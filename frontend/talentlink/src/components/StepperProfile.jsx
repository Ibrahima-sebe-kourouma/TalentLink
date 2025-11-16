import React, { useState } from "react";
import Step1InfoPerso from "./steps/Step1InfoPerso";
import Step2Resume from "./steps/Step2Resume";
import Step3Formation from "./steps/Step3Formation";
import Step2Experience from "./steps/Step2Experience";
import Step5CompetencesLangues from "./steps/Step5CompetencesLangues";
import Step6Certifications from "./steps/Step6Certifications";
import Step7Projets from "./steps/Step7Projets";
import Step5CV from "./steps/Step5CV";
import "./Stepper.css";
import { API_PROFILE_URL } from "../constants/api";

const steps = [
  "Informations personnelles",
  "Résumé professionnel",
  "Formation",
  "Expérience",
  "Compétences & Langues",
  "Certifications",
  "Projets & Réalisations",
  "CV & Liens",
];

export default function StepperProfile({ candidat, user, onCandidatChange }) {
  const [currentStep, setCurrentStep] = useState(candidat?.progression || 1);
  const [formData, setFormData] = useState(candidat || { auth_user_id: user?.id });
  const [completed, setCompleted] = useState(false);

  // Fonction utilitaire pour sauvegarder partielle + update progression (save-step)
  async function saveStep(step, data) {
      console.log("saveStep - Début", { step, data, currentCandidateId: candidat?.id });
    try {
      // Vérifier si nous avons déjà un profil candidat
      let currentCandidateId = candidat?.id || formData?.id;

      if (!currentCandidateId) {
          console.log("saveStep - Pas d'ID candidat, vérification pour user:", user.id);
        // Vérifier si un profil existe déjà pour cet utilisateur
        const checkRes = await fetch(`${API_PROFILE_URL}/candidates/by-user/${user.id}`);
        
        if (checkRes.ok) {
          const existingCandidat = await checkRes.json();
          currentCandidateId = existingCandidat.id;
            console.log("saveStep - Candidat existant trouvé:", currentCandidateId);
          // Mettre à jour le state local avec les données existantes
          setFormData(prev => ({ ...prev, ...existingCandidat }));
        } else {
          // Créer un nouveau profil si aucun n'existe
          const createRes = await fetch(`${API_PROFILE_URL}/candidates`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              auth_user_id: user.id,
              progression: step,
              ...data 
            })
          });
          
          if (!createRes.ok) {
            throw new Error("Échec de la création du profil candidat");
          }
          
          const newCandidat = await createRes.json();
          currentCandidateId = newCandidat.id;
          // Mettre à jour le state local avec les nouvelles données
          setFormData(prev => ({ ...prev, ...newCandidat }));
        }
      }

      // Mise à jour partielle du profil avec les nouvelles données
      if (currentCandidateId) {
        const updateData = {
          ...data,
          progression: step
        };

          console.log("saveStep - Mise à jour candidat", { currentCandidateId, updateData });
        const updateRes = await fetch(`${API_PROFILE_URL}/candidates/${currentCandidateId}/partial-update`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData)
        });

          console.log("saveStep - Réponse mise à jour:", updateRes.status, updateRes.ok);
        if (!updateRes.ok) {
            const errorText = await updateRes.text();
            console.error("saveStep - Erreur réponse:", errorText);
          throw new Error("Échec de la mise à jour du profil");
        }

        const updatedCandidat = await updateRes.json();
          console.log("saveStep - Candidat mis à jour:", updatedCandidat);
        setFormData(prev => ({ ...prev, ...updatedCandidat }));
        onCandidatChange && onCandidatChange(updatedCandidat);
      }
      
          console.log("saveStep - Succès");
    } catch (err) {
      console.error("Erreur sauvegarde étape:", err);
          alert(`Erreur sauvegarde étape: ${err.message}\n\nVoir la console pour plus de détails.`);
          throw err; // Re-throw pour empêcher la progression
    }
  }

  const handleNext = async (data) => {
      console.log("StepperProfile - handleNext appelé", { currentStep, data, candidateId: formData.id });
        try {
          await saveStep(currentStep, data);
          console.log("StepperProfile - saveStep réussi, passage au step suivant");
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setCompleted(true);
      }
        } catch (err) {
          console.error("StepperProfile - Erreur dans handleNext, pas de progression:", err);
        }
  };

  const handlePrev = () => setCurrentStep(Math.max(1, currentStep - 1));

  const renderStepComponent = () => {
    if (completed) {
      return (
        <div style={{padding: 20}}>
          <h3>Profil complété ✅</h3>
          <p>Vos informations ont été sauvegardées avec succès.</p>
          <div style={{marginTop: 12}}>
            <button className="tl-btn-secondary" onClick={() => setCurrentStep(1)}>Retour au début</button>
          </div>
        </div>
      );
    }
    switch (currentStep) {
      case 1:
        return <Step1InfoPerso data={formData} onNext={handleNext} />;
      case 2:
        return <Step2Resume data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <Step3Formation data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 4:
        return <Step2Experience data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 5:
        return <Step5CompetencesLangues data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 6:
        return <Step6Certifications data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 7:
        return <Step7Projets data={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 8:
        return <Step5CV data={formData} candidateId={formData.id} isLastStep={currentStep === steps.length} onNext={handleNext} onPrev={handlePrev} />;
      default:
        return <Step1InfoPerso data={formData} onNext={handleNext} />;
    }
  };

  return (
    <div className="tl-stepper">
      <div className="tl-stepper-head">
        {steps.map((label, i) => (
          <div key={i} className="tl-step">
            <div className={"tl-step-circle " + (currentStep === i + 1 ? "active" : "")}>{i + 1}</div>
            <div className="tl-step-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="tl-stepper-body">{renderStepComponent()}</div>
    </div>
  );
}
