from sqlalchemy.orm import Session
from sqlalchemy import desc
from fastapi import HTTPException
from datetime import datetime
from typing import List

from models.message import MessageDB, MessageCreate
from models.conversation import ConversationDB


def send_message(db: Session, payload: MessageCreate) -> MessageDB:
    """
    Envoie un nouveau message dans une conversation.
    Met à jour last_message_at de la conversation.
    """
    # Vérifier que la conversation existe
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == payload.conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Vérifier que l'expéditeur fait partie de la conversation
    if (payload.sender_user_id != conversation.candidate_user_id and 
        payload.sender_user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé à envoyer un message dans cette conversation")
    
    # Créer le message
    message = MessageDB(
        conversation_id=payload.conversation_id,
        sender_user_id=payload.sender_user_id,
        content=payload.content,
        created_at=datetime.utcnow(),
        is_read=False
    )
    
    db.add(message)
    
    # Mettre à jour last_message_at de la conversation
    conversation.last_message_at = datetime.utcnow()
    
    db.commit()
    db.refresh(message)
    return message


def get_messages(db: Session, conversation_id: int, user_id: int, limit: int = 50, offset: int = 0) -> List[MessageDB]:
    """
    Récupère les messages d'une conversation.
    Vérifie que l'utilisateur fait partie de la conversation.
    """
    # Vérifier que la conversation existe et que l'utilisateur y participe
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    if (user_id != conversation.candidate_user_id and 
        user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé à voir ces messages")
    
    # Récupérer les messages
    messages = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id
    ).order_by(MessageDB.created_at).offset(offset).limit(limit).all()
    
    return messages


def mark_messages_as_read(db: Session, conversation_id: int, user_id: int) -> int:
    """
    Marque tous les messages non lus d'une conversation comme lus pour un utilisateur.
    Retourne le nombre de messages marqués comme lus.
    """
    # Vérifier que la conversation existe et que l'utilisateur y participe
    conversation = db.query(ConversationDB).filter(
        ConversationDB.id == conversation_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    if (user_id != conversation.candidate_user_id and 
        user_id != conversation.recruiter_user_id):
        raise HTTPException(status_code=403, detail="Non autorisé")
    
    # Marquer comme lus tous les messages reçus par cet utilisateur
    count = db.query(MessageDB).filter(
        MessageDB.conversation_id == conversation_id,
        MessageDB.sender_user_id != user_id,
        MessageDB.is_read == False
    ).update({
        "is_read": True,
        "read_at": datetime.utcnow()
    })
    
    db.commit()
    return count


def get_unread_count(db: Session, user_id: int) -> int:
    """Compte le nombre total de messages non lus pour un utilisateur."""
    # Récupérer toutes les conversations de l'utilisateur
    conversations = db.query(ConversationDB.id).filter(
        (ConversationDB.candidate_user_id == user_id) | 
        (ConversationDB.recruiter_user_id == user_id)
    ).all()
    
    conversation_ids = [c.id for c in conversations]
    
    if not conversation_ids:
        return 0
    
    # Compter les messages non lus reçus par cet utilisateur
    count = db.query(MessageDB).filter(
        MessageDB.conversation_id.in_(conversation_ids),
        MessageDB.sender_user_id != user_id,
        MessageDB.is_read == False
    ).count()
    
    return count


def delete_message(db: Session, message_id: int, user_id: int):
    """Supprime un message (seul l'expéditeur peut supprimer son message)."""
    message = db.query(MessageDB).filter(MessageDB.id == message_id).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    if message.sender_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à supprimer ce message")
    
    db.delete(message)
    db.commit()
    return {"detail": "Message supprimé"}
