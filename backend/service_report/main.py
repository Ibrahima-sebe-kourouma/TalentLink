from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exception_handlers import http_exception_handler
import logging
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from database.database import create_tables
from routes.report_routes import router as report_router

# Créer les tables
create_tables()

app = FastAPI(
    title="TalentLink Report Service", 
    version="1.0.0",
    description="Service de gestion des signalements pour TalentLink",
    root_path="/api/report"
)

app.include_router(report_router)

# CORS - Configuration depuis variables d'environnement
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("service_report")


@app.exception_handler(HTTPException)
async def http_exception_logger(request: Request, exc: HTTPException):
    try:
        logger.error(
            "HTTPException: %s %s -> status=%s detail=%s",
            request.method,
            request.url,
            exc.status_code,
            exc.detail,
        )
    except Exception:
        logger.exception("Erreur lors du logging de l'HTTPException")

    return await http_exception_handler(request, exc)


@app.get("/")
def root():
    return {
        "service": "TalentLink Report Service",
        "version": "1.0.0",
        "description": "Service de gestion des signalements",
        "features": [
            "Signalements d'offres, profils et messages",
            "Système de sévérité automatique",
            "Interface admin pour traitement",
            "Notifications automatiques"
        ]
    }

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_REPORT_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_REPORT_PORT", "8007"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Report TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    print(f"📖 Documentation API: http://{host}:{port}/docs")
    
    uvicorn.run(app, host=host, port=port, reload=debug)