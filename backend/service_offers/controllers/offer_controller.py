from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime

from models.offer import OfferDB, OfferCreate, OfferUpdate, OfferStatus


def _serialize_keywords(keywords: Optional[List[str]]) -> Optional[str]:
    if keywords is None:
        return None
    return ",".join([k.strip() for k in keywords if k and k.strip()]) or None


def _parse_keywords(csv_keywords: Optional[str]) -> Optional[List[str]]:
    if not csv_keywords:
        return []
    return [k.strip() for k in csv_keywords.split(",") if k.strip()]


def _offer_to_dict(o: OfferDB) -> dict:
    return {
        "id": o.id,
        "recruiter_user_id": o.recruiter_user_id,
        "titre": o.titre,
        "description": o.description,
        "type_contrat": o.type_contrat,
        "localisation": o.localisation,
        "entreprise": o.entreprise,
        "domaine": o.domaine,
        "mots_cles": _parse_keywords(o.mots_cles),
        "remote": o.remote,
        "salaire_min": o.salaire_min,
        "salaire_max": o.salaire_max,
        "experience_requise": o.experience_requise,
        "education_requise": o.education_requise,
        "nb_postes": o.nb_postes,
        "places_restantes": o.places_restantes,
        "date_publication": o.date_publication,
        "date_expiration": o.date_expiration,
        "statut": o.statut,
        "created_at": o.created_at,
        "updated_at": o.updated_at,
    }


def create_offer(db: Session, payload: OfferCreate) -> dict:
    if not payload.recruiter_user_id:
        raise HTTPException(status_code=400, detail="recruiter_user_id is required")
    
    nb_postes = payload.nb_postes or 1
    places_restantes = payload.places_restantes if payload.places_restantes is not None else nb_postes
    
    offer = OfferDB(
        recruiter_user_id=payload.recruiter_user_id,
        titre=payload.titre,
        description=payload.description,
        type_contrat=payload.type_contrat,
        localisation=payload.localisation,
        entreprise=payload.entreprise,
        domaine=payload.domaine,
        mots_cles=_serialize_keywords(payload.mots_cles),
        remote=payload.remote or False,
        salaire_min=payload.salaire_min,
        salaire_max=payload.salaire_max,
        experience_requise=payload.experience_requise,
        education_requise=payload.education_requise,
        nb_postes=nb_postes,
        places_restantes=places_restantes,
        date_expiration=payload.date_expiration,
    )
    db.add(offer)
    db.commit()
    db.refresh(offer)
    return _offer_to_dict(offer)


def list_offers(
    db: Session,
    q: Optional[str] = None,
    localisation: Optional[str] = None,
    type_contrat: Optional[str] = None,
    domaine: Optional[str] = None,
    remote: Optional[bool] = None,
    min_salaire: Optional[int] = None,
    statut: Optional[str] = "published",
    sort_by: Optional[str] = "date",
    order: Optional[str] = "desc",
    recruiter_user_id: Optional[int] = None,
):
    query = db.query(OfferDB)

    if statut:
        try:
            query = query.filter(OfferDB.statut == OfferStatus(statut))
        except Exception:
            pass

    if q:
        # Recherche tolérante par mots: pour chaque token, on exige qu'il apparaisse
        # dans AU MOINS un des champs (titre, description, localisation, entreprise, domaine, mots_cles).
        # Exemple: "plom par" matchera les offres contenant "plombier" et "Paris" (tokens séparés).
        tokens = [t.strip() for t in q.split() if t.strip()]
        if tokens:
            per_token_conditions = []
            for t in tokens:
                like = f"%{t}%"
                per_token_conditions.append(
                    or_(
                        OfferDB.titre.ilike(like),
                        OfferDB.description.ilike(like),
                        OfferDB.localisation.ilike(like),
                        OfferDB.entreprise.ilike(like),
                        OfferDB.domaine.ilike(like),
                        OfferDB.mots_cles.ilike(like),
                    )
                )
            # Tous les tokens doivent matcher (AND), mais chaque token peut matcher n'importe quel champ (OR)
            query = query.filter(and_(*per_token_conditions))

    if localisation:
        query = query.filter(OfferDB.localisation.ilike(f"%{localisation}%"))

    if type_contrat:
        try:
            query = query.filter(OfferDB.type_contrat == type_contrat)
        except Exception:
            pass

    if domaine:
        query = query.filter(OfferDB.domaine.ilike(f"%{domaine}%"))

    if remote is not None:
        query = query.filter(OfferDB.remote == bool(remote))

    if min_salaire is not None:
        query = query.filter(OfferDB.salaire_min >= min_salaire)

    if recruiter_user_id is not None:
        query = query.filter(OfferDB.recruiter_user_id == recruiter_user_id)

    # Sorting
    if sort_by == "date":
        sort_col = OfferDB.date_publication
    elif sort_by == "salaire":
        sort_col = OfferDB.salaire_min
    elif sort_by == "localisation":
        sort_col = OfferDB.localisation
    else:
        sort_col = OfferDB.date_publication

    if order == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    results = query.all()
    return [_offer_to_dict(o) for o in results]


def get_offer(db: Session, offer_id: int) -> dict:
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    return _offer_to_dict(offer)


def update_offer(db: Session, offer_id: int, payload: OfferUpdate, recruiter_user_id: Optional[int] = None) -> dict:
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")

    # Claim ownership if missing, else enforce ownership
    if recruiter_user_id is not None:
        if offer.recruiter_user_id is None:
            offer.recruiter_user_id = recruiter_user_id
            db.commit()
            db.refresh(offer)
        elif offer.recruiter_user_id != recruiter_user_id:
            raise HTTPException(status_code=403, detail="Action non autorisée pour cet utilisateur")

    data = payload.dict(exclude_unset=True)
    # prevent changing owner via update
    data.pop("recruiter_user_id", None)
    if "mots_cles" in data:
        data["mots_cles"] = _serialize_keywords(data["mots_cles"])

    for k, v in data.items():
        setattr(offer, k, v)

    db.commit()
    db.refresh(offer)
    return _offer_to_dict(offer)


def publish_offer(db: Session, offer_id: int, recruiter_user_id: Optional[int] = None) -> dict:
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if recruiter_user_id is not None:
        if offer.recruiter_user_id is None:
            offer.recruiter_user_id = recruiter_user_id
        elif offer.recruiter_user_id != recruiter_user_id:
            raise HTTPException(status_code=403, detail="Action non autorisée pour cet utilisateur")
    offer.statut = OfferStatus.PUBLISHED
    offer.date_publication = datetime.utcnow()
    db.commit()
    db.refresh(offer)
    return _offer_to_dict(offer)


def close_offer(db: Session, offer_id: int, recruiter_user_id: Optional[int] = None) -> dict:
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if recruiter_user_id is not None:
        if offer.recruiter_user_id is None:
            offer.recruiter_user_id = recruiter_user_id
        elif offer.recruiter_user_id != recruiter_user_id:
            raise HTTPException(status_code=403, detail="Action non autorisée pour cet utilisateur")
    offer.statut = OfferStatus.CLOSED
    db.commit()
    db.refresh(offer)
    return _offer_to_dict(offer)


def delete_offer(db: Session, offer_id: int, recruiter_user_id: Optional[int] = None):
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    if recruiter_user_id is not None:
        if offer.recruiter_user_id is None:
            offer.recruiter_user_id = recruiter_user_id
            db.add(offer)
            db.commit()
        elif offer.recruiter_user_id != recruiter_user_id:
            raise HTTPException(status_code=403, detail="Action non autorisée pour cet utilisateur")
    db.delete(offer)
    db.commit()
    return {"detail": "Offre supprimée"}


def decrement_offer_places(db: Session, offer_id: int) -> bool:
    """
    Décrémente le nombre de places restantes pour une offre.
    Ferme automatiquement l'offre si toutes les places sont prises.
    Retourne True si l'offre a été fermée, False sinon.
    """
    offer = db.query(OfferDB).filter(OfferDB.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offre introuvable")
    
    if offer.statut == OfferStatus.CLOSED:
        return True  # Déjà fermée
    
    if offer.places_restantes <= 0:
        # Plus de places disponibles, fermer l'offre
        offer.statut = OfferStatus.CLOSED
        db.commit()
        return True
    
    # Décrémenter les places restantes
    offer.places_restantes -= 1
    
    # Fermer l'offre si toutes les places sont prises
    if offer.places_restantes <= 0:
        offer.statut = OfferStatus.CLOSED
    
    db.commit()
    db.refresh(offer)
    
    return offer.statut == OfferStatus.CLOSED
