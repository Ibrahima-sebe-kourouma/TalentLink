from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Boolean, ForeignKey
from datetime import datetime
from enum import Enum as PyEnum
from pydantic import BaseModel, Field
from typing import Optional, List

from database.database import Base


class ReportType(str, PyEnum):
    OFFER = "offer"
    PROFILE = "profile"
    MESSAGE = "message"


class ReportStatus(str, PyEnum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    RESOLVED = "resolved"
    REJECTED = "rejected"


class ReportSeverity(str, PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    CRITICAL = "critical"


class ReportVerdict(str, PyEnum):
    VALID = "valid"
    INVALID = "invalid"


class ReportDB(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    
    # Reporter info
    reporter_user_id = Column(Integer, nullable=False, index=True)  # ID du candidat qui signale
    
    # Reported item info
    report_type = Column(Enum(ReportType), nullable=False)
    target_id = Column(String(100), nullable=False)  # ID de l'offre, profil ou message (peut être int ou ObjectId)
    recruiter_user_id = Column(Integer, nullable=True, index=True)  # ID du recruteur concerné
    
    # Report details
    reason = Column(String(500), nullable=False)  # Raison du signalement
    description = Column(Text, nullable=True)  # Description détaillée
    
    # Status and processing
    status = Column(Enum(ReportStatus), default=ReportStatus.PENDING)
    severity = Column(Enum(ReportSeverity), default=ReportSeverity.LOW)
    verdict = Column(Enum(ReportVerdict), nullable=True)
    
    # Admin processing
    admin_user_id = Column(Integer, nullable=True, index=True)  # Admin qui traite
    admin_note = Column(Text, nullable=True)  # Note de l'admin pour le candidat
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)


# Pydantic Schemas
class ReportCreate(BaseModel):
    reported_type: ReportType
    reported_id: str  # Peut être int ou ObjectId MongoDB
    reason: str
    description: Optional[str] = None


class ReportUpdate(BaseModel):
    status: Optional[ReportStatus] = None
    verdict: Optional[ReportVerdict] = None
    admin_note: Optional[str] = None


class ReportResponse(BaseModel):
    id: int
    reporter_user_id: int
    reported_type: ReportType
    reported_id: str  # Peut être int ou ObjectId MongoDB
    reason: str
    description: Optional[str]
    status: ReportStatus
    severity: ReportSeverity
    verdict: Optional[ReportVerdict]
    admin_user_id: Optional[int]
    admin_note: Optional[str]
    created_at: datetime
    updated_at: datetime
    processed_at: Optional[datetime]

    @classmethod
    def from_db(cls, db_report: "ReportDB"):
        """Créer depuis un objet DB"""
        return cls(
            id=db_report.id,
            reporter_user_id=db_report.reporter_user_id,
            reported_type=db_report.report_type,
            reported_id=str(db_report.target_id),  # Convertir en string
            reason=db_report.reason,
            description=db_report.description,
            status=db_report.status,
            severity=db_report.severity,
            verdict=db_report.verdict,
            admin_user_id=db_report.admin_user_id,
            admin_note=db_report.admin_note,
            created_at=db_report.created_at,
            updated_at=db_report.updated_at,
            processed_at=db_report.processed_at
        )


class ReportStats(BaseModel):
    total_reports: int
    pending_reports: int
    resolved_reports: int
    rejected_reports: int
    critical_reports: int
    reports_by_type: dict