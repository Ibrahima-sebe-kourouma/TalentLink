import React, { useState } from "react";

export default function Step4Competences({ data = {}, onNext, onPrev }) {
  const [skills, setSkills] = useState(data.competences || []);

  const add = () => setSkills([...skills, { name: "", level: "" }]);
  const update = (i, k, v) => { const c=[...skills]; c[i][k]=v; setSkills(c); };

  return (
    <div>
      <h3>Compétences</h3>
      {skills.map((s, i) => (
        <div className="tl-inline" key={i}>
          <input placeholder="Nom compétence" value={s.name} onChange={e=>update(i,"name",e.target.value)} />
          <input placeholder="Niveau (ex: Débutant)" value={s.level} onChange={e=>update(i,"level",e.target.value)} />
        </div>
      ))}
      <div className="tl-actions">
        <button onClick={onPrev} className="tl-btn-secondary">Précédent</button>
        <button onClick={() => onNext({ competences: skills })} className="tl-btn-primary">Suivant</button>
        <button onClick={add} className="tl-btn-ghost">+ Ajouter</button>
      </div>
    </div>
  );
}
