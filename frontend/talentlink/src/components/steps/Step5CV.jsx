import React, { useState, useEffect } from "react";
import { API_PROFILE_URL } from "../../constants/api";

export default function Step5CV({ data = {}, onNext, onPrev, candidateId, isLastStep = false }) {
  const [cv, setCv] = useState(data.cv || "");
  const [lien, setLien] = useState(data.lien || "");
  const [lettreMotivation, setLettreMotivation] = useState(data.lettre_motivation || "");
  const [cvFile, setCvFile] = useState(null);
  const [coverLetterFile, setCoverLetterFile] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingCoverLetter, setUploadingCoverLetter] = useState(false);
  const [cvFileName, setCvFileName] = useState("");
  const [coverLetterFileName, setCoverLetterFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    // Si le candidat a déjà un CV/lettre, afficher le nom
    if (data.cv) {
      const filename = data.cv.split('/').pop();
      setCvFileName(filename);
    }
    if (data.lettre_motivation) {
      const filename = data.lettre_motivation.split('/').pop();
      setCoverLetterFileName(filename);
    }
  }, [data]);

  const handleCVUpload = async () => {
    if (!cvFile) {
      setError("Veuillez sélectionner un fichier CV");
      return;
    }

    if (!candidateId) {
      setError("Erreur: ID candidat manquant");
      return;
    }

    setUploadingCV(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", cvFile);

    try {
      console.log("Upload CV - Début", {candidateId, fileName: cvFile.name});
      
      const response = await fetch(`${API_PROFILE_URL}/candidates/${candidateId}/upload-cv`, {
        method: "POST",
        body: formData,
      });

      console.log("Upload CV - Status:", response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Upload CV - Erreur:", errorData);
        throw new Error(errorData.detail || "Erreur lors de l'upload du CV");
      }

      const result = await response.json();
      console.log("Upload CV - Succès:", result);
      
      setSuccess(`✓ CV "${result.filename}" uploadé avec succès! Fichier enregistré dans le système.`);
      setCvFileName(result.filename);
      setCv(result.path);
      setCvFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("cv-file-input");
      if (fileInput) fileInput.value = "";
      
      // Afficher une alerte de confirmation
      alert(`✓ CV uploadé avec succès!\n\nFichier: ${result.filename}\nCandidat: ${result.candidate.name || 'N/A'}\nChemin: ${result.path}`);

    } catch (err) {
      console.error("Upload CV - Exception:", err);
      setError(`Erreur: ${err.message}`);
      alert(`✗ Erreur lors de l'upload du CV: ${err.message}`);
    } finally {
      setUploadingCV(false);
    }
  };

  const handleCoverLetterUpload = async () => {
    if (!coverLetterFile) {
      setError("Veuillez sélectionner un fichier lettre de motivation");
      return;
    }

    if (!candidateId) {
      setError("Erreur: ID candidat manquant");
      return;
    }

    setUploadingCoverLetter(true);
    setError("");
    setSuccess("");

    const formData = new FormData();
    formData.append("file", coverLetterFile);

    try {
      const response = await fetch(`${API_PROFILE_URL}/candidates/${candidateId}/upload-cover-letter`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de l'upload de la lettre de motivation");
      }

      const result = await response.json();
      console.log("Upload Lettre - Succès:", result);
      
      setSuccess(`✓ Lettre de motivation "${result.filename}" uploadée avec succès! Fichier enregistré dans le système.`);
      setCoverLetterFileName(result.filename);
      setLettreMotivation(result.path);
      setCoverLetterFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("cover-letter-file-input");
      if (fileInput) fileInput.value = "";
      
      // Afficher une alerte de confirmation
      alert(`✓ Lettre de motivation uploadée avec succès!\n\nFichier: ${result.filename}\nCandidat: ${result.candidate.name || 'N/A'}\nChemin: ${result.path}`);

    } catch (err) {
      console.error("Upload Lettre - Exception:", err);
      setError(`Erreur: ${err.message}`);
      alert(`✗ Erreur lors de l'upload de la lettre: ${err.message}`);
    } finally {
      setUploadingCoverLetter(false);
    }
  };

  const handleDownloadCV = () => {
    if (candidateId && cv) {
      window.open(`${API_PROFILE_URL}/candidates/${candidateId}/download-cv`, '_blank');
    }
  };

  const handleDownloadCoverLetter = () => {
    if (candidateId && lettreMotivation) {
      window.open(`${API_PROFILE_URL}/candidates/${candidateId}/download-cover-letter`, '_blank');
    }
  };

  const handleNext = () => {
    console.log("Step5CV - handleNext appelé", { cv, lien, lettreMotivation, candidateId });
    onNext({ cv, lien, lettre_motivation: lettreMotivation });
  };

  return (
    <div>
      <h3>CV & Lettre de Motivation</h3>
      
      {error && <div className="alert alert-error" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
      {success && <div className="alert alert-success" style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

      <div style={{marginBottom: '20px'}}>
        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
          Télécharger votre CV (PDF, DOC, DOCX - max 5MB)
        </label>
        <input 
          id="cv-file-input"
          type="file" 
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCvFile(e.target.files[0])}
          style={{marginBottom: '10px'}}
        />
        <button 
          onClick={handleCVUpload} 
          disabled={!cvFile || uploadingCV}
          className="tl-btn-secondary"
          style={{marginRight: '10px'}}
        >
          {uploadingCV ? "Upload en cours..." : "Uploader CV"}
        </button>
        {cvFileName && (
          <span>
            Fichier actuel: <strong>{cvFileName}</strong>
            <button 
              onClick={handleDownloadCV}
              className="tl-btn-secondary"
              style={{marginLeft: '10px', fontSize: '0.9em'}}
            >
              Télécharger
            </button>
          </span>
        )}
      </div>

      <div style={{marginBottom: '20px'}}>
        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
          Télécharger votre lettre de motivation (PDF, DOC, DOCX - max 5MB)
        </label>
        <input 
          id="cover-letter-file-input"
          type="file" 
          accept=".pdf,.doc,.docx"
          onChange={(e) => setCoverLetterFile(e.target.files[0])}
          style={{marginBottom: '10px'}}
        />
        <button 
          onClick={handleCoverLetterUpload} 
          disabled={!coverLetterFile || uploadingCoverLetter}
          className="tl-btn-secondary"
          style={{marginRight: '10px'}}
        >
          {uploadingCoverLetter ? "Upload en cours..." : "Uploader Lettre"}
        </button>
        {coverLetterFileName && (
          <span>
            Fichier actuel: <strong>{coverLetterFileName}</strong>
            <button 
              onClick={handleDownloadCoverLetter}
              className="tl-btn-secondary"
              style={{marginLeft: '10px', fontSize: '0.9em'}}
            >
              Télécharger
            </button>
          </span>
        )}
      </div>

      <div style={{marginBottom: '20px'}}>
        <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
          Lien portfolio / GitHub / LinkedIn
        </label>
        <input 
          placeholder="https://..." 
          value={lien} 
          onChange={e=>setLien(e.target.value)}
          style={{width: '100%', padding: '8px', marginBottom: '10px'}}
        />
      </div>

      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">{isLastStep ? "Terminer" : "Suivant"}</button>
      </div>
    </div>
  );
}
