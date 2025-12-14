from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional, Dict
from datetime import datetime
import requests

from models.report import (
    ReportDB, 
    ReportCreate, 
    ReportUpdate, 
    ReportType, 
    ReportStatus, 
    ReportSeverity,
    ReportVerdict
)


class ReportController:
    def __init__(self):
        self.mail_service_url = "http://localhost:8005"
    
    def create_report(self, db: Session, user_id: int, report_data: ReportCreate) -> ReportDB:
        """Créer un nouveau signalement"""
        # Convertir reported_id en string pour supporter ObjectId MongoDB
        target_id_str = str(report_data.reported_id)
        
        # Vérifier si l'utilisateur n'a pas déjà signalé ce même élément
        existing_report = db.query(ReportDB).filter(
            and_(
                ReportDB.reporter_user_id == user_id,
                ReportDB.target_id == target_id_str,
                ReportDB.report_type == report_data.reported_type,
                ReportDB.status.in_([ReportStatus.PENDING, ReportStatus.UNDER_REVIEW])
            )
        ).first()
        
        if existing_report:
            raise ValueError("Vous avez déjà signalé cet élément")
        
        # Créer le signalement
        report = ReportDB(
            reporter_user_id=user_id,
            report_type=report_data.reported_type,
            target_id=target_id_str,
            recruiter_user_id=None,  # Sera déterminé automatiquement si besoin
            reason=report_data.reason,
            description=report_data.description
        )
        
        # Calculer la sévérité basée sur le nombre de signalements similaires
        report.severity = self._calculate_severity(db, report_data)
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        # Envoyer notification à l'admin si critique
        if report.severity == ReportSeverity.CRITICAL:
            self._notify_admin_critical_report(report)
        
        return report
    
    def get_user_reports(self, db: Session, user_id: int, status: Optional[ReportStatus] = None) -> List[ReportDB]:
        """Récupérer les signalements d'un utilisateur"""
        query = db.query(ReportDB).filter(ReportDB.reporter_user_id == user_id)
        
        if status:
            query = query.filter(ReportDB.status == status)
        
        return query.order_by(ReportDB.created_at.desc()).all()
    
    def get_all_reports(self, db: Session, status: Optional[ReportStatus] = None, 
                       severity: Optional[ReportSeverity] = None) -> List[ReportDB]:
        """Récupérer tous les signalements (pour l'admin)"""
        query = db.query(ReportDB)
        
        if status:
            query = query.filter(ReportDB.status == status)
        if severity:
            query = query.filter(ReportDB.severity == severity)
        
        return query.order_by(ReportDB.created_at.desc()).all()
    
    def get_report(self, db: Session, report_id: int) -> Optional[ReportDB]:
        """Récupérer un signalement par ID"""
        return db.query(ReportDB).filter(ReportDB.id == report_id).first()
    
    def process_report(self, db: Session, admin_user_id: int, report_id: int, 
                      update_data: ReportUpdate) -> ReportDB:
        """Traiter un signalement (action admin)"""
        report = db.query(ReportDB).filter(ReportDB.id == report_id).first()
        
        if not report:
            raise ValueError("Signalement non trouvé")
        
        if report.status not in [ReportStatus.PENDING, ReportStatus.UNDER_REVIEW]:
            raise ValueError("Ce signalement a déjà été traité")
        
        # Mettre à jour les informations
        report.admin_user_id = admin_user_id
        report.processed_at = datetime.utcnow()
        
        if update_data.status:
            report.status = update_data.status
        if update_data.verdict:
            report.verdict = update_data.verdict
        if update_data.admin_note:
            report.admin_note = update_data.admin_note
        
        # Générer automatiquement une note si non fournie
        if not update_data.admin_note:
            report.admin_note = self._generate_auto_note(report.verdict, report.report_type)
        
        db.commit()
        db.refresh(report)
        
        # Envoyer notification au reporter
        self._notify_reporter_decision(report)
        
        return report
    
    def get_report_stats(self, db: Session) -> Dict:
        """Obtenir les statistiques des signalements"""
        total = db.query(ReportDB).count()
        pending = db.query(ReportDB).filter(ReportDB.status == ReportStatus.PENDING).count()
        resolved = db.query(ReportDB).filter(ReportDB.status == ReportStatus.RESOLVED).count()
        rejected = db.query(ReportDB).filter(ReportDB.status == ReportStatus.REJECTED).count()
        critical = db.query(ReportDB).filter(ReportDB.severity == ReportSeverity.CRITICAL).count()
        
        # Statistiques par type
        type_stats = db.query(
            ReportDB.report_type,
            func.count(ReportDB.id)
        ).group_by(ReportDB.report_type).all()
        
        reports_by_type = {str(type_): count for type_, count in type_stats}
        
        return {
            "total_reports": total,
            "pending_reports": pending,
            "resolved_reports": resolved,
            "rejected_reports": rejected,
            "critical_reports": critical,
            "reports_by_type": reports_by_type
        }
    
    def _calculate_severity(self, db: Session, report_data: ReportCreate) -> ReportSeverity:
        """Calculer la sévérité basée sur le nombre de signalements similaires"""
        # Convertir en string pour la comparaison
        target_id_str = str(report_data.reported_id)
        
        # Pour tous les types, compter les signalements sur cet élément spécifique
        count = db.query(ReportDB).filter(
            and_(
                ReportDB.target_id == target_id_str,
                ReportDB.report_type == report_data.reported_type
            )
        ).count()
        
        # Définir les seuils
        if count >= 5:
            return ReportSeverity.CRITICAL
        elif count >= 2:
            return ReportSeverity.MEDIUM
        else:
            return ReportSeverity.LOW
    
    def _generate_auto_note(self, verdict: ReportVerdict, report_type: ReportType) -> str:
        """Générer une note automatique basée sur le verdict"""
        if verdict == ReportVerdict.VALID:
            return (
                f"Merci pour votre signalement concernant ce {report_type.value}. "
                "Après vérification, nous confirmons que votre signalement est justifié. "
                "Des mesures appropriées ont été prises concernant ce contenu. "
                "Votre vigilance contribue à maintenir la qualité de TalentLink."
            )
        else:
            return (
                f"Merci pour votre signalement concernant ce {report_type.value}. "
                "Après examen approfondi, nous avons déterminé que ce contenu respecte "
                "les conditions d'utilisation de TalentLink. Votre signalement nous aide "
                "néanmoins à améliorer notre plateforme."
            )
    
    def _notify_admin_critical_report(self, report: ReportDB):
        """Notifier les admins d'un signalement critique"""
        try:
            email_data = {
                "to_email": "admin@talentlink.com",  # À configurer
                "subject": f"🚨 Signalement Critique - {report.report_type.value}",
                "body": (
                    f"Un signalement critique a été créé:\n\n"
                    f"Type: {report.report_type.value}\n"
                    f"Raison: {report.reason}\n"
                    f"Sévérité: {report.severity.value}\n"
                    f"ID du signalement: {report.id}\n\n"
                    f"Veuillez traiter ce signalement rapidement.\n"
                    f"Accès admin: http://localhost:3000/admin/reports"
                )
            }
            
            requests.post(
                f"{self.mail_service_url}/mail/appointment",
                json=email_data,
                timeout=5
            )
        except Exception as e:
            print(f"Erreur notification admin critique: {e}")
    
    def _notify_reporter_decision(self, report: ReportDB):
        """Notifier le reporter de la décision"""
        try:
            if report.verdict == ReportVerdict.VALID:
                subject = "✅ Votre signalement a été validé"
            else:
                subject = "ℹ️ Votre signalement a été examiné"
            
            email_data = {
                "to_email": f"user_{report.reporter_user_id}@talentlink.com",  # À adapter avec vraie email
                "subject": subject,
                "body": (
                    f"Bonjour,\n\n"
                    f"Votre signalement concernant {report.report_type.value} (ID: {report.id}) "
                    f"a été traité.\n\n"
                    f"Statut: {report.status.value}\n"
                    f"Note de l'administrateur:\n{report.admin_note}\n\n"
                    f"Vous pouvez consulter le détail dans votre espace candidat.\n\n"
                    f"Cordialement,\n"
                    f"L'équipe TalentLink"
                )
            }
            
            requests.post(
                f"{self.mail_service_url}/mail/appointment",
                json=email_data,
                timeout=5
            )
        except Exception as e:
            print(f"Erreur notification reporter: {e}")