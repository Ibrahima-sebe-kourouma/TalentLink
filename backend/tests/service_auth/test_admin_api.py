#!/usr/bin/env python3
"""
Script pour tester les API admin
"""

import requests
import json

def test_admin_apis():
    """Tester les APIs d'administration"""
    
    # 1. Se connecter pour obtenir le token
    login_url = "http://127.0.0.1:8001/auth/login"
    login_params = {
        "email": "user1@gmail.com",
        "password": "1234"
    }
    
    print("🔐 Test de connexion...")
    login_response = requests.post(login_url, params=login_params, timeout=10)
    
    if login_response.status_code != 200:
        print(f"❌ Échec de connexion: {login_response.status_code}")
        return
    
    login_data = login_response.json()
    token = login_data.get('access_token')
    print(f"✅ Token obtenu: {token[:30]}...")
    
    # Headers avec le token
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 2. Tester les statistiques admin
    stats_url = "http://127.0.0.1:8001/admin/statistics"
    print("\n📊 Test des statistiques...")
    
    try:
        stats_response = requests.get(stats_url, headers=headers, timeout=10)
        
        if stats_response.status_code == 200:
            stats_data = stats_response.json()
            print("✅ Statistiques récupérées:")
            print(f"   - Utilisateurs total: {stats_data.get('users', {}).get('total', 'N/A')}")
            print(f"   - Utilisateurs actifs: {stats_data.get('users', {}).get('active', 'N/A')}")
            print(f"   - Candidats: {stats_data.get('users', {}).get('by_role', {}).get('candidat', 'N/A')}")
            print(f"   - Recruteurs: {stats_data.get('users', {}).get('by_role', {}).get('recruteur', 'N/A')}")
            print(f"   - Admins: {stats_data.get('users', {}).get('by_role', {}).get('admin', 'N/A')}")
        else:
            print(f"❌ Échec statistiques: {stats_response.status_code}")
            print(f"Réponse: {stats_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur statistiques: {e}")
    
    # 3. Tester la liste des utilisateurs
    users_url = "http://127.0.0.1:8001/admin/users"
    print("\n👥 Test de la liste des utilisateurs...")
    
    try:
        users_response = requests.get(users_url, headers=headers, timeout=10)
        
        if users_response.status_code == 200:
            users_data = users_response.json()
            print(f"✅ {len(users_data)} utilisateur(s) récupéré(s)")
            
            # Afficher les 3 premiers
            for i, user in enumerate(users_data[:3]):
                print(f"   {i+1}. {user.get('name')} {user.get('prenom')} - {user.get('email')} - {user.get('role', 'N/A')}")
                
        else:
            print(f"❌ Échec liste utilisateurs: {users_response.status_code}")
            print(f"Réponse: {users_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur liste utilisateurs: {e}")
    
    # 4. Tester les logs d'audit
    audit_url = "http://127.0.0.1:8001/admin/audit-logs"
    print("\n📋 Test des logs d'audit...")
    
    try:
        audit_response = requests.get(audit_url, headers=headers, timeout=10)
        
        if audit_response.status_code == 200:
            audit_data = audit_response.json()
            print(f"✅ {len(audit_data)} log(s) d'audit récupéré(s)")
        else:
            print(f"❌ Échec logs audit: {audit_response.status_code}")
            print(f"Réponse: {audit_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur logs audit: {e}")

if __name__ == "__main__":
    test_admin_apis()