#!/usr/bin/env python3
"""
Test script pour vérifier la suspension d'utilisateur via l'API admin
"""
import requests
import json

def test_user_suspension():
    """Tester la suspension d'un utilisateur"""
    print("🔐 Test de suspension d'utilisateur...")
    
    # URL de l'API auth
    auth_url = "http://127.0.0.1:8001"
    
    # Connexion admin d'abord
    login_data = {
        "email": "user1@gmail.com",
        "password": "1234"
    }
    
    try:
        # 1. Connexion admin
        login_response = requests.post(f"{auth_url}/auth/login", params=login_data)
        if login_response.status_code != 200:
            print(f"❌ Échec connexion admin: {login_response.status_code}")
            return
            
        token_data = login_response.json()
        token = token_data["access_token"]
        print(f"✅ Connexion admin réussie! Token obtenu.")
        
        # 2. Test de suspension d'utilisateur (ID 4)
        user_id = 4
        suspension_data = {
            "status": "suspended",
            "reason": "Test suspension via API",
            "suspended_until": None
        }
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        print(f"🚫 Test suspension de l'utilisateur ID {user_id}...")
        suspend_response = requests.patch(
            f"{auth_url}/admin/users/{user_id}/status",
            headers=headers,
            json=suspension_data
        )
        
        if suspend_response.status_code == 200:
            print("✅ Suspension réussie!")
            result = suspend_response.json()
            print(f"📋 Résultat: {json.dumps(result, indent=2, ensure_ascii=False)}")
        else:
            print(f"❌ Échec suspension: {suspend_response.status_code}")
            print(f"Réponse: {suspend_response.text}")
            
        # 3. Vérifier la liste des utilisateurs
        print("\n👥 Test de la liste des utilisateurs...")
        users_response = requests.get(f"{auth_url}/admin/users", headers=headers)
        
        if users_response.status_code == 200:
            users = users_response.json()
            print(f"✅ {len(users)} utilisateur(s) récupéré(s)")
            for user in users[:3]:  # Afficher les 3 premiers
                status = user.get('status', 'active')
                print(f"   - {user['name']} {user['prenom']} ({user['email']}) - {user['role']} - Status: {status}")
        else:
            print(f"❌ Échec liste utilisateurs: {users_response.status_code}")
            
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au service auth (port 8001)")
        print("Assurez-vous que le service auth est démarré")
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_user_suspension()