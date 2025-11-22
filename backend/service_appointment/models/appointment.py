from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

# Import de la base commune
from database.database import Base

class AppointmentStatus(enum.Enum):
    PENDING = "pending"          # En attente de choix du candidat
    CONFIRMED = "confirmed"      # Candidat a choisi un créneau
    COMPLETED = "completed"      # RDV enrichi avec détails par le recruteur
    CANCELLED = "cancelled"      # Annulé
    REFUSED = "refused"          # Candidat a refusé tous les créneaux

class AppointmentMode(enum.Enum):
    ONLINE = "online"           # En ligne (Google Meet, etc.)
    PHYSICAL = "physical"       # En présentiel
    PHONE = "phone"             # Par téléphone

class Appointment(Base):
    """Modèle principal pour les rendez-vous"""
    __tablename__ = "appointments"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identifiants
    recruiter_id = Column(Integer, nullable=False, index=True)  # ID du recruteur
    candidate_id = Column(Integer, nullable=False, index=True)  # ID du candidat
    offer_id = Column(Integer, nullable=False, index=True)      # ID de l'offre concernée
    
    # Informations du poste
    position_title = Column(String(255), nullable=False)       # Titre du poste
    company_name = Column(String(255), nullable=False)         # Nom de l'entreprise
    
    # Statut et dates
    status = Column(Enum(AppointmentStatus), default=AppointmentStatus.PENDING, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Date choisie par le candidat (sera remplie quand le candidat choisit)
    chosen_datetime = Column(DateTime, nullable=True)
    
    # Détails du rendez-vous (remplis par le recruteur après confirmation)
    mode = Column(Enum(AppointmentMode), nullable=True)          # Mode de rdv
    location_details = Column(Text, nullable=True)              # Adresse ou lien Meet
    additional_notes = Column(Text, nullable=True)              # Notes supplémentaires
    
    # Relations
    proposed_slots = relationship("AppointmentSlot", back_populates="appointment", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Appointment(id={self.id}, candidate_id={self.candidate_id}, status={self.status.value})>"

class AppointmentSlot(Base):
    """Créneaux horaires proposés par le recruteur (3 maximum)"""
    __tablename__ = "appointment_slots"
    
    id = Column(Integer, primary_key=True, index=True)
    appointment_id = Column(Integer, ForeignKey('appointments.id'), nullable=False)
    
    # Date et heure proposées
    proposed_datetime = Column(DateTime, nullable=False)
    
    # Statut de ce créneau
    is_chosen = Column(Boolean, default=False)  # True si le candidat a choisi ce créneau
    
    # Relation
    appointment = relationship("Appointment", back_populates="proposed_slots")
    
    def __repr__(self):
        return f"<AppointmentSlot(id={self.id}, datetime={self.proposed_datetime}, chosen={self.is_chosen})>"

class AppointmentCandidate(Base):
    """Liste des candidats éligibles pour les rendez-vous"""
    __tablename__ = "appointment_candidates"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Identifiants
    recruiter_id = Column(Integer, nullable=False, index=True)  # ID du recruteur
    candidate_id = Column(Integer, nullable=False, index=True)  # ID du candidat
    offer_id = Column(Integer, nullable=False, index=True)      # ID de l'offre
    
    # Informations du candidat et poste
    candidate_name = Column(String(255), nullable=False)       # Nom du candidat
    candidate_email = Column(String(255), nullable=False)      # Email du candidat
    position_title = Column(String(255), nullable=False)       # Titre du poste
    company_name = Column(String(255), nullable=False)         # Nom de l'entreprise
    
    # Statut de la candidature qui a déclenché l'ajout
    application_status = Column(String(50), nullable=False)    # "review", "interview", "offer"
    
    # Dates de suivi
    added_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Status de rendez-vous
    has_appointment = Column(Boolean, default=False)           # True si un RDV a été créé
    
    def __repr__(self):
        return f"<AppointmentCandidate(id={self.id}, candidate={self.candidate_name}, status={self.application_status})>"