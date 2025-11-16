"""
Script de migration pour créer les tables d'administration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import get_db, engine
from models.admin import AdminAuditDB, UserStatusDB, ReportDB
from models.user import UserDB, Role
from sqlalchemy import text

def migrate_create_admin_tables():
    """Créer les tables d'administration"""
    
    try:
        # Créer les tables d'administration
        AdminAuditDB.metadata.create_all(bind=engine)
        UserStatusDB.metadata.create_all(bind=engine)
        ReportDB.metadata.create_all(bind=engine)
        
        print("✅ Tables d'administration créées avec succès!")
        
        # Vérifier que les tables existent
        db = next(get_db())
        
        tables_to_check = ['admin_audit', 'user_status', 'reports']
        for table_name in tables_to_check:
            result = db.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}'"))
            table_exists = result.fetchone() is not None
            
            if table_exists:
                print(f"✅ Table {table_name} vérifiée dans la base de données")
            else:
                print(f"❌ Table {table_name} non trouvée")
        
        # Vérifier s'il existe déjà un utilisateur admin
        admin_count = db.query(UserDB).filter(UserDB.role == Role.ADMIN).count()
        if admin_count == 0:
            print("\n⚠️  Aucun administrateur trouvé dans la base de données.")
            print("   Vous devrez créer un compte administrateur manuellement ou")
            print("   modifier le rôle d'un utilisateur existant en 'admin'.")
        else:
            print(f"\n✅ {admin_count} administrateur(s) trouvé(s) dans la base de données.")
            
        db.close()
        print("\n🎉 Migration des tables d'administration terminée!")
            
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")

def create_first_admin():
    """Helper pour créer le premier administrateur"""
    db = next(get_db())
    
    try:
        # Chercher un utilisateur existant qu'on peut promouvoir
        first_user = db.query(UserDB).first()
        if first_user:
            print(f"Promotion de l'utilisateur {first_user.email} en administrateur...")
            first_user.role = Role.ADMIN
            db.commit()
            print(f"✅ {first_user.email} est maintenant administrateur!")
        else:
            print("❌ Aucun utilisateur trouvé pour promotion")
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    
    migrate_create_admin_tables()
    
    if len(sys.argv) > 1 and sys.argv[1] == "--create-admin":
        create_first_admin()