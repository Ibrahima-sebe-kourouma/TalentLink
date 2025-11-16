from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Import après la définition de l'engine pour éviter les conflits circulaires

# Configuration de la base de données
DATABASE_URL = "sqlite:///./chatbot.db"

# Créer le moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False},  # Nécessaire pour SQLite
    echo=False  # Mettre True pour voir les requêtes SQL
)

# Créer la session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles - sera importée depuis models.chatbot

# Dépendance pour récupérer la session DB
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Créer toutes les tables
def create_tables():
    """Créer toutes les tables de la base de données"""
    from models.chatbot import Base
    Base.metadata.create_all(bind=engine)
    print("✅ Tables de la base de données créées")

# Supprimer toutes les tables (pour les tests)
def drop_tables():
    """Supprimer toutes les tables"""
    from models.chatbot import Base
    Base.metadata.drop_all(bind=engine)
    print("🗑️ Tables supprimées")

# Initialiser la base avec des données par défaut
def init_default_data():
    """Initialiser avec des personnalités par défaut"""
    from models.chatbot import ChatbotPersonalityDB, SYSTEM_PROMPTS, MODEL_CONFIGS
    
    db = SessionLocal()
    try:
        # Vérifier si des personnalités existent déjà
        existing_personalities = db.query(ChatbotPersonalityDB).count()
        
        if existing_personalities == 0:
            # Créer les personnalités par défaut
            default_personalities = [
                {
                    "name": "Assistant Général",
                    "description": "Assistant polyvalent pour tous vos besoins sur TalentLink",
                    "system_prompt": SYSTEM_PROMPTS["assistant_general"],
                    "llm_config": MODEL_CONFIGS["balanced"],
                    "is_public": True,
                    "created_by": 1  # Admin
                },
                {
                    "name": "Expert Recrutement",
                    "description": "Spécialiste en stratégies de recrutement et sourcing",
                    "system_prompt": SYSTEM_PROMPTS["recruteur_expert"],
                    "llm_config": MODEL_CONFIGS["analytical"],
                    "is_public": True,
                    "created_by": 1
                },
                {
                    "name": "Coach Candidat",
                    "description": "Coach professionnel pour optimiser votre recherche d'emploi",
                    "system_prompt": SYSTEM_PROMPTS["candidat_coach"],
                    "llm_config": MODEL_CONFIGS["creative"],
                    "is_public": True,
                    "created_by": 1
                },
                {
                    "name": "Analyste RH",
                    "description": "Expert en données RH et métriques de recrutement",
                    "system_prompt": SYSTEM_PROMPTS["analyste_rh"],
                    "llm_config": MODEL_CONFIGS["precise"],
                    "is_public": True,
                    "created_by": 1
                },
                {
                    "name": "Support Technique",
                    "description": "Assistant pour l'utilisation de la plateforme TalentLink",
                    "system_prompt": SYSTEM_PROMPTS["assistant_technique"],
                    "llm_config": MODEL_CONFIGS["precise"],
                    "is_public": True,
                    "created_by": 1
                }
            ]
            
            for personality_data in default_personalities:
                personality = ChatbotPersonalityDB(**personality_data)
                db.add(personality)
            
            db.commit()
            print(f"✅ {len(default_personalities)} personnalités par défaut créées")
        else:
            print(f"ℹ️ {existing_personalities} personnalités déjà présentes")
    
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {e}")
        db.rollback()
    finally:
        db.close()

# Réinitialiser complètement la base de données
def reset_database():
    """Réinitialiser complètement la base"""
    print("🔄 Réinitialisation de la base de données...")
    drop_tables()
    create_tables()
    init_default_data()
    print("✅ Base de données réinitialisée avec succès")

if __name__ == "__main__":
    # Pour tester la configuration
    print("🧪 Test de la configuration de base de données...")
    create_tables()
    init_default_data()
    print("✅ Configuration testée avec succès")