from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from database.database import engine, Base

# Import routes
from routes.conversation_routes import router as conversation_router
from routes.message_routes import router as message_router

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Service Messaging", version="1.0")

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
    return {"message": "Service Messaging: conversations and messages"}

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_MESSAGING_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_MESSAGING_PORT", "8004"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Messaging TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=debug)
