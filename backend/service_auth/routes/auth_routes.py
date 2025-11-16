from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from controllers.auth_controller import create_user, authenticate_user, request_password_reset, reset_password_with_token
from controllers.user_controller import get_user_by_id,get_all_users, update_user, delete_user, nbr_users,nbr_admins,nbr_candidats,nbr_recruteurs
from models.user import UserCreate, UserResponse
from utils.security import create_access_token
from datetime import timedelta

router = APIRouter(prefix="/auth", tags=["Authentification"])

@router.post("/register", response_model=UserResponse)
def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Inscrit un nouvel utilisateur dans le système.
    Valide et hash le mot de passe avant de créer l'utilisateur.
    Retourne les informations de l'utilisateur créé (sans le mot de passe).
    """
    return create_user(db, user_data)

@router.post("/login")
def login_user(email: str, password: str, db: Session = Depends(get_db)):
    """
    Authentifie un utilisateur avec son email et mot de passe.
    Vérifie les identifiants et retourne un token JWT avec les informations utilisateur.
    """
    user = authenticate_user(db, email, password)
    
    # Créer le token JWT
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=timedelta(hours=24)  # Token valide 24h
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role,
            "est_actif": user.est_actif
        }
    }


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """Request a password reset. In development this returns the token in the response.
    In production you should email the token/link instead of returning it.
    """
    return request_password_reset(db, email)


@router.post("/reset-password")
def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    """Reset password using token received from /forgot-password (or email link)."""
    return reset_password_with_token(db, token, new_password)

@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Récupère les informations d'un utilisateur par son ID.
    Retourne les détails de l'utilisateur sans le mot de passe.
    """
    return get_user_by_id(db, user_id)

@router.get("/users", response_model=list[UserResponse])
def list_users(db: Session = Depends(get_db)):
    """
    Liste tous les utilisateurs enregistrés dans le système.
    Retourne un tableau de tous les utilisateurs avec leurs informations.
    """
    return get_all_users(db)

@router.put("/users/{user_id}", response_model=UserResponse)
def update_user_route(user_id: int, user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Met à jour les informations d'un utilisateur existant.
    Ne modifie que les champs fournis, les autres restent inchangés.
    Le handler est renommé pour éviter la collision avec la fonction importée.
    """
    update_data = user_data.dict(exclude_unset=True)
    return update_user(db, user_id, update_data)

@router.delete("/users/{user_id}")
def delete_user_route(user_id: int, db: Session = Depends(get_db)):
    """
    Supprime un utilisateur du système.
    Cette action est irréversible et supprime toutes les données associées.
    """
    return delete_user(db, user_id)

@router.get("/stats/total_users")
def total_users(db: Session = Depends(get_db)):
    """
    Retourne le nombre total d'utilisateurs dans le système.
    """
    return {"total_users": nbr_users(db)}

@router.get("/stats/admins")
def total_admins(db: Session = Depends(get_db)):
    """
    Retourne le nombre total d'administrateurs dans le système.
    """
    return {"total_admins": nbr_admins(db)}

@router.get("/stats/candidats")
def total_candidats(db: Session = Depends(get_db)):
    """
    Retourne le nombre total de candidats dans le système.
    """
    return {"total_candidats": nbr_candidats(db)}

@router.get("/stats/recruteurs")
def total_recruteurs(db: Session = Depends(get_db)):
    """
    Retourne le nombre total de recruteurs dans le système.
    """
    return {"total_recruteurs": nbr_recruteurs(db)}

