from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from models.message import MessageCreate, MessageResponse
from controllers.message_controller import (
    send_message,
    get_messages,
    mark_messages_as_read,
    get_unread_count,
    delete_message,
)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse)
def send_message_endpoint(payload: MessageCreate, db: Session = Depends(get_db)):
    """Envoie un nouveau message dans une conversation."""
    return send_message(db, payload)


@router.get("/conversation/{conversation_id}", response_model=List[MessageResponse])
def get_messages_endpoint(
    conversation_id: int, 
    user_id: int, 
    limit: int = 50, 
    offset: int = 0, 
    db: Session = Depends(get_db)
):
    """Récupère les messages d'une conversation."""
    return get_messages(db, conversation_id, user_id, limit, offset)


@router.patch("/conversation/{conversation_id}/mark-read")
def mark_as_read_endpoint(conversation_id: int, user_id: int, db: Session = Depends(get_db)):
    """Marque tous les messages non lus d'une conversation comme lus."""
    count = mark_messages_as_read(db, conversation_id, user_id)
    return {"marked_as_read": count}


@router.get("/unread-count")
def unread_count_endpoint(user_id: int, db: Session = Depends(get_db)):
    """Retourne le nombre total de messages non lus pour un utilisateur."""
    count = get_unread_count(db, user_id)
    return {"unread_count": count}


@router.delete("/{message_id}")
def delete_message_endpoint(message_id: int, user_id: int, db: Session = Depends(get_db)):
    """Supprime un message (seul l'expéditeur peut supprimer)."""
    return delete_message(db, message_id, user_id)
