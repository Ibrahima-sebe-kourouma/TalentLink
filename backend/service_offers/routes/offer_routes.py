from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database.database import get_db
from controllers.offer_controller import (
    create_offer,
    list_offers,
    get_offer,
    update_offer,
    publish_offer,
    close_offer,
    delete_offer,
)
from models.offer import OfferCreate, OfferUpdate, OfferResponse

router = APIRouter(prefix="/offers", tags=["Offers"])


@router.post("/", response_model=OfferResponse)
def create_offer_endpoint(payload: OfferCreate, db: Session = Depends(get_db)):
    return create_offer(db, payload)


@router.get("/", response_model=list[OfferResponse])
def list_offers_endpoint(
    q: str | None = None,
    localisation: str | None = None,
    type_contrat: str | None = None,
    domaine: str | None = None,
    remote: bool | None = None,
    min_salaire: int | None = None,
    statut: str | None = "published",
    sort_by: str | None = "date",
    order: str | None = "desc",
    recruiter_user_id: int | None = None,
    db: Session = Depends(get_db),
):
    return list_offers(db, q, localisation, type_contrat, domaine, remote, min_salaire, statut, sort_by, order, recruiter_user_id)


@router.get("/stats", include_in_schema=False)
def get_offers_stats(db: Session = Depends(get_db)):
    """Statistiques des offres pour le dashboard admin"""
    from models.offer import OfferDB
    
    total = db.query(OfferDB).count()
    active = db.query(OfferDB).filter(OfferDB.statut == "published").count()
    closed = db.query(OfferDB).filter(OfferDB.statut == "closed").count()
    draft = db.query(OfferDB).filter(OfferDB.statut == "draft").count()
    
    return {
        "total": total,
        "active": active,
        "closed": closed,
        "draft": draft
    }


@router.get("/{offer_id}", response_model=OfferResponse)
def get_offer_endpoint(offer_id: int, db: Session = Depends(get_db)):
    return get_offer(db, offer_id)


@router.put("/{offer_id}", response_model=OfferResponse)
def update_offer_endpoint(offer_id: int, payload: OfferUpdate, recruiter_user_id: int | None = None, db: Session = Depends(get_db)):
    return update_offer(db, offer_id, payload, recruiter_user_id)


@router.patch("/{offer_id}/publish", response_model=OfferResponse)
def publish_offer_endpoint(offer_id: int, recruiter_user_id: int | None = None, db: Session = Depends(get_db)):
    return publish_offer(db, offer_id, recruiter_user_id)


@router.patch("/{offer_id}/close", response_model=OfferResponse)
def close_offer_endpoint(offer_id: int, recruiter_user_id: int | None = None, db: Session = Depends(get_db)):
    return close_offer(db, offer_id, recruiter_user_id)


@router.delete("/{offer_id}")
def delete_offer_endpoint(offer_id: int, recruiter_user_id: int | None = None, db: Session = Depends(get_db)):
    return delete_offer(db, offer_id, recruiter_user_id)
