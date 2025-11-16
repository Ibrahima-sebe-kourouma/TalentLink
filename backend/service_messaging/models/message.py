from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from datetime import datetime
from pydantic import BaseModel
from typing import Optional

from database.database import Base


class MessageDB(Base):
    """
    Modèle de message dans une conversation.
    Chaque message est envoyé par un utilisateur et appartient à une conversation.
    """
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), index=True, nullable=False)
    
    # Expéditeur (ID du service auth)
    sender_user_id = Column(Integer, index=True, nullable=False)
    
    # Contenu
    content = Column(Text, nullable=False)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)


# Pydantic Schemas
class MessageCreate(BaseModel):
    conversation_id: int
    sender_user_id: int
    content: str


class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender_user_id: int
    content: str
    created_at: datetime
    is_read: bool
    read_at: Optional[datetime]

    class Config:
        from_attributes = True
