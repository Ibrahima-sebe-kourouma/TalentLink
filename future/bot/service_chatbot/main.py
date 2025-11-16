from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from database.database import create_tables, init_default_data
from routes.chatbot_routes import router as chatbot_router
from utils.ollama_client import chatbot_service

# Gestionnaire de contexte pour les événements de démarrage/arrêt
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Démarrage
    print("🚀 Démarrage du service Chatbot TalentLink...")
    
    # Initialiser la base de données
    create_tables()
    init_default_data()
    print("✅ Base de données initialisée")
    
    # Vérifier Ollama
    if chatbot_service.is_ready():
        models = chatbot_service.get_available_models()
        print(f"✅ Ollama connecté - {len(models)} modèles disponibles")
        for model in models:
            print(f"   📦 {model['name']} ({model['size']})")
    else:
        print("⚠️ Ollama non disponible - Service en mode dégradé")
    
    yield
    
    # Arrêt
    print("🛑 Arrêt du service Chatbot...")

# Création de l'application FastAPI
app = FastAPI(
    title="TalentLink - Service Chatbot",
    description="Service de chatbot personnalisé avec intégration Ollama pour TalentLink",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(chatbot_router)

# Route racine
@app.get("/")
async def root():
    ollama_status = chatbot_service.is_ready()
    models_count = len(chatbot_service.get_available_models())
    
    return {
        "service": "TalentLink Chatbot Service",
        "version": "1.0.0",
        "status": "active",
        "ollama_status": "connected" if ollama_status else "disconnected",
        "models_available": models_count,
        "features": [
            "Chat avec IA locale (Ollama)",
            "Personnalités personnalisées", 
            "Historique des conversations",
            "Base de connaissances",
            "Support multi-modèles"
        ],
        "endpoints": {
            "chat": "/api/chatbot/chat",
            "health": "/api/chatbot/health",
            "models": "/api/chatbot/models",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

# Route de santé générale
@app.get("/health")
async def health():
    ollama_ready = chatbot_service.is_ready()
    return {
        "status": "healthy" if ollama_ready else "degraded",
        "service": "chatbot",
        "version": "1.0.0",
        "ollama": "connected" if ollama_ready else "disconnected"
    }

# Gestion des erreurs globales
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return HTTPException(
        status_code=404,
        detail="Endpoint non trouvé"
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return HTTPException(
        status_code=500,
        detail="Erreur interne du serveur"
    )

# Point d'entrée principal
if __name__ == "__main__":
    print("🤖 Démarrage du service Chatbot TalentLink...")
    print("📍 Service disponible sur: http://127.0.0.1:8007")
    print("📚 Documentation API: http://127.0.0.1:8007/docs")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8007,  # Port dédié pour le service chatbot
        reload=True,
        log_level="info"
    )