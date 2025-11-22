from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from database.database import get_database
from controllers.report_controller import ReportController
from models.report import (
    ReportCreate, 
    ReportUpdate, 
    ReportResponse, 
    ReportStats,
    ReportStatus,
    ReportSeverity
)

router = APIRouter(prefix="/reports", tags=["Reports"])

# ============ ROUTES POUR LES CANDIDATS ============

@router.post("/", response_model=ReportResponse)
def create_report(
    user_id: int,
    report_data: ReportCreate,
    db: Session = Depends(get_database)
):
    """Créer un nouveau signalement"""
    controller = ReportController()
    
    try:
        report = controller.create_report(db, user_id, report_data)
        return ReportResponse.from_db(report)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/my-reports", response_model=List[ReportResponse])
def get_my_reports(
    user_id: int,
    status: Optional[ReportStatus] = None,
    db: Session = Depends(get_database)
):
    """Récupérer mes signalements"""
    controller = ReportController()
    reports = controller.get_user_reports(db, user_id, status)
    return [ReportResponse.from_db(r) for r in reports]

@router.get("/my-reports/{report_id}", response_model=ReportResponse)
def get_my_report(
    report_id: int,
    user_id: int,
    db: Session = Depends(get_database)
):
    """Récupérer un de mes signalements par ID"""
    controller = ReportController()
    report = controller.get_report(db, report_id)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signalement non trouvé"
        )
    
    # Vérifier que le signalement appartient à l'utilisateur
    if report.reporter_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Accès non autorisé à ce signalement"
        )
    
    return ReportResponse.from_db(report)

# ============ ROUTES POUR LES ADMINISTRATEURS ============

@router.get("/admin/all", response_model=List[ReportResponse])
def get_all_reports_admin(
    admin_user_id: int,
    status: Optional[ReportStatus] = None,
    severity: Optional[ReportSeverity] = None,
    db: Session = Depends(get_database)
):
    """Récupérer tous les signalements (admin uniquement)"""
    # TODO: Ajouter vérification que l'utilisateur est admin
    controller = ReportController()
    reports = controller.get_all_reports(db, status, severity)
    return [ReportResponse.from_db(r) for r in reports]

@router.get("/admin/{report_id}", response_model=ReportResponse)
def get_report_admin(
    report_id: int,
    admin_user_id: int,
    db: Session = Depends(get_database)
):
    """Récupérer un signalement par ID (admin)"""
    # TODO: Ajouter vérification que l'utilisateur est admin
    controller = ReportController()
    report = controller.get_report(db, report_id)
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Signalement non trouvé"
        )
    
    return ReportResponse.from_db(report)

@router.patch("/admin/{report_id}/process", response_model=ReportResponse)
def process_report_admin(
    report_id: int,
    admin_user_id: int,
    update_data: ReportUpdate,
    db: Session = Depends(get_database)
):
    """Traiter un signalement (admin uniquement)"""
    # TODO: Ajouter vérification que l'utilisateur est admin
    controller = ReportController()
    
    try:
        report = controller.process_report(db, admin_user_id, report_id, update_data)
        return ReportResponse.from_db(report)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/admin/stats", response_model=ReportStats)
def get_report_stats_admin(
    admin_user_id: int,
    db: Session = Depends(get_database)
):
    """Obtenir les statistiques des signalements (admin)"""
    # TODO: Ajouter vérification que l'utilisateur est admin
    controller = ReportController()
    stats = controller.get_report_stats(db)
    return stats


@router.get("/stats", include_in_schema=False)
def get_report_stats_public(db: Session = Depends(get_database)):
    """Statistiques publiques des signalements pour le dashboard admin"""
    from models.report import ReportDB, ReportStatus
    
    try:
        total = db.query(ReportDB).count()
        pending = db.query(ReportDB).filter(ReportDB.status == ReportStatus.PENDING).count()
        under_review = db.query(ReportDB).filter(ReportDB.status == ReportStatus.UNDER_REVIEW).count()
        resolved = db.query(ReportDB).filter(ReportDB.status == ReportStatus.RESOLVED).count()
        rejected = db.query(ReportDB).filter(ReportDB.status == ReportStatus.REJECTED).count()
        
        return {
            "total": total,
            "pending": pending,
            "under_review": under_review,
            "resolved": resolved,
            "dismissed": rejected  # Utilisé "rejected" au lieu de "dismissed" selon le modèle
        }
    except Exception as e:
        # En cas d'erreur, retourner des zéros
        print(f"Erreur stats reports: {e}")
        return {
            "total": 0,
            "pending": 0,
            "under_review": 0,
            "resolved": 0,
            "dismissed": 0
        }

# ============ ROUTES UTILITAIRES ============

@router.get("/health")
def health_check():
    """Vérification de l'état du service"""
    return {
        "service": "TalentLink Report Service",
        "status": "healthy",
        "version": "1.0.0"
    }

# Routes pour différents types de signalements avec des helpers

@router.get("/types")
def get_report_types():
    """Obtenir les types de signalements disponibles"""
    return {
        "types": [
            {
                "value": "offer",
                "label": "Offre d'emploi",
                "description": "Signaler une offre d'emploi inappropriée ou trompeuse"
            },
            {
                "value": "profile", 
                "label": "Profil recruteur",
                "description": "Signaler le comportement d'un recruteur"
            },
            {
                "value": "message",
                "label": "Message",
                "description": "Signaler un message inapproprié"
            }
        ]
    }

@router.get("/reasons")
def get_report_reasons():
    """Obtenir les raisons de signalement prédéfinies"""
    return {
        "offer_reasons": [
            "Offre discriminatoire",
            "Contenu inapproprié ou offensant",
            "Informations trompeuses",
            "Arnaque ou fraude",
            "Violation des conditions d'utilisation",
            "Autre"
        ],
        "profile_reasons": [
            "Comportement inapproprié",
            "Harcèlement",
            "Discrimination",
            "Profil frauduleux",
            "Violation des conditions d'utilisation",
            "Autre"
        ],
        "message_reasons": [
            "Contenu inapproprié ou offensant",
            "Harcèlement",
            "Spam",
            "Menaces",
            "Violation des conditions d'utilisation",
            "Autre"
        ]
    }