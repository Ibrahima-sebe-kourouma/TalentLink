from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database.database import init_database, check_database_connection
from routes.appointment_routes import router as appointment_router
import uvicorn

# Créer l'application FastAPI
app = FastAPI(
    title="TalentLink - Service de Rendez-vous",
    description="API pour la gestion des rendez-vous entre recruteurs et candidats",
    version="1.0.0",
    root_path="/api/appointment"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend React
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Événement de démarrage
@app.on_event("startup")
async def startup_event():
    """Initialisation au démarrage du service"""
    print("🚀 Démarrage du service Appointment TalentLink...")
    print("📍 Service disponible sur: http://127.0.0.1:8006")
    print("🗄️ Base de données: SQLite")
    
    # Initialiser la base de données
    try:
        init_database()
        if check_database_connection():
            print("✅ Service Appointment prêt !")
        else:
            print("❌ Erreur de connexion à la base de données")
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {str(e)}")

# Inclure les routes
app.include_router(appointment_router)

# Route racine
@app.get("/")
async def root():
    """Point d'entrée du service"""
    return {
        "service": "TalentLink Appointment Service",
        "version": "1.0.0",
        "description": "Service de gestion des rendez-vous",
        "endpoints": {
            "health": "/appointments/health",
            "docs": "/docs",
            "recruiter_candidates": "/appointments/candidates/{recruiter_id}",
            "create_appointment": "/appointments/create",
            "candidate_appointments": "/appointments/candidate/{candidate_id}"
        }
    }

# Route de santé globale
@app.get("/health")
async def health_check():
    """Vérification de l'état du service"""
    try:
        db_status = check_database_connection()
        return {
            "status": "healthy" if db_status else "unhealthy",
            "database": "connected" if db_status else "disconnected",
            "service": "appointment",
            "port": 8006
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Service unhealthy: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8006,
        reload=True
    )