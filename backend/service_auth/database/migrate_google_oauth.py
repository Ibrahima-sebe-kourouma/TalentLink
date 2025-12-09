"""
Migration: Ajout des colonnes Google OAuth
Ajoute google_id et picture aux utilisateurs
"""
import sys
import os

# Ajouter le chemin du module
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import engine
from sqlalchemy import text

def migrate():
    """Ajoute les colonnes Google OAuth à la table users"""
    
    try:
        with engine.connect() as conn:
            # Vérifier si google_id existe
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result]
            
            if 'google_id' not in columns:
                print("➕ Ajout de la colonne google_id...")
                conn.execute(text("ALTER TABLE users ADD COLUMN google_id VARCHAR"))
                conn.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_users_google_id ON users(google_id)"))
                conn.commit()
                print("✅ Colonne google_id ajoutée")
            else:
                print("ℹ️  Colonne google_id existe déjà")
            
            if 'picture' not in columns:
                print("➕ Ajout de la colonne picture...")
                conn.execute(text("ALTER TABLE users ADD COLUMN picture VARCHAR"))
                conn.commit()
                print("✅ Colonne picture ajoutée")
            else:
                print("ℹ️  Colonne picture existe déjà")
        
        print("✅ Migration terminée avec succès!")
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        raise

if __name__ == "__main__":
    migrate()
