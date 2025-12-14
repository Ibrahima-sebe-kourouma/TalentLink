"""Models and Pydantic schemas for Recruiter profiles.

Design notes:
- Mirrors the candidate profile structure where it makes sense.
- Each recruiter is linked to an auth service user via `auth_user_id` (unique).
- Company information and contact person details are stored locally for UI simplicity.
"""
from datetime import datetime
from typing import Optional, List, Dict

from pydantic import BaseModel, EmailStr, HttpUrl
from sqlalchemy import Column, Integer, String, DateTime, JSON

from database.database import Base


class RecruteurDB(Base):
    __tablename__ = "recruteurs"

    id = Column(Integer, primary_key=True, index=True)
    # Link back to auth service user
    auth_user_id = Column(Integer, unique=True, nullable=False)

    # Contact person details
    name = Column(String, nullable=True)
    prenom = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    telephone = Column(String, nullable=True)

    # Company details
    entreprise = Column(String, nullable=True)
    role = Column(String, nullable=True)  # ex: Talent Acquisition, HR, etc.
    description_entreprise = Column(String, nullable=True)

    adresse = Column(String, nullable=True)
    ville = Column(String, nullable=True)
    pays = Column(String, nullable=True)
    code_postal = Column(String, nullable=True)

    site_web = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    linkedin = Column(String, nullable=True)
    twitter = Column(String, nullable=True)
    autres_liens = Column(JSON, nullable=True, default=list)  # list[str] or list[dict]

    preferences_recrutement = Column(JSON, nullable=True, default=dict)  # ex: domaines, types_contrat

    progression = Column(Integer, default=1, nullable=False)

    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---- Pydantic schemas ----
class RecruteurCreate(BaseModel):
    auth_user_id: int
    name: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    entreprise: Optional[str] = None
    role: Optional[str] = None
    description_entreprise: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    site_web: Optional[str] = None
    logo_url: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    autres_liens: Optional[List[str]] = None
    preferences_recrutement: Optional[Dict[str, object]] = None
    progression: Optional[int] = 1


class RecruteurUpdate(BaseModel):
    name: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    telephone: Optional[str] = None
    entreprise: Optional[str] = None
    role: Optional[str] = None
    description_entreprise: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    site_web: Optional[str] = None
    logo_url: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    autres_liens: Optional[List[str]] = None
    preferences_recrutement: Optional[Dict[str, object]] = None
    progression: Optional[int] = None


class RecruteurResponse(BaseModel):
    id: int
    auth_user_id: int
    name: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[str] = None
    telephone: Optional[str] = None
    entreprise: Optional[str] = None
    role: Optional[str] = None
    description_entreprise: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    site_web: Optional[str] = None
    logo_url: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    autres_liens: Optional[List[str]] = None
    preferences_recrutement: Optional[Dict[str, object]] = None
    progression: Optional[int] = None
    date_creation: Optional[datetime] = None
    date_modification: Optional[datetime] = None

    class Config:
        from_attributes = True
