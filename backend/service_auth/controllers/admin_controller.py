from sqlalchemy.orm import Session
from sqlalchemy import desc, and_, or_, func
from fastapi import HTTPException, Depends
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json

from models.user import UserDB
from models.admin import (
    AdminAuditDB, UserStatusDB, ReportDB,
    AdminAuditCreate, UserStatusUpdate, ReportCreate, ReportUpdate
)

# Constantes pour remplacer les enums
class ActionType:
    USER_CREATED = "user_created"
    USER_UPDATED = "user_updated"
    USER_DELETED = "user_deleted"
    USER_SUSPENDED = "user_suspended"
    USER_BANNED = "user_banned"
    USER_REACTIVATED = "user_reactivated"
    REPORT_RESOLVED = "report_resolved"

class UserStatus:
    ACTIVE = "active"
    SUSPENDED = "suspended"
    BANNED = "banned"

class ReportStatus:
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

class ReportType:
    USER = "user"
    CONTENT = "content"
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"

class Role:
    ADMIN = "admin"
    CANDIDAT = "candidat"

# ===== AUDIT TRAIL =====

def log_admin_action(
    db: Session,
    admin_user_id: int,
    action_type: str,
    description: str,
    target_user_id: Optional[int] = None,
    details: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None
) -> AdminAuditDB:
    """Enregistrer une action administrative"""
    audit = AdminAuditDB(
        admin_user_id=admin_user_id,
        target_user_id=target_user_id,
        action_type=action_type,
        description=description,
        details=details,
        ip_address=ip_address,
        user_agent=user_agent
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

def get_admin_audit_logs(
    db: Session,
    limit: int = 100,
    offset: int = 0,
    admin_user_id: Optional[int] = None,
    target_user_id: Optional[int] = None,
    action_type: Optional[str] = None
) -> List[AdminAuditDB]:
    """Récupérer les logs d'audit"""
    query = db.query(AdminAuditDB)
    
    if admin_user_id:
        query = query.filter(AdminAuditDB.admin_user_id == admin_user_id)
    if target_user_id:
        query = query.filter(AdminAuditDB.target_user_id == target_user_id)
    if action_type:
        query = query.filter(AdminAuditDB.action_type == action_type)
    
    return query.order_by(desc(AdminAuditDB.created_at)).offset(offset).limit(limit).all()

# ===== GESTION DES UTILISATEURS =====

def get_all_users(
    db: Session,
    role: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[Dict[str, Any]]:
    """Récupérer tous les utilisateurs avec leur statut"""
    query = db.query(UserDB).outerjoin(UserStatusDB, UserDB.id == UserStatusDB.user_id)
    
    if role:
        query = query.filter(UserDB.role == role)
    
    if status:
        if status == UserStatus.ACTIVE:
            query = query.filter(or_(
                UserStatusDB.status == UserStatus.ACTIVE,
                UserStatusDB.status == None
            ))
        else:
            query = query.filter(UserStatusDB.status == status)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(or_(
            UserDB.name.ilike(search_term),
            UserDB.prenom.ilike(search_term),
            UserDB.email.ilike(search_term)
        ))
    
    users = query.offset(offset).limit(limit).all()
    
    # Enrichir avec les informations de statut
    result = []
    for user in users:
        user_status = db.query(UserStatusDB).filter(UserStatusDB.user_id == user.id).first()
        result.append({
            "id": user.id,
            "name": user.name,
            "prenom": user.prenom,
            "email": user.email,
            "role": user.role,
            "est_actif": user.est_actif,
            "date_creation": user.date_creation,
            "status": user_status.status if user_status else UserStatus.ACTIVE,
            "status_reason": user_status.reason if user_status else None,
            "suspended_until": user_status.suspended_until if user_status else None
        })
    
    return result

def update_user_status(
    db: Session,
    user_id: int,
    status_update: UserStatusUpdate,
    admin_user_id: int
) -> UserStatusDB:
    """Mettre à jour le statut d'un utilisateur"""
    # Vérifier que l'utilisateur existe
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    
    # Vérifier que l'admin ne peut pas se suspendre/bannir lui-même
    if user_id == admin_user_id:
        raise HTTPException(status_code=400, detail="Impossible de modifier son propre statut")
    
    # Récupérer ou créer le statut utilisateur
    user_status = db.query(UserStatusDB).filter(UserStatusDB.user_id == user_id).first()
    if not user_status:
        user_status = UserStatusDB(user_id=user_id)
        db.add(user_status)
    
    # Mettre à jour le statut
    old_status = user_status.status
    user_status.status = status_update.status
    user_status.reason = status_update.reason
    user_status.suspended_until = status_update.suspended_until
    user_status.admin_user_id = admin_user_id
    user_status.updated_at = datetime.utcnow()
    
    # Désactiver l'utilisateur si banni ou suspendu
    user.est_actif = status_update.status == UserStatus.ACTIVE
    
    db.commit()
    db.refresh(user_status)
    
    # Logger l'action
    action_type = None
    description = ""
    if status_update.status == UserStatus.SUSPENDED:
        action_type = ActionType.USER_SUSPENDED
        description = f"Utilisateur suspendu: {user.email}"
    elif status_update.status == UserStatus.BANNED:
        action_type = ActionType.USER_BANNED
        description = f"Utilisateur banni: {user.email}"
    elif status_update.status == UserStatus.ACTIVE and old_status in [UserStatus.SUSPENDED, UserStatus.BANNED]:
        action_type = ActionType.USER_REACTIVATED
        description = f"Utilisateur réactivé: {user.email}"
    
    if action_type:
        log_admin_action(
            db, admin_user_id, action_type, description,
            target_user_id=user_id,
            details=json.dumps({"reason": status_update.reason, "old_status": old_status if old_status else "active"})
        )
    
    return user_status

# ===== GESTION DES SIGNALEMENTS =====

def create_report(db: Session, report: ReportCreate) -> ReportDB:
    """Créer un nouveau signalement"""
    db_report = ReportDB(**report.dict())
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_reports(
    db: Session,
    status: Optional[str] = None,
    report_type: Optional[str] = None,
    limit: int = 100,
    offset: int = 0
) -> List[ReportDB]:
    """Récupérer les signalements"""
    query = db.query(ReportDB)
    
    if status:
        query = query.filter(ReportDB.status == status)
    if report_type:
        query = query.filter(ReportDB.report_type == report_type)
    
    return query.order_by(desc(ReportDB.created_at)).offset(offset).limit(limit).all()

def update_report(
    db: Session,
    report_id: int,
    report_update: ReportUpdate,
    admin_user_id: int
) -> ReportDB:
    """Mettre à jour un signalement"""
    report = db.query(ReportDB).filter(ReportDB.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Signalement introuvable")
    
    if report_update.status:
        report.status = report_update.status
        if report_update.status in [ReportStatus.REVIEWED, ReportStatus.RESOLVED, ReportStatus.DISMISSED]:
            report.reviewed_by = admin_user_id
            report.reviewed_at = datetime.utcnow()
    
    if report_update.admin_notes:
        report.admin_notes = report_update.admin_notes
    
    report.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(report)
    
    # Logger l'action
    if report_update.status == ReportStatus.RESOLVED:
        log_admin_action(
            db, admin_user_id, ActionType.REPORT_RESOLVED,
            f"Signalement résolu: {report.reason}",
            details=json.dumps({"report_id": report_id, "type": report.report_type})
        )
    
    return report

# ===== STATISTIQUES =====

def get_platform_statistics(db: Session) -> Dict[str, Any]:
    """Récupérer les statistiques globales de la plateforme"""
    import requests
    from datetime import datetime, timedelta
    
    # Statistiques utilisateurs (depuis ce service)
    total_users = db.query(UserDB).count()
    active_users = db.query(UserDB).filter(UserDB.est_actif == True).count()
    suspended_users = db.query(UserStatusDB).filter(UserStatusDB.status == UserStatus.SUSPENDED).count()
    banned_users = db.query(UserStatusDB).filter(UserStatusDB.status == UserStatus.BANNED).count()
    
    # Compter par rôle
    candidats = db.query(UserDB).filter(UserDB.role == "candidat").count()
    recruteurs = db.query(UserDB).filter(UserDB.role == "recruteur").count()
    admins = db.query(UserDB).filter(UserDB.role == "admin").count()
    
    # Nouveaux utilisateurs
    today = datetime.utcnow().date()
    last_week = today - timedelta(days=7)
    last_month = today - timedelta(days=30)
    
    new_users_today = db.query(UserDB).filter(func.date(UserDB.date_creation) == today).count()
    new_users_week = db.query(UserDB).filter(func.date(UserDB.date_creation) >= last_week).count()
    new_users_month = db.query(UserDB).filter(func.date(UserDB.date_creation) >= last_month).count()
    
    # Utilisateurs par jour (7 derniers jours)
    users_per_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        count = db.query(UserDB).filter(func.date(UserDB.date_creation) == day).count()
        users_per_day.append(count)
    
    # Statistiques des offres (appel au service_offers)
    offers_stats = {"total": 0, "active": 0, "closed": 0}
    try:
        response = requests.get("http://localhost:8003/offers/stats", timeout=2)
        if response.status_code == 200:
            offers_stats = response.json()
    except:
        pass
    
    # Statistiques des signalements (appel au service_report)
    reports_stats = {"total": 0, "pending": 0, "resolved": 0, "under_review": 0}
    try:
        response = requests.get("http://localhost:8007/reports/stats", timeout=5)
        print(f"📊 Reports Stats Response: {response.status_code}")
        if response.status_code == 200:
            reports_stats = response.json()
            print(f"📊 Reports Stats Data: {reports_stats}")
    except Exception as e:
        print(f"❌ Erreur reports stats: {e}")
        pass
    
    # Statistiques des candidatures (appel au service_offers)
    applications_stats = {"total": 0, "pending": 0, "accepted": 0, "rejected": 0}
    try:
        response = requests.get("http://localhost:8003/applications/stats", timeout=2)
        if response.status_code == 200:
            applications_stats = response.json()
    except:
        pass
    
    return {
        "users": {
            "total": total_users,
            "active": active_users,
            "suspended": suspended_users,
            "banned": banned_users,
            "candidats": candidats,
            "recruteurs": recruteurs,
            "admins": admins,
            "new_today": new_users_today,
            "new_this_week": new_users_week,
            "new_this_month": new_users_month,
            "per_day": users_per_day  # Liste des 7 derniers jours
        },
        "offers": offers_stats,
        "reports": reports_stats,
        "applications": applications_stats,
        "platform": {
            "last_updated": datetime.utcnow().isoformat()
        }
    }