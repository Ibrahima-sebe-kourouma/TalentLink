#!/usr/bin/env python3
"""
Script de migration pour normaliser les rôles en minuscules
"""

import sqlite3
import os
from datetime import datetime

def normalize_roles():
    """Normaliser tous les rôles en minuscules dans la base de données"""
    
    # Chemin vers la base de données
    current_dir = os.path.dirname(os.path.abspath(__file__))
    database_path = os.path.join(current_dir, "database", "database.db")
    
    conn = sqlite3.connect(database_path)
    cursor = conn.cursor()
    
    try:
        print("🔄 Normalisation des rôles en cours...")
        
        # Vérifier les rôles actuels
        cursor.execute('SELECT DISTINCT role FROM users')
        current_roles = [r[0] for r in cursor.fetchall()]
        print(f"Rôles actuels: {current_roles}")
        
        # Normaliser CANDIDAT -> candidat
        cursor.execute("UPDATE users SET role = 'candidat' WHERE role = 'CANDIDAT'")
        candidat_updated = cursor.rowcount
        
        # Normaliser RECRUTEUR -> recruteur  
        cursor.execute("UPDATE users SET role = 'recruteur' WHERE role = 'RECRUTEUR'")
        recruteur_updated = cursor.rowcount
        
        # Le rôle admin est déjà en minuscules
        
        conn.commit()
        
        # Vérifier les nouveaux rôles
        cursor.execute('SELECT DISTINCT role FROM users')
        new_roles = [r[0] for r in cursor.fetchall()]
        print(f"Nouveaux rôles: {new_roles}")
        
        print(f"✅ Migration terminée:")
        print(f"   - {candidat_updated} utilisateur(s) CANDIDAT -> candidat")
        print(f"   - {recruteur_updated} utilisateur(s) RECRUTEUR -> recruteur")
        
        # Afficher un résumé des utilisateurs par rôle
        for role in new_roles:
            cursor.execute('SELECT COUNT(*) FROM users WHERE role = ?', (role,))
            count = cursor.fetchone()[0]
            print(f"   - {count} utilisateur(s) avec le rôle '{role}'")
            
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()
    
    return True

if __name__ == "__main__":
    print("🚀 Démarrage de la migration des rôles...")
    success = normalize_roles()
    
    if success:
        print("\n🎉 Migration des rôles terminée avec succès!")
        print("Vous pouvez maintenant redémarrer le service d'authentification.")
    else:
        print("\n❌ Échec de la migration des rôles.")
        exit(1)