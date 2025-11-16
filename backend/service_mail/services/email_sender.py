import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional, Tuple

class EmailSender:
    def __init__(self):
        self.smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
        self.smtp_port = int(os.getenv("SMTP_PORT", "465"))
        self.smtp_user = os.getenv("SMTP_USER", "talentlinkmontreal@gmail.com")
        raw_pwd = os.getenv("SMTP_PASSWORD", "txnh flrh irjj qild")
        self.smtp_password = (raw_pwd or "").replace(" ", "")
        self.smtp_use_ssl = os.getenv("SMTP_USE_SSL", "true").lower() in ("1", "true", "yes")
        self.from_email = os.getenv("FROM_EMAIL", self.smtp_user)
        self.from_name = os.getenv("FROM_NAME", "TalentLink")
        self.app_url = os.getenv("APP_URL", "http://localhost:3000")
        self.debug = os.getenv("EMAIL_DEBUG", "false").lower() in ("1", "true", "yes")

    def _send(self, to_email: str, subject: str, html: str, text: Optional[str] = None) -> bool:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            msg['Reply-To'] = self.from_email

            if text:
                msg.attach(MIMEText(text, 'plain', 'utf-8'))
            msg.attach(MIMEText(html, 'html', 'utf-8'))

            if self.smtp_use_ssl or self.smtp_port == 465:
                with smtplib.SMTP_SSL(self.smtp_host, self.smtp_port, timeout=20) as server:
                    if self.debug:
                        server.set_debuglevel(1)
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
            else:
                with smtplib.SMTP(self.smtp_host, self.smtp_port, timeout=20) as server:
                    if self.debug:
                        server.set_debuglevel(1)
                    server.ehlo(); server.starttls(); server.ehlo()
                    server.login(self.smtp_user, self.smtp_password)
                    server.send_message(msg)
            return True
        except Exception as e:
            print(f"[mail] SMTP error: {e}")
            return False

    def render_welcome(self, user_name: str) -> Tuple[str, str]:
        subject = "🎉 Bienvenue sur TalentLink !"
        text = f"""
Bonjour {user_name},

Bienvenue sur TalentLink, la plateforme qui connecte talents et opportunités !

Votre compte a été créé avec succès. Vous pouvez dès maintenant :
• Compléter votre profil candidat
• Rechercher des offres d'emploi
• Postuler aux opportunités qui vous correspondent
• Suivre l'évolution de vos candidatures

Commencez dès maintenant : {self.app_url}/profile

Nous vous souhaitons beaucoup de succès dans votre recherche d'emploi !

Cordialement,
L'équipe TalentLink
""".strip()
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0 0 10px; color: #ffffff; font-size: 32px;">🎉</h1>
                            <h2 style="margin: 0; color: #ffffff; font-size: 24px;">Bienvenue sur TalentLink !</h2>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
                                Bonjour <strong>{user_name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Votre compte a été créé avec succès ! Vous faites désormais partie de la communauté TalentLink, 
                                la plateforme qui connecte les talents aux meilleures opportunités professionnelles.
                            </p>
                            
                            <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Pour commencer :</h3>
                            <ul style="margin: 0 0 30px; padding-left: 20px; color: #4b5563; font-size: 15px; line-height: 1.8;">
                                <li>✅ Complétez votre profil candidat</li>
                                <li>🔍 Recherchez des offres d'emploi</li>
                                <li>📤 Postulez aux opportunités qui vous correspondent</li>
                                <li>📊 Suivez l'évolution de vos candidatures</li>
                            </ul>
                            
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{self.app_url}/profile" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            Accéder à mon espace
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                Nous vous souhaitons beaucoup de succès !<br>
                                <strong>L'équipe TalentLink</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return subject, html

    def render_password_reset(self, user_name: str, reset_token: str, expiry_minutes: int) -> Tuple[str, str, str]:
        subject = "🔐 Réinitialisation de votre mot de passe TalentLink"
        text = f"""
Bonjour {user_name},

Vous avez demandé la réinitialisation de votre mot de passe sur TalentLink.

Pour réinitialiser votre mot de passe, utilisez le code suivant (4 caractères) :

CODE DE VÉRIFICATION : {reset_token}

Copiez ce code et collez-le dans le champ prévu à cet effet sur la page de réinitialisation.

Ce code est valide pendant {expiry_minutes} minutes.

Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe actuel reste inchangé.

Cordialement,
L'équipe TalentLink
""".strip()
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🔐 TalentLink</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 24px;">Réinitialisation de mot de passe</h2>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Bonjour <strong>{user_name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                Vous avez demandé la réinitialisation de votre mot de passe sur TalentLink. 
                                Utilisez le code de vérification <strong>(4 caractères)</strong> ci-dessous pour créer un nouveau mot de passe :
                            </p>
                            
                            <div style="margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px; border: 2px dashed #667eea; text-align: center;">
                                <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                    Code de vérification (4 caractères)
                                </p>
                                <p style="margin: 0; font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 8px; font-family: 'Courier New', monospace; user-select: all;">
                                    {reset_token}
                                </p>
                                <p style="margin: 10px 0 0; color: #6b7280; font-size: 12px;">
                                    📋 Cliquez pour sélectionner et copier
                                </p>
                            </div>
                            
                            <p style="margin: 20px 0; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; color: #92400e; font-size: 14px; line-height: 1.6;">
                                ⏱️ <strong>Attention :</strong> Ce code est valide pendant <strong>{expiry_minutes} minutes</strong>.
                            </p>
                            
                            <p style="margin: 20px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Rendez-vous sur la page de réinitialisation et entrez ce code pour créer votre nouveau mot de passe.
                            </p>
                            
                            <p style="margin: 30px 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                                Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. 
                                Votre mot de passe actuel reste inchangé et sécurisé.
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                Cordialement,<br>
                                <strong>L'équipe TalentLink</strong>
                            </p>
                            <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                                © 2025 TalentLink. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return subject, html, text

    def render_application_notification(self, user_name: str, offer_title: str, company_name: str, status: str) -> Tuple[str, str, str]:
        titles = {
            "submitted": ("Candidature reçue", "Votre candidature a bien été soumise.", "#10b981"),
            "in_review": ("Candidature en cours d'examen", "Votre candidature est actuellement examinée par l'entreprise.", "#3b82f6"),
            "interview": ("Entretien programmé", "Félicitations ! L'entreprise souhaite vous rencontrer en entretien.", "#8b5cf6"),
            "offered": ("Offre d'emploi reçue", "Excellente nouvelle ! L'entreprise vous propose le poste.", "#f59e0b"),
            "rejected": ("Candidature non retenue", "Malheureusement, votre candidature n'a pas été retenue pour cette fois.", "#ef4444"),
            "withdrawn": ("Candidature retirée", "Votre candidature a été retirée.", "#6b7280"),
        }
        
        status_title, status_message, status_color = titles.get(
            status,
            ("Mise à jour de candidature", "Le statut de votre candidature a été mis à jour.", "#6b7280")
        )
        
        subject = f"TalentLink - {status_title} : {offer_title}"
        
        text = f"""
Bonjour {user_name},

{status_message}

Offre : {offer_title}
Entreprise : {company_name}
Nouveau statut : {status}

Consultez votre espace candidat sur TalentLink pour plus de détails :
{self.app_url}/profile

Cordialement,
L'équipe TalentLink
""".strip()
        
        html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f7fb;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: {status_color}; border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold;">{status_title}</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px;">
                            <p style="margin: 0 0 20px; color: #4b5563; font-size: 16px;">
                                Bonjour <strong>{user_name}</strong>,
                            </p>
                            
                            <p style="margin: 0 0 30px; color: #4b5563; font-size: 16px; line-height: 1.6;">
                                {status_message}
                            </p>
                            
                            <div style="margin: 20px 0; padding: 20px; background-color: #f9fafb; border-radius: 6px; border-left: 4px solid {status_color};">
                                <p style="margin: 0 0 10px; color: #1f2937; font-size: 18px; font-weight: bold;">
                                    {offer_title}
                                </p>
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                    📍 {company_name}
                                </p>
                            </div>
                            
                            <table role="presentation" style="margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{self.app_url}/profile" style="display: inline-block; padding: 14px 32px; background: {status_color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            Voir mes candidatures
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            
                            <p style="margin: 20px 0 0; color: #9ca3af; font-size: 13px; line-height: 1.5; text-align: center;">
                                💡 Astuce : Gardez votre profil à jour pour augmenter vos chances !
                            </p>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">
                                Cordialement,<br>
                                <strong>L'équipe TalentLink</strong>
                            </p>
                            <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                                © 2025 TalentLink. Tous droits réservés.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
"""
        return subject, html, text

    def send_welcome(self, to_email: str, user_name: str) -> bool:
        subject, html = self.render_welcome(user_name)
        return self._send(to_email, subject, html)

    def send_password_reset(self, to_email: str, user_name: str, reset_token: str, expiry_minutes: int) -> bool:
        subject, html, text = self.render_password_reset(user_name, reset_token, expiry_minutes)
        return self._send(to_email, subject, html, text)

    def send_application_notification(self, to_email: str, user_name: str, offer_title: str, company_name: str, status: str) -> bool:
        subject, html, text = self.render_application_notification(user_name, offer_title, company_name, status)
        return self._send(to_email, subject, html, text)

email_sender = EmailSender()
