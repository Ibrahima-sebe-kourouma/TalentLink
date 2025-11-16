import React, { useState } from "react";

export default function Step7Projets({ data = {}, onNext, onPrev }) {
  const [projets, setProjets] = useState(data.projets || []);

  const addProjet = () => {
    setProjets([...projets, {
      titre: "",
      description: "",
      technologies: "",
      lien: "",
      date_debut: "",
      date_fin: "",
      role: "",
      resultats: ""
    }]);
  };

  const updateProjet = (index, field, value) => {
    const newProjets = [...projets];
    newProjets[index] = { ...newProjets[index], [field]: value };
    setProjets(newProjets);
  };

  const removeProjet = (index) => {
    setProjets(projets.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext({ projets });
  };

  return (
    <div>
      <div className="tl-section">
        <h3>Projets et Réalisations</h3>
        <p className="tl-hint">
          Présentez vos projets personnels ou professionnels significatifs.
        </p>

        {projets.map((projet, idx) => (
          <div key={idx} className="tl-card">
            <div className="tl-grid">
              <input
                placeholder="Titre du projet"
                value={projet.titre}
                onChange={(e) => updateProjet(idx, "titre", e.target.value)}
                className="tl-input"
              />
              <input
                placeholder="Rôle dans le projet"
                value={projet.role}
                onChange={(e) => updateProjet(idx, "role", e.target.value)}
                className="tl-input"
              />
            </div>
            
            <textarea
              placeholder="Description détaillée du projet"
              value={projet.description}
              onChange={(e) => updateProjet(idx, "description", e.target.value)}
              className="tl-textarea"
              rows={4}
            />
            
            <div className="tl-grid">
              <input
                placeholder="Technologies / Outils utilisés"
                value={projet.technologies}
                onChange={(e) => updateProjet(idx, "technologies", e.target.value)}
                className="tl-input"
              />
              <input
                placeholder="Lien vers le projet"
                value={projet.lien}
                onChange={(e) => updateProjet(idx, "lien", e.target.value)}
                className="tl-input"
              />
            </div>
            
            <div className="tl-grid">
              <input
                type="date"
                placeholder="Date de début"
                value={projet.date_debut}
                onChange={(e) => updateProjet(idx, "date_debut", e.target.value)}
                className="tl-input"
              />
              <input
                type="date"
                placeholder="Date de fin"
                value={projet.date_fin}
                onChange={(e) => updateProjet(idx, "date_fin", e.target.value)}
                className="tl-input"
              />
            </div>
            
            <textarea
              placeholder="Résultats / Impacts du projet"
              value={projet.resultats}
              onChange={(e) => updateProjet(idx, "resultats", e.target.value)}
              className="tl-textarea"
              rows={3}
            />
            
            <div className="tl-actions">
              <button onClick={() => removeProjet(idx)} className="tl-btn-secondary">
                Supprimer ce projet
              </button>
            </div>
          </div>
        ))}

        <button onClick={addProjet} className="tl-btn-ghost">
          + Ajouter un projet
        </button>
      </div>

      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">Suivant</button>
      </div>
    </div>
  );
}