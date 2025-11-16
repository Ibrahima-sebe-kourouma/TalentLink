import React, { useState } from "react";

export default function Step2Experience({ data = {}, onNext, onPrev }) {
  const [items, setItems] = useState(data.experience || []);

  const addEmpty = () => setItems([...items, { title: "", company: "", start_date: "", end_date: "", description: "" }]);
  const updateItem = (i, key, val) => {
    const copy = [...items]; copy[i][key] = val; setItems(copy);
  };

  return (
    <div>
      <h3>Expériences</h3>
      {items.map((it, idx) => (
        <div className="tl-card" key={idx}>
          <input placeholder="Titre" value={it.title} onChange={e=>updateItem(idx,"title",e.target.value)} />
          <input placeholder="Entreprise" value={it.company} onChange={e=>updateItem(idx,"company",e.target.value)} />
          <input placeholder="Début" value={it.start_date} onChange={e=>updateItem(idx,"start_date",e.target.value)} />
          <input placeholder="Fin" value={it.end_date} onChange={e=>updateItem(idx,"end_date",e.target.value)} />
          <textarea placeholder="Description" value={it.description} onChange={e=>updateItem(idx,"description",e.target.value)} />
        </div>
      ))}
      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={() => { if(items.length===0) addEmpty(); else onNext({ experience: items }); }} className="tl-btn-primary">Suivant</button>
        <button onClick={addEmpty} className="tl-btn-ghost">+ Ajouter une expérience</button>
      </div>
    </div>
  );
}
