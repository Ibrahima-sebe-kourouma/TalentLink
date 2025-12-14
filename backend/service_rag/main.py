"""
Service RAG (Retrieval-Augmented Generation) pour TalentLink
Point d'entrée principal du service
"""
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.rag_controller import rag_controller
from routes import router

# Charger les variables d'environnement
load_dotenv()

# Configuration de l'application FastAPI
app = FastAPI(
    title="Service RAG - TalentLink",
    description="Service de requête de documents avec RAG (Retrieval-Augmented Generation)",
    version="1.0.0",
    root_path="/api/rag"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enregistrement des routes
app.include_router(router, prefix="/rag", tags=["RAG"])


@app.on_event("startup")
async def startup_event():
    """Initialisation de l'index au démarrage de l'application."""
    await rag_controller.initialize_index()


if __name__ == "__main__":
    import uvicorn
    
    # Récupérer le port depuis les variables d'environnement
    port = int(os.getenv("RAG_SERVICE_PORT", 8008))
    
    print(f"🚀 Démarrage du service RAG sur le port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)

