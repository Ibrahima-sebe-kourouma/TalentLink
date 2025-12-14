from mongoengine import Q
from mongoengine.errors import DoesNotExist
from fastapi import HTTPException
from datetime import datetime
from typing import List
from bson import ObjectId

from models.message import Message, MessageCreate
from models.conversation import Conversation
from controllers.conversation_controller import update_last_message_time


def send_message(payload: MessageCreate) -> Message:
    """
    Envoie un nouveau message dans une conversation.
    Met à jour last_message_at de la conversation.
    """
    # Vérifier que la conversation existe
    try:
        conversation = Conversation.objects.get(id=payload.conversation_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de conversation invalide: {str(e)}")
    
    # Vérifier que l'expéditeur fait partie de la conversation
    if (payload.sender_user_id != conversation.candidate_user_id and 
        payload.sender_user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé à envoyer un message dans cette conversation")
    
    # Créer le message
    message = Message(
        conversation_id=payload.conversation_id,
        sender_user_id=payload.sender_user_id,
        content=payload.content,
        created_at=datetime.utcnow(),
        is_read=False
    )
    
    message.save()
    
    # Mettre à jour last_message_at de la conversation
    update_last_message_time(payload.conversation_id)
    
    return message


def get_messages(conversation_id: str, user_id: int, limit: int = 50, offset: int = 0) -> List[Message]:
    """
    Récupère les messages d'une conversation.
    Vérifie que l'utilisateur fait partie de la conversation.
    """
    # Vérifier que la conversation existe et que l'utilisateur y participe
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de conversation invalide: {str(e)}")
    
    if (user_id != conversation.candidate_user_id and 
        user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé à voir ces messages")
    
    # Récupérer les messages avec pagination
    messages = Message.objects(
        conversation_id=conversation_id
    ).order_by('created_at').skip(offset).limit(limit)
    
    return list(messages)


def mark_messages_as_read(conversation_id: str, user_id: int) -> int:
    """
    Marque tous les messages non lus d'une conversation comme lus pour un utilisateur.
    Retourne le nombre de messages marqués comme lus.
    """
    # Vérifier que la conversation existe et que l'utilisateur y participe
    try:
        conversation = Conversation.objects.get(id=conversation_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de conversation invalide: {str(e)}")
    
    if (user_id != conversation.candidate_user_id and 
        user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    # Marquer comme lus tous les messages reçus par cet utilisateur
    unread_messages = Message.objects(
        conversation_id=conversation_id,
        sender_user_id__ne=user_id,
        is_read=False
    )
    
    count = unread_messages.count()
    
    # Mettre à jour tous les messages non lus
    for message in unread_messages:
        message.is_read = True
        message.read_at = datetime.utcnow()
        message.save()
    
    return count


def get_unread_count(user_id: int) -> int:
    """Compte le nombre total de messages non lus pour un utilisateur."""
    # Récupérer toutes les conversations de l'utilisateur
    conversations = Conversation.objects(
        Q(candidate_user_id=user_id) | Q(recruiter_user_id=user_id)
    ).only('id')
    
    conversation_ids = [str(conv.id) for conv in conversations]
    
    if not conversation_ids:
        return 0
    
    # Compter les messages non lus reçus par cet utilisateur
    count = Message.objects(
        conversation_id__in=conversation_ids,
        sender_user_id__ne=user_id,
        is_read=False
    ).count()
    
    return count


def delete_message(message_id: str, user_id: int):
    """Supprime un message (seul l'expéditeur peut supprimer son message)."""
    try:
        message = Message.objects.get(id=message_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de message invalide: {str(e)}")
    
    if message.sender_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à supprimer ce message")
    
    message.delete()
    return {"detail": "Message supprimé"}


def get_message(message_id: str, user_id: int) -> Message:
    """Récupère un message spécifique si l'utilisateur y a accès."""
    try:
        message = Message.objects.get(id=message_id)
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ID de message invalide: {str(e)}")
    
    # Vérifier que l'utilisateur fait partie de la conversation
    try:
        conversation = Conversation.objects.get(id=message.conversation_id)
        if (user_id != conversation.candidate_user_id and 
            user_id != conversation.recruiter_user_id):
            raise HTTPException(status_code=403, detail="Non autorisé à voir ce message")
    except DoesNotExist:
        raise HTTPException(status_code=404, detail="Conversation associée non trouvée")
    
    return message