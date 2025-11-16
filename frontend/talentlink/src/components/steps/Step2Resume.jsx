import React, { useState } from "react";

export default function Step2Resume({ data = {}, onNext, onPrev }) {
  const [resumeProfessionnel, setResumeProfessionnel] = useState(data.resume_professionnel || "");

  const handleNext = () => {
    onNext({ resume_professionnel: resumeProfessionnel });
  };

  return (
    <div className="tl-section">
      <h3>Résumé Professionnel</h3>
      <div className="tl-card">
        <p className="tl-hint">
          Présentez votre parcours, vos objectifs et ce qui vous motive professionnellement.
          Un bon résumé permet aux recruteurs de rapidement comprendre votre profil.
        </p>
        <textarea
          placeholder="Décrivez votre parcours professionnel, vos objectifs de carrière et ce qui vous passionne dans votre domaine..."
          value={resumeProfessionnel}
          onChange={(e) => setResumeProfessionnel(e.target.value)}
          rows={6}
          className="tl-textarea"
        />
      </div>
      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">Suivant</button>
      </div>
    </div>
  );
}