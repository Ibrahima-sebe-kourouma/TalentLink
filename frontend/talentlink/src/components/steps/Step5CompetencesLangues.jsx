import React, { useState } from "react";

export default function Step5CompetencesLangues({ data = {}, onNext, onPrev }) {
  const [competences, setCompetences] = useState(data.competences || []);
  const [langues, setLangues] = useState(data.langues || []);

  const addCompetence = () => {
    setCompetences([...competences, { name: "", level: "" }]);
  };

  const updateCompetence = (index, field, value) => {
    const newCompetences = [...competences];
    newCompetences[index] = { ...newCompetences[index], [field]: value };
    setCompetences(newCompetences);
  };

  const removeCompetence = (index) => {
    setCompetences(competences.filter((_, i) => i !== index));
  };

  const addLangue = () => {
    setLangues([...langues, { langue: "", niveau: "" }]);
  };

  const updateLangue = (index, field, value) => {
    const newLangues = [...langues];
    newLangues[index] = { ...newLangues[index], [field]: value };
    setLangues(newLangues);
  };

  const removeLangue = (index) => {
    setLangues(langues.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    onNext({ competences, langues });
  };

  return (
    <div>
      <div className="tl-section">
        <h3>Compétences Techniques</h3>
        <div className="tl-grid">
          {competences.map((comp, idx) => (
            <div key={idx} className="tl-card">
              <div className="tl-inline">
                <input
                  placeholder="Nom de la compétence"
                  value={comp.name}
                  onChange={(e) => updateCompetence(idx, "name", e.target.value)}
                  className="tl-input"
                />
                <select
                  value={comp.level}
                  onChange={(e) => updateCompetence(idx, "level", e.target.value)}
                  className="tl-select"
                >
                  <option value="">Niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Expert">Expert</option>
                </select>
                <button onClick={() => removeCompetence(idx)} className="tl-btn-icon">×</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addCompetence} className="tl-btn-ghost">+ Ajouter une compétence</button>
      </div>

      <div className="tl-section">
        <h3>Langues</h3>
        <div className="tl-grid">
          {langues.map((lang, idx) => (
            <div key={idx} className="tl-card">
              <div className="tl-inline">
                <input
                  placeholder="Langue"
                  value={lang.langue}
                  onChange={(e) => updateLangue(idx, "langue", e.target.value)}
                  className="tl-input"
                />
                <select
                  value={lang.niveau}
                  onChange={(e) => updateLangue(idx, "niveau", e.target.value)}
                  className="tl-select"
                >
                  <option value="">Niveau</option>
                  <option value="Débutant">Débutant</option>
                  <option value="Intermédiaire">Intermédiaire</option>
                  <option value="Avancé">Avancé</option>
                  <option value="Bilingue">Bilingue</option>
                  <option value="Langue maternelle">Langue maternelle</option>
                </select>
                <button onClick={() => removeLangue(idx)} className="tl-btn-icon">×</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addLangue} className="tl-btn-ghost">+ Ajouter une langue</button>
      </div>

      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">Suivant</button>
      </div>
    </div>
  );
}