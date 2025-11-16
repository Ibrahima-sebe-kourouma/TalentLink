from sqlalchemy import Column, Integer, String, DateTime, Boolean
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from database.database import Base


class ConversationDB(Base):
    """
    Modèle de conversation entre deux utilisateurs.
    Une conversation lie un candidat et un recruteur, généralement initiée depuis une candidature.
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    
    # Participants (IDs du service auth)
    candidate_user_id = Column(Integer, index=True, nullable=False)
    recruiter_user_id = Column(Integer, index=True, nullable=False)
    
    # Contexte optionnel
    application_id = Column(Integer, index=True, nullable=True)  # ID de la candidature qui a initié la conversation
    offer_id = Column(Integer, index=True, nullable=True)  # ID de l'offre liée
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_message_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Statut
    is_archived = Column(Boolean, default=False)


# Pydantic Schemas
class ConversationCreate(BaseModel):
    candidate_user_id: int
    recruiter_user_id: int
    application_id: Optional[int] = None
    offer_id: Optional[int] = None


class ConversationResponse(BaseModel):
    id: int
    candidate_user_id: int
    recruiter_user_id: int
    application_id: Optional[int]
    offer_id: Optional[int]
    created_at: datetime
    last_message_at: datetime
    is_archived: bool
    unread_count: Optional[int] = 0  # Sera calculé côté controller

    class Config:
        from_attributes = True
