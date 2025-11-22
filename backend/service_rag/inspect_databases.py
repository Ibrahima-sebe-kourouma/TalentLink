import sqlite3
import os

# Chemins des bases de données
dbs = {
    'service_offers': r'C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend\service_offers\database\database.db',
    'service_profile': r'C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend\service_profile\database\database.db',
    'service_appointment': r'C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend\service_appointment\database\appointments.db'
}

print("="*60)
print("INSPECTION DES TABLES DANS LES BASES DE DONNÉES")
print("="*60)

for service_name, db_path in dbs.items():
    print(f"\n📦 {service_name}")
    print(f"   Chemin: {db_path}")
    
    if not os.path.exists(db_path):
        print(f"   ❌ Fichier non trouvé")
        continue
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Lister les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        if tables:
            print(f"   ✅ Tables trouvées:")
            for table in tables:
                table_name = table[0]
                cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                count = cursor.fetchone()[0]
                print(f"      - {table_name} ({count} enregistrements)")
        else:
            print(f"   ⚠️  Aucune table trouvée")
        
        conn.close()
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")

print("\n" + "="*60)
