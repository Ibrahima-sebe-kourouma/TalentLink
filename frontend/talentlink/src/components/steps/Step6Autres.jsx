import React, { useState } from "react";

export default function Step6Autres({ data = {}, onNext, onPrev }) {
  const [resumeProfessionnel, setResumeProfessionnel] = useState(data.resume_professionnel || "");
  const [langues, setLangues] = useState(data.langues || []);
  const [certifications, setCertifications] = useState(data.certifications || []);
  const [autres, setAutres] = useState(data.autres || []);
  const [projets, setProjets] = useState(data.projets || []);

  // Gestion des langues
  const addLangue = () => setLangues([...langues, ""]);
  const updateLangue = (index, value) => {
    const newLangues = [...langues];
    newLangues[index] = value;
    setLangues(newLangues);
  };

  // Gestion des certifications
  const addCertification = () => setCertifications([...certifications, ""]);
  const updateCertification = (index, value) => {
    const newCertifications = [...certifications];
    newCertifications[index] = value;
    setCertifications(newCertifications);
  };

  // Gestion des projets
  const addProjet = () => setProjets([...projets, { nom: "", description: "", technologies: "", lien: "" }]);
  const updateProjet = (index, field, value) => {
    const newProjets = [...projets];
    newProjets[index] = { ...newProjets[index], [field]: value };
    setProjets(newProjets);
  };

  // Gestion des autres informations
  const addAutre = () => setAutres([...autres, ""]);
  const updateAutre = (index, value) => {
    const newAutres = [...autres];
    newAutres[index] = value;
    setAutres(newAutres);
  };

  const handleNext = () => {
    onNext({
      resume_professionnel: resumeProfessionnel,
      langues,
      certifications,
      projets,
      autres
    });
  };

  return (
    <div>
      <h3>Informations complémentaires</h3>
      
      <div className="tl-section">
        <h4>Résumé Professionnel</h4>
        <textarea
          placeholder="Décrivez votre parcours et vos objectifs professionnels..."
          value={resumeProfessionnel}
          onChange={(e) => setResumeProfessionnel(e.target.value)}
          rows={4}
        />
      </div>

      <div className="tl-section">
        <h4>Langues</h4>
        {langues.map((langue, idx) => (
          <div key={idx} className="tl-inline">
            <input
              placeholder="Langue et niveau (ex: Anglais - Courant)"
              value={langue}
              onChange={(e) => updateLangue(idx, e.target.value)}
            />
          </div>
        ))}
        <button onClick={addLangue} className="tl-btn-ghost">+ Ajouter une langue</button>
      </div>

      <div className="tl-section">
        <h4>Certifications</h4>
        {certifications.map((cert, idx) => (
          <div key={idx} className="tl-inline">
            <input
              placeholder="Nom de la certification"
              value={cert}
              onChange={(e) => updateCertification(idx, e.target.value)}
            />
          </div>
        ))}
        <button onClick={addCertification} className="tl-btn-ghost">+ Ajouter une certification</button>
      </div>

      <div className="tl-section">
        <h4>Projets</h4>
        {projets.map((projet, idx) => (
          <div key={idx} className="tl-card">
            <input
              placeholder="Nom du projet"
              value={projet.nom}
              onChange={(e) => updateProjet(idx, "nom", e.target.value)}
            />
            <textarea
              placeholder="Description du projet"
              value={projet.description}
              onChange={(e) => updateProjet(idx, "description", e.target.value)}
            />
            <input
              placeholder="Technologies utilisées"
              value={projet.technologies}
              onChange={(e) => updateProjet(idx, "technologies", e.target.value)}
            />
            <input
              placeholder="Lien vers le projet"
              value={projet.lien}
              onChange={(e) => updateProjet(idx, "lien", e.target.value)}
            />
          </div>
        ))}
        <button onClick={addProjet} className="tl-btn-ghost">+ Ajouter un projet</button>
      </div>

      <div className="tl-section">
        <h4>Autres informations</h4>
        {autres.map((autre, idx) => (
          <div key={idx} className="tl-inline">
            <input
              placeholder="Information supplémentaire"
              value={autre}
              onChange={(e) => updateAutre(idx, e.target.value)}
            />
          </div>
        ))}
        <button onClick={addAutre} className="tl-btn-ghost">+ Ajouter</button>
      </div>

      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={handleNext} className="tl-btn-primary">Suivant</button>
      </div>
    </div>
  );
}