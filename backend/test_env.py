#!/usr/bin/env python3
"""
Script de test pour vérifier la configuration des variables d'environnement
"""
import os
from dotenv import load_dotenv

# Charger le fichier .env
load_dotenv()

print("🔍 Test de configuration des variables d'environnement")
print("=" * 50)

# Variables de sécurité
print(f"SECRET_KEY: {'✅ Définie' if os.getenv('SECRET_KEY') else '❌ Non définie'}")
print(f"ACCESS_TOKEN_EXPIRE_MINUTES: {os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', 'Non définie')}")

# Variables de base de données
print(f"\nBases de données:")
print(f"  AUTH: {os.getenv('DATABASE_URL_AUTH', 'Non définie')}")
print(f"  PROFILE: {os.getenv('DATABASE_URL_PROFILE', 'Non définie')}")
print(f"  OFFERS: {os.getenv('DATABASE_URL_OFFERS', 'Non définie')}")
print(f"  MESSAGING: {os.getenv('DATABASE_URL_MESSAGING', 'Non définie')}")
print(f"  MAIL: {os.getenv('DATABASE_URL_MAIL', 'Non définie')}")

# Variables des services
print(f"\nServices (Host:Port):")
print(f"  AUTH: {os.getenv('SERVICE_AUTH_HOST', '127.0.0.1')}:{os.getenv('SERVICE_AUTH_PORT', '8001')}")
print(f"  PROFILE: {os.getenv('SERVICE_PROFILE_HOST', '127.0.0.1')}:{os.getenv('SERVICE_PROFILE_PORT', '8002')}")
print(f"  OFFERS: {os.getenv('SERVICE_OFFERS_HOST', '127.0.0.1')}:{os.getenv('SERVICE_OFFERS_PORT', '8003')}")
print(f"  MESSAGING: {os.getenv('SERVICE_MESSAGING_HOST', '127.0.0.1')}:{os.getenv('SERVICE_MESSAGING_PORT', '8004')}")
print(f"  MAIL: {os.getenv('SERVICE_MAIL_HOST', '127.0.0.1')}:{os.getenv('SERVICE_MAIL_PORT', '8005')}")

# Variables email
print(f"\nConfiguration Email:")
print(f"  SMTP_HOST: {os.getenv('SMTP_HOST', 'Non définie')}")
print(f"  SMTP_PORT: {os.getenv('SMTP_PORT', 'Non définie')}")
print(f"  SMTP_USER: {os.getenv('SMTP_USER', 'Non définie')}")
print(f"  SMTP_PASSWORD: {'✅ Définie' if os.getenv('SMTP_PASSWORD') else '❌ Non définie'}")

# Variables CORS
print(f"\nConfiguration CORS:")
print(f"  CORS_ORIGINS: {os.getenv('CORS_ORIGINS', 'Non définie')}")

# Variables environnement
print(f"\nEnvironnement:")
print(f"  ENVIRONMENT: {os.getenv('ENVIRONMENT', 'Non définie')}")
print(f"  DEBUG: {os.getenv('DEBUG', 'Non définie')}")

print("\n✅ Test terminé!")