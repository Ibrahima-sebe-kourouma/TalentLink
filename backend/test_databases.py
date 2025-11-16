#!/usr/bin/env python3
"""
Script de test pour vérifier la connectivité des bases de données
"""
import sys
import os
from dotenv import load_dotenv

# Ajouter le chemin backend au Python path
backend_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, backend_dir)

# Charger les variables d'environnement
load_dotenv()

def test_database_connection(service_name, database_module_path):
    """Test la connexion à une base de données d'un service"""
    try:
        print(f"🔍 Test {service_name}...")
        
        # Import dynamique du module database du service
        module = __import__(database_module_path, fromlist=['engine', 'Base'])
        engine = module.engine
        Base = module.Base
        
        # Test de connexion
        with engine.connect() as connection:
            print(f"  ✅ Connexion DB réussie")
        
        # Test de création des tables
        Base.metadata.create_all(bind=engine)
        print(f"  ✅ Création/vérification tables réussie")
        
        return True
        
    except Exception as e:
        print(f"  ❌ Erreur: {str(e)}")
        return False

def main():
    print("🔍 Test de connectivité des bases de données")
    print("=" * 60)
    
    services = [
        ("Service Auth", "service_auth.database.database"),
        ("Service Profile", "service_profile.database.database"),
        ("Service Offers", "service_offers.database.database"),
        ("Service Messaging", "service_messaging.database.database"),
    ]
    
    results = {}
    
    for service_name, module_path in services:
        results[service_name] = test_database_connection(service_name, module_path)
    
    print("\n📊 Résultats:")
    print("-" * 30)
    
    all_success = True
    for service_name, success in results.items():
        status = "✅ OK" if success else "❌ ÉCHEC"
        print(f"{service_name}: {status}")
        if not success:
            all_success = False
    
    print(f"\n{'🎉 Tous les services sont opérationnels!' if all_success else '⚠️ Des erreurs ont été détectées.'}")
    
    return 0 if all_success else 1

if __name__ == "__main__":
    sys.exit(main())