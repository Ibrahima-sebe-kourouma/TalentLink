from mongoengine import Document, StringField, IntField, DateTimeField, BooleanField, ListField
from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class Conversation(Document):
    """
    Modèle MongoDB de conversation entre deux utilisateurs.
    Une conversation lie un candidat et un recruteur, généralement initiée depuis une candidature.
    """
    meta = {
        'collection': 'conversations',
        'indexes': [
            'candidate_user_id',
            'recruiter_user_id', 
            'application_id',
            'offer_id',
            'created_at',
            'last_message_at'
        ]
    }

    # Participants (IDs du service auth)
    candidate_user_id = IntField(required=True)
    recruiter_user_id = IntField(required=True)
    
    # Contexte optionnel
    application_id = IntField()  # ID de la candidature qui a initié la conversation
    offer_id = IntField()  # ID de l'offre liée
    
    # Metadata
    created_at = DateTimeField(default=datetime.utcnow, required=True)
    last_message_at = DateTimeField(default=datetime.utcnow, required=True)
    
    # Statut
    is_archived = BooleanField(default=False)

    def to_dict(self):
        """Convertir en dictionnaire pour l'API."""
        return {
            'id': str(self.id),
            'candidate_user_id': self.candidate_user_id,
            'recruiter_user_id': self.recruiter_user_id,
            'application_id': self.application_id,
            'offer_id': self.offer_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_message_at': self.last_message_at.isoformat() if self.last_message_at else None,
            'is_archived': self.is_archived
        }


# Pydantic Schemas (identiques à l'ancien)
class ConversationCreate(BaseModel):
    candidate_user_id: int
    recruiter_user_id: int
    application_id: Optional[int] = None
    offer_id: Optional[int] = None


class ConversationResponse(BaseModel):
    id: str  # MongoDB utilise des ObjectId string
    candidate_user_id: int
    recruiter_user_id: int
    application_id: Optional[int]
    offer_id: Optional[int]
    created_at: str  # ISO format string
    last_message_at: str  # ISO format string
    is_archived: bool
    unread_count: Optional[int] = 0  # Sera calculé côté controller

    class Config:
        from_attributes = True