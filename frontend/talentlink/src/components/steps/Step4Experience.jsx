import React, { useState, useEffect } from "react";
import { FaBuilding, FaPlus, FaTrash } from "react-icons/fa";

export default function Step4Experience({ data = {}, onNext, onPrev }) {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    if (data.experience && data.experience.length > 0) {
      setExperiences(data.experience);
    } else {
      setExperiences([{ title: "", company: "", location: "", start_date: "", end_date: "", description: "" }]);
    }
  }, [data]);

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...experiences];
    updatedItems[index][field] = value;
    setExperiences(updatedItems);
  };

  const addItem = () => {
    setExperiences([...experiences, { title: "", company: "", location: "", start_date: "", end_date: "", description: "" }]);
  };

  const removeItem = (index) => {
    if (experiences.length > 1) {
      const updatedItems = experiences.filter((_, i) => i !== index);
      setExperiences(updatedItems);
    }
  };

  const handleNext = (e) => {
    e.preventDefault();
    const nonEmptyItems = experiences.filter(exp => exp.title || exp.company);
    onNext({ experience: nonEmptyItems });
  };

  return (
    <div className="step-content">
      <h3 className="step-title"><FaBuilding /> Expériences Professionnelles</h3>
      <p className="step-description">
        Listez vos expériences, de la plus récente à la plus ancienne. Mettez en avant les missions et les résultats qui valorisent votre profil.
      </p>

      <form onSubmit={handleNext}>
        {experiences.map((item, index) => (
          <div className="tl-card list-item-card" key={index}>
            <div className="card-header">
              <h4>Expérience #{index + 1}</h4>
              {experiences.length > 1 && (
                <button type="button" onClick={() => removeItem(index)} className="tl-btn-icon-danger">
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="form-grid-2">
              <div className="tl-form-group">
                <label htmlFor={`title-${index}`}>Poste occupé</label>
                <input id={`title-${index}`} type="text" className="tl-input" placeholder="Ex: Développeur Full-Stack" value={item.title} onChange={(e) => handleItemChange(index, "title", e.target.value)} />
              </div>
              <div className="tl-form-group">
                <label htmlFor={`company-${index}`}>Entreprise</label>
                <input id={`company-${index}`} type="text" className="tl-input" placeholder="Ex: Google" value={item.company} onChange={(e) => handleItemChange(index, "company", e.target.value)} />
              </div>
            </div>
             <div className="tl-form-group">
                <label htmlFor={`location-${index}`}>Lieu</label>
                <input id={`location-${index}`} type="text" className="tl-input" placeholder="Ex: Paris, France" value={item.location} onChange={(e) => handleItemChange(index, "location", e.target.value)} />
              </div>
            <div className="form-grid-2">
              <div className="tl-form-group">
                <label htmlFor={`start_date-${index}`}>Date de début</label>
                <input id={`start_date-${index}`} type="month" className="tl-input" value={item.start_date} onChange={(e) => handleItemChange(index, "start_date", e.target.value)} />
              </div>
              <div className="tl-form-group">
                <label htmlFor={`end_date-${index}`}>Date de fin</label>
                <input id={`end_date-${index}`} type="month" className="tl-input" value={item.end_date} onChange={(e) => handleItemChange(index, "end_date", e.target.value)} />
              </div>
            </div>
            <div className="tl-form-group">
              <label htmlFor={`description-${index}`}>Missions et réalisations</label>
              <textarea id={`description-${index}`} className="tl-input" rows="4" placeholder="Décrivez vos responsabilités et vos succès..." value={item.description} onChange={(e) => handleItemChange(index, "description", e.target.value)}></textarea>
            </div>
          </div>
        ))}

        <button type="button" onClick={addItem} className="tl-btn-secondary-outline add-item-btn">
          <FaPlus /> Ajouter une expérience
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
