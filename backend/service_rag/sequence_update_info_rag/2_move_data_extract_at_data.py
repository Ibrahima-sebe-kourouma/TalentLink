"""
Script de déplacement des fichiers JSON extraits vers le dossier data
Déplace uniquement les fichiers commençant par 'service_' et écrase les anciens
"""

import os
import shutil
from pathlib import Path

# Obtenir le répertoire du script et remonter au dossier BACKEND_RAG
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_RAG_DIR = os.path.dirname(SCRIPT_DIR)

# Dossiers source et destination
SOURCE_DIR = os.path.join(BACKEND_RAG_DIR, 'data_extract_from_db')
DEST_DIR = os.path.join(BACKEND_RAG_DIR, 'data')

def move_service_files():
    """Déplace les fichiers service_*.json vers le dossier data"""
    
    print("="*60)
    print("🚀 DÉPLACEMENT DES FICHIERS JSON VERS LE DOSSIER DATA")
    print("="*60)
    
    # Vérifier que le dossier source existe
    if not os.path.exists(SOURCE_DIR):
        print(f"❌ Erreur: Le dossier source '{SOURCE_DIR}' n'existe pas")
        return
    
    # Créer le dossier de destination s'il n'existe pas
    if not os.path.exists(DEST_DIR):
        os.makedirs(DEST_DIR)
        print(f"📁 Dossier de destination créé: {DEST_DIR}")
    else:
        print(f"📁 Dossier de destination: {DEST_DIR}")
    
    # Lister tous les fichiers dans le dossier source
    files = os.listdir(SOURCE_DIR)
    
    # Filtrer les fichiers qui commencent par 'service_'
    service_files = [f for f in files if f.startswith('service_') and f.endswith('.json')]
    
    if not service_files:
        print("\n⚠️  Aucun fichier commençant par 'service_' trouvé dans le dossier source")
        return
    
    print(f"\n📊 {len(service_files)} fichier(s) à déplacer:\n")
    
    moved_count = 0
    replaced_count = 0
    error_count = 0
    
    # Déplacer chaque fichier
    for filename in service_files:
        source_path = os.path.join(SOURCE_DIR, filename)
        dest_path = os.path.join(DEST_DIR, filename)
        
        try:
            # Vérifier si le fichier existe déjà dans la destination
            file_exists = os.path.exists(dest_path)
            
            # Copier le fichier (écrase si existe déjà)
            shutil.copy2(source_path, dest_path)
            
            if file_exists:
                print(f"   ♻️  {filename} - Remplacé")
                replaced_count += 1
            else:
                print(f"   ✅ {filename} - Déplacé")
                moved_count += 1
            
        except Exception as e:
            print(f"   ❌ {filename} - Erreur: {e}")
            error_count += 1
    
    # Résumé
    print("\n" + "="*60)
    print("✅ Opération terminée!")
    print(f"📄 {moved_count} nouveau(x) fichier(s) déplacé(s)")
    print(f"♻️  {replaced_count} fichier(s) remplacé(s)")
    
    if error_count > 0:
        print(f"❌ {error_count} erreur(s)")
    
    print(f"📁 Fichiers disponibles dans: {DEST_DIR}")
    print("="*60)
    
    # Afficher les fichiers dans le dossier data
    print("\n📋 Contenu du dossier data:")
    data_files = sorted(os.listdir(DEST_DIR))
    for i, file in enumerate(data_files, 1):
        file_size = os.path.getsize(os.path.join(DEST_DIR, file))
        size_kb = file_size / 1024
        print(f"   {i}. {file} ({size_kb:.1f} KB)")


if __name__ == "__main__":
    move_service_files()
    
    print("\n💡 Prochaine étape:")
    print("   Relancez le serveur RAG pour réindexer les nouvelles données")
    print("   Commande: cd backend\\BACKEND_RAG && .\\run_rag.bat")
