from mongoengine import connect, disconnect
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le répertoire backend
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

# Configuration MongoDB
MONGODB_URL = os.getenv("MONGODB_URL_MESSAGING", "mongodb://localhost:27017")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE_MESSAGING", "talentlink_messaging")

print(f"📍 MongoDB URL: {MONGODB_URL}")
print(f"📁 MongoDB Database: {MONGODB_DATABASE}")

def connect_to_mongodb():
    """Connexion à MongoDB."""
    try:
        connect(
            db=MONGODB_DATABASE,
            host=MONGODB_URL,
            alias='default',
            serverSelectionTimeoutMS=5000,  # Timeout de 5 secondes
            connectTimeoutMS=10000  # Timeout de connexion de 10 secondes
        )
        print(f"✅ Connecté à MongoDB: {MONGODB_DATABASE}")
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion MongoDB: {e}")
        return False

def disconnect_from_mongodb():
    """Déconnexion de MongoDB."""
    try:
        disconnect()
        print("🔌 Déconnecté de MongoDB")
    except Exception as e:
        print(f"⚠️ Erreur lors de la déconnexion: {e}")

def test_mongodb_connection():
    """Tester la connexion MongoDB."""
    from mongoengine.connection import get_db
    
    try:
        # Tester la connexion
        db = get_db()
        
        # Test basique d'écriture
        test_collection = db.test_connection
        test_doc = {"test": "TalentLink Migration", "timestamp": "2025-11-19"}
        test_collection.insert_one(test_doc)
        
        # Test de lecture
        result = test_collection.find_one({"test": "TalentLink Migration"})
        
        if result:
            print(f"✅ Test MongoDB réussi: {result}")
            # Nettoyage
            test_collection.delete_one({"test": "TalentLink Migration"})
            return True
        else:
            print("❌ Test MongoDB échoué")
            return False
            
    except Exception as e:
        print(f"❌ Erreur test MongoDB: {e}")
        return False

# Fonction de compatibilité avec SQLAlchemy (pour transition douce)
def get_db():
    """Fonction de compatibilité - pas utilisée avec MongoDB mais garde la signature."""
    pass

if __name__ == "__main__":
    print("🧪 Test de la configuration MongoDB")
    print("=" * 50)
    
    if connect_to_mongodb():
        if test_mongodb_connection():
            print("🎉 MongoDB est prêt pour TalentLink !")
        else:
            print("⚠️ Problème de test MongoDB")
    else:
        print("❌ Impossible de se connecter à MongoDB")
    
    disconnect_from_mongodb()