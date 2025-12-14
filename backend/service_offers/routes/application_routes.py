from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from controllers.application_controller import (
    create_application,
    get_application,
    list_applications,
    update_application_status,
    withdraw_application,
    delete_application,
    stats_for_user,
)
from models.application import ApplicationCreate, ApplicationUpdateStatus, ApplicationResponse

router = APIRouter(prefix="/applications", tags=["Applications"])


@router.post("/", response_model=ApplicationResponse)
def apply_endpoint(payload: ApplicationCreate, db: Session = Depends(get_db)):
    return create_application(db, payload)


@router.get("/", response_model=list[ApplicationResponse])
def list_applications_endpoint(user_id: int | None = None, statut: str | None = None, offre_id: int | None = None, db: Session = Depends(get_db)):
    return list_applications(db, user_id=user_id, statut=statut, offre_id=offre_id)


@router.get("/stats/by-user")
def stats_by_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    return stats_for_user(db, user_id)


@router.get("/stats", include_in_schema=False)
def get_applications_stats(db: Session = Depends(get_db)):
    """Statistiques des candidatures pour le dashboard admin"""
    from models.application import ApplicationDB
    
    total = db.query(ApplicationDB).count()
    submitted = db.query(ApplicationDB).filter(ApplicationDB.statut == "submitted").count()
    in_review = db.query(ApplicationDB).filter(ApplicationDB.statut == "in_review").count()
    interview = db.query(ApplicationDB).filter(ApplicationDB.statut == "interview").count()
    offered = db.query(ApplicationDB).filter(ApplicationDB.statut == "offered").count()
    rejected = db.query(ApplicationDB).filter(ApplicationDB.statut == "rejected").count()
    withdrawn = db.query(ApplicationDB).filter(ApplicationDB.statut == "withdrawn").count()
    
    return {
        "total": total,
        "submitted": submitted,
        "in_review": in_review,
        "interview": interview,
        "offered": offered,
        "rejected": rejected,
        "withdrawn": withdrawn
    }


@router.get("/{app_id}", response_model=ApplicationResponse)
def get_application_endpoint(app_id: int, db: Session = Depends(get_db)):
    return get_application(db, app_id)


@router.patch("/{app_id}/status", response_model=ApplicationResponse)
def update_status_endpoint(app_id: int, payload: ApplicationUpdateStatus, db: Session = Depends(get_db)):
    return update_application_status(db, app_id, payload)


@router.patch("/{app_id}/withdraw", response_model=ApplicationResponse)
def withdraw_application_endpoint(app_id: int, user_id: int, reason: str | None = None, db: Session = Depends(get_db)):
    """Permet au candidat de retirer sa candidature (statut withdrawn). Requiert user_id pour autorisation."""
    return withdraw_application(db, app_id, user_id, reason)


@router.delete("/{app_id}")
def delete_application_endpoint(app_id: int, user_id: int, db: Session = Depends(get_db)):
    """Supprimer une candidature. Le candidat doit fournir son user_id pour autorisation."""
    return delete_application(db, app_id, user_id)
