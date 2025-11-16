"""
Script de migration pour créer la table notifications
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import get_db, engine
from models.notification import Base as NotificationBase
from sqlalchemy import text

def migrate_add_notifications():
    """Créer la table notifications si elle n'existe pas"""
    
    try:
        # Créer la table notifications
        NotificationBase.metadata.create_all(bind=engine)
        print("Table notifications créée avec succès!")
        
        # Vérifier que la table existe
        db = next(get_db())
        result = db.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='notifications'"))
        table_exists = result.fetchone() is not None
        
        if table_exists:
            print("✅ Table notifications vérifiée dans la base de données")
        else:
            print("❌ Table notifications non trouvée")
            
        db.close()
            
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")

if __name__ == "__main__":
    migrate_add_notifications()