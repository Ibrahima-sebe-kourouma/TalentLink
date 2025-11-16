from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func, desc
from fastapi import HTTPException
from datetime import datetime
from typing import List, Optional

from models.conversation import ConversationDB, ConversationCreate
from models.message import MessageDB


def create_conversation(db: Session, payload: ConversationCreate) -> ConversationDB:
    """
    Crée une nouvelle conversation entre un candidat et un recruteur.
    Vérifie qu'une conversation n'existe pas déjà entre ces deux utilisateurs.
    """
    # Vérifier si une conversation existe déjà entre ces deux utilisateurs
    existing = db.query(ConversationDB).filter(
        or_(
            and_(
                ConversationDB.candidate_user_id == payload.candidate_user_id,
                ConversationDB.recruiter_user_id == payload.recruiter_user_id
            ),
            and_(
                ConversationDB.candidate_user_id == payload.recruiter_user_id,
                ConversationDB.recruiter_user_id == payload.candidate_user_id
            )
        )
    ).first()
    
    if existing:
        # Si la conversation existe déjà, la retourner
        return existing
    
    # Créer une nouvelle conversation
    conversation = ConversationDB(
        candidate_user_id=payload.candidate_user_id,
        recruiter_user_id=payload.recruiter_user_id,
        application_id=payload.application_id,
        offer_id=payload.offer_id,
        created_at=datetime.utcnow(),
        last_message_at=datetime.utcnow(),
        is_archived=False
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


def get_conversation(db: Session, conversation_id: int) -> ConversationDB:
    """Récupère une conversation par son ID."""
    conversation = db.query(ConversationDB).filter(ConversationDB.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    return conversation


def list_conversations_for_user(db: Session, user_id: int, include_archived: bool = False) -> List[dict]:
    """
    Liste toutes les conversations d'un utilisateur (en tant que candidat ou recruteur).
    Retourne les conversations avec le nombre de messages non lus.
    """
    query = db.query(ConversationDB).filter(
        or_(
            ConversationDB.candidate_user_id == user_id,
            ConversationDB.recruiter_user_id == user_id
        )
    )
    
    if not include_archived:
        query = query.filter(ConversationDB.is_archived == False)
    
    conversations = query.order_by(desc(ConversationDB.last_message_at)).all()
    
    # Enrichir avec le nombre de messages non lus
    result = []
    for conv in conversations:
        # Compter les messages non lus reçus par cet utilisateur
        unread_count = db.query(func.count(MessageDB.id)).filter(
            MessageDB.conversation_id == conv.id,
            MessageDB.sender_user_id != user_id,
            MessageDB.is_read == False
        ).scalar() or 0
        
        conv_dict = {
            "id": conv.id,
            "candidate_user_id": conv.candidate_user_id,
            "recruiter_user_id": conv.recruiter_user_id,
            "application_id": conv.application_id,
            "offer_id": conv.offer_id,
            "created_at": conv.created_at,
            "last_message_at": conv.last_message_at,
            "is_archived": conv.is_archived,
            "unread_count": unread_count
        }
        result.append(conv_dict)
    
    return result


def archive_conversation(db: Session, conversation_id: int, user_id: int) -> ConversationDB:
    """Archive une conversation (soft delete)."""
    conversation = get_conversation(db, conversation_id)
    
    # Vérifier que l'utilisateur fait partie de la conversation
    if conversation.candidate_user_id != user_id and conversation.recruiter_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à archiver cette conversation")
    
    conversation.is_archived = True
    db.commit()
    db.refresh(conversation)
    return conversation


def delete_conversation(db: Session, conversation_id: int, user_id: int):
    """Supprime définitivement une conversation et tous ses messages."""
    conversation = get_conversation(db, conversation_id)
    
    # Vérifier que l'utilisateur fait partie de la conversation
    if conversation.candidate_user_id != user_id and conversation.recruiter_user_id != user_id:
        raise HTTPException(status_code=403, detail="Non autorisé à supprimer cette conversation")
    
    # Supprimer tous les messages associés
    db.query(MessageDB).filter(MessageDB.conversation_id == conversation_id).delete()
    
    # Supprimer la conversation
    db.delete(conversation)
    db.commit()
    return {"detail": "Conversation supprimée"}
