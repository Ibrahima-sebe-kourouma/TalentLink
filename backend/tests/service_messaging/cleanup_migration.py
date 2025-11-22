#!/usr/bin/env python3
"""
Script de nettoyage final après migration
Supprime les fichiers temporaires et organise l'architecture
"""

import os
import sys
import shutil
from pathlib import Path

def get_project_root():
    """Retourne le répertoire racine du projet"""
    current = Path(__file__).parent
    # Remonter jusqu'à trouver le dossier backend
    while current.name != 'backend' and current.parent != current:
        current = current.parent
    return current

def clean_temporary_files():
    """Supprime les fichiers temporaires de migration"""
    backend_root = get_project_root()
    
    # Fichiers temporaires à supprimer s'ils existent encore
    temp_files = [
        'analyze_messaging_data.py',
        'export_sqlite_data.py', 
        'import_to_mongodb.py',
        'migration_data',
        'messaging_data_analysis.json'
    ]
    
    removed_files = []
    
    for file_name in temp_files:
        file_path = backend_root / file_name
        if file_path.exists():
            if file_path.is_dir():
                shutil.rmtree(file_path)
            else:
                file_path.unlink()
            removed_files.append(file_name)
    
    return removed_files

def verify_test_structure():
    """Vérifie que la structure de tests est correcte"""
    backend_root = get_project_root()
    test_dir = backend_root / 'tests' / 'service_messaging'
    
    expected_files = [
        'README.md',
        'analyze_messaging_data.py',
        'export_sqlite_data.py',
        'import_to_mongodb.py',
        'test_migration.py',
        'migration_data/conversations.json',
        'migration_data/messages.json',
        'migration_data/sqlite_to_mongodb_mapping.json'
    ]
    
    missing_files = []
    existing_files = []
    
    for file_path in expected_files:
        full_path = test_dir / file_path
        if full_path.exists():
            existing_files.append(file_path)
        else:
            missing_files.append(file_path)
    
    return existing_files, missing_files

def verify_service_structure():
    """Vérifie que la structure du service messaging est correcte"""
    backend_root = get_project_root()
    service_dir = backend_root / 'service_messaging'
    
    expected_structure = [
        'main.py',
        'models/conversation.py',
        'models/message.py',
        'controllers/conversation_controller.py',
        'controllers/message_controller.py',
        'routes/conversation_routes.py',
        'routes/message_routes.py',
        'database/database.py'
    ]
    
    missing_files = []
    existing_files = []
    
    for file_path in expected_structure:
        full_path = service_dir / file_path
        if full_path.exists():
            existing_files.append(file_path)
        else:
            missing_files.append(file_path)
    
    return existing_files, missing_files

def check_sqlite_remnants():
    """Vérifie qu'il ne reste aucun fichier SQLite"""
    backend_root = get_project_root()
    
    sqlite_files = []
    
    # Rechercher les fichiers .db
    for root, dirs, files in os.walk(backend_root):
        for file in files:
            if file.endswith('.db') or file.endswith('.sqlite') or file.endswith('.sqlite3'):
                sqlite_files.append(os.path.join(root, file))
    
    return sqlite_files

def generate_cleanup_report():
    """Génère un rapport de nettoyage"""
    print("🧹 Rapport de Nettoyage Final - Service Messaging")
    print("=" * 55)
    
    # Nettoyage des fichiers temporaires
    print("\n1. 🗑️  Nettoyage des fichiers temporaires...")
    removed_files = clean_temporary_files()
    if removed_files:
        print(f"   ✅ {len(removed_files)} fichiers supprimés:")
        for file in removed_files:
            print(f"      - {file}")
    else:
        print("   ✅ Aucun fichier temporaire trouvé")
    
    # Vérification de la structure de tests
    print("\n2. 📁 Vérification de la structure de tests...")
    existing_test_files, missing_test_files = verify_test_structure()
    print(f"   ✅ {len(existing_test_files)} fichiers de tests présents:")
    for file in existing_test_files[:5]:  # Limiter l'affichage
        print(f"      - {file}")
    if len(existing_test_files) > 5:
        print(f"      ... et {len(existing_test_files) - 5} autres")
    
    if missing_test_files:
        print(f"   ⚠️  {len(missing_test_files)} fichiers manquants:")
        for file in missing_test_files:
            print(f"      - {file}")
    
    # Vérification de la structure du service
    print("\n3. 🔧 Vérification de la structure du service...")
    existing_service_files, missing_service_files = verify_service_structure()
    print(f"   ✅ {len(existing_service_files)} fichiers de service présents")
    
    if missing_service_files:
        print(f"   ⚠️  {len(missing_service_files)} fichiers manquants:")
        for file in missing_service_files:
            print(f"      - {file}")
    
    # Recherche de fichiers SQLite restants
    print("\n4. 🔍 Recherche de fichiers SQLite...")
    sqlite_files = check_sqlite_remnants()
    if sqlite_files:
        print(f"   ⚠️  {len(sqlite_files)} fichiers SQLite trouvés:")
        for file in sqlite_files:
            print(f"      - {file}")
    else:
        print("   ✅ Aucun fichier SQLite trouvé")
    
    # Résumé final
    print("\n" + "=" * 55)
    print("📊 RÉSUMÉ FINAL")
    print("=" * 55)
    
    issues = 0
    
    if missing_test_files:
        issues += len(missing_test_files)
        print(f"❌ {len(missing_test_files)} fichiers de tests manquants")
    else:
        print("✅ Structure de tests complète")
    
    if missing_service_files:
        issues += len(missing_service_files)
        print(f"❌ {len(missing_service_files)} fichiers de service manquants")
    else:
        print("✅ Structure de service complète")
    
    if sqlite_files:
        issues += len(sqlite_files)
        print(f"❌ {len(sqlite_files)} fichiers SQLite restants")
    else:
        print("✅ Aucun résidu SQLite")
    
    print(f"\n🎯 Statut: {'✅ NETTOYAGE RÉUSSI' if issues == 0 else f'⚠️ {issues} PROBLÈMES DÉTECTÉS'}")
    
    # Instructions finales
    if issues == 0:
        print("\n🚀 Architecture prête pour la production!")
        print("   - Tests disponibles dans: tests/service_messaging/")
        print("   - Service opérationnel sur: http://localhost:8004")
        print("   - Base de données: MongoDB talentlink_messaging")
    
    return issues == 0

def main():
    """Fonction principale de nettoyage"""
    try:
        success = generate_cleanup_report()
        
        if success:
            print("\n✅ Nettoyage terminé avec succès!")
        else:
            print("\n⚠️  Nettoyage terminé avec des avertissements.")
        
        return success
        
    except Exception as e:
        print(f"\n❌ Erreur lors du nettoyage: {str(e)}")
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)