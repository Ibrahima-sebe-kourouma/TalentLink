from sqlalchemy.orm import Session
from fastapi import HTTPException
from typing import Optional
from datetime import datetime
import os
import requests

# Email notifications now use a dedicated Mail microservice via HTTP

from models.application import ApplicationDB, ApplicationCreate, ApplicationUpdateStatus, ApplicationStatus
from models.offer import OfferDB, OfferStatus
from controllers.offer_controller import decrement_offer_places
from controllers.notification_controller import create_application_notification, create_offer_full_notification

PROFILE_SERVICE_URL = os.getenv("PROFILE_SERVICE_URL", "http://127.0.0.1:8002")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://127.0.0.1:8001")
MAIL_SERVICE_URL = os.getenv("MAIL_SERVICE_URL", "http://127.0.0.1:8004")


def _ensure_candidate_exists(auth_user_id: int) -> bool:
    try:
        r = requests.get(f"{PROFILE_SERVICE_URL}/candidates/by-user/{auth_user_id}", timeout=5)
        return r.ok
    except Exception:
        return False


def _get_user_info(auth_user_id: int) -> dict | None:
    """Fetch minimal user info (email, name) from auth service.

    Returns a dict like {"email": str, "name": str, "prenom": str} or None.
    """
    try:
        r = requests.get(f"{AUTH_SERVICE_URL}/auth/users/{auth_user_id}", timeout=5)
        if not r.ok:
            return None
        data = r.json() or {}
        return data
    except Exception:
        return None


def create_application(db: Session, payload: ApplicationCreate) -> ApplicationDB:
    # Offer must exist and be published
    offer = db.query(OfferDB).filter(OfferDB.id == payload.offre_id).first()
    if not offer:
        raise HTTPException(status_code=400, detail="Offre introuvable")
    if offer.statut != OfferStatus.PUBLISHED:
        raise HTTPException(status_code=400, detail="Offre non disponible pour candidature")
    if offer.places_restantes <= 0:
        raise HTTPException(status_code=400, detail="Plus de places disponibles pour cette offre")

    # Ensure candidate exists (basic completeness check)
    if not _ensure_candidate_exists(payload.auth_user_id):
        raise HTTPException(status_code=400, detail="Profil candidat introuvable. Veuillez compléter votre profil.")

    # Prevent duplicate applications
    existing = db.query(ApplicationDB).filter(
        ApplicationDB.offre_id == payload.offre_id,
        ApplicationDB.auth_user_id == payload.auth_user_id
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Vous avez déjà postulé à cette offre")

    app = ApplicationDB(
        offre_id=payload.offre_id,
        auth_user_id=payload.auth_user_id,
        candidat_id=payload.candidat_id,
        message_motivation=payload.message_motivation,
        cv_url=payload.cv_url,
        statut=ApplicationStatus.SUBMITTED,
        date_candidature=datetime.utcnow(),
    )
    db.add(app)
    db.commit()
    db.refresh(app)

    # Créer une notification pour le recruteur
    try:
        user = _get_user_info(payload.auth_user_id) or {}
        user_name = f"{user.get('prenom') or ''} {user.get('name') or ''}".strip() or "Candidat"
        offer_title = getattr(offer, "titre", "Offre")
        
        if offer.recruiter_user_id:
            create_application_notification(
                db, 
                offer.recruiter_user_id, 
                user_name, 
                offer_title, 
                app.id
            )
            print(f"[offers] notification created for recruiter {offer.recruiter_user_id}")
    except Exception as e:
        print(f"[offers] notification error: {e}")

    # Fire-and-forget email notification for submission
    try:
        user = _get_user_info(payload.auth_user_id) or {}
        to_email = user.get("email")
        user_name = f"{user.get('prenom') or ''} {user.get('name') or ''}".strip() or (to_email or "Candidat")
        offer_title = getattr(offer, "titre", "Offre")
        company_name = getattr(offer, "entreprise", "Entreprise") or "Entreprise"

        if not to_email:
            print(f"[offers] no recipient email for user_id={payload.auth_user_id}; skipping submission email")
        else:
            body = {
                "to_email": to_email,
                "user_name": user_name,
                "offer_title": offer_title,
                "company_name": company_name,
                "status": ApplicationStatus.SUBMITTED.value,
            }
            r = requests.post(f"{MAIL_SERVICE_URL}/mail/application-notification", json=body, timeout=10)
            print(f"[offers] submission email http_status={r.status_code} to={to_email}")
    except Exception as e:
        # Never break core flow on email failure
        print(f"[offers] submission email error: {e}")

    return app


def get_application(db: Session, app_id: int) -> ApplicationDB:
    app = db.query(ApplicationDB).filter(ApplicationDB.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Candidature introuvable")
    return app


def list_applications(db: Session, user_id: Optional[int] = None, statut: Optional[str] = None, offre_id: Optional[int] = None):
    q = db.query(ApplicationDB)
    if user_id is not None:
        q = q.filter(ApplicationDB.auth_user_id == user_id)
    if offre_id is not None:
        q = q.filter(ApplicationDB.offre_id == offre_id)
    if statut is not None:
        try:
            q = q.filter(ApplicationDB.statut == ApplicationStatus(statut))
        except Exception:
            pass
    return q.order_by(ApplicationDB.date_candidature.desc()).all()


def update_application_status(db: Session, app_id: int, payload: ApplicationUpdateStatus) -> ApplicationDB:
    app = get_application(db, app_id)
    old_status = app.statut
    app.statut = payload.statut
    db.commit()
    db.refresh(app)

    # Si le candidat est accepté (offered), décrémenter les places disponibles
    if old_status != ApplicationStatus.OFFERED and payload.statut == ApplicationStatus.OFFERED:
        try:
            offer_closed = decrement_offer_places(db, app.offre_id)
            if offer_closed:
                print(f"[offers] Offre {app.offre_id} fermée automatiquement - toutes les places sont prises")
                # Créer notification d'offre fermée
                try:
                    offer = db.query(OfferDB).filter(OfferDB.id == app.offre_id).first()
                    if offer and offer.recruiter_user_id:
                        create_offer_full_notification(
                            db,
                            offer.recruiter_user_id,
                            offer.titre or "Offre",
                            offer.id
                        )
                except Exception as e:
                    print(f"[offers] Erreur notification offre fermée: {e}")
        except Exception as e:
            print(f"[offers] Erreur lors de la décrémentation des places: {e}")

    # Notify candidate about the status change
    try:
        # Load offer to extract title/company
        offer = db.query(OfferDB).filter(OfferDB.id == app.offre_id).first()
        offer_title = getattr(offer, "titre", "Offre") if offer else "Offre"
        company_name = getattr(offer, "entreprise", "Entreprise") if offer else "Entreprise"

        user = _get_user_info(app.auth_user_id) or {}
        to_email = user.get("email")
        user_name = f"{user.get('prenom') or ''} {user.get('name') or ''}".strip() or (to_email or "Candidat")

        if not to_email:
            print(f"[offers] no recipient email for user_id={app.auth_user_id}; skipping status email")
        else:
            body = {
                "to_email": to_email,
                "user_name": user_name,
                "offer_title": offer_title,
                "company_name": company_name or "Entreprise",
                "status": payload.statut.value,
            }
            r = requests.post(f"{MAIL_SERVICE_URL}/mail/application-notification", json=body, timeout=10)
            print(f"[offers] status email http_status={r.status_code} to={to_email} status={payload.statut.value}")
    except Exception as e:
        print(f"[offers] status email error: {e}")

    return app


def withdraw_application(db: Session, app_id: int, user_id: int, reason: str | None = None) -> ApplicationDB:
    """Permet au candidat de retirer sa candidature (passer le statut à withdrawn)."""
    app = get_application(db, app_id)
    # Authorization: only the owner can withdraw their application
    if app.auth_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à retirer cette candidature")
    
    # Change status to withdrawn
    app.statut = ApplicationStatus.WITHDRAWN
    
    # Optionally store the reason in message_motivation or a dedicated field
    # For now, we'll append it to message_motivation if provided
    if reason:
        current_msg = app.message_motivation or ""
        app.message_motivation = f"{current_msg}\n[Retrait candidat: {reason}]".strip()
    
    db.commit()
    db.refresh(app)
    
    # Notify candidate about withdrawal confirmation
    try:
        offer = db.query(OfferDB).filter(OfferDB.id == app.offre_id).first()
        offer_title = getattr(offer, "titre", "Offre") if offer else "Offre"
        company_name = getattr(offer, "entreprise", "Entreprise") if offer else "Entreprise"

        user = _get_user_info(app.auth_user_id) or {}
        to_email = user.get("email")
        user_name = f"{user.get('prenom') or ''} {user.get('name') or ''}".strip() or (to_email or "Candidat")

        if to_email:
            body = {
                "to_email": to_email,
                "user_name": user_name,
                "offer_title": offer_title,
                "company_name": company_name or "Entreprise",
                "status": ApplicationStatus.WITHDRAWN.value,
            }
            r = requests.post(f"{MAIL_SERVICE_URL}/mail/application-notification", json=body, timeout=10)
            print(f"[offers] withdrawal email http_status={r.status_code} to={to_email}")
    except Exception as e:
        print(f"[offers] withdrawal email error: {e}")
    
    return app


def delete_application(db: Session, app_id: int, user_id: int):
    app = get_application(db, app_id)
    # Authorization: only the owner (auth_user_id) can delete their application
    if app.auth_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à supprimer cette candidature")
    db.delete(app)
    db.commit()
    return {"detail": "Candidature supprimée"}


def stats_for_user(db: Session, user_id: int) -> dict:
    """Return counts per status for a user's applications."""
    data = {s.value: 0 for s in ApplicationStatus}
    rows = db.query(ApplicationDB.statut,).filter(ApplicationDB.auth_user_id == user_id).all()
    for (status,) in rows:
        key = status.value if isinstance(status, ApplicationStatus) else str(status)
        data[key] = data.get(key, 0) + 1
    data["total"] = sum(v for k, v in data.items() if k != "total")
    return data
