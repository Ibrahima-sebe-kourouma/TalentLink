from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from database.database import get_db
from models.user import Role
from models.admin import (
    AdminAuditResponse, UserStatusUpdate, UserStatusResponse,
    ReportCreate, ReportUpdate, ReportResponse,
    UserStatus, ReportStatus, ReportType, ActionType
)
from controllers.admin_controller import (
    get_all_users, update_user_status, get_admin_audit_logs,
    create_report, get_reports, update_report, get_platform_statistics,
    log_admin_action
)
from controllers.auth_controller import get_current_user
from models.user import UserDB

router = APIRouter(prefix="/admin", tags=["Administration"])

# Middleware pour vérifier les permissions admin
def require_admin(current_user: UserDB = Depends(get_current_user)) -> UserDB:
    if current_user.role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Accès réservé aux administrateurs")
    return current_user

# ===== GESTION DES UTILISATEURS =====

@router.get("/users")
def list_users(
    role: Optional[Role] = Query(None, description="Filtrer par rôle"),
    status: Optional[UserStatus] = Query(None, description="Filtrer par statut"),
    search: Optional[str] = Query(None, description="Rechercher par nom/email"),
    limit: int = Query(100, description="Nombre maximum de résultats"),
    offset: int = Query(0, description="Décalage pour la pagination"),
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Récupérer la liste des utilisateurs avec filtres"""
    return get_all_users(db, role, status, search, limit, offset)


@router.get("/users/public", include_in_schema=False)
def list_users_public(
    role: Optional[str] = Query(None, description="Filtrer par rôle"),
    status: Optional[str] = Query(None, description="Filtrer par statut"),
    search: Optional[str] = Query(None, description="Rechercher par nom/email"),
    limit: int = Query(100, description="Nombre maximum de résultats"),
    offset: int = Query(0, description="Décalage pour la pagination"),
    db: Session = Depends(get_db)
):
    """Récupérer la liste des utilisateurs (sans authentification)"""
    return get_all_users(db, role, status, search, limit, offset)

@router.patch("/users/{user_id}/status")
def modify_user_status(
    user_id: int,
    status_update: UserStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Modifier le statut d'un utilisateur (suspendre, bannir, réactiver)"""
    user_status = update_user_status(db, user_id, status_update, admin_user.id)
    
    return {
        "detail": f"Statut utilisateur mis à jour: {status_update.status}",
        "user_status": user_status
    }

@router.post("/users/{user_id}/change-role")
def change_user_role(
    user_id: int,
    new_role: Role,
    reason: str,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Changer le rôle d'un utilisateur"""
    from controllers.user_controller import get_user
    
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    if user.id == admin_user.id:
        raise HTTPException(status_code=400, detail="Impossible de modifier son propre rôle")
    
    old_role = user.role
    user.role = new_role
    db.commit()
    
    # Logger l'action
    log_admin_action(
        db, admin_user.id, ActionType.ROLE_CHANGED,
        f"Rôle changé de {old_role.value} à {new_role.value} pour {user.email}",
        target_user_id=user_id,
        details=f"Raison: {reason}",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"detail": f"Rôle changé de {old_role.value} à {new_role.value}"}

# ===== SIGNALEMENTS =====

@router.post("/reports", response_model=ReportResponse)
def submit_report(
    report: ReportCreate,
    db: Session = Depends(get_db)
):
    """Soumettre un signalement (accessible à tous les utilisateurs connectés)"""
    return create_report(db, report)

@router.get("/reports", response_model=List[ReportResponse])
def list_reports(
    status: Optional[ReportStatus] = Query(None, description="Filtrer par statut"),
    report_type: Optional[ReportType] = Query(None, description="Filtrer par type"),
    limit: int = Query(100, description="Nombre maximum de résultats"),
    offset: int = Query(0, description="Décalage pour la pagination"),
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Récupérer la liste des signalements"""
    return get_reports(db, status, report_type, limit, offset)

@router.patch("/reports/{report_id}", response_model=ReportResponse)
def moderate_report(
    report_id: int,
    report_update: ReportUpdate,
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Traiter un signalement"""
    return update_report(db, report_id, report_update, admin_user.id)

# ===== AUDIT ET LOGS =====

@router.get("/audit-logs", response_model=List[AdminAuditResponse])
def get_audit_logs(
    limit: int = Query(100, description="Nombre maximum de résultats"),
    offset: int = Query(0, description="Décalage pour la pagination"),
    admin_user_id: Optional[int] = Query(None, description="Filtrer par administrateur"),
    target_user_id: Optional[int] = Query(None, description="Filtrer par utilisateur ciblé"),
    action_type: Optional[ActionType] = Query(None, description="Filtrer par type d'action"),
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Récupérer les logs d'audit des actions administratives"""
    return get_admin_audit_logs(db, limit, offset, admin_user_id, target_user_id, action_type)


@router.get("/audit-logs/public", response_model=List[AdminAuditResponse], include_in_schema=False)
def get_public_audit_logs(
    limit: int = Query(10, description="Nombre maximum de résultats"),
    db: Session = Depends(get_db)
):
    """Récupérer les logs d'audit publics (sans authentification)"""
    return get_admin_audit_logs(db, limit, 0, None, None, None)

# ===== STATISTIQUES =====

@router.get("/statistics")
def get_admin_statistics(
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Récupérer les statistiques globales de la plateforme (authentifié)"""
    return get_platform_statistics(db)


@router.get("/stats/public", include_in_schema=False)
def get_public_statistics(
    db: Session = Depends(get_db)
):
    """Statistiques publiques pour le dashboard (sans authentification)"""
    return get_platform_statistics(db)

# ===== ACTIONS EN BATCH =====

@router.post("/batch/suspend-users")
def batch_suspend_users(
    user_ids: List[int],
    reason: str,
    request: Request,
    suspended_until: Optional[str] = None,
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Suspendre plusieurs utilisateurs en une fois"""
    from datetime import datetime
    
    suspended_until_dt = None
    if suspended_until:
        try:
            suspended_until_dt = datetime.fromisoformat(suspended_until)
        except ValueError:
            raise HTTPException(status_code=400, detail="Format de date invalide")
    
    results = []
    for user_id in user_ids:
        try:
            status_update = UserStatusUpdate(
                status=UserStatus.SUSPENDED,
                reason=reason,
                suspended_until=suspended_until_dt
            )
            user_status = update_user_status(db, user_id, status_update, admin_user.id)
            results.append({"user_id": user_id, "success": True, "status": user_status})
        except Exception as e:
            results.append({"user_id": user_id, "success": False, "error": str(e)})
    
    return {"results": results}

@router.post("/batch/resolve-reports")
def batch_resolve_reports(
    report_ids: List[int],
    admin_notes: str,
    db: Session = Depends(get_db),
    admin_user: UserDB = Depends(require_admin)
):
    """Résoudre plusieurs signalements en une fois"""
    results = []
    for report_id in report_ids:
        try:
            report_update = ReportUpdate(
                status=ReportStatus.RESOLVED,
                admin_notes=admin_notes
            )
            report = update_report(db, report_id, report_update, admin_user.id)
            results.append({"report_id": report_id, "success": True, "report": report})
        except Exception as e:
            results.append({"report_id": report_id, "success": False, "error": str(e)})
    
    return {"results": results}