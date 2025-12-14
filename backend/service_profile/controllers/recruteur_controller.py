from sqlalchemy.orm import Session
from fastapi import HTTPException
from models.recruteur import RecruteurDB


def create_recruteur(db: Session, recruteur_data: dict):
    auth_user_id = recruteur_data.get("auth_user_id")
    if auth_user_id is None:
        raise HTTPException(status_code=400, detail="auth_user_id is required")

    existing = db.query(RecruteurDB).filter(RecruteurDB.auth_user_id == auth_user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Recruiter profile already exists for this user")

    payload = dict(recruteur_data)
    rec = RecruteurDB(**payload)
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def get_recruteur_by_id(db: Session, recruteur_id: int):
    return db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()


def get_recruteur_by_auth_user(db: Session, auth_user_id: int):
    return db.query(RecruteurDB).filter(RecruteurDB.auth_user_id == auth_user_id).first()


def list_recruteurs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(RecruteurDB).offset(skip).limit(limit).all()


def update_recruteur(db: Session, recruteur_id: int, update_data: dict):
    rec = db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    for key, value in update_data.items():
        if hasattr(rec, key):
            setattr(rec, key, value)

    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def partial_update_recruteur(db: Session, recruteur_id: int, partial_data: dict):
    rec = db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    for key, value in partial_data.items():
        if hasattr(rec, key):
            setattr(rec, key, value)

    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


def update_progression(db: Session, recruteur_id: int, step: int):
    rec = db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    try:
        step_int = int(step)
    except Exception:
        raise HTTPException(status_code=400, detail="step must be an integer")

    rec.progression = step_int
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return {"message": "Progression mise à jour", "current_step": rec.progression}


def check_completion(db: Session, recruteur_id: int):
    rec = db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")

    completion = {
        "societe": bool(getattr(rec, "entreprise", None) and getattr(rec, "description_entreprise", None)),
        "contact": bool(getattr(rec, "email", None) and getattr(rec, "telephone", None)),
        "adresse": bool(getattr(rec, "adresse", None) or getattr(rec, "ville", None) or getattr(rec, "pays", None)),
        "liens": bool(getattr(rec, "site_web", None) or getattr(rec, "linkedin", None) or getattr(rec, "logo_url", None)),
    }

    percent = 0
    if len(completion) > 0:
        percent = sum(bool(v) for v in completion.values()) / len(completion) * 100

    return {"completion": completion, "progression": rec.progression, "percentage": percent}


def delete_recruteur(db: Session, recruteur_id: int):
    rec = db.query(RecruteurDB).filter(RecruteurDB.id == recruteur_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    db.delete(rec)
    db.commit()
    return {"detail": "Recruiter deleted"}
