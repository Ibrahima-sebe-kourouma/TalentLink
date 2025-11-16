from fastapi import HTTPException
from models.email import (
    WelcomeEmailPayload,
    PasswordResetEmailPayload,
    ApplicationNotificationPayload,
)
from services.email_sender import email_sender


def send_welcome(payload: WelcomeEmailPayload) -> dict:
    ok = email_sender.send_welcome(payload.to_email, payload.user_name)
    if not ok:
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de bienvenue")
    return {"detail": "Email de bienvenue envoyé"}


def send_password_reset(payload: PasswordResetEmailPayload) -> dict:
    ok = email_sender.send_password_reset(payload.to_email, payload.user_name, payload.reset_token, payload.expiry_minutes)
    if not ok:
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de réinitialisation")
    return {"detail": "Email de réinitialisation envoyé"}


def send_application_notification(payload: ApplicationNotificationPayload) -> dict:
    ok = email_sender.send_application_notification(payload.to_email.lower(), payload.user_name, payload.offer_title, payload.company_name, payload.status)
    if not ok:
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de notification")
    return {"detail": "Email de notification envoyé"}
