#!/usr/bin/env python3
"""
Script de debug pour tester les composants du chatbot
"""

import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import engine, SessionLocal
from models.chatbot import (
    ChatbotConversationDB,
    ChatbotMessageDB,
    ChatbotKnowledgeDB,
    ChatbotPersonalityDB,
    ChatbotQuery
)
from controllers.chatbot_controller import search_knowledge, get_personalities
from utils.ollama_client import OllamaClient

def test_database_connection():
    """Tester la connexion à la base de données"""
    try:
        db = SessionLocal()
        
        # Test de requête simple
        personalities = db.query(ChatbotPersonalityDB).count()
        knowledge_count = db.query(ChatbotKnowledgeDB).count()
        conversations_count = db.query(ChatbotConversationDB).count()
        
        print("✅ Connexion base de données OK")
        print(f"📊 Personnalités: {personalities}")
        print(f"📚 Base de connaissances: {knowledge_count}")
        print(f"💬 Conversations: {conversations_count}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur base de données: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_search_knowledge():
    """Tester la fonction search_knowledge"""
    try:
        db = SessionLocal()
        
        # Test de recherche
        results = search_knowledge(db, "utilisateur", limit=3)
        print(f"✅ Recherche knowledge OK - {len(results)} résultats")
        
        for item in results:
            print(f"  📖 {item['title'][:50]}...")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur search_knowledge: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_ollama_service():
    """Tester le service Ollama"""
    try:
        service = OllamaClient()
        is_ready = service.is_ready() if hasattr(service, 'is_ready') else True
        print(f"✅ Ollama {'disponible' if is_ready else 'non disponible'}")
        
        if is_ready:
            models = service.list_models() if hasattr(service, 'list_models') else []
            print(f"📦 Modèles disponibles: {models}")
        
        return is_ready
        
    except Exception as e:
        print(f"❌ Erreur Ollama: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_chat_query():
    """Tester une requête de chat complète"""
    try:
        from controllers.chatbot_controller import process_chat_query
        
        db = SessionLocal()
        
        # Créer une requête de test
        query = ChatbotQuery(
            message="Bonjour, comment ça va ?",
            user_id=1
        )
        
        print("🧪 Test requête chat...")
        result = process_chat_query(db, query)
        print("✅ Requête chat réussie")
        print(f"📝 Réponse: {result.get('response', 'Pas de réponse')[:100]}...")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"❌ Erreur requête chat: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Fonction principale de debug"""
    print("🔍 === TEST DE DEBUG CHATBOT ===\n")
    
    print("1️⃣ Test connexion base de données")
    db_ok = test_database_connection()
    print()
    
    print("2️⃣ Test search_knowledge")
    search_ok = test_search_knowledge()
    print()
    
    print("3️⃣ Test service Ollama")
    ollama_ok = test_ollama_service()
    print()
    
    if db_ok and search_ok and ollama_ok:
        print("4️⃣ Test requête chat complète")
        chat_ok = test_chat_query()
        print()
    else:
        print("4️⃣ ⏭️ Skipping chat test (dependencies failed)")
        chat_ok = False
    
    print("📊 === RÉSULTATS ===")
    print(f"Base de données: {'✅' if db_ok else '❌'}")
    print(f"Search knowledge: {'✅' if search_ok else '❌'}")
    print(f"Ollama service: {'✅' if ollama_ok else '❌'}")
    print(f"Chat query: {'✅' if chat_ok else '❌'}")
    
    if all([db_ok, search_ok, ollama_ok, chat_ok]):
        print("\n🎉 Tous les tests sont OK !")
    else:
        print("\n⚠️ Certains tests ont échoué")

if __name__ == "__main__":
    main()