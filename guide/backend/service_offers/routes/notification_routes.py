from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database.database import get_db
from models.notification import NotificationResponse, NotificationUpdate
from controllers.notification_controller import (
    get_notifications,
    get_unread_count,
    mark_as_read,
    mark_all_as_read,
    delete_old_notifications
)

router = APIRouter()


@router.get("/notifications", response_model=List[NotificationResponse])
def list_notifications(
    recruiter_user_id: int = Query(..., description="ID du recruteur"),
    unread_only: bool = Query(False, description="Afficher seulement les non lues"),
    limit: int = Query(50, description="Nombre maximum de résultats"),
    offset: int = Query(0, description="Décalage pour la pagination"),
    db: Session = Depends(get_db)
):
    """Récupérer les notifications d'un recruteur"""
    return get_notifications(db, recruiter_user_id, unread_only, limit, offset)


@router.get("/notifications/unread-count")
def get_unread_notifications_count(
    recruiter_user_id: int = Query(..., description="ID du recruteur"),
    db: Session = Depends(get_db)
):
    """Compter les notifications non lues"""
    count = get_unread_count(db, recruiter_user_id)
    return {"unread_count": count}


@router.patch("/notifications/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    recruiter_user_id: int = Query(..., description="ID du recruteur"),
    db: Session = Depends(get_db)
):
    """Marquer une notification comme lue"""
    notification = mark_as_read(db, notification_id, recruiter_user_id)
    return {"detail": "Notification marquée comme lue", "notification": notification}


@router.patch("/notifications/mark-all-read")
def mark_all_notifications_as_read(
    recruiter_user_id: int = Query(..., description="ID du recruteur"),
    db: Session = Depends(get_db)
):
    """Marquer toutes les notifications comme lues"""
    count = mark_all_as_read(db, recruiter_user_id)
    return {"detail": f"{count} notifications marquées comme lues"}


@router.delete("/notifications/cleanup")
def cleanup_old_notifications(
    days_old: int = Query(30, description="Supprimer les notifications plus anciennes que X jours"),
    db: Session = Depends(get_db)
):
    """Nettoyer les anciennes notifications (admin)"""
    count = delete_old_notifications(db, days_old)
    return {"detail": f"{count} notifications supprimées"}