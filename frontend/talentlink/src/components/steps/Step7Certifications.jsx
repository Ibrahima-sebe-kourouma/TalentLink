import React, { useState } from "react";

export default function Step6Certifications({ data = {}, onNext, onPrev }) {
  const [certifications, setCertifications] = useState(data.certifications || []);

  const addCertification = () => {
    setCertifications([...certifications, { 
      nom: "", 
      organisme: "", 
      date: "", 
      expiration: "",
      identifiant: "" 
    }]);
  };

  const updateCertification = (index, field, value) => {
    const newCertifications = [...certifications];
    newCertifications[index] = { ...newCertifications[index], [field]: value };
    setCertifications(newCertifications);
  };

  const removeCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext({ certifications });
  };

  return (
    <div>
      <div className="tl-section">
        <h3>Certifications et Accréditations</h3>
        <p className="tl-hint">
          Ajoutez vos certifications professionnelles, diplômes spécialisés ou accréditations.
        </p>
        
        {certifications.map((cert, idx) => (
          <div key={idx} className="tl-card">
            <div className="tl-grid">
              <input
                placeholder="Nom de la certification"
                value={cert.nom}
                onChange={(e) => updateCertification(idx, "nom", e.target.value)}
                className="tl-input"
              />
              <input
                placeholder="Organisme émetteur"
                value={cert.organisme}
                onChange={(e) => updateCertification(idx, "organisme", e.target.value)}
                className="tl-input"
              />
            </div>
            <div className="tl-grid">
              <input
                type="date"
                placeholder="Date d'obtention"
                value={cert.date}
                onChange={(e) => updateCertification(idx, "date", e.target.value)}
                className="tl-input"
              />
              <input
                type="date"
                placeholder="Date d'expiration (optionnel)"
                value={cert.expiration}
                onChange={(e) => updateCertification(idx, "expiration", e.target.value)}
                className="tl-input"
              />
            </div>
            <div className="tl-inline">
              <input
                placeholder="Identifiant de certification (optionnel)"
                value={cert.identifiant}
                onChange={(e) => updateCertification(idx, "identifiant", e.target.value)}
                className="tl-input"
              />
              <button onClick={() => removeCertification(idx)} className="tl-btn-icon">×</button>
            </div>
          </div>
        ))}
        
        <button onClick={addCertification} className="tl-btn-ghost">
          + Ajouter une certification
        </button>
      </div>

      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">Suivant</button>
      </div>
    </div>
  );
}