"""
Script d'extraction des données des bases de données SQLite vers JSON
Extrait les tables de chaque service et les sauvegarde en fichiers JSON
"""

import sqlite3
import json
import os
from pathlib import Path
from datetime import datetime

# Configuration des bases de données et leurs tables
DB_CONFIG = {
    'service_offers': {
        'db_path': '../service_offers/database/database.db',
        'tables': ['offers', 'applications']
    },
    'service_profile': {
        'db_path': '../service_profile/database/database.db',
        'tables': ['candidats', 'recruteurs', 'profile_views']
    },
    'service_appointment': {
        'db_path': '../service_appointment/database/appointments.db',
        'tables': ['appointments', 'appointment_candidates', 'appointment_slots']
    }
}

# Dossier de sortie
OUTPUT_DIR = './data_extract_from_db'


def get_table_schema(cursor, table_name):
    """Récupère le schéma d'une table"""
    cursor.execute(f"PRAGMA table_info({table_name})")
    columns = cursor.fetchall()
    return [col[1] for col in columns]  # col[1] contient le nom de la colonne


def extract_table_to_dict(cursor, table_name):
    """Extrait une table et retourne les données sous forme de liste de dictionnaires"""
    try:
        # Récupérer le schéma
        columns = get_table_schema(cursor, table_name)
        
        # Récupérer les données
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        # Convertir en liste de dictionnaires
        data = []
        for row in rows:
            row_dict = {}
            for idx, column in enumerate(columns):
                value = row[idx]
                # Convertir les types non-JSON en string
                if isinstance(value, (bytes, bytearray)):
                    value = str(value)
                row_dict[column] = value
            data.append(row_dict)
        
        return {
            'table_name': table_name,
            'columns': columns,
            'row_count': len(data),
            'extracted_at': datetime.now().isoformat(),
            'data': data
        }
    except sqlite3.OperationalError as e:
        print(f"❌ Erreur lors de l'extraction de la table {table_name}: {e}")
        return None


def extract_all_databases():
    """Extrait toutes les tables de toutes les bases de données"""
    
    # Créer le dossier de sortie
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"📁 Dossier de sortie créé: {OUTPUT_DIR}")
    
    total_files = 0
    total_records = 0
    
    # Parcourir chaque service
    for service_name, config in DB_CONFIG.items():
        db_path = config['db_path']
        tables = config['tables']
        
        print(f"\n🔄 Traitement du service: {service_name}")
        print(f"   Base de données: {db_path}")
        
        # Vérifier que la base de données existe
        if not os.path.exists(db_path):
            print(f"   ⚠️  Base de données non trouvée, ignorée.")
            continue
        
        # Connexion à la base de données
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            
            # Extraire chaque table
            for table_name in tables:
                print(f"   📊 Extraction de la table: {table_name}")
                
                # Extraire les données
                table_data = extract_table_to_dict(cursor, table_name)
                
                if table_data:
                    # Nom du fichier de sortie
                    output_file = os.path.join(OUTPUT_DIR, f"{service_name}_{table_name}.json")
                    
                    # Sauvegarder en JSON
                    with open(output_file, 'w', encoding='utf-8') as f:
                        json.dump(table_data, f, indent=2, ensure_ascii=False)
                    
                    print(f"   ✅ {table_data['row_count']} enregistrement(s) exporté(s) vers: {output_file}")
                    total_files += 1
                    total_records += table_data['row_count']
            
            conn.close()
            
        except sqlite3.Error as e:
            print(f"   ❌ Erreur de connexion à la base de données: {e}")
            continue
    
    # Résumé
    print(f"\n" + "="*60)
    print(f"✅ Extraction terminée!")
    print(f"📄 {total_files} fichier(s) JSON créé(s)")
    print(f"📊 {total_records} enregistrement(s) au total")
    print(f"📁 Fichiers sauvegardés dans: {OUTPUT_DIR}")
    print("="*60)


def create_metadata_file():
    """Crée un fichier de métadonnées pour l'extraction"""
    metadata = {
        'extraction_date': datetime.now().isoformat(),
        'services': list(DB_CONFIG.keys()),
        'total_tables': sum(len(config['tables']) for config in DB_CONFIG.values()),
        'config': DB_CONFIG
    }
    
    metadata_file = os.path.join(OUTPUT_DIR, '_metadata.json')
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    print(f"📝 Métadonnées sauvegardées: {metadata_file}")


if __name__ == "__main__":
    print("="*60)
    print("🚀 EXTRACTION DES DONNÉES DES BASES DE DONNÉES SQLITE")
    print("="*60)
    
    extract_all_databases()
    create_metadata_file()
    
    print("\n💡 Pour utiliser ces données avec le RAG:")
    print("   1. Les fichiers JSON sont prêts dans ./data_extract_from_db")
    print("   2. Vous pouvez les copier dans ./data pour l'indexation")
    print("   3. Relancez le serveur RAG pour indexer les nouvelles données")
