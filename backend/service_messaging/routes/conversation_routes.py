from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database.database import get_db
from models.conversation import ConversationCreate, ConversationResponse
from controllers.conversation_controller import (
    create_conversation,
    get_conversation,
    list_conversations_for_user,
    archive_conversation,
    delete_conversation,
)

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.post("/", response_model=ConversationResponse)
def create_conversation_endpoint(payload: ConversationCreate, db: Session = Depends(get_db)):
    """
    Crée une nouvelle conversation entre un candidat et un recruteur.
    Si une conversation existe déjà, la retourne.
    """
    return create_conversation(db, payload)


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation_endpoint(conversation_id: int, db: Session = Depends(get_db)):
    """Récupère une conversation par son ID."""
    return get_conversation(db, conversation_id)


@router.get("/")
def list_conversations_endpoint(user_id: int, include_archived: bool = False, db: Session = Depends(get_db)):
    """
    Liste toutes les conversations d'un utilisateur.
    Retourne les conversations avec le nombre de messages non lus.
    """
    return list_conversations_for_user(db, user_id, include_archived)


@router.patch("/{conversation_id}/archive", response_model=ConversationResponse)
def archive_conversation_endpoint(conversation_id: int, user_id: int, db: Session = Depends(get_db)):
    """Archive une conversation."""
    return archive_conversation(db, conversation_id, user_id)


@router.delete("/{conversation_id}")
def delete_conversation_endpoint(conversation_id: int, user_id: int, db: Session = Depends(get_db)):
    """Supprime définitivement une conversation et tous ses messages."""
    return delete_conversation(db, conversation_id, user_id)
