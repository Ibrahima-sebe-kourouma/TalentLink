from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database.database import get_database
from controllers.appointment_controller import AppointmentController
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

router = APIRouter(prefix="/appointments", tags=["appointments"])

# ============ MODÈLES PYDANTIC ============

class AppointmentProposal(BaseModel):
    candidate_id: int
    offer_id: int
    proposed_slots: List[str]  # Liste de 3 datetime en ISO format

class CandidateEligible(BaseModel):
    candidate_id: int
    offer_id: int
    candidate_name: str
    candidate_email: str
    position_title: str
    company_name: str
    application_status: str  # "review", "interview", "offer"

class AppointmentDetails(BaseModel):
    mode: str  # "online", "physical", "phone"
    location_details: str
    additional_notes: Optional[str] = ""

class SlotChoice(BaseModel):
    appointment_id: int
    slot_id: int

# ============ ROUTES POUR LES RECRUTEURS ============

@router.post("/candidates/add")
async def add_candidate_to_appointments(
    recruiter_id: int,
    candidate_data: CandidateEligible,
    db: Session = Depends(get_database)
):
    """Ajoute un candidat à la liste des rendez-vous possibles"""
    controller = AppointmentController(db)
    success = controller.add_candidate_to_appointments(recruiter_id, candidate_data.dict())
    
    if success:
        return {"message": "Candidat ajouté à la liste des rendez-vous", "success": True}
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de l'ajout du candidat"
        )

@router.get("/candidates/{recruiter_id}")
async def get_eligible_candidates(
    recruiter_id: int,
    db: Session = Depends(get_database)
):
    """Récupère la liste des candidats éligibles pour les rendez-vous"""
    controller = AppointmentController(db)
    candidates = controller.get_eligible_candidates(recruiter_id)
    return {"candidates": candidates}

@router.post("/create")
async def create_appointment_proposal(
    recruiter_id: int,
    appointment_data: AppointmentProposal,
    db: Session = Depends(get_database)
):
    """Crée une proposition de rendez-vous avec 3 créneaux"""
    controller = AppointmentController(db)
    
    # Validation des créneaux (doit y en avoir exactement 3)
    if len(appointment_data.proposed_slots) != 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vous devez proposer exactement 3 créneaux horaires"
        )
    
    result = controller.create_appointment_proposal(recruiter_id, appointment_data.dict())
    
    if result:
        return result
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Erreur lors de la création du rendez-vous"
        )

@router.get("/recruiter/{recruiter_id}")
async def get_recruiter_appointments(
    recruiter_id: int,
    db: Session = Depends(get_database)
):
    """Récupère tous les rendez-vous d'un recruteur"""
    controller = AppointmentController(db)
    appointments = controller.get_recruiter_appointments(recruiter_id)
    return {"appointments": appointments}

@router.put("/complete/{appointment_id}")
async def complete_appointment_details(
    appointment_id: int,
    recruiter_id: int,
    details: AppointmentDetails,
    db: Session = Depends(get_database)
):
    """Le recruteur ajoute les détails finaux du rendez-vous"""
    controller = AppointmentController(db)
    success = controller.complete_appointment_details(recruiter_id, appointment_id, details.dict())
    
    if success:
        return {"message": "Détails du rendez-vous mis à jour", "success": True}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous non trouvé ou non modifiable"
        )

@router.post("/send-final-email/{appointment_id}")
async def send_final_appointment_email(
    appointment_id: int,
    recruiter_id: int,
    db: Session = Depends(get_database)
):
    """Envoie l'email final avec tous les détails au candidat"""
    controller = AppointmentController(db)
    success = controller.send_final_appointment_email(recruiter_id, appointment_id)
    
    if success:
        return {"message": "Email envoyé au candidat", "success": True}
    else:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rendez-vous non trouvé ou email non envoyé"
        )

# ============ ROUTES POUR LES CANDIDATS ============

@router.get("/candidate/{candidate_id}")
async def get_candidate_appointments(
    candidate_id: int,
    db: Session = Depends(get_database)
):
    """Récupère tous les rendez-vous d'un candidat"""
    controller = AppointmentController(db)
    appointments = controller.get_candidate_appointments(candidate_id)
    return {"appointments": appointments}

@router.post("/candidate/choose-slot")
async def candidate_choose_slot(
    candidate_id: int,
    slot_choice: SlotChoice,
    db: Session = Depends(get_database)
):
    """Le candidat choisit un créneau"""
    controller = AppointmentController(db)
    success = controller.candidate_choose_slot(
        candidate_id, 
        slot_choice.appointment_id, 
        slot_choice.slot_id
    )
    
    if success:
        return {"message": "Créneau sélectionné avec succès", "success": True}
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de sélectionner ce créneau"
        )

@router.post("/candidate/refuse-all/{appointment_id}")
async def candidate_refuse_all_slots(
    appointment_id: int,
    candidate_id: int,
    db: Session = Depends(get_database)
):
    """Le candidat refuse tous les créneaux et crée une conversation"""
    controller = AppointmentController(db)
    success = controller.candidate_refuse_all_slots(candidate_id, appointment_id)
    
    if success:
        return {
            "message": "Créneaux refusés. Une conversation a été créée avec le recruteur.",
            "success": True,
            "action": "conversation_created"
        }
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible de refuser les créneaux"
        )

# ============ ROUTES UTILITAIRES ============

@router.get("/health")
async def health_check():
    """Vérification de l'état du service"""
    return {
        "service": "appointment",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }

@router.get("/stats/{recruiter_id}")
async def get_appointment_stats(
    recruiter_id: int,
    db: Session = Depends(get_database)
):
    """Récupère tous les rendez-vous d'un recruteur avec les données complètes"""
    controller = AppointmentController(db)
    appointments = controller.get_recruiter_appointments(recruiter_id)
    return {"appointments": appointments}