#!/usr/bin/env python3
"""
Test script pour vérifier la structure de réponse de l'API de connexion
"""
import requests
import json

def test_login_response():
    """Tester la structure de réponse de l'API login"""
    print("🔐 Test de la structure de réponse login...")
    
    # URL de l'API auth
    auth_url = "http://127.0.0.1:8001"
    
    # Données de connexion (user1@gmail.com qui est admin)
    login_data = {
        "email": "user1@gmail.com",
        "password": "1234"
    }
    
    try:
        # Test de connexion
        response = requests.post(
            f"{auth_url}/auth/login",
            params=login_data
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connexion réussie!")
            print(f"📋 Structure de la réponse:")
            print(json.dumps(data, indent=2, ensure_ascii=False))
            
            # Vérifier la structure
            if 'user' in data and 'id' in data['user']:
                print(f"✅ Structure correcte: user.id = {data['user']['id']}")
                print(f"✅ user.email = {data['user']['email']}")
                print(f"✅ user.role = {data['user']['role']}")
            else:
                print("❌ Structure incorrecte dans la réponse")
                
        else:
            print(f"❌ Échec connexion: {response.status_code}")
            print(f"Réponse: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au service auth (port 8001)")
        print("Assurez-vous que le service auth est démarré")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_login_response()