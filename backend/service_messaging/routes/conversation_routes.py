from fastapi import APIRouter
from typing import List

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
def create_conversation_endpoint(payload: ConversationCreate):
    """
    Crée une nouvelle conversation entre un candidat et un recruteur.
    Si une conversation existe déjà, la retourne.
    """
    conversation = create_conversation(payload)
    return ConversationResponse(**conversation.to_dict())


@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation_endpoint(conversation_id: str):
    """Récupère une conversation par son ID."""
    conversation = get_conversation(conversation_id)
    return ConversationResponse(**conversation.to_dict())


@router.get("/")
def list_conversations_endpoint(user_id: int, include_archived: bool = False):
    """
    Liste toutes les conversations d'un utilisateur.
    Retourne les conversations avec le nombre de messages non lus.
    """
    return list_conversations_for_user(user_id, include_archived)


@router.patch("/{conversation_id}/archive", response_model=ConversationResponse)
def archive_conversation_endpoint(conversation_id: str, user_id: int):
    """Archive une conversation."""
    conversation = archive_conversation(conversation_id, user_id)
    return ConversationResponse(**conversation.to_dict())


@router.delete("/{conversation_id}")
def delete_conversation_endpoint(conversation_id: str, user_id: int):
    """Supprime définitivement une conversation et tous ses messages."""
    return delete_conversation(conversation_id, user_id)