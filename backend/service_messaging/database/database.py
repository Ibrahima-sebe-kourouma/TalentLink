from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Charger les variables d'environnement depuis le répertoire backend
backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(backend_dir, '.env')
load_dotenv(dotenv_path=env_path)

DATABASE_URL = os.getenv("DATABASE_URL_MESSAGING", "sqlite:///./messaging.db")

# Convertir chemin relatif en absolu si nécessaire
if DATABASE_URL.startswith('sqlite:///./') or (DATABASE_URL.startswith('sqlite:///') and not os.path.isabs(DATABASE_URL.replace('sqlite:///', ''))):
    rel_path = DATABASE_URL.replace('sqlite:///./', '').replace('sqlite:///', '')
    abs_path = os.path.join(backend_dir, rel_path)
    os.makedirs(os.path.dirname(abs_path), exist_ok=True)
    DATABASE_URL = f"sqlite:///{abs_path}"

print(f"📍 Messaging DB: {DATABASE_URL}")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Dependency pour obtenir une session de base de données."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
