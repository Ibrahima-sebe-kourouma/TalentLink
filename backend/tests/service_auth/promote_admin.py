#!/usr/bin/env python3
"""
Script pour promouvoir un utilisateur en administrateur
Usage: python promote_admin.py <email_utilisateur>
"""

import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Configuration de la base de données (même chemin que dans database/database.py)
current_dir = os.path.dirname(os.path.abspath(__file__))
database_path = os.path.join(current_dir, "database", "database.db")
DATABASE_URL = f"sqlite:///{database_path}"

def promote_to_admin(email):
    """Promouvoir un utilisateur en administrateur"""
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        # Vérifier si l'utilisateur existe
        result = session.execute(
            text("SELECT id, email, name, prenom, role FROM users WHERE email = :email"),
            {"email": email}
        )
        user = result.fetchone()
        
        if not user:
            print(f"❌ Aucun utilisateur trouvé avec l'email: {email}")
            return False
        
        print(f"👤 Utilisateur trouvé:")
        print(f"   ID: {user.id}")
        print(f"   Nom: {user.name} {user.prenom}")
        print(f"   Email: {user.email}")
        print(f"   Rôle actuel: {user.role}")
        
        if user.role == 'admin':
            print(f"✅ L'utilisateur {email} est déjà administrateur.")
            return True
        
        # Confirmation
        confirm = input(f"\n🔐 Voulez-vous promouvoir {user.name} {user.prenom} en administrateur? (oui/non): ")
        if confirm.lower() not in ['oui', 'o', 'yes', 'y']:
            print("❌ Promotion annulée.")
            return False
        
        # Promouvoir en admin
        session.execute(
            text("UPDATE users SET role = 'admin' WHERE id = :user_id"),
            {"user_id": user.id}
        )
        session.commit()
        
        print(f"✅ {user.name} {user.prenom} a été promu administrateur avec succès!")
        
        # Log de l'action dans audit trail
        try:
            session.execute(
                text("""
                    INSERT INTO admin_audit (
                        admin_user_id, action_type, description, 
                        target_user_id, created_at
                    ) VALUES (
                        :admin_id, 'role_changed', 
                        'Promotion initiale en administrateur', 
                        :target_id, datetime('now')
                    )
                """),
                {
                    "admin_id": user.id,
                    "target_id": user.id
                }
            )
            session.commit()
            print("✅ Action enregistrée dans les logs d'audit.")
        except Exception as e:
            print(f"⚠️  Erreur lors de l'enregistrement du log d'audit: {e}")
        
        session.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la promotion: {e}")
        return False

def list_users():
    """Lister tous les utilisateurs"""
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        session = Session()
        
        result = session.execute(
            text("SELECT id, email, name, prenom, role FROM users ORDER BY role, name")
        )
        users = result.fetchall()
        
        if not users:
            print("❌ Aucun utilisateur trouvé dans la base de données.")
            return
        
        print(f"\n👥 {len(users)} utilisateur(s) trouvé(s):")
        print("-" * 80)
        print(f"{'ID':<5} {'Email':<30} {'Nom':<20} {'Rôle':<10}")
        print("-" * 80)
        
        for user in users:
            role_emoji = {
                'admin': '🛡️',
                'recruteur': '👔', 
                'candidat': '👤'
            }.get(user.role, '❓')
            
            print(f"{user.id:<5} {user.email:<30} {user.name} {user.prenom:<20} {role_emoji} {user.role}")
        
        session.close()
        
    except Exception as e:
        print(f"❌ Erreur lors de la liste des utilisateurs: {e}")

def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python promote_admin.py <email_utilisateur>  - Promouvoir un utilisateur")
        print("  python promote_admin.py --list               - Lister tous les utilisateurs")
        sys.exit(1)
    
    if sys.argv[1] == '--list':
        list_users()
    else:
        email = sys.argv[1]
        success = promote_to_admin(email)
        if success:
            print(f"\n🎉 L'utilisateur {email} peut maintenant accéder au panel d'administration!")
        else:
            sys.exit(1)

if __name__ == "__main__":
    main()