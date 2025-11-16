from datetime import datetime
from sqlalchemy import Column, Integer, DateTime

from database.database import Base


class ProfileViewDB(Base):
    __tablename__ = "profile_views"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, index=True, nullable=False)
    recruiter_auth_user_id = Column(Integer, index=True, nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow, nullable=False)
