from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import mimetypes
from sqlalchemy.orm import Session
import os
import shutil
from pathlib import Path
from datetime import datetime
from database.database import get_db
from controllers.candidat_controller import (
    create_candidat,
    get_candidat_by_id,
    get_candidat_by_auth_user,
    list_candidats,
    update_candidat,
    delete_candidat,
    add_skill,
    add_experience,
    get_all_info_candidat,
    partial_update_candidat,
    update_progression,
    check_completion,
)
from controllers.profile_view_controller import (
    record_profile_view,
    get_profile_view_summary,
)
from models.candidat import (
    CandidatCreate,
    CandidatResponse,
    CandidatUpdate,
    SkillItem,
    ExperienceItem,
)

router = APIRouter(prefix="/candidates", tags=["Candidates"])

# Configuration pour les uploads
UPLOAD_DIR = Path(__file__).resolve().parents[2] / "uploads"
CV_DIR = UPLOAD_DIR / "cv"
COVER_LETTER_DIR = UPLOAD_DIR / "cover_letters"
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# S'assurer que les répertoires existent
CV_DIR.mkdir(parents=True, exist_ok=True)
COVER_LETTER_DIR.mkdir(parents=True, exist_ok=True)


def validate_file(file: UploadFile, max_size: int = MAX_FILE_SIZE):
    """Valide l'extension et la taille du fichier."""
    # Vérifier l'extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier non autorisé. Extensions acceptées: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Lire le fichier pour vérifier la taille
    file.file.seek(0, 2)  # Aller à la fin du fichier
    file_size = file.file.tell()
    file.file.seek(0)  # Revenir au début
    
    if file_size > max_size:
        raise HTTPException(
            status_code=400,
            detail=f"Fichier trop volumineux. Taille maximale: {max_size / (1024*1024):.0f}MB"
        )
    
    return file_ext


def save_file(file: UploadFile, directory: Path, candidate_id: int, file_type: str) -> str:
    """Sauvegarde le fichier et retourne le chemin relatif."""
    file_ext = validate_file(file)
    
    # Nettoyer le nom de fichier original
    safe_filename = "".join(c for c in file.filename if c.isalnum() or c in "._- ")
    safe_filename = safe_filename.replace(" ", "_")
    
    # Créer un nom unique avec timestamp
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    filename = f"candidate_{candidate_id}_{file_type}_{timestamp}{file_ext}"
    
    file_path = directory / filename
    
    # S'assurer que le répertoire existe
    directory.mkdir(parents=True, exist_ok=True)
    
    # Sauvegarder le fichier
    try:
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"✓ Fichier sauvegardé: {file_path}")
    except Exception as e:
        print(f"✗ Erreur lors de la sauvegarde: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la sauvegarde du fichier: {str(e)}")
    
    # Retourner le chemin relatif à partir de backend/
    relative_path = str(file_path.relative_to(UPLOAD_DIR.parent))
    print(f"Chemin relatif retourné: {relative_path}")
    return relative_path


@router.post("/", response_model=CandidatResponse)
def create_candidate_endpoint(payload: CandidatCreate, db: Session = Depends(get_db)):
    """
    Crée un nouveau profil de candidat.
    Requiert un ID utilisateur valide du service d'authentification (auth_user_id).
    Retourne le profil candidat créé avec toutes ses informations.
    """
    return create_candidat(db, payload.dict())


@router.get("/{candidate_id}", response_model=CandidatResponse)
def get_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """
    Récupère les détails d'un candidat par son ID de profil.
    Retourne toutes les informations du profil candidat, y compris les compétences et expériences.
    """
    candidate = get_candidat_by_id(db, candidate_id)
    return candidate


@router.get("/by-user/{auth_user_id}", response_model=CandidatResponse)
def get_candidate_by_user(auth_user_id: int, db: Session = Depends(get_db)):
    """
    Récupère le profil d'un candidat en utilisant l'ID utilisateur du service d'authentification.
    Utile pour lier le profil authentifié avec son profil candidat.
    """
    candidate = get_candidat_by_auth_user(db, auth_user_id)
    return candidate


@router.get("/", response_model=list[CandidatResponse])
def list_candidates(db: Session = Depends(get_db)):
    """
    Liste tous les profils candidats dans le système.
    Retourne un tableau de tous les candidats avec leurs informations complètes.
    """
    return list_candidats(db)


@router.put("/{candidate_id}", response_model=CandidatResponse)
def update_candidate(candidate_id: int, payload: CandidatUpdate, db: Session = Depends(get_db)):
    """
    Met à jour les informations d'un profil candidat existant.
    Seuls les champs fournis seront modifiés, les autres resteront inchangés.
    """
    return update_candidat(db, candidate_id, payload.dict(exclude_unset=True))


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, db: Session = Depends(get_db)):
    """
    Supprime un profil candidat du système.
    Cette action est irréversible.
    """
    return delete_candidat(db, candidate_id)


@router.post("/{candidate_id}/skills", response_model=CandidatResponse)
def add_skill_endpoint(candidate_id: int, skill: SkillItem, db: Session = Depends(get_db)):
    """
    Ajoute une nouvelle compétence au profil d'un candidat.
    La compétence doit contenir un nom et peut inclure un niveau optionnel.
    """
    return add_skill(db, candidate_id, skill.dict())


@router.post("/{candidate_id}/experiences", response_model=CandidatResponse)
def add_experience_endpoint(candidate_id: int, exp: ExperienceItem, db: Session = Depends(get_db)):
    """
    Ajoute une nouvelle expérience professionnelle au profil d'un candidat.
    L'expérience peut inclure le titre, l'entreprise, les dates et une description.
    """
    return add_experience(db, candidate_id, exp.dict())

@router.get("/{candidate_id}/full-info", response_model=CandidatResponse)
def get_full_info_candidate(candidate_id: int, db: Session = Depends(get_db)):
    return get_all_info_candidat(db, candidate_id)



@router.patch("/{candidate_id}/partial-update", response_model=CandidatResponse)
def partial_update_candidate(candidate_id: int, payload: dict, db: Session = Depends(get_db)):
    """
    Met à jour partiellement les champs du profil du candidat (utilisé par un stepper).
    Envoyer uniquement les champs de l'étape courante.
    """
    return partial_update_candidat(db, candidate_id, payload)


@router.patch("/{candidate_id}/progression")
def update_progression_endpoint(candidate_id: int, step: int, db: Session = Depends(get_db)):
    """
    Met à jour la progression (étape atteinte) du candidat.
    Ex: step=2
    """
    return update_progression(db, candidate_id, step)


@router.get("/{candidate_id}/completion-status")
def completion_status(candidate_id: int, db: Session = Depends(get_db)):
    """
    Retourne quelles sections du profil sont complètes et le pourcentage global.
    Utile pour afficher une progression dans le frontend.
    """
    return check_completion(db, candidate_id)


@router.post("/{candidate_id}/upload-cv")
def upload_cv(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload le CV d'un candidat (PDF, DOC, DOCX, max 5MB).
    Le fichier est sauvegardé sur le serveur et le chemin est stocké en base de données.
    """
    print(f"\n=== UPLOAD CV - Début ===")
    print(f"Candidate ID: {candidate_id}")
    print(f"Nom fichier: {file.filename}")
    print(f"Content Type: {file.content_type}")
    
    # Vérifier que le candidat existe
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        print(f"✗ Candidat {candidate_id} non trouvé")
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    print(f"✓ Candidat trouvé: {candidate.name} {candidate.prenom}")
    
    # Supprimer l'ancien fichier si existe
    if candidate.cv:
        old_file_path = Path(__file__).resolve().parents[2] / candidate.cv
        if old_file_path.exists():
            print(f"Suppression ancien CV: {old_file_path}")
            old_file_path.unlink()
    
    # Sauvegarder le nouveau fichier
    print(f"Sauvegarde dans: {CV_DIR}")
    file_path = save_file(file, CV_DIR, candidate_id, "cv")
    
    # Mettre à jour la base de données
    print(f"Mise à jour DB avec chemin: {file_path}")
    updated_candidate = update_candidat(db, candidate_id, {"cv": file_path})
    
    print(f"✓ CV uploadé avec succès!")
    print(f"=== UPLOAD CV - Fin ===\n")
    
    return {
        "success": True,
        "message": "CV uploadé avec succès",
        "filename": file.filename,
        "path": file_path,
        "candidate": {
            "id": updated_candidate.id,
            "name": updated_candidate.name,
            "cv": updated_candidate.cv
        }
    }


@router.post("/{candidate_id}/upload-cover-letter")
def upload_cover_letter(
    candidate_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload la lettre de motivation d'un candidat (PDF, DOC, DOCX, max 5MB).
    Le fichier est sauvegardé sur le serveur et le chemin est stocké en base de données.
    """
    print(f"\n=== UPLOAD LETTRE - Début ===")
    print(f"Candidate ID: {candidate_id}")
    print(f"Nom fichier: {file.filename}")
    
    # Vérifier que le candidat existe
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        print(f"✗ Candidat {candidate_id} non trouvé")
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    print(f"✓ Candidat trouvé: {candidate.name} {candidate.prenom}")
    
    # Supprimer l'ancien fichier si existe
    if candidate.lettre_motivation:
        old_file_path = Path(__file__).resolve().parents[2] / candidate.lettre_motivation
        if old_file_path.exists():
            print(f"Suppression ancienne lettre: {old_file_path}")
            old_file_path.unlink()
    
    # Sauvegarder le nouveau fichier
    print(f"Sauvegarde dans: {COVER_LETTER_DIR}")
    file_path = save_file(file, COVER_LETTER_DIR, candidate_id, "cover_letter")
    
    # Mettre à jour la base de données
    print(f"Mise à jour DB avec chemin: {file_path}")
    updated_candidate = update_candidat(db, candidate_id, {"lettre_motivation": file_path})
    
    print(f"✓ Lettre uploadée avec succès!")
    print(f"=== UPLOAD LETTRE - Fin ===\n")
    
    return {
        "success": True,
        "message": "Lettre de motivation uploadée avec succès",
        "filename": file.filename,
        "path": file_path,
        "candidate": {
            "id": updated_candidate.id,
            "name": updated_candidate.name,
            "lettre_motivation": updated_candidate.lettre_motivation
        }
    }


def _serve_file(file_path: Path, inline: bool = False):
    media_type, _ = mimetypes.guess_type(file_path.name)
    media_type = media_type or "application/octet-stream"
    headers = None
    if inline:
        headers = {"Content-Disposition": f"inline; filename=\"{file_path.name}\""}
    return FileResponse(
        path=str(file_path),
        filename=file_path.name,
        media_type=media_type,
        headers=headers,
    )


@router.get("/{candidate_id}/download-cv")
def download_cv(candidate_id: int, inline: bool = False, db: Session = Depends(get_db)):
    """
    Télécharge le CV d'un candidat.
    """
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    if not candidate.cv:
        raise HTTPException(status_code=404, detail="Aucun CV uploadé pour ce candidat")
    
    file_path = Path(__file__).resolve().parents[2] / candidate.cv
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier CV introuvable sur le serveur")
    
    return _serve_file(file_path, inline=inline)


@router.get("/{candidate_id}/download-cover-letter")
def download_cover_letter(candidate_id: int, inline: bool = False, db: Session = Depends(get_db)):
    """
    Télécharge la lettre de motivation d'un candidat.
    """
    candidate = get_candidat_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidat non trouvé")
    
    if not candidate.lettre_motivation:
        raise HTTPException(status_code=404, detail="Aucune lettre de motivation uploadée pour ce candidat")
    
    file_path = Path(__file__).resolve().parents[2] / candidate.lettre_motivation
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Fichier lettre de motivation introuvable sur le serveur")
    
    return _serve_file(file_path, inline=inline)


# --- Profile views tracking ---
@router.post("/{candidate_id}/profile-views")
def create_profile_view(candidate_id: int, recruiter_auth_user_id: int, db: Session = Depends(get_db)):
    """Enregistre une visite de profil par un recruteur.
    Passer recruiter_auth_user_id (id utilisateur du service auth) en query param.
    """
    return record_profile_view(db, candidate_id, recruiter_auth_user_id)


@router.get("/{candidate_id}/profile-views/summary")
def get_profile_views_summary(candidate_id: int, db: Session = Depends(get_db)):
    """Retourne un résumé des vues de profil: total, recruteurs uniques, dernière visite, 30 derniers jours."""
    return get_profile_view_summary(db, candidate_id)


