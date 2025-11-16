import React, { useState, useEffect } from "react";

export default function Step1InfoPerso({ data = {}, onNext }) {
  const [form, setForm] = useState({
    name: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    code_postal: "",
  });

  // 🔹 Met à jour les champs quand "data" change (profil chargé)
  useEffect(() => {
    if (data) {
      setForm({
        name: data.name || "",
        prenom: data.prenom || "",
        email: data.email || "",
        telephone: data.telephone || "",
        adresse: data.adresse || "",
        ville: data.ville || "",
        pays: data.pays || "",
        code_postal: data.code_postal || "",
      });
    }
  }, [data]);

  const change = (k, v) => setForm({ ...form, [k]: v });

  const handleSubmit = () => {
    // tu peux valider ici si besoin (email, champs obligatoires, etc.)
    onNext(form);
  };

  return (
    <div>
      <h3>Informations personnelles</h3>
      <div className="tl-grid">
        <input
          placeholder="Prénom"
          value={form.prenom}
          onChange={(e) => change("prenom", e.target.value)}
        />
        <input
          placeholder="Nom"
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
        />
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => change("email", e.target.value)}
        />
        <input
          placeholder="Téléphone"
          value={form.telephone}
          onChange={(e) => change("telephone", e.target.value)}
        />
        <input
          placeholder="Adresse"
          value={form.adresse}
          onChange={(e) => change("adresse", e.target.value)}
        />
        <input
          placeholder="Ville"
          value={form.ville}
          onChange={(e) => change("ville", e.target.value)}
        />
        <input
          placeholder="Pays"
          value={form.pays}
          onChange={(e) => change("pays", e.target.value)}
        />
        <input
          placeholder="Code postal"
          value={form.code_postal}
          onChange={(e) => change("code_postal", e.target.value)}
        />
      </div>

      <div className="tl-actions">
        <button className="tl-btn-primary" onClick={handleSubmit}>
          Suivant
        </button>
      </div>
    </div>
  );
}
