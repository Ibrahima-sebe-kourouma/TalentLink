"""
Google OAuth 2.0 Authentication Controller
Gère l'authentification via Google Sign-In
"""
import os
import requests
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from models.user import UserDB
from utils.security import create_access_token
from datetime import datetime

# Configuration Google OAuth
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8001/auth/google/callback")
PROFILE_SERVICE_URL = os.getenv("PROFILE_SERVICE_URL", "http://127.0.0.1:8002")
MAIL_SERVICE_URL = os.getenv("MAIL_SERVICE_URL", "http://127.0.0.1:8005")


def get_google_login_url():
    """
    Génère l'URL de connexion Google OAuth 2.0
    """
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in params.items()])
    return f"{base_url}?{query_string}"


def exchange_code_for_token(code: str):
    """
    Échange le code d'autorisation contre un token d'accès
    """
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": GOOGLE_CLIENT_ID,
        "client_secret": GOOGLE_CLIENT_SECRET,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code"
    }
    
    try:
        response = requests.post(token_url, data=data, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"[OAuth] Erreur lors de l'échange du code: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Impossible d'obtenir le token Google"
        )


def verify_google_token(token: str):
    """
    Vérifie et décode le token ID Google
    """
    try:
        # Vérifier le token avec Google
        # clock_skew_in_seconds permet de tolérer un décalage d'horloge de 10 secondes
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID,
            clock_skew_in_seconds=10
        )
        
        # Vérifier que le token provient bien de Google
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            raise ValueError('Wrong issuer.')
        
        return idinfo
    except ValueError as e:
        print(f"[OAuth] Token invalide: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token Google invalide"
        )


def google_oauth_callback(db: Session, code: str):
    """
    Gère le callback OAuth et crée/connecte l'utilisateur
    """
    # Échanger le code contre un token
    token_data = exchange_code_for_token(code)
    id_token_str = token_data.get("id_token")
    
    if not id_token_str:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token ID manquant"
        )
    
    # Vérifier et décoder le token
    user_info = verify_google_token(id_token_str)
    
    # Extraire les informations utilisateur
    email = user_info.get("email")
    google_id = user_info.get("sub")
    name = user_info.get("name", "")
    given_name = user_info.get("given_name", "")
    family_name = user_info.get("family_name", "")
    picture = user_info.get("picture", "")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email non fourni par Google"
        )
    
    # Vérifier si l'utilisateur existe déjà
    existing_user = db.query(UserDB).filter(UserDB.email == email).first()
    
    if existing_user:
        # Mettre à jour le google_id si nécessaire
        if not hasattr(existing_user, 'google_id') or not existing_user.google_id:
            existing_user.google_id = google_id
            db.commit()
        
        user = existing_user
    else:
        # Créer un nouvel utilisateur
        # Par défaut, les utilisateurs Google sont des candidats
        new_user = UserDB(
            email=email,
            name=family_name or name.split()[-1] if name else "Google",
            prenom=given_name or name.split()[0] if name else "User",
            password="",  # Pas de mot de passe pour OAuth
            role="candidat",
            google_id=google_id,
            picture=picture
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        user = new_user
        
        # Créer le profil candidat dans le service profile
        try:
            payload = {
                "auth_user_id": user.id,
                "name": user.name,
                "prenom": user.prenom,
                "email": user.email,
            }
            requests.post(f"{PROFILE_SERVICE_URL}/candidates/", json=payload, timeout=5)
        except Exception as e:
            print(f"[OAuth] Erreur création profil: {e}")
            # Ne pas bloquer la connexion si le profil échoue
        
        # Envoyer l'email de bienvenue
        try:
            welcome_payload = {
                "to_email": user.email,
                "user_name": f"{user.prenom} {user.name}"
            }
            requests.post(f"{MAIL_SERVICE_URL}/mail/welcome", json=welcome_payload, timeout=5)
            print(f"[OAuth] Email de bienvenue envoyé à {user.email}")
        except Exception as e:
            print(f"[OAuth] Erreur envoi email de bienvenue: {e}")
            # Ne pas bloquer la connexion si l'email échoue
    
    # Créer le token JWT pour l'application
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "prenom": user.prenom,
            "role": user.role,
            "picture": picture
        }
    }


def google_token_login(db: Session, token: str):
    """
    Connexion directe avec un token Google ID (pour frontend)
    """
    # Vérifier et décoder le token
    user_info = verify_google_token(token)
    
    # Extraire les informations
    email = user_info.get("email")
    google_id = user_info.get("sub")
    name = user_info.get("name", "")
    given_name = user_info.get("given_name", "")
    family_name = user_info.get("family_name", "")
    picture = user_info.get("picture", "")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email non fourni par Google"
        )
    
    # Vérifier si l'utilisateur existe
    existing_user = db.query(UserDB).filter(UserDB.email == email).first()
    
    if existing_user:
        # Mettre à jour le google_id
        if not hasattr(existing_user, 'google_id') or not existing_user.google_id:
            existing_user.google_id = google_id
            db.commit()
        user = existing_user
    else:
        # Créer nouvel utilisateur
        new_user = UserDB(
            email=email,
            name=family_name or name.split()[-1] if name else "Google",
            prenom=given_name or name.split()[0] if name else "User",
            password="",
            role="candidat",
            google_id=google_id,
            picture=picture
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        user = new_user
        
        # Créer profil candidat
        try:
            payload = {
                "auth_user_id": user.id,
                "name": user.name,
                "prenom": user.prenom,
                "email": user.email,
            }
            requests.post(f"{PROFILE_SERVICE_URL}/candidates/", json=payload, timeout=5)
        except Exception:
            pass
        
        # Envoyer l'email de bienvenue
        try:
            welcome_payload = {
                "to_email": user.email,
                "user_name": f"{user.prenom} {user.name}"
            }
            requests.post(f"{MAIL_SERVICE_URL}/mail/welcome", json=welcome_payload, timeout=5)
            print(f"[OAuth] Email de bienvenue envoyé à {user.email}")
        except Exception as e:
            print(f"[OAuth] Erreur envoi email de bienvenue: {e}")
    
    # Créer JWT token
    access_token = create_access_token(data={"sub": user.email})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "prenom": user.prenom,
            "role": user.role,
            "picture": picture
        }
    }
