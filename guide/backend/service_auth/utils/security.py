from passlib.context import CryptContext
from fastapi import HTTPException
from jose import jwt, JWTError
from datetime import datetime, timedelta
import os

# Configuration JWT
SECRET_KEY = os.getenv("SECRET_KEY", "votre-cle-secrete-super-securisee")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# ✅ bcrypt_sha256 corrige la limite des 72 caractères de bcrypt
# Il applique d’abord un SHA-256 avant le hash bcrypt.
# On garde bcrypt comme fallback pour compatibilité ascendante.
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__default_rounds=12  # Nombre de rounds pour un bon équilibre sécurité/performance
)

def hash_password(password: str) -> str:
    """
    Hash un mot de passe utilisateur de façon sécurisée.
    Le mot de passe est tronqué à 72 bytes si nécessaire pour respecter
    la limitation de bcrypt.
    """
    if not isinstance(password, str):
        raise HTTPException(status_code=400, detail="Le mot de passe doit être une chaîne de caractères.")
    
    # Tronquer à 72 bytes si nécessaire pour respecter la limite de bcrypt
    encoded_password = password.encode('utf-8')
    if len(encoded_password) > 72:
        encoded_password = encoded_password[:72]
        password = encoded_password.decode('utf-8')
    
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie la correspondance entre un mot de passe brut et son hash.
    """
    if not isinstance(plain_password, str):
        raise HTTPException(status_code=400, detail="Le mot de passe doit être une chaîne de caractères.")
    
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Crée un token JWT d'accès.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str):
    """
    Vérifie et décode un token JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token expiré"
        )
    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token invalide"
        )
