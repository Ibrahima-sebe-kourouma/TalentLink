from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Enum
from datetime import datetime
from enum import Enum as PyEnum
from pydantic import BaseModel, Field
from typing import Optional, List

from database.database import Base


class OfferStatus(str, PyEnum):
    DRAFT = "draft"
    PUBLISHED = "published"
    CLOSED = "closed"


class ContractType(str, PyEnum):
    CDI = "CDI"
    CDD = "CDD"
    STAGE = "STAGE"
    FREELANCE = "FREELANCE"
    ALTERNANCE = "ALTERNANCE"


class OfferDB(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    # Owner (auth user id of recruiter)
    recruiter_user_id = Column(Integer, nullable=True, index=True)
    titre = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    type_contrat = Column(Enum(ContractType), nullable=False)
    localisation = Column(String, nullable=True)
    entreprise = Column(String, nullable=True)
    domaine = Column(String, nullable=True)
    mots_cles = Column(Text, nullable=True)  # CSV de mots-clés simples
    remote = Column(Boolean, default=False)
    salaire_min = Column(Integer, nullable=True)
    salaire_max = Column(Integer, nullable=True)
    experience_requise = Column(String, nullable=True)
    education_requise = Column(String, nullable=True)
    nb_postes = Column(Integer, default=1)
    places_restantes = Column(Integer, default=1)  # Nombre de places encore disponibles
    date_publication = Column(DateTime, default=datetime.utcnow)
    date_expiration = Column(DateTime, nullable=True)
    statut = Column(Enum(OfferStatus), default=OfferStatus.DRAFT)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# Pydantic Schemas
class OfferBase(BaseModel):
    titre: str
    description: str
    type_contrat: ContractType
    localisation: Optional[str] = None
    entreprise: Optional[str] = None
    domaine: Optional[str] = None
    mots_cles: Optional[List[str]] = None
    remote: Optional[bool] = False
    salaire_min: Optional[int] = None
    salaire_max: Optional[int] = None
    experience_requise: Optional[str] = None
    education_requise: Optional[str] = None
    nb_postes: Optional[int] = 1
    places_restantes: Optional[int] = None  # Calculé automatiquement si non fourni
    date_expiration: Optional[datetime] = None


class OfferCreate(OfferBase):
    recruiter_user_id: int


class OfferUpdate(BaseModel):
    titre: Optional[str] = None
    description: Optional[str] = None
    type_contrat: Optional[ContractType] = None
    localisation: Optional[str] = None
    entreprise: Optional[str] = None
    domaine: Optional[str] = None
    mots_cles: Optional[List[str]] = None
    remote: Optional[bool] = None
    salaire_min: Optional[int] = None
    salaire_max: Optional[int] = None
    experience_requise: Optional[str] = None
    education_requise: Optional[str] = None
    nb_postes: Optional[int] = None
    places_restantes: Optional[int] = None
    date_expiration: Optional[datetime] = None
    statut: Optional[OfferStatus] = None


class OfferResponse(OfferBase):
    id: int
    recruiter_user_id: int | None = None
    statut: OfferStatus
    date_publication: datetime
    created_at: datetime
    updated_at: datetime
    places_restantes: int  # Toujours inclus dans la réponse

    class Config:
        from_attributes = True
