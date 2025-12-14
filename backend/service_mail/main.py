from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from routes.email_routes import router as email_router

app = FastAPI(
    title="TalentLink Mail Service", 
    version="1.0.0",
    root_path="/api/mail"
)

@app.get("/")
def root():
    return {"service": "mail", "status": "ok"}

app.include_router(email_router)

# CORS - Configuration depuis variables d'environnement
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_MAIL_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_MAIL_PORT", "8005"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Mail TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=debug)
