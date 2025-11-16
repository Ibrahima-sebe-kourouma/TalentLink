from sqlalchemy import Column, Integer, String, Boolean, Enum, DateTime
from enum import Enum as PyEnum
from datetime import datetime
from pydantic import BaseModel, EmailStr

from database.database import Base

class Role(str, PyEnum):
    CANDIDAT = "candidat"
    RECRUTEUR = "recruteur" 
    ADMIN = "admin"

# ---- Modèle SQLAlchemy ----
class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    prenom = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    role = Column(String, default="candidat")  # Temporairement en String pour compatibilité
    est_actif = Column(Boolean, default=True)
    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    # Password reset fields (nullable for users without an active reset)
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expiry = Column(DateTime, nullable=True)

# ---- Schéma Pydantic ----
class UserCreate(BaseModel):
    name: str
    prenom: str
    email: EmailStr
    password: str
    role: str = "candidat"  # String au lieu d'enum

class UserResponse(BaseModel):
    id: int
    name: str
    prenom: str
    email: EmailStr
    role: str  # String au lieu d'enum
    est_actif: bool
    # Do not expose reset tokens in API responses

    class Config:
        from_attributes = True
