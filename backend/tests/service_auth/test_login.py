#!/usr/bin/env python3
"""
Script pour tester la connexion admin
"""

import requests
import json

def test_admin_login():
    """Tester la connexion admin"""
    
    login_url = "http://127.0.0.1:8001/auth/login"
    
    # Données de connexion
    params = {
        "email": "user1@gmail.com",
        "password": "1234"
    }
    
    try:
        print(f"🔐 Test de connexion admin...")
        print(f"Email: {params['email']}")
        print(f"URL: {login_url}")
        
        response = requests.post(login_url, params=params, timeout=10)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connexion réussie!")
            print(f"Token: {data.get('access_token', 'N/A')[:50]}...")
            print(f"Type: {data.get('token_type', 'N/A')}")
            
            user = data.get('user', {})
            print(f"Utilisateur:")
            print(f"  - ID: {user.get('id')}")
            print(f"  - Nom: {user.get('name')} {user.get('prenom')}")
            print(f"  - Email: {user.get('email')}")
            print(f"  - Rôle: {user.get('role')}")
            print(f"  - Actif: {user.get('est_actif')}")
            
        else:
            print(f"❌ Échec de connexion: {response.status_code}")
            print(f"Réponse: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")

if __name__ == "__main__":
    test_admin_login()