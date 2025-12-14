from mongoengine import Q
from mongoengine.errors import DoesNotExist
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional
from bson import ObjectId

from models.conversation import Conversation, ConversationCreate
from models.message import Message
from database.database import connect_to_mongodb


def create_conversation(payload: ConversationCreate) -> Conversation:
    """
    Crée une nouvelle conversation entre un candidat et un recruteur.
    Vérifie qu'une conversation n'existe pas déjà entre ces deux utilisateurs.
    """
    # Vérifier si une conversation existe déjà entre ces deux utilisateurs
    existing = Conversation.objects(
        Q(candidate_user_id=payload.candidate_user_id, recruiter_user_id=payload.recruiter_user_id) |
        Q(candidate_user_id=payload.recruiter_user_id, recruiter_user_id=payload.candidate_user_id)
    ).first()
    
    if existing:
        # Si la conversation existe déjà, la retourner
        return existing
    
    # Créer une nouvelle conversation
    conversation = Conversation(
        candidate_user_id=payload.candidate_user_id,
        recruiter_user_id=payload.recruiter_user_id,
        application_id=payload.application_id,
        offer_id=payload.offer_id,
        created_at=datetime.utcnow(),
        last_message_at=datetime.utcnow(),
        is_archived=False
    )
    
    conversation.save()
    return conversation


def get_conversation(conversation_id: str) -> Conversation:
    """Récupère une conversation par son ID."""
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        return conversation
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de conversation invalide: {str(e)}")


def list_conversations_for_user(user_id: int, include_archived: bool = False) -> List[dict]:
    """
    Liste toutes les conversations d'un utilisateur (en tant que candidat ou recruteur).
    Retourne les conversations avec le nombre de messages non lus.
    """
    query = Q(candidate_user_id=user_id) | Q(recruiter_user_id=user_id)
    
    if not include_archived:
        query = query & Q(is_archived=False)
    
    conversations = Conversation.objects(query).order_by('-last_message_at')
    
    # Enrichir avec le nombre de messages non lus
    result = []
    for conv in conversations:
        # Compter les messages non lus reçus par cet utilisateur
        unread_count = Message.objects(
            conversation_id=str(conv.id),
            sender_user_id__ne=user_id,
            is_read=False
        ).count()
        
        conv_dict = conv.to_dict()
        conv_dict["unread_count"] = unread_count
        result.append(conv_dict)
    
    return result


def archive_conversation(conversation_id: str, user_id: int) -> Conversation:
    """Archive une conversation (soft delete)."""
    conversation = get_conversation(conversation_id)
    
    # Vérifier que l'utilisateur fait partie de la conversation
    if conversation.candidate_user_id != user_id and conversation.recruiter_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à archiver cette conversation")
    
    conversation.is_archived = True
    conversation.save()
    return conversation


def delete_conversation(conversation_id: str, user_id: int):
    """Supprime définitivement une conversation et tous ses messages."""
    conversation = get_conversation(conversation_id)
    
    # Vérifier que l'utilisateur fait partie de la conversation
    if conversation.candidate_user_id != user_id and conversation.recruiter_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à supprimer cette conversation")
    
    # Supprimer tous les messages associés
    Message.objects(conversation_id=conversation_id).delete()
    
    # Supprimer la conversation
    conversation.delete()
    return {"detail": "Conversation supprimée"}


def update_last_message_time(conversation_id: str):
    """Met à jour le timestamp du dernier message pour une conversation."""
    try:
        conversation = Conversation.objects.get(id=conversation_id)
        conversation.last_message_at = datetime.utcnow()
        conversation.save()
    except DoesNotExist:
        # Conversation introuvable, on ignore silencieusement
        pass