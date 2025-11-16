from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, UniqueConstraint
from datetime import datetime
from enum import Enum as PyEnum
from pydantic import BaseModel
from typing import Optional

from database.database import Base


class ApplicationStatus(str, PyEnum):
    SUBMITTED = "submitted"
    IN_REVIEW = "in_review"
    INTERVIEW = "interview"
    OFFERED = "offered"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationDB(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    offre_id = Column(Integer, ForeignKey("offers.id"), index=True, nullable=False)
    auth_user_id = Column(Integer, index=True, nullable=False)
    candidat_id = Column(Integer, index=True, nullable=True)
    statut = Column(Enum(ApplicationStatus), default=ApplicationStatus.SUBMITTED)
    date_candidature = Column(DateTime, default=datetime.utcnow)
    message_motivation = Column(Text, nullable=True)
    cv_url = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('offre_id', 'auth_user_id', name='uq_app_offer_user'),
    )


# Pydantic Schemas
class ApplicationCreate(BaseModel):
    offre_id: int
    auth_user_id: int
    candidat_id: Optional[int] = None
    message_motivation: Optional[str] = None
    cv_url: Optional[str] = None


class ApplicationUpdateStatus(BaseModel):
    statut: ApplicationStatus


class ApplicationResponse(BaseModel):
    id: int
    offre_id: int
    auth_user_id: int
    candidat_id: Optional[int]
    statut: ApplicationStatus
    date_candidature: datetime
    message_motivation: Optional[str]
    cv_url: Optional[str]
    updated_at: datetime

    class Config:
        from_attributes = True
