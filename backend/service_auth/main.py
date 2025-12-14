from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database.database import Base, engine
from routes import auth_routes
from routes.admin_routes import router as admin_router
import uvicorn
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()


# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TalentLink - Auth Service", 
    version="1.0",
    root_path="/api/auth"
)

# Enregistrer les routes
app.include_router(auth_routes.router)
app.include_router(admin_router)

# Autoriser CORS pour que le front puisse appeler l'API
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
    return {"message": "Bienvenue sur le service d'authentification TalentLink 🚀"}

if __name__ == "__main__":
    host = os.getenv("SERVICE_AUTH_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_AUTH_PORT", "8001"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Auth TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=debug)