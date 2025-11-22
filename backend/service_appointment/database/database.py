from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os
from contextlib import contextmanager

# Configuration de la base de données SQLite
DATABASE_URL = "sqlite:///./database/appointments.db"

# Créer le moteur SQLAlchemy
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Créer la session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()

def init_database():
    """Initialise la base de données et crée les tables"""
    # Créer le dossier database s'il n'existe pas
    db_dir = os.path.dirname("./database/appointments.db")
    if not os.path.exists(db_dir):
        os.makedirs(db_dir)
    
    # Importer les modèles pour s'assurer qu'ils sont enregistrés
    try:
        from models.appointment import Appointment, AppointmentSlot, AppointmentCandidate
        # Créer toutes les tables
        Base.metadata.create_all(bind=engine)
        print("✅ Base de données initialisée avec succès")
    except Exception as e:
        print(f"❌ Erreur initialisation base de données: {str(e)}")
        raise

def get_database() -> Session:
    """Dépendance pour obtenir une session de base de données"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@contextmanager
def get_db_session():
    """Context manager pour les opérations de base de données"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def check_database_connection():
    """Vérifie la connexion à la base de données"""
    try:
        with get_db_session() as db:
            # Test simple de connexion
            db.execute(text("SELECT 1"))
        print("✅ Connexion à la base de données réussie")
        return True
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {str(e)}")
        return False