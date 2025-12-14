"""
Script pour nettoyer les données de test après les tests de charge
"""
import os
import json
from pathlib import Path

def clean_rag_conversations():
    """Nettoyer les conversations de test du RAG"""
    conversations_dir = Path("../service_rag/conversations")
    
    if not conversations_dir.exists():
        print("Répertoire conversations non trouvé")
        return
    
    print("Nettoyage des conversations de test...")
    
    count = 0
    for file in conversations_dir.glob("*.json"):
        if file.name.startswith("user_"):
            # Index files
            continue
        
        try:
            with open(file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Supprimer les conversations de test
            if data.get("user_id") and "test" in str(data.get("user_id")).lower():
                file.unlink()
                count += 1
        except Exception as e:
            print(f"Erreur avec {file.name}: {e}")
    
    print(f"✅ {count} conversations de test supprimées")

def clean_reports():
    """Nettoyer les anciens rapports"""
    reports_dir = Path("reports")
    
    if not reports_dir.exists():
        print("Répertoire reports non trouvé")
        return
    
    print("Nettoyage des anciens rapports...")
    
    count = 0
    for file in reports_dir.glob("*.html"):
        file.unlink()
        count += 1
    
    print(f"✅ {count} rapports supprimés")

if __name__ == "__main__":
    print("\n" + "="*50)
    print("  NETTOYAGE DES DONNÉES DE TEST")
    print("="*50 + "\n")
    
    clean_rag_conversations()
    clean_reports()
    
    print("\n" + "="*50)
    print("  Nettoyage terminé!")
    print("="*50 + "\n")
