from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import Optional

Base = declarative_base()

class NotificationType(str, Enum):
    NEW_APPLICATION = "new_application"
    APPLICATION_WITHDRAWN = "application_withdrawn"
    APPLICATION_UPDATED = "application_updated"
    OFFER_FULL = "offer_full"

class NotificationDB(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    recruiter_user_id = Column(Integer, nullable=False, index=True)  # ID du recruteur destinataire
    type = Column(String, nullable=False)  # Type de notification
    title = Column(String, nullable=False)  # Titre court
    message = Column(Text, nullable=False)  # Message détaillé
    related_id = Column(Integer, nullable=True)  # ID de l'objet lié (candidature, offre, etc.)
    related_type = Column(String, nullable=True)  # Type d'objet lié (application, offer)
    is_read = Column(Boolean, default=False)  # Lu ou non
    created_at = Column(DateTime, default=datetime.utcnow)

# Schémas Pydantic
class NotificationBase(BaseModel):
    recruiter_user_id: int
    type: NotificationType
    title: str
    message: str
    related_id: Optional[int] = None
    related_type: Optional[str] = None

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(NotificationBase):
    id: int
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None