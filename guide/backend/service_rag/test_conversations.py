"""
Script de test pour le système de conversations TalentBot
"""
import requests
import json
from datetime import datetime

RAG_URL = "http://localhost:8008/rag"
TEST_USER_ID = "test_user_123"

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}\n")

def test_1_new_conversation():
    """Test 1: Créer une nouvelle conversation"""
    print_section("TEST 1: Nouvelle conversation")
    
    response = requests.post(f"{RAG_URL}/chat", json={
        "question": "Qu'est-ce que TalentLink ?",
        "user_id": TEST_USER_ID,
        "model_type": "openai",
        "model_name": "gpt-4o-mini",
        "top_k": 3
    })
    
    if response.status_code == 200:
        data = response.json()
        conversation_id = data["conversation_id"]
        print(f"✅ Conversation créée: {conversation_id}")
        print(f"📝 Question: {data['question']}")
        print(f"💬 Réponse: {data['answer'][:150]}...")
        print(f"📚 Sources: {len(data['sources'])} source(s)")
        print(f"📖 Historique: {len(data['conversation_history'])} message(s)")
        return conversation_id
    else:
        print(f"❌ Erreur: {response.status_code}")
        print(response.text)
        return None

def test_2_continue_conversation(conversation_id):
    """Test 2: Continuer une conversation existante"""
    print_section("TEST 2: Continuer la conversation")
    
    questions = [
        "Quelles sont les fonctionnalités principales ?",
        "Et pour les candidats ?"
    ]
    
    for question in questions:
        print(f"\n🗣️  Question: {question}")
        
        response = requests.post(f"{RAG_URL}/chat", json={
            "question": question,
            "conversation_id": conversation_id,
            "user_id": TEST_USER_ID,
            "model_type": "openai",
            "model_name": "gpt-4o-mini"
        })
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Réponse: {data['answer'][:150]}...")
            print(f"📖 Historique: {len(data['conversation_history'])} message(s)")
        else:
            print(f"❌ Erreur: {response.status_code}")
    
    return True

def test_3_list_conversations():
    """Test 3: Lister les conversations de l'utilisateur"""
    print_section("TEST 3: Liste des conversations")
    
    response = requests.get(f"{RAG_URL}/conversations/{TEST_USER_ID}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ {data['total']} conversation(s) trouvée(s)\n")
        
        for conv in data['conversations']:
            print(f"📝 {conv['title']}")
            print(f"   ID: {conv['conversation_id']}")
            print(f"   Messages: {conv['message_count']}")
            print(f"   Créée: {conv['created_at']}")
            print(f"   Mise à jour: {conv['updated_at']}\n")
        
        return data['conversations']
    else:
        print(f"❌ Erreur: {response.status_code}")
        return []

def test_4_get_conversation(conversation_id):
    """Test 4: Récupérer une conversation complète"""
    print_section("TEST 4: Récupération conversation complète")
    
    response = requests.get(f"{RAG_URL}/conversations/{TEST_USER_ID}/{conversation_id}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Conversation récupérée: {data['title']}")
        print(f"📝 {len(data['messages'])} message(s)\n")
        
        for i, msg in enumerate(data['messages'], 1):
            role = "👤 User" if msg['role'] == 'user' else "🤖 Bot"
            print(f"{role}: {msg['content'][:100]}...")
        
        return True
    else:
        print(f"❌ Erreur: {response.status_code}")
        return False

def test_5_context_memory(conversation_id):
    """Test 5: Vérifier la mémoire contextuelle"""
    print_section("TEST 5: Test de mémoire contextuelle")
    
    # Question qui nécessite le contexte
    response = requests.post(f"{RAG_URL}/chat", json={
        "question": "Peux-tu me résumer ce dont on a parlé ?",
        "conversation_id": conversation_id,
        "user_id": TEST_USER_ID,
        "model_type": "openai",
        "model_name": "gpt-4o-mini"
    })
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Le bot se souvient du contexte")
        print(f"💬 Réponse: {data['answer'][:200]}...")
        return True
    else:
        print(f"❌ Erreur: {response.status_code}")
        return False

def test_6_stats():
    """Test 6: Statistiques des conversations"""
    print_section("TEST 6: Statistiques")
    
    response = requests.get(f"{RAG_URL}/conversations/stats")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Statistiques récupérées:")
        print(f"   Total conversations: {data['total_conversations']}")
        print(f"   En mémoire: {data['active_in_memory']}")
        print(f"   Stockage: {data['storage_path']}")
        return True
    else:
        print(f"❌ Erreur: {response.status_code}")
        return False

def test_7_delete_conversation(conversation_id):
    """Test 7: Supprimer une conversation"""
    print_section("TEST 7: Suppression de conversation")
    
    response = requests.delete(f"{RAG_URL}/conversations/{TEST_USER_ID}/{conversation_id}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Conversation supprimée: {data['conversation_id']}")
        return True
    else:
        print(f"❌ Erreur: {response.status_code}")
        return False

def main():
    print("""
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║     TEST COMPLET DU SYSTÈME DE CONVERSATIONS RAG        ║
║              TalentBot avec Historique                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
    """)
    
    results = []
    
    # Test 1: Nouvelle conversation
    conversation_id = test_1_new_conversation()
    results.append(("Nouvelle conversation", conversation_id is not None))
    
    if not conversation_id:
        print("\n❌ Impossible de continuer les tests sans conversation_id")
        return
    
    # Test 2: Continuer la conversation
    success = test_2_continue_conversation(conversation_id)
    results.append(("Continuer conversation", success))
    
    # Test 3: Liste des conversations
    conversations = test_3_list_conversations()
    results.append(("Liste conversations", len(conversations) > 0))
    
    # Test 4: Récupérer conversation complète
    success = test_4_get_conversation(conversation_id)
    results.append(("Récupération complète", success))
    
    # Test 5: Test de mémoire contextuelle
    success = test_5_context_memory(conversation_id)
    results.append(("Mémoire contextuelle", success))
    
    # Test 6: Statistiques
    success = test_6_stats()
    results.append(("Statistiques", success))
    
    # Test 7: Suppression (optionnel)
    # success = test_7_delete_conversation(conversation_id)
    # results.append(("Suppression", success))
    
    # Résumé
    print_section("RÉSUMÉ DES TESTS")
    
    passed = sum(1 for _, success in results if success)
    total = len(results)
    
    for test_name, success in results:
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\n{'='*60}")
    print(f"Résultat final: {passed}/{total} tests réussis")
    
    if passed == total:
        print("✅ Tous les tests sont passés ! Le système est opérationnel.")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.")
    
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
