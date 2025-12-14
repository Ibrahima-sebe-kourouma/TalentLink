from fastapi import HTTPException
import os
from models.email import (
    WelcomeEmailPayload,
    PasswordResetEmailPayload,
    ApplicationNotificationPayload,
    AppointmentEmailPayload,
)
from services.email_sender import email_sender

# Mode dégradé : si activé, log au lieu de fail
GRACEFUL_EMAIL_FAILURE = os.getenv("GRACEFUL_EMAIL_FAILURE", "true").lower() in ("1", "true", "yes")


def send_welcome(payload: WelcomeEmailPayload) -> dict:
    ok = email_sender.send_welcome(payload.to_email, payload.user_name)
    if not ok:
        if GRACEFUL_EMAIL_FAILURE:
            print(f"[mail] Welcome email failed for {payload.to_email} - graceful mode enabled")
            return {"detail": "Email de bienvenue simulé (SMTP non disponible)", "status": "simulated"}
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de bienvenue")
    return {"detail": "Email de bienvenue envoyé"}


def send_password_reset(payload: PasswordResetEmailPayload) -> dict:
    ok = email_sender.send_password_reset(payload.to_email, payload.user_name, payload.reset_token, payload.expiry_minutes)
    if not ok:
        if GRACEFUL_EMAIL_FAILURE:
            print(f"[mail] Password reset email failed for {payload.to_email} - graceful mode enabled")
            return {"detail": "Email de réinitialisation simulé (SMTP non disponible)", "status": "simulated"}
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de réinitialisation")
    return {"detail": "Email de réinitialisation envoyé"}


def send_application_notification(payload: ApplicationNotificationPayload) -> dict:
    ok = email_sender.send_application_notification(payload.to_email.lower(), payload.user_name, payload.offer_title, payload.company_name, payload.status)
    if not ok:
        if GRACEFUL_EMAIL_FAILURE:
            print(f"[mail] Application notification failed for {payload.to_email} - graceful mode enabled")
            return {"detail": "Email de notification simulé (SMTP non disponible)", "status": "simulated"}
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de notification")
    return {"detail": "Email de notification envoyé"}


def send_appointment_email(payload: AppointmentEmailPayload) -> dict:
    ok = email_sender.send_generic_email(payload.to_email, payload.subject, payload.body)
    if not ok:
        if GRACEFUL_EMAIL_FAILURE:
            print(f"[mail] Appointment email failed for {payload.to_email} - graceful mode enabled")
            return {"detail": "Email de rendez-vous simulé (SMTP non disponible)", "status": "simulated"}
        raise HTTPException(status_code=500, detail="Echec d'envoi de l'email de rendez-vous")
    return {"detail": "Email de rendez-vous envoyé"}
