from fastapi import APIRouter
from controllers.email_controller import (
    send_welcome,
    send_password_reset,
    send_application_notification,
)
from models.email import (
    WelcomeEmailPayload,
    PasswordResetEmailPayload,
    ApplicationNotificationPayload,
)

router = APIRouter(prefix="/mail", tags=["Mail"])

@router.post("/welcome")
def welcome_endpoint(payload: WelcomeEmailPayload):
    return send_welcome(payload)

@router.post("/password-reset")
def password_reset_endpoint(payload: PasswordResetEmailPayload):
    return send_password_reset(payload)

@router.post("/application-notification")
def application_notification_endpoint(payload: ApplicationNotificationPayload):
    return send_application_notification(payload)
