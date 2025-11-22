import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration de la base de données
# Utiliser le dossier database pour stocker la base de données
DATABASE_DIR = os.path.join(os.path.dirname(__file__))
DEFAULT_DB_PATH = os.path.join(DATABASE_DIR, "reports.db")
DATABASE_URL = os.getenv("REPORT_DATABASE_URL", f"sqlite:///{DEFAULT_DB_PATH}")

# Créer le moteur SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

# Session locale
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base pour les modèles
Base = declarative_base()


def get_database():
    """Dépendance pour obtenir une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Créer toutes les tables."""
    Base.metadata.create_all(bind=engine)