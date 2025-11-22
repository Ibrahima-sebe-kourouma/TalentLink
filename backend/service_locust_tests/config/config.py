"""
Configuration centralisée pour les tests Locust
"""
import os
from dotenv import load_dotenv

load_dotenv()

# URLs des services
SERVICE_AUTH_URL = os.getenv("SERVICE_AUTH_URL", "http://localhost:8001")
SERVICE_PROFILE_URL = os.getenv("SERVICE_PROFILE_URL", "http://localhost:8002")
SERVICE_OFFERS_URL = os.getenv("SERVICE_OFFERS_URL", "http://localhost:8003")
SERVICE_MESSAGING_URL = os.getenv("SERVICE_MESSAGING_URL", "http://localhost:8004")
SERVICE_MAIL_URL = os.getenv("SERVICE_MAIL_URL", "http://localhost:8005")
SERVICE_REPORT_URL = os.getenv("SERVICE_REPORT_URL", "http://localhost:8006")
SERVICE_APPOINTMENT_URL = os.getenv("SERVICE_APPOINTMENT_URL", "http://localhost:8007")
SERVICE_RAG_URL = os.getenv("SERVICE_RAG_URL", "http://localhost:8008")

# Utilisateurs de test
TEST_USERS = {
    "candidate": {
        "email": "test_candidate@talenlink.com",
        "password": "TestPassword123!",
        "name": "Test Candidat",
        "nom": "Test",
        "prenom": "Candidat",
        "role": "candidat"
    },
    "recruiter": {
        "email": "test_recruiter@talenlink.com",
        "password": "TestPassword123!",
        "name": "Test Recruteur",
        "nom": "Test",
        "prenom": "Recruteur",
        "role": "recruteur"
    },
    "admin": {
        "email": "test_admin@talenlink.com",
        "password": "TestPassword123!",
        "name": "Test Admin",
        "nom": "Test",
        "prenom": "Admin",
        "role": "admin"
    }
}

# Configuration Locust
LOCUST_HOST = SERVICE_AUTH_URL
LOCUST_USERS = 10  # Nombre d'utilisateurs simultanés
LOCUST_SPAWN_RATE = 2  # Utilisateurs ajoutés par seconde
LOCUST_RUN_TIME = "5m"  # Durée du test

# Configuration des rapports
REPORTS_DIR = "reports"
