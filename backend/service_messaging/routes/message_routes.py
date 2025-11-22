from fastapi import APIRouter
from typing import List

from models.message import MessageCreate, MessageResponse
from controllers.message_controller import (
    send_message,
    get_messages,
    mark_messages_as_read,
    get_unread_count,
    delete_message,
    get_message,
)

router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/", response_model=MessageResponse)
def send_message_endpoint(payload: MessageCreate):
    """Envoie un nouveau message dans une conversation."""
    message = send_message(payload)
    return MessageResponse(**message.to_dict())


@router.get("/conversation/{conversation_id}", response_model=List[MessageResponse])
def get_messages_endpoint(
    conversation_id: str, 
    user_id: int, 
    limit: int = 50, 
    offset: int = 0
):
    """Récupère les messages d'une conversation."""
    messages = get_messages(conversation_id, user_id, limit, offset)
    return [MessageResponse(**msg.to_dict()) for msg in messages]


@router.get("/{message_id}", response_model=MessageResponse)
def get_message_endpoint(message_id: str, user_id: int):
    """Récupère un message spécifique."""
    message = get_message(message_id, user_id)
    return MessageResponse(**message.to_dict())


@router.patch("/conversation/{conversation_id}/mark-read")
def mark_as_read_endpoint(conversation_id: str, user_id: int):
    """Marque tous les messages non lus d'une conversation comme lus."""
    count = mark_messages_as_read(conversation_id, user_id)
    return {"marked_as_read": count}


@router.get("/unread-count")
def unread_count_endpoint(user_id: int):
    """Retourne le nombre total de messages non lus pour un utilisateur."""
    count = get_unread_count(user_id)
    return {"unread_count": count}


@router.delete("/{message_id}")
def delete_message_endpoint(message_id: str, user_id: int):
    """Supprime un message (seul l'expéditeur peut supprimer)."""
    return delete_message(message_id, user_id)