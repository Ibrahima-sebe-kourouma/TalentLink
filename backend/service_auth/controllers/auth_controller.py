from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from models.user import UserDB, UserCreate
from utils.security import hash_password, verify_password, verify_token
from database.database import get_db
import os
import requests
from datetime import datetime, timedelta
import secrets
import string

# URL of the profile service (adjust via env var PROFILE_SERVICE_URL)
PROFILE_SERVICE_URL = os.getenv("PROFILE_SERVICE_URL", "http://127.0.0.1:8002")
MAIL_SERVICE_URL = os.getenv("MAIL_SERVICE_URL", "http://127.0.0.1:8004")

# --- Anti brute-force (in-memory) for reset token ---
# Limites: 5 tentatives puis blocage 10 minutes pour ce token
RESET_MAX_ATTEMPTS = int(os.getenv("RESET_MAX_ATTEMPTS", "5"))
RESET_LOCK_MINUTES = int(os.getenv("RESET_LOCK_MINUTES", "10"))

# token -> { attempts: int, locked_until: datetime }
_RESET_ATTEMPTS: dict[str, dict] = {}

def _is_token_locked(token: str) -> tuple[bool, int]:
    """Retourne (locked, seconds_remaining)."""
    info = _RESET_ATTEMPTS.get(token)
    if not info:
        return False, 0
    locked_until = info.get("locked_until")
    if locked_until and locked_until > datetime.utcnow():
        delta = locked_until - datetime.utcnow()
        return True, max(0, int(delta.total_seconds()))
    return False, 0

def _register_failed_attempt(token: str):
    info = _RESET_ATTEMPTS.setdefault(token, {"attempts": 0, "locked_until": None})
    info["attempts"] = int(info.get("attempts", 0)) + 1
    if info["attempts"] >= RESET_MAX_ATTEMPTS:
        info["locked_until"] = datetime.utcnow() + timedelta(minutes=RESET_LOCK_MINUTES)

def _clear_attempts(token: str):
    if token in _RESET_ATTEMPTS:
        del _RESET_ATTEMPTS[token]

def create_user(db: Session, user_data: UserCreate):
    existing_user = db.query(UserDB).filter(UserDB.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré.")

    # Valider le rôle
    valid_roles = ["candidat", "recruteur", "admin"]
    if user_data.role not in valid_roles:
        raise HTTPException(status_code=400, detail=f"Rôle invalide. Rôles autorisés: {valid_roles}")

    hashed_pwd = hash_password(user_data.password)
    new_user = UserDB(
        name=user_data.name,
        prenom=user_data.prenom,
        email=user_data.email,
        password=hashed_pwd,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # If the user is a candidate, create a profile in the profile service
    try:
        if getattr(new_user, "role", "") == "candidat":
            payload = {
                "auth_user_id": new_user.id,
                "name": getattr(new_user, "name", None),
                "prenom": getattr(new_user, "prenom", None),
                "email": getattr(new_user, "email", None),
            }
            # call profile service create endpoint
            requests.post(f"{PROFILE_SERVICE_URL}/candidates/", json=payload, timeout=5)
    except Exception:
        # don't break user creation if profile service call fails; log could be added
        pass

    # Send welcome email via Mail service
    try:
        user_name = f"{new_user.prenom} {new_user.name}" if new_user.prenom and new_user.name else new_user.email
        payload = {"to_email": new_user.email, "user_name": user_name}
        r = requests.post(f"{MAIL_SERVICE_URL}/mail/welcome", json=payload, timeout=10)
        if r.status_code >= 400:
            print(f"Failed to send welcome email via mail-service: {r.status_code} - {r.text}")
    except Exception as e:
        # Don't break user creation if email fails
        print(f"Failed to send welcome email to {new_user.email}: {str(e)}")

    return new_user


def authenticate_user(db: Session, email: str, password: str):
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if not user or not verify_password(password, user.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Identifiants invalides")
    return user


def _generate_4char_code() -> str:
    """Génère un code de vérification à 4 chiffres (ex: 0472)."""
    digits = string.digits
    return "".join(secrets.choice(digits) for _ in range(4))


def request_password_reset(db: Session, email: str, token_ttl_minutes: int = 60):
    """
    Generate a reset token for the given email and send it by email.
    Returns a generic message to avoid revealing whether the email exists.
    """
    user = db.query(UserDB).filter(UserDB.email == email).first()
    if not user:
        # Do not reveal whether an email exists; return generic response
        return {"detail": "Si l'email existe, un code de vérification a été envoyé."}

    # Generate short 4-char token and try to avoid collisions
    token = None
    for _ in range(5):
        candidate = _generate_4char_code()
        exists = db.query(UserDB).filter(UserDB.reset_token == candidate).first()
        if not exists:
            token = candidate
            break
    if token is None:
        # Fallback si collisions improbables
        token = _generate_4char_code()
    expiry = datetime.utcnow() + timedelta(minutes=token_ttl_minutes)
    user.reset_token = token
    user.reset_token_expiry = expiry
    db.add(user)
    db.commit()

    # Clear any previous attempts for this token (fresh code)
    _clear_attempts(token)
    
    # Send email with reset code via Mail service
    user_name = f"{user.prenom} {user.name}" if user.prenom and user.name else user.email
    try:
        payload = {
            "to_email": user.email,
            "user_name": user_name,
            "reset_token": token,
            "expiry_minutes": token_ttl_minutes,
        }
        r = requests.post(f"{MAIL_SERVICE_URL}/mail/password-reset", json=payload, timeout=10)
        if r.status_code >= 400:
            print(f"Failed to send password reset via mail-service: {r.status_code} - {r.text}")
    except Exception as e:
        # Log error but don't reveal to user
        print(f"Failed to send password reset email to {user.email}: {e}")
    
    # Always return generic success message (security best practice)
    return {"detail": "Si l'email existe, un code de vérification a été envoyé."}


def reset_password_with_token(db: Session, token: str, new_password: str):
    """Validate token and set a new password."""
    if not token:
        raise HTTPException(status_code=400, detail="Token is required")

    # Anti brute-force: vérifier le verrouillage avant d'aller plus loin
    locked, seconds = _is_token_locked(token)
    if locked:
        minutes = max(1, seconds // 60)
        raise HTTPException(status_code=429, detail=f"Trop de tentatives. Réessayez dans ~{minutes} minute(s).")

    user = db.query(UserDB).filter(UserDB.reset_token == token).first()
    if not user or not user.reset_token_expiry:
        # tentative échouée -> compter
        _register_failed_attempt(token)
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    if user.reset_token_expiry < datetime.utcnow():
        # Clear expired token
        user.reset_token = None
        user.reset_token_expiry = None
        db.add(user)
        db.commit()
        # tentative échouée -> compter
        _register_failed_attempt(token)
        raise HTTPException(status_code=400, detail="Token expired")

    # Update password and clear token
    user.password = hash_password(new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.add(user)
    db.commit()
    db.refresh(user)
    # Succès -> nettoyer l'état anti-bruteforce pour ce token
    _clear_attempts(token)
    return {"detail": "Password updated"}


def get_user_by_id(db: Session, user_id: int):
    return db.query(UserDB).filter(UserDB.id == user_id).first()


def get_all_users(db: Session):
    return db.query(UserDB).all()


def delete_user(db: Session, user_id: int):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
    # Attempt to delete associated candidate profile in profile service
    try:
        # find candidate by auth_user_id
        resp = requests.get(f"{PROFILE_SERVICE_URL}/candidates/by-user/{user.id}", timeout=5)
        if resp.ok:
            candidate = resp.json()
            candidate_id = candidate.get("id")
            if candidate_id:
                requests.delete(f"{PROFILE_SERVICE_URL}/candidates/{candidate_id}", timeout=5)
    except Exception:
        # non-fatal: proceed to delete auth user even if profile deletion fails
        pass

    db.delete(user)
    db.commit()
    return {"detail": "Utilisateur supprimé avec succès."}


def update_user(db: Session, user_id: int, update_data: dict):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")

    for key, value in update_data.items():
        if key == "password":
            value = hash_password(value)
        setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def nbr_users(db: Session):
    return db.query(UserDB).count()

def nbr_candidats(db: Session):
    return db.query(UserDB).filter(UserDB.role == "candidat").count()

def nbr_recruteurs(db: Session):
    return db.query(UserDB).filter(UserDB.role == "recruteur").count()

def nbr_admins(db: Session):
    return db.query(UserDB).filter(UserDB.role == "admin").count()


# Authentification par Bearer Token
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserDB:
    """Obtenir l'utilisateur actuel à partir du token JWT"""
    try:
        # Extraire le token
        token = credentials.credentials
        
        # Vérifier et décoder le token
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token invalide",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Récupérer l'utilisateur
        user = get_user_by_id(db, int(user_id))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Utilisateur non trouvé",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token invalide",
            headers={"WWW-Authenticate": "Bearer"}
        )

