from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.database import get_db
from controllers.recruteur_controller import (
    create_recruteur,
    get_recruteur_by_id,
    get_recruteur_by_auth_user,
    list_recruteurs,
    update_recruteur,
    delete_recruteur,
    partial_update_recruteur,
    update_progression,
    check_completion,
)
from models.recruteur import (
    RecruteurCreate,
    RecruteurResponse,
    RecruteurUpdate,
)

router = APIRouter(prefix="/recruiters", tags=["Recruiters"])


@router.post("/", response_model=RecruteurResponse)
def create_recruiter_endpoint(payload: RecruteurCreate, db: Session = Depends(get_db)):
    return create_recruteur(db, payload.dict())


@router.get("/{recruiter_id}", response_model=RecruteurResponse)
def get_recruiter(recruiter_id: int, db: Session = Depends(get_db)):
    rec = get_recruteur_by_id(db, recruiter_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return rec


@router.get("/by-user/{auth_user_id}", response_model=RecruteurResponse)
def get_recruiter_by_user(auth_user_id: int, db: Session = Depends(get_db)):
    rec = get_recruteur_by_auth_user(db, auth_user_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Recruiter not found")
    return rec


@router.get("/", response_model=list[RecruteurResponse])
def list_recruiters(db: Session = Depends(get_db)):
    return list_recruteurs(db)


@router.put("/{recruiter_id}", response_model=RecruteurResponse)
def update_recruiter(recruiter_id: int, payload: RecruteurUpdate, db: Session = Depends(get_db)):
    return update_recruteur(db, recruiter_id, payload.dict(exclude_unset=True))


@router.patch("/{recruiter_id}/partial-update", response_model=RecruteurResponse)
def partial_update_recruiter(recruiter_id: int, payload: dict, db: Session = Depends(get_db)):
    return partial_update_recruteur(db, recruiter_id, payload)


@router.patch("/{recruiter_id}/progression")
def update_progression_endpoint(recruiter_id: int, step: int, db: Session = Depends(get_db)):
    return update_progression(db, recruiter_id, step)


@router.get("/{recruiter_id}/completion-status")
def completion_status(recruiter_id: int, db: Session = Depends(get_db)):
    return check_completion(db, recruiter_id)


@router.delete("/{recruiter_id}")
def delete_recruiter(recruiter_id: int, db: Session = Depends(get_db)):
    return delete_recruteur(db, recruiter_id)
