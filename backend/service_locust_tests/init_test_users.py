"""
Tests pour initialiser les utilisateurs de test
À exécuter avant les tests de charge
"""
import requests
from config.config import TEST_USERS, SERVICE_AUTH_URL

def create_test_users():
    """Créer les utilisateurs de test nécessaires"""
    print("Création des utilisateurs de test...")
    
    for role, user_data in TEST_USERS.items():
        print(f"\n{'='*50}")
        print(f"Création utilisateur: {role}")
        print(f"Email: {user_data['email']}")
        
        try:
            response = requests.post(
                f"{SERVICE_AUTH_URL}/auth/register",
                json=user_data,
                timeout=10
            )
            
            if response.status_code in [200, 201]:
                print(f"✅ Utilisateur {role} créé avec succès")
            elif response.status_code == 400 and "existe déjà" in response.text:
                print(f"ℹ️  Utilisateur {role} existe déjà")
            else:
                print(f"❌ Erreur: {response.status_code}")
                print(f"   {response.text}")
        
        except Exception as e:
            print(f"❌ Exception: {e}")
    
    print(f"\n{'='*50}")
    print("Initialisation terminée!")
    print(f"{'='*50}\n")

if __name__ == "__main__":
    create_test_users()
