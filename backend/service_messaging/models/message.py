from mongoengine import Document, StringField, IntField, DateTimeField, BooleanField, ObjectIdField
from datetime import datetime
from pydantic import BaseModel
from typing import Optional
from bson import ObjectId


class Message(Document):
    """
    Modèle MongoDB de message dans une conversation.
    Chaque message est envoyé par un utilisateur et appartient à une conversation.
    """
    meta = {
        'collection': 'messages',
        'indexes': [
            'conversation_id',
            'sender_user_id',
            'created_at',
            'is_read',
            ('conversation_id', 'created_at'),  # Index composé
            ('sender_user_id', 'created_at')
        ]
    }

    conversation_id = StringField(required=True)  # ObjectId string de la conversation
    
    # Expéditeur (ID du service auth)
    sender_user_id = IntField(required=True)
    
    # Contenu
    content = StringField(required=True)
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow, required=True)
    is_read = BooleanField(default=False)
    read_at = DateTimeField()

    def to_dict(self):
        """Convertir en dictionnaire pour l'API."""
        return {
            'id': str(self.id),
            'conversation_id': self.conversation_id,
            'sender_user_id': self.sender_user_id,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_read': self.is_read,
            'read_at': self.read_at.isoformat() if self.read_at else None
        }


# Pydantic Schemas (identiques à l'ancien)
class MessageCreate(BaseModel):
    conversation_id: str  # ObjectId string
    sender_user_id: int
    content: str


class MessageResponse(BaseModel):
    id: str  # MongoDB utilise des ObjectId string
    conversation_id: str  # ObjectId string
    sender_user_id: int
    content: str
    created_at: str  # ISO format string
    is_read: bool
    read_at: Optional[str]  # ISO format string

    class Config:
        from_attributes = True