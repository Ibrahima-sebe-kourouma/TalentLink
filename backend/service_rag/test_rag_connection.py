"""
Script de test pour vérifier la connexion entre le frontend et le service RAG
"""
import requests
import json

RAG_SERVICE_URL = "http://localhost:8008"

def test_rag_health():
    """Test de la santé du service RAG"""
    print("🔍 Test 1: Vérification de la santé du service RAG...")
    try:
        response = requests.get(f"{RAG_SERVICE_URL}/rag/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Service RAG opérationnel: {data}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Impossible de se connecter au service RAG: {e}")
        return False


def test_rag_root():
    """Test de l'endpoint racine"""
    print("\n🔍 Test 2: Vérification de l'endpoint racine...")
    try:
        response = requests.get(f"{RAG_SERVICE_URL}/rag/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Endpoint racine OK:")
            print(f"   Message: {data.get('message')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Modèles supportés: {list(data.get('models_supportes', {}).keys())}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False


def test_rag_models():
    """Test de l'endpoint des modèles"""
    print("\n🔍 Test 3: Vérification de l'endpoint des modèles...")
    try:
        response = requests.get(f"{RAG_SERVICE_URL}/rag/models")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Modèles disponibles:")
            print(f"   OpenAI: {data.get('openai', {}).get('models', [])}")
            print(f"   Ollama: {data.get('ollama', {}).get('models', [])}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False


def test_rag_query():
    """Test d'une requête simple"""
    print("\n🔍 Test 4: Test d'une requête simple...")
    try:
        payload = {
            "question": "Qu'est-ce que TalentLink ?",
            "model_type": "openai",
            "model_name": "gpt-4o-mini",
            "top_k": 3
        }
        
        response = requests.post(
            f"{RAG_SERVICE_URL}/rag/query",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Requête exécutée avec succès:")
            print(f"   Question: {data.get('question')}")
            print(f"   Réponse: {data.get('answer')[:200]}...")
            print(f"   Modèle: {data.get('model_used')}")
            print(f"   Sources: {len(data.get('sources', []))} source(s)")
            return True
        elif response.status_code == 503:
            print(f"⚠️  Service pas encore initialisé (index pas chargé)")
            print(f"   Cela peut arriver au premier démarrage")
            return False
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False


def main():
    print("=" * 60)
    print("🧪 TEST DE CONNEXION FRONTEND <-> SERVICE RAG")
    print("=" * 60)
    
    results = []
    
    # Test 1: Santé du service
    results.append(("Santé du service", test_rag_health()))
    
    # Test 2: Endpoint racine
    results.append(("Endpoint racine", test_rag_root()))
    
    # Test 3: Liste des modèles
    results.append(("Liste des modèles", test_rag_models()))
    
    # Test 4: Requête simple
    results.append(("Requête RAG", test_rag_query()))
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    
    success = 0
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} - {test_name}")
        if result:
            success += 1
    
    print("\n" + "-" * 60)
    print(f"Résultat: {success}/{total} tests réussis")
    
    if success == total:
        print("✅ Tous les tests sont passés ! Le service RAG est opérationnel.")
    elif success > 0:
        print("⚠️  Certains tests ont échoué. Vérifiez les logs ci-dessus.")
    else:
        print("❌ Tous les tests ont échoué. Le service RAG n'est peut-être pas démarré.")
        print("   Démarrez-le avec: cd backend\\service_rag && .\\run_service_rag.bat")
    
    print("=" * 60)


if __name__ == "__main__":
    main()
