from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi import HTTPException

from models.profile_view import ProfileViewDB
from controllers.candidat_controller import get_candidat_by_id


def record_profile_view(db: Session, candidate_id: int, recruiter_auth_user_id: int):
    # Ensure candidate exists
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    entry = ProfileViewDB(
        candidate_id=candidate_id,
        recruiter_auth_user_id=recruiter_auth_user_id,
        viewed_at=datetime.utcnow(),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {
        "id": entry.id,
        "candidate_id": entry.candidate_id,
        "recruiter_auth_user_id": entry.recruiter_auth_user_id,
        "viewed_at": entry.viewed_at.isoformat(),
    }


def get_profile_view_summary(db: Session, candidate_id: int):
    # Ensure candidate exists
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    q = db.query(ProfileViewDB).filter(ProfileViewDB.candidate_id == candidate_id)

    total_views = q.count()

    unique_recruiters = (
        db.query(func.count(func.distinct(ProfileViewDB.recruiter_auth_user_id)))
        .filter(ProfileViewDB.candidate_id == candidate_id)
        .scalar()
        or 0
    )

    last_view_obj = (
        db.query(ProfileViewDB.viewed_at)
        .filter(ProfileViewDB.candidate_id == candidate_id)
        .order_by(desc(ProfileViewDB.viewed_at))
        .first()
    )
    last_view_at = last_view_obj[0].isoformat() if last_view_obj else None

    since = datetime.utcnow() - timedelta(days=30)
    last_30_days = (
        db.query(func.count(ProfileViewDB.id))
        .filter(ProfileViewDB.candidate_id == candidate_id, ProfileViewDB.viewed_at >= since)
        .scalar()
        or 0
    )

    recent = (
        db.query(ProfileViewDB)
        .filter(ProfileViewDB.candidate_id == candidate_id)
        .order_by(desc(ProfileViewDB.viewed_at))
        .limit(5)
        .all()
    )

    return {
        "candidate_id": candidate_id,
        "total_views": total_views,
        "unique_recruiters": unique_recruiters,
        "last_view_at": last_view_at,
        "last_30_days": last_30_days,
        "recent": [
            {
                "recruiter_auth_user_id": r.recruiter_auth_user_id,
                "viewed_at": r.viewed_at.isoformat(),
            }
            for r in recent
        ],
    }
