"""
Test de l'endpoint /chat avec différents payloads
"""
import requests
import json

RAG_URL = "http://localhost:8008/rag"

def test_payload(payload, description):
    print(f"\n{'='*60}")
    print(f"Test: {description}")
    print(f"{'='*60}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(f"{RAG_URL}/chat", json=payload)
        print(f"Status: {response.status_code}")
        
        if response.ok:
            data = response.json()
            print(f"✅ Succès!")
            print(f"Conversation ID: {data.get('conversation_id')}")
            print(f"Réponse: {data.get('answer', '')[:100]}...")
        else:
            print(f"❌ Erreur {response.status_code}")
            try:
                error = response.json()
                print(f"Détail: {json.dumps(error, indent=2)}")
            except:
                print(f"Réponse brute: {response.text}")
    except Exception as e:
        print(f"❌ Exception: {e}")

# Test 1: Requête minimale
test_payload({
    "question": "Qu'est-ce que TalentLink ?"
}, "Requête minimale (question seulement)")

# Test 2: Avec user_id string
test_payload({
    "question": "Qu'est-ce que TalentLink ?",
    "user_id": "4"
}, "Avec user_id en string")

# Test 3: Avec user_id number
test_payload({
    "question": "Qu'est-ce que TalentLink ?",
    "user_id": 4
}, "Avec user_id en number")

# Test 4: Payload complet
test_payload({
    "question": "Qu'est-ce que TalentLink ?",
    "user_id": "4",
    "model_type": "openai",
    "model_name": "gpt-4o-mini",
    "top_k": 5
}, "Payload complet")

# Test 5: Avec conversation_id None
test_payload({
    "question": "Qu'est-ce que TalentLink ?",
    "conversation_id": None,
    "user_id": "4"
}, "Avec conversation_id None")

print("\n" + "="*60)
print("Tests terminés")
print("="*60)
