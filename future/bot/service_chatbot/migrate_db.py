#!/usr/bin/env python
"""
Script de migration pour recréer les tables de la base de données chatbot
avec la nouvelle structure incluant meta_data
"""

import os
import sys
from datetime import datetime
from database.database import engine, SessionLocal
from models.chatbot import Base  # Import Base depuis les modèles

def recreate_tables():
    """Recrée toutes les tables de la base de données"""
    print("🔄 Recréation des tables de la base de données...")
    
    # Renommer l'ancien fichier de base de données s'il existe
    db_file = "chatbot.db"
    backup_file = f"chatbot_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
    
    if os.path.exists(db_file):
        try:
            os.rename(db_file, backup_file)
            print(f"📁 Ancien fichier sauvegardé comme {backup_file}")
        except:
            print("⚠️  Impossible de renommer l'ancien fichier, création d'une nouvelle DB...")
    
    # Recréer toutes les tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables recréées avec succès")
    
    # Importer et exécuter l'initialisation par défaut
    try:
        from database.database import initialize_default_data
        db = SessionLocal()
        initialize_default_data(db)
        db.close()
        print("✅ Données par défaut initialisées")
    except Exception as e:
        print(f"⚠️  Erreur lors de l'initialisation des données par défaut: {e}")

if __name__ == "__main__":
    recreate_tables()
    print("🚀 Migration terminée. Vous pouvez relancer le service.")