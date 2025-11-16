from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from models.candidat import CandidatDB


def create_candidat(db: Session, candidat_data: dict):
    # Ensure auth_user_id provided
    auth_user_id = candidat_data.get("auth_user_id")
    if auth_user_id is None:
        raise HTTPException(status_code=400, detail="auth_user_id is required")

    # check if profile already exists for this auth_user_id
    existing = db.query(CandidatDB).filter(CandidatDB.auth_user_id == auth_user_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists for this user")

    # Create new candidate with the provided auth_user_id
    payload = dict(candidat_data)
    candidat = CandidatDB(**payload)
    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat


def get_candidat_by_id(db: Session, candidat_id: int):
    return db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()


def get_candidat_by_auth_user(db: Session, auth_user_id: int):
    return db.query(CandidatDB).filter(CandidatDB.auth_user_id == auth_user_id).first()


def list_candidats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(CandidatDB).offset(skip).limit(limit).all()


def update_candidat(db: Session, candidat_id: int, update_data: dict):
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # update allowed fields
    for key, value in update_data.items():
        if hasattr(candidat, key):
            setattr(candidat, key, value)

    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat


def partial_update_candidat(db: Session, candidat_id: int, partial_data: dict):
    """Met à jour partiellement un candidat (utilisé pour sauvegarde par étape)."""
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    for key, value in partial_data.items():
        if hasattr(candidat, key):
            setattr(candidat, key, value)

    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat


def update_progression(db: Session, candidat_id: int, step: int):
    """Met à jour la progression (étape atteinte) du candidat."""
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    # sanity check on step
    try:
        step_int = int(step)
    except Exception:
        raise HTTPException(status_code=400, detail="step must be an integer")

    candidat.progression = step_int
    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return {"message": "Progression mise à jour", "current_step": candidat.progression}


def check_completion(db: Session, candidat_id: int):
    """Retourne l'état de complétude par section et un pourcentage global."""
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    completion = {
        "infos_personnelles": bool(getattr(candidat, "email", None) and (getattr(candidat, "name", None) or getattr(candidat, "prenom", None))),
        "experience": bool(getattr(candidat, "experience", None)),
        "formation": bool(getattr(candidat, "formation", None)),
        "competences": bool(getattr(candidat, "competences", None)),
        "langues": bool(getattr(candidat, "langues", None)),
        "cv": bool(getattr(candidat, "cv", None) or getattr(candidat, "resume_professionnel", None)),
    }

    percent = 0
    if len(completion) > 0:
        percent = sum(bool(v) for v in completion.values()) / len(completion) * 100

    return {"completion": completion, "progression": candidat.progression, "percentage": percent}


def delete_candidat(db: Session, candidat_id: int):
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidat)
    db.commit()
    return {"detail": "Candidate deleted"}


def add_skill(db: Session, candidat_id: int, skill: dict):
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    skills = candidat.competences or []
    skills.append(skill)
    candidat.competences = skills
    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat


def add_experience(db: Session, candidat_id: int, exp: dict):
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")

    exps = candidat.experience or []
    exps.append(exp)
    candidat.experience = exps
    db.add(candidat)
    db.commit()
    db.refresh(candidat)
    return candidat



def get_all_info_candidat(db: Session, candidat_id: int):
    candidat = db.query(CandidatDB).filter(CandidatDB.id == candidat_id).first()
    if not candidat:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidat



# creer le controller pour les candidats
