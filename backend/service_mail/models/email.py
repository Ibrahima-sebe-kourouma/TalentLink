from pydantic import BaseModel, EmailStr
from typing import Optional

class WelcomeEmailPayload(BaseModel):
    to_email: EmailStr
    user_name: str

class PasswordResetEmailPayload(BaseModel):
    to_email: EmailStr
    user_name: str
    reset_token: str
    expiry_minutes: int = 60

class ApplicationNotificationPayload(BaseModel):
    to_email: EmailStr
    user_name: str
    offer_title: str
    company_name: str
    status: str  # submitted, in_review, interview, offered, rejected, withdrawn
