"""Models and Pydantic schemas for Candidate profiles.

Design notes:
- Each service has its own database. We don't import SQLAlchemy models from the auth service.
- We store `auth_user_id` (int) to link a profile to a user in the auth service.
- Lists such as `skills` and `experiences` are stored as JSON columns.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, JSON

from database.database import Base


class CandidatDB(Base):
    __tablename__ = "candidats"

    id = Column(Integer, primary_key=True, index=True)
    # Keep track of the auth service user id
    auth_user_id = Column(Integer, unique=True, nullable=False)
    # keep name/email locally to simplify UI assembly (copied from auth service)
    name = Column(String, nullable=True)
    prenom = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)

    telephone = Column(String, nullable=True)
    adresse = Column(String, nullable=True)
    ville = Column(String, nullable=True)
    pays = Column(String, nullable=True)
    code_postal = Column(String, nullable=True)
    resume_professionnel = Column(String, nullable=True)

    # JSON columns to hold lists of skills / experiences / education
    experience = Column(JSON, nullable=True, default=list)
    formation = Column(JSON, nullable=True, default=list)
    competences = Column(JSON, nullable=True, default=list)
    langues = Column(JSON, nullable=True, default=list)
    certifications = Column(JSON, nullable=True, default=list)
    autres = Column(JSON, nullable=True, default=list)
    projets = Column(JSON, nullable=True, default=list)

    lien = Column(String, nullable=True)
    cv = Column(String, nullable=True)
    lettre_motivation = Column(String, nullable=True)

    # progression du stepper (par ex. 1..5)
    progression = Column(Integer, default=1, nullable=False)

    date_creation = Column(DateTime, default=datetime.utcnow)
    date_modification = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ---- Pydantic schemas ----
class ExperienceItem(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None


class SkillItem(BaseModel):
    name: str
    level: Optional[str] = None


class CertificationItem(BaseModel):
    nom: Optional[str] = None
    organisme: Optional[str] = None
    date: Optional[str] = None
    expiration: Optional[str] = None
    identifiant: Optional[str] = None


class LanguageItem(BaseModel):
    langue: Optional[str] = None
    niveau: Optional[str] = None


class CandidatCreate(BaseModel):
    auth_user_id: int
    name: Optional[str] = None
    prenom: Optional[str] = None
    email: Optional[EmailStr] = None
    progression: Optional[int] = 1
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    resume_professionnel: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    formation: Optional[List[dict]] = None
    competences: Optional[List[SkillItem]] = None
    langues: Optional[List[LanguageItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    autres: Optional[List[str]] = None
    projets: Optional[List[dict]] = None
    lien: Optional[str] = None
    cv: Optional[str] = None
    lettre_motivation: Optional[str] = None


class CandidatUpdate(BaseModel):
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    resume_professionnel: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    formation: Optional[List[dict]] = None
    competences: Optional[List[SkillItem]] = None
    langues: Optional[List[LanguageItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    autres: Optional[List[str]] = None
    projets: Optional[List[dict]] = None
    lien: Optional[str] = None
    cv: Optional[str] = None
    lettre_motivation: Optional[str] = None
    progression: Optional[int] = None


class CandidatResponse(BaseModel):
    id: int
    #comme candidat est lié à un user dans auth par auth_user_id
    # affichons les informations de base de l'utilisateur dans candidat response


    auth_user_id: int
    # Identité de base (non sensibles)
    name: Optional[str] = None
    prenom: Optional[str] = None
    telephone: Optional[str] = None
    adresse: Optional[str] = None
    ville: Optional[str] = None
    pays: Optional[str] = None
    code_postal: Optional[str] = None
    resume_professionnel: Optional[str] = None
    experience: Optional[List[ExperienceItem]] = None
    formation: Optional[List[dict]] = None
    competences: Optional[List[SkillItem]] = None
    langues: Optional[List[LanguageItem]] = None
    certifications: Optional[List[CertificationItem]] = None
    autres: Optional[List[str]] = None
    projets: Optional[List[dict]] = None
    lien: Optional[str] = None
    cv: Optional[str] = None
    lettre_motivation: Optional[str] = None
    date_creation: Optional[datetime] = None
    date_modification: Optional[datetime] = None
    progression: Optional[int] = None

    class Config:
        from_attributes = True