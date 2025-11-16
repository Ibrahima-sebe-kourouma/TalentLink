#!/usr/bin/env python3
"""
Script pour recréer la base de données avec les enum corrects
"""

import os
import sqlite3
import shutil
from datetime import datetime
from sqlalchemy import create_engine
from database.database import Base, get_db
from models.user import UserDB, Role

def backup_and_recreate_db():
    """Sauvegarder et recréer la base avec les bons enum"""
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(current_dir, "database", "database.db")
    backup_path = os.path.join(current_dir, "database", f"database_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db")
    
    print("🔄 Recreation de la base de données...")
    
    # 1. Sauvegarder les données actuelles
    print("📋 Extraction des données actuelles...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Extraire tous les utilisateurs
    cursor.execute("SELECT id, name, prenom, email, password, role, est_actif, date_creation FROM users")
    users_data = cursor.fetchall()
    print(f"   - {len(users_data)} utilisateurs extraits")
    
    # Extraire les données admin si elles existent
    admin_audit_data = []
    user_status_data = []
    reports_data = []
    
    try:
        cursor.execute("SELECT * FROM admin_audit")
        admin_audit_data = cursor.fetchall()
        print(f"   - {len(admin_audit_data)} logs d'audit extraits")
    except:
        pass
    
    try:
        cursor.execute("SELECT * FROM user_status")
        user_status_data = cursor.fetchall()
        print(f"   - {len(user_status_data)} statuts utilisateur extraits")
    except:
        pass
        
    try:
        cursor.execute("SELECT * FROM reports")
        reports_data = cursor.fetchall()
        print(f"   - {len(reports_data)} signalements extraits")
    except:
        pass
    
    conn.close()
    
    # 2. Faire une sauvegarde
    print(f"💾 Sauvegarde vers: {backup_path}")
    shutil.copy2(db_path, backup_path)
    
    # 3. Supprimer l'ancienne base
    print("🗑️  Suppression de l'ancienne base...")
    os.remove(db_path)
    
    # 4. Recréer avec SQLAlchemy
    print("🏗️  Création de la nouvelle base avec SQLAlchemy...")
    engine = create_engine(f"sqlite:///{db_path}")
    Base.metadata.create_all(bind=engine)
    
    # 5. Réinsérer les données avec les rôles normalisés
    print("📥 Réinsertion des données...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Réinsérer les utilisateurs
    for user_data in users_data:
        id_val, name, prenom, email, password, role, est_actif, date_creation = user_data
        
        # Normaliser le rôle
        role_normalized = role.lower() if role else "candidat"
        
        cursor.execute("""
            INSERT INTO users (id, name, prenom, email, password, role, est_actif, date_creation, date_modification)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (id_val, name, prenom, email, password, role_normalized, est_actif, date_creation, datetime.now()))
    
    print(f"   - {len(users_data)} utilisateurs réinsérés")
    
    # Réinsérer les données admin si disponibles
    if admin_audit_data:
        for audit_data in admin_audit_data:
            cursor.execute("""
                INSERT INTO admin_audit VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, audit_data)
        print(f"   - {len(admin_audit_data)} logs d'audit réinsérés")
    
    if user_status_data:
        for status_data in user_status_data:
            cursor.execute("""
                INSERT INTO user_status VALUES (?, ?, ?, ?, ?, ?, ?)
            """, status_data)
        print(f"   - {len(user_status_data)} statuts utilisateur réinsérés")
    
    if reports_data:
        for report_data in reports_data:
            cursor.execute("""
                INSERT INTO reports VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, report_data)
        print(f"   - {len(reports_data)} signalements réinsérés")
    
    conn.commit()
    
    # Vérifier les rôles finaux
    cursor.execute("SELECT DISTINCT role FROM users")
    final_roles = [r[0] for r in cursor.fetchall()]
    print(f"✅ Rôles finaux: {final_roles}")
    
    # Vérifier l'admin
    cursor.execute("SELECT id, email, role FROM users WHERE role = 'admin'")
    admin = cursor.fetchone()
    if admin:
        print(f"🛡️  Admin vérifié: ID={admin[0]}, Email={admin[1]}, Role={admin[2]}")
    
    conn.close()
    print("🎉 Base de données recrée avec succès!")
    return True

if __name__ == "__main__":
    try:
        success = backup_and_recreate_db()
        if success:
            print("\n✅ La base de données a été recrée avec les enum corrects.")
            print("Vous pouvez maintenant redémarrer le service d'authentification.")
        else:
            print("\n❌ Échec de la recreation de la base de données.")
    except Exception as e:
        print(f"\n❌ Erreur: {e}")
        exit(1)