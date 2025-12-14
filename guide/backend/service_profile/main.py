from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exception_handlers import http_exception_handler
import logging
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from database.database import engine, Base

# import and include routes
from routes.candidat_routes import router as candidat_router
from routes.recruteur_routes import router as recruteur_router

# create tables (ensure models are imported via routers above)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Service Profile", version="1.1")

app.include_router(candidat_router)
app.include_router(recruteur_router)

# Autoriser CORS - Configuration depuis variables d'environnement
cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure un logger simple pour afficher les détails des erreurs HTTP dans la console
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("service_profile")


@app.exception_handler(HTTPException)
async def http_exception_logger(request: Request, exc: HTTPException):
    """
    Handler global pour HTTPException qui logge le détail dans la console
    avant de déléguer au handler HTTP par défaut de FastAPI.
    """
    try:
        logger.error(
            "HTTPException: %s %s -> status=%s detail=%s",
            request.method,
            request.url,
            exc.status_code,
            exc.detail,
        )
    except Exception:
        # Si le logging échoue, on ignore pour ne pas casser le handler
        logger.exception("Erreur lors du logging de l'HTTPException")

    return await http_exception_handler(request, exc)

@app.get("/")
def root():
    return {"message": "Service Profile: candidates and recruiters"}

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_PROFILE_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_PROFILE_PORT", "8002"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Profile TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=debug)
