import React, { useState } from "react";

export default function Step3Formation({ data = {}, onNext, onPrev }) {
  const [items, setItems] = useState(data.formation || []);

  const addEmpty = () => setItems([...items, { school: "", degree: "", start: "", end: "" }]);
  const updateItem = (i, key, val) => { const copy=[...items]; copy[i][key]=val; setItems(copy); };

  return (
    <div>
      <h3>Formation</h3>
      {items.map((it, idx) => (
        <div className="tl-card" key={idx}>
          <input placeholder="École / Université" value={it.school || ""} onChange={e=>updateItem(idx,"school",e.target.value)} />
          <input placeholder="Diplôme" value={it.degree || ""} onChange={e=>updateItem(idx,"degree",e.target.value)} />
          <input placeholder="Début" value={it.start || ""} onChange={e=>updateItem(idx,"start",e.target.value)} />
          <input placeholder="Fin" value={it.end || ""} onChange={e=>updateItem(idx,"end",e.target.value)} />
        </div>
      ))}
      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={() => onNext({ formation: items })} className="tl-btn-primary">Suivant</button>
        <button onClick={addEmpty} className="tl-btn-ghost">+ Ajouter</button>
      </div>
    </div>
  );
}
