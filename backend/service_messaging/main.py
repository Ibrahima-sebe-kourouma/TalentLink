from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Configuration MongoDB
from database.database import connect_to_mongodb

# Import routes MongoDB
from routes.conversation_routes import router as conversation_router
from routes.message_routes import router as message_router

app = FastAPI(title="Service Messaging MongoDB", version="2.0")

# Connexion à MongoDB au démarrage
@app.on_event("startup")
async def startup_event():
    """Connexion à MongoDB au démarrage du service."""
    success = connect_to_mongodb()
    if not success:
        print("❌ Échec de la connexion MongoDB - Service peut être instable!")
    else:
        print("✅ Service Messaging connecté à MongoDB")

app.include_router(conversation_router)
app.include_router(message_router)

# CORS - Configuration depuis variables d'environnement
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "Service Messaging: conversations and messages", 
        "database": "MongoDB",
        "version": "2.0"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "messaging",
        "database": "MongoDB",
        "port": int(os.getenv("SERVICE_MESSAGING_PORT", "8004")),
        "endpoints": [
            "/conversations/",
            "/messages/",
            "/health"
        ]
    }

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_MESSAGING_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_MESSAGING_PORT", "8004"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Messaging MongoDB TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    print(f"🍃 Base de données: MongoDB")
    
    uvicorn.run(app, host=host, port=port, reload=debug)