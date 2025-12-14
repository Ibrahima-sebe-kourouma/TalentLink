import React, { useState, useEffect } from "react";
import { FaStar, FaPlus, FaTrash } from "react-icons/fa";

const SKILL_LEVELS = ["Débutant", "Intermédiaire", "Avancé", "Expert"];

export default function Step4Competences({ data = {}, onNext, onPrev }) {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    if (data.competences && data.competences.length > 0) {
      setSkills(data.competences);
    } else {
      setSkills([{ name: "", level: SKILL_LEVELS[0] }]);
    }
  }, [data]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...skills];
    updatedItems[index][field] = value;
    setSkills(updatedItems);
  };

  const addItem = () => {
    setSkills([...skills, { name: "", level: SKILL_LEVELS[0] }]);
  };

  const removeItem = (index) => {
    if (skills.length > 1) {
      const updatedItems = skills.filter((_, i) => i !== index);
      setSkills(updatedItems);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const nonEmptyItems = skills.filter((s) => s.name);
    onNext({ competences: nonEmptyItems });
  };

  return (
    <div className="step-content">
      <h3 className="step-title">
        <FaStar /> Compétences Techniques et Professionnelles
      </h3>
      <p className="step-description">
        Listez les compétences que vous maîtrisez. Soyez précis sur votre niveau
        pour donner une idée claire de votre expertise.
      </p>

      <form onSubmit={handleNext}>
        {skills.map((item, index) => (
          <div className="tl-card list-item-card" key={index}>
            <div className="card-header">
              <h4>Compétence #{index + 1}</h4>
              {skills.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="tl-btn-icon-danger"
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="form-grid-2">
              <div className="tl-form-group">
                <label htmlFor={`skill-name-${index}`}>Compétence</label>
                <input
                  id={`skill-name-${index}`}
                  type="text"
                  className="tl-input"
                  placeholder="Ex: JavaScript, Gestion de projet..."
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                />
              </div>
              <div className="tl-form-group">
                <label htmlFor={`skill-level-${index}`}>Niveau</label>
                <select
                  id={`skill-level-${index}`}
                  className="tl-input"
                  value={item.level}
                  onChange={(e) =>
                    handleItemChange(index, "level", e.target.value)
                  }
                >
                  {SKILL_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addItem}
          className="tl-btn-secondary-outline add-item-btn"
        >
          <FaPlus /> Ajouter une compétence
        </button>

        <div className="step-actions">
          <button type="button" onClick={onPrev} className="tl-btn-secondary">
            Précédent
          </button>
          <button type="submit" className="tl-btn-primary">
            Suivant
          </button>
        </div>
      </form>
    </div>
  );
}
