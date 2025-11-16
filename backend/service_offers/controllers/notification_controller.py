from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from fastapi import HTTPException
from typing import List, Optional
from datetime import datetime, timedelta

from models.notification import NotificationDB, NotificationCreate, NotificationUpdate, NotificationType


def create_notification(db: Session, payload: NotificationCreate) -> NotificationDB:
    """Créer une nouvelle notification"""
    notification = NotificationDB(
        recruiter_user_id=payload.recruiter_user_id,
        type=payload.type,
        title=payload.title,
        message=payload.message,
        related_id=payload.related_id,
        related_type=payload.related_type,
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification


def get_notifications(
    db: Session, 
    recruiter_user_id: int,
    unread_only: bool = False,
    limit: int = 50,
    offset: int = 0
) -> List[NotificationDB]:
    """Récupérer les notifications d'un recruteur"""
    query = db.query(NotificationDB).filter(NotificationDB.recruiter_user_id == recruiter_user_id)
    
    if unread_only:
        query = query.filter(NotificationDB.is_read == False)
    
    return query.order_by(desc(NotificationDB.created_at)).offset(offset).limit(limit).all()


def get_unread_count(db: Session, recruiter_user_id: int) -> int:
    """Compter les notifications non lues"""
    return db.query(NotificationDB).filter(
        and_(
            NotificationDB.recruiter_user_id == recruiter_user_id,
            NotificationDB.is_read == False
        )
    ).count()


def mark_as_read(db: Session, notification_id: int, recruiter_user_id: int) -> NotificationDB:
    """Marquer une notification comme lue"""
    notification = db.query(NotificationDB).filter(
        and_(
            NotificationDB.id == notification_id,
            NotificationDB.recruiter_user_id == recruiter_user_id
        )
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification introuvable")
    
    notification.is_read = True
    db.commit()
    db.refresh(notification)
    return notification


def mark_all_as_read(db: Session, recruiter_user_id: int) -> int:
    """Marquer toutes les notifications comme lues"""
    count = db.query(NotificationDB).filter(
        and_(
            NotificationDB.recruiter_user_id == recruiter_user_id,
            NotificationDB.is_read == False
        )
    ).update({"is_read": True})
    
    db.commit()
    return count


def delete_old_notifications(db: Session, days_old: int = 30) -> int:
    """Supprimer les notifications anciennes (nettoyage)"""
    cutoff_date = datetime.utcnow() - timedelta(days=days_old)
    count = db.query(NotificationDB).filter(
        NotificationDB.created_at < cutoff_date
    ).delete()
    
    db.commit()
    return count


def create_application_notification(
    db: Session,
    recruiter_user_id: int,
    candidate_name: str,
    offer_title: str,
    application_id: int
):
    """Helper pour créer une notification de nouvelle candidature"""
    return create_notification(db, NotificationCreate(
        recruiter_user_id=recruiter_user_id,
        type=NotificationType.NEW_APPLICATION,
        title="Nouvelle candidature",
        message=f"{candidate_name} a postulé pour l'offre '{offer_title}'",
        related_id=application_id,
        related_type="application"
    ))


def create_offer_full_notification(
    db: Session,
    recruiter_user_id: int,
    offer_title: str,
    offer_id: int
):
    """Helper pour créer une notification d'offre complète"""
    return create_notification(db, NotificationCreate(
        recruiter_user_id=recruiter_user_id,
        type=NotificationType.OFFER_FULL,
        title="Offre complète",
        message=f"L'offre '{offer_title}' a été fermée automatiquement car toutes les places sont prises",
        related_id=offer_id,
        related_type="offer"
    ))