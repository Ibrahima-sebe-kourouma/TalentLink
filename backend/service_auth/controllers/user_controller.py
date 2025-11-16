from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.user import UserDB, UserCreate
from utils.security import hash_password, verify_password

   

def get_user_by_id(db: Session, user_id: int):
    return db.query(UserDB).filter(UserDB.id == user_id).first()


def get_all_users(db: Session):
    return db.query(UserDB).all()


def delete_user(db: Session, user_id: int):
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé.")
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

