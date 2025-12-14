from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le répertoire backend
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

# Configuration de la base de données depuis les variables d'environnement
DATABASE_URL = os.getenv('DATABASE_URL_AUTH')
if not DATABASE_URL:
    # Fallback vers le chemin par défaut si la variable n'est pas définie
    current_dir = os.path.dirname(os.path.abspath(__file__))
    database_path = os.path.join(current_dir, "database.db")
    DATABASE_URL = f"sqlite:///{database_path}"
else:
    # Si le chemin est relatif, le convertir en absolu depuis backend/
    if DATABASE_URL.startswith('sqlite:///./') or not os.path.isabs(DATABASE_URL.replace('sqlite:///', '')):
        rel_path = DATABASE_URL.replace('sqlite:///./', '').replace('sqlite:///', '')
        abs_path = os.path.join(backend_dir, rel_path)
        # Créer le répertoire s'il n'existe pas
        os.makedirs(os.path.dirname(abs_path), exist_ok=True)
        DATABASE_URL = f"sqlite:///{abs_path}"

SQLALCHEMY_DATABASE_URL = DATABASE_URL

# Debug: Afficher le chemin de la base de données
print(f"📎 Auth DB: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
