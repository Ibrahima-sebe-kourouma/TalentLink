"""
Tests pour le service Chatbot TalentLink avec intégration Ollama
"""
import requests
import time
import json
from datetime import datetime

# Configuration
BASE_URL = "http://127.0.0.1:8007"
API_BASE = f"{BASE_URL}/api/chatbot"

def test_service_health():
    """Test de santé du service"""
    print("🧪 Test de santé du service...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        print(f"   ✅ Service status: {data['status']}")
        print(f"   ✅ Ollama status: {data['ollama']}")
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur de santé: {e}")
        return False

def test_chatbot_health():
    """Test de santé spécifique au chatbot"""
    print("🧪 Test de santé du chatbot...")
    
    try:
        response = requests.get(f"{API_BASE}/health", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        print(f"   ✅ Status: {data['status']}")
        print(f"   ✅ Ollama: {data['ollama_status']}")
        print(f"   ✅ Modèles: {data['models_available']}")
        print(f"   ✅ Modèle par défaut: {data['default_model']}")
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur chatbot santé: {e}")
        return False

def test_ollama_models():
    """Test de récupération des modèles Ollama"""
    print("🧪 Test des modèles Ollama...")
    
    try:
        response = requests.get(f"{API_BASE}/models", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        models = data['data']
        print(f"   ✅ {len(models)} modèles disponibles:")
        
        for model in models:
            print(f"      📦 {model['name']} ({model['size']})")
        
        return len(models) > 0
        
    except Exception as e:
        print(f"   ❌ Erreur modèles: {e}")
        return False

def test_get_personalities():
    """Test de récupération des personnalités"""
    print("🧪 Test des personnalités...")
    
    try:
        response = requests.get(f"{API_BASE}/personalities", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        personalities = data['data']
        print(f"   ✅ {len(personalities)} personnalités disponibles:")
        
        for p in personalities[:3]:  # Afficher les 3 premières
            print(f"      👤 {p['name']} - {p['usage_count']} utilisations")
        
        return len(personalities) > 0
        
    except Exception as e:
        print(f"   ❌ Erreur personnalités: {e}")
        return False

def test_create_conversation():
    """Test de création de conversation"""
    print("🧪 Test création de conversation...")
    
    try:
        conversation_data = {
            "user_id": 1,
            "title": "Test Conversation",
            "context": "Test automatique du chatbot",
            "model_used": "gemma3:4b"
        }
        
        response = requests.post(f"{API_BASE}/conversations", json=conversation_data, timeout=10)
        assert response.status_code == 201
        
        data = response.json()
        conversation_id = data['data']['id']
        print(f"   ✅ Conversation créée (ID: {conversation_id})")
        
        return conversation_id
        
    except Exception as e:
        print(f"   ❌ Erreur création conversation: {e}")
        return None

def test_simple_chat():
    """Test de chat simple"""
    print("🧪 Test de chat simple...")
    
    try:
        query_data = {
            "message": "Bonjour! Pouvez-vous me présenter TalentLink?",
            "user_id": 1,
            "model_params": {
                "temperature": 0.7
            }
        }
        
        print("   📤 Envoi du message...")
        start_time = time.time()
        
        response = requests.post(f"{API_BASE}/chat", json=query_data, timeout=60)
        
        end_time = time.time()
        response_time = int((end_time - start_time) * 1000)
        
        assert response.status_code == 200
        
        data = response.json()
        result = data['data']
        
        print(f"   ✅ Réponse reçue en {response_time}ms")
        print(f"   🤖 Modèle: {result['model_used']}")
        print(f"   📊 Tokens: {result['tokens_used']}")
        print(f"   💬 Réponse: {result['response'][:100]}...")
        
        return result['conversation_id']
        
    except Exception as e:
        print(f"   ❌ Erreur chat: {e}")
        return None

def test_chat_with_personality():
    """Test de chat avec une personnalité"""
    print("🧪 Test de chat avec personnalité...")
    
    try:
        # Récupérer une personnalité
        personalities_response = requests.get(f"{API_BASE}/personalities", timeout=10)
        personalities = personalities_response.json()['data']
        
        if not personalities:
            print("   ⚠️ Aucune personnalité disponible")
            return False
        
        personality = personalities[0]  # Prendre la première
        
        query_data = {
            "message": "Comment optimiser un processus de recrutement?",
            "user_id": 1,
            "personality_id": personality['id']
        }
        
        print(f"   📤 Chat avec {personality['name']}...")
        
        response = requests.post(f"{API_BASE}/chat", json=query_data, timeout=60)
        assert response.status_code == 200
        
        data = response.json()
        result = data['data']
        
        print(f"   ✅ Réponse avec personnalité reçue")
        print(f"   💬 Extrait: {result['response'][:100]}...")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur chat avec personnalité: {e}")
        return False

def test_conversation_history():
    """Test de récupération d'historique"""
    print("🧪 Test de l'historique de conversation...")
    
    try:
        # Créer une conversation avec quelques messages
        conv_id = test_create_conversation()
        if not conv_id:
            return False
        
        # Envoyer quelques messages
        for i, message in enumerate([
            "Bonjour!",
            "Parlez-moi de TalentLink",
            "Quelles sont ses fonctionnalités principales?"
        ]):
            query_data = {
                "message": message,
                "user_id": 1,
                "conversation_id": conv_id
            }
            
            response = requests.post(f"{API_BASE}/chat", json=query_data, timeout=30)
            if response.status_code != 200:
                print(f"   ❌ Erreur message {i+1}")
                return False
        
        # Récupérer l'historique
        response = requests.get(f"{API_BASE}/conversations/{conv_id}?user_id=1", timeout=10)
        assert response.status_code == 200
        
        data = response.json()
        conversation = data['data']
        messages = conversation['messages']
        
        print(f"   ✅ Historique récupéré: {len(messages)} messages")
        print(f"   📈 Total conversation: {conversation['conversation']['total_messages']} messages")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur historique: {e}")
        return False

def test_knowledge_search():
    """Test de recherche dans les connaissances"""
    print("🧪 Test de recherche de connaissances...")
    
    try:
        response = requests.get(
            f"{API_BASE}/knowledge/search",
            params={"q": "recrutement", "limit": 3},
            timeout=10
        )
        assert response.status_code == 200
        
        data = response.json()
        results = data['data']
        
        print(f"   ✅ {len(results)} résultats trouvés pour 'recrutement'")
        for result in results:
            print(f"      📄 {result['title']} (score: {result.get('score', 0)})")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur recherche connaissances: {e}")
        return False

def test_chatbot_stats():
    """Test des statistiques"""
    print("🧪 Test des statistiques...")
    
    try:
        response = requests.get(f"{API_BASE}/stats", timeout=10)
        assert response.status_code == 200
        
        data = response.json()['data']
        
        print(f"   ✅ Conversations totales: {data['total_conversations']}")
        print(f"   ✅ Messages totaux: {data['total_messages']}")
        print(f"   ✅ Utilisateurs actifs: {data['active_users']}")
        print(f"   ✅ Temps de réponse moyen: {data['average_response_time']:.1f}ms")
        print(f"   ✅ Tokens utilisés: {data['total_tokens_used']}")
        
        return True
        
    except Exception as e:
        print(f"   ❌ Erreur statistiques: {e}")
        return False

def run_all_tests():
    """Lancer tous les tests"""
    print("🚀 Lancement des tests du service Chatbot TalentLink")
    print("=" * 60)
    
    tests = [
        ("Santé du service", test_service_health),
        ("Santé du chatbot", test_chatbot_health),
        ("Modèles Ollama", test_ollama_models),
        ("Personnalités", test_get_personalities),
        ("Création conversation", test_create_conversation),
        ("Chat simple", test_simple_chat),
        ("Chat avec personnalité", test_chat_with_personality),
        ("Historique conversation", test_conversation_history),
        ("Recherche connaissances", test_knowledge_search),
        ("Statistiques", test_chatbot_stats),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        print(f"\n📋 Test: {test_name}")
        try:
            if test_name == "Création conversation":
                # Test spécial qui retourne un ID
                result = test_func()
                success = result is not None
            else:
                success = test_func()
            
            if success:
                print(f"   ✅ PASSÉ")
                passed += 1
            else:
                print(f"   ❌ ÉCHEC")
                failed += 1
                
        except Exception as e:
            print(f"   ❌ ERREUR: {e}")
            failed += 1
    
    print("\n" + "=" * 60)
    print(f"📊 RÉSULTATS FINAUX:")
    print(f"   ✅ Tests réussis: {passed}")
    print(f"   ❌ Tests échoués: {failed}")
    print(f"   📈 Taux de réussite: {(passed/(passed+failed)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 TOUS LES TESTS SONT PASSÉS! Le chatbot est prêt à utiliser.")
    else:
        print(f"\n⚠️ {failed} test(s) ont échoué. Vérifiez la configuration.")
        print("💡 Assurez-vous que:")
        print("   - Ollama est démarré (ollama serve)")
        print("   - Au moins un modèle est installé (ollama pull gemma3:4b)")
        print("   - Le service chatbot est lancé sur le port 8007")
    
    return failed == 0

if __name__ == "__main__":
    print("🤖 Tests du Service Chatbot TalentLink")
    print(f"📍 URL de test: {BASE_URL}")
    print(f"⏰ Heure: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    success = run_all_tests()
    
    if not success:
        print(f"\n🔧 Pour déboguer:")
        print(f"   curl {BASE_URL}/health")
        print(f"   curl {API_BASE}/models")
        print(f"   ollama list")
    
    exit(0 if success else 1)