from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from datetime import datetime
from pydantic import BaseModel
from typing import Optional, List
from database.database import Base

class ActionType(str, PyEnum):
    USER_SUSPENDED = "user_suspended"
    USER_BANNED = "user_banned"
    USER_REACTIVATED = "user_reactivated"
    OFFER_MODERATED = "offer_moderated"
    PROFILE_MODERATED = "profile_moderated"
    REPORT_RESOLVED = "report_resolved"
    ROLE_CHANGED = "role_changed"

class UserStatus(str, PyEnum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"

class ReportStatus(str, PyEnum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class ReportType(str, PyEnum):
    OFFER = "offer"
    PROFILE = "profile"
    MESSAGE = "message"
    OTHER = "other"

# Modèle pour l'audit des actions administratives
class AdminAuditDB(Base):
    __tablename__ = "admin_audit"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_user_id = Column(Integer, nullable=False, index=True)  # ID de l'admin qui fait l'action
    target_user_id = Column(Integer, nullable=True, index=True)  # ID de l'utilisateur ciblé (si applicable)
    action_type = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    details = Column(Text, nullable=True)  # JSON ou détails supplémentaires
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Modèle pour le statut des utilisateurs
class UserStatusDB(Base):
    __tablename__ = "user_status"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True, unique=True)
    status = Column(String, default="active")
    reason = Column(Text, nullable=True)  # Raison de la suspension/ban
    suspended_until = Column(DateTime, nullable=True)  # Date de fin de suspension
    admin_user_id = Column(Integer, nullable=True)  # Admin qui a fait l'action
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Modèle pour les signalements
class ReportDB(Base):
    __tablename__ = "reports"
    
    id = Column(Integer, primary_key=True, index=True)
    reporter_user_id = Column(Integer, nullable=False, index=True)  # Qui signale
    reported_user_id = Column(Integer, nullable=True, index=True)  # Utilisateur signalé (si applicable)
    report_type = Column(String, nullable=False)
    target_id = Column(Integer, nullable=True)  # ID de l'objet signalé (offre, profil, etc.)
    reason = Column(String, nullable=False)  # Catégorie du signalement
    description = Column(Text, nullable=False)  # Description détaillée
    status = Column(String, default="pending")
    admin_notes = Column(Text, nullable=True)  # Notes de l'administrateur
    reviewed_by = Column(Integer, nullable=True)  # ID de l'admin qui a traité
    reviewed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Schémas Pydantic pour l'audit
class AdminAuditCreate(BaseModel):
    admin_user_id: int
    target_user_id: Optional[int] = None
    action_type: str
    description: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class AdminAuditResponse(BaseModel):
    id: int
    admin_user_id: int
    target_user_id: Optional[int]
    action_type: str
    description: str
    details: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour le statut des utilisateurs
class UserStatusUpdate(BaseModel):
    status: str
    reason: Optional[str] = None
    suspended_until: Optional[datetime] = None

class UserStatusResponse(BaseModel):
    id: int
    user_id: int
    status: str
    reason: Optional[str]
    suspended_until: Optional[datetime]
    admin_user_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Schémas pour les signalements
class ReportCreate(BaseModel):
    reporter_user_id: int
    reported_user_id: Optional[int] = None
    report_type: str
    target_id: Optional[int] = None
    reason: str
    description: str

class ReportUpdate(BaseModel):
    status: Optional[str] = None
    admin_notes: Optional[str] = None

class ReportResponse(BaseModel):
    id: int
    reporter_user_id: int
    reported_user_id: Optional[int]
    report_type: str
    target_id: Optional[int]
    reason: str
    description: str
    status: str
    admin_notes: Optional[str]
    reviewed_by: Optional[int]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True