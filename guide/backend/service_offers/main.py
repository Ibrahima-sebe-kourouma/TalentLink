from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exception_handlers import http_exception_handler
import logging
import os
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

from database.database import engine, Base
from migrations.ensure_recruiter_columns import ensure_recruiter_columns
from routes.offer_routes import router as offer_router
from routes.application_routes import router as application_router
from routes.notification_routes import router as notification_router

# Create/Update schema
Base.metadata.create_all(bind=engine)
ensure_recruiter_columns()

app = FastAPI(title="Service Offers", version="1.1")

app.include_router(offer_router)
app.include_router(application_router)
app.include_router(notification_router)

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
logger = logging.getLogger("service_offers")


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
    return {"message": "Service Offers"}

# Point d'entrée pour le démarrage du service
if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("SERVICE_OFFERS_HOST", "127.0.0.1")
    port = int(os.getenv("SERVICE_OFFERS_PORT", "8003"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    
    print(f"🚀 Démarrage du service Offers TalentLink...")
    print(f"📍 Service disponible sur: http://{host}:{port}")
    
    uvicorn.run(app, host=host, port=port, reload=debug)
