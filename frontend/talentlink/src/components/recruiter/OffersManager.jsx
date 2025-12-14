import React, { useEffect, useState } from "react";
import { API_OFFERS_URL, API_PROFILE_URL } from "../../constants/api";
import { ProductTour, TourHelpButton, useProductTour, offersManagerPageTour } from "../onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";

export default function OffersManager({ user }) {
  const [recruteur, setRecruteur] = useState(null);
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState({ titre: "", description: "", type_contrat: "CDI", localisation: "", domaine: "", remote: false, salaire_min: "", salaire_max: "", nb_postes: 1, places_restantes: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Edition dans un modal
  const [editOpen, setEditOpen] = useState(false);
  const [editOffer, setEditOffer] = useState(null);
  const [editForm, setEditForm] = useState({ 
    titre: "", 
    description: "", 
    type_contrat: "CDI", 
    localisation: "", 
    domaine: "", 
    remote: false, 
    salaire_min: "", 
    salaire_max: "", 
    nb_postes: 1,
    places_restantes: 1,
    mots_cles: "",
    experience_requise: "",
    education_requise: "",
    date_expiration: ""
  });

  // Tour guidé
  const { isReady, run, tourSteps, startTour, handleTourComplete } = useProductTour(
    'offers_manager_page',
    offersManagerPageTour,
    user?.id,
    true
  );

  const entreprise = recruteur?.entreprise || "";

  useEffect(() => {
    const loadRecruiter = async () => {
      try {
        const r = await fetch(`${API_PROFILE_URL}/recruiters/by-user/${user.id}`);
        if (r.ok) setRecruteur(await r.json());
      } catch {}
    };
    if (user?.id) loadRecruiter();
  }, [user?.id]);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      setError("");
      try {
        // statut vide => récupère toutes les offres; filtrage côté client par entreprise
        const res = await fetch(`${API_OFFERS_URL}/offers?statut=`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        setOffers(entreprise ? arr.filter(o => (o.entreprise || "").toLowerCase() === entreprise.toLowerCase()) : arr);
      } catch (e) {
        setError("Erreur de chargement des offres");
      } finally {
        setLoading(false);
      }
    };
    if (entreprise) fetchOffers();
  }, [entreprise]);

  const refreshOffers = async () => {
    try {
      const ref = await fetch(`${API_OFFERS_URL}/offers?statut=`);
      const data = await ref.json();
      const arr = Array.isArray(data) ? data : [];
      setOffers(entreprise ? arr.filter(o => (o.entreprise || "").toLowerCase() === entreprise.toLowerCase()) : arr);
    } catch {}
  };

  const handleCreate = async () => {
    setError("");
    if (!entreprise) {
      setError("Renseignez d'abord le nom de l'entreprise dans votre profil recruteur");
      return;
    }
    try {
  const payload = { ...form, salaire_min: form.salaire_min ? parseInt(form.salaire_min, 10) : null, salaire_max: form.salaire_max ? parseInt(form.salaire_max, 10) : null, entreprise, recruiter_user_id: user.id, mots_cles: undefined };
      const res = await fetch(`${API_OFFERS_URL}/offers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (res.ok) {
        setForm({ titre: "", description: "", type_contrat: "CDI", localisation: "", domaine: "", remote: false, salaire_min: "", salaire_max: "", nb_postes: 1, places_restantes: 1 });
        // refresh list after create
        refreshOffers();
      } else {
        setError(d?.detail || "Erreur lors de la création de l'offre");
      }
    } catch {
      setError("Erreur réseau");
    }
  };

  const changeStatus = async (id, action) => {
    try {
      const res = await fetch(`${API_OFFERS_URL}/offers/${id}/${action}?recruiter_user_id=${user.id}`, { method: "PATCH" });
      if (res.ok) {
        // refresh list
        // re-fetch using current entreprise filter
        refreshOffers();
      }
    } catch {}
  };

  const removeOffer = async (id) => {
    try {
      const res = await fetch(`${API_OFFERS_URL}/offers/${id}?recruiter_user_id=${user.id}`, { method: "DELETE" });
      if (res.ok) {
        refreshOffers();
      }
    } catch {}
  };

  // Ouvrir le modal d'édition avec une offre existante
  const openEdit = (offer) => {
    setEditOffer(offer);
    const motsClesStr = Array.isArray(offer.mots_cles) ? offer.mots_cles.join(", ") : "";
    const dateExp = offer.date_expiration ? new Date(offer.date_expiration).toISOString().split('T')[0] : "";
    setEditForm({
      titre: offer.titre || "",
      description: offer.description || "",
      type_contrat: offer.type_contrat || "CDI",
      localisation: offer.localisation || "",
      domaine: offer.domaine || "",
      remote: !!offer.remote,
      salaire_min: offer.salaire_min ?? "",
      salaire_max: offer.salaire_max ?? "",
      nb_postes: offer.nb_postes ?? 1,
      places_restantes: offer.places_restantes ?? (offer.nb_postes ?? 1),
      mots_cles: motsClesStr,
      experience_requise: offer.experience_requise || "",
      education_requise: offer.education_requise || "",
      date_expiration: dateExp,
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditOffer(null);
  };

  // Enregistrer les modifications (PUT /offers/{id})
  const saveEdit = async () => {
    if (!editOffer) return;
    setError("");
    try {
      // Construire un payload minimal: n'envoyer que les champs modifiés
      const changes = {};
      const original = editOffer;
      const toNum = (v) => (v === "" || v === null || v === undefined ? undefined : parseInt(v, 10));

      if ((editForm.titre || "") !== (original.titre || "")) changes.titre = editForm.titre || "";
      if ((editForm.description || "") !== (original.description || "")) changes.description = editForm.description || "";
      if ((editForm.type_contrat || "") !== (original.type_contrat || "")) changes.type_contrat = editForm.type_contrat;
      if ((editForm.localisation || "") !== (original.localisation || "")) changes.localisation = editForm.localisation || "";
      if ((editForm.domaine || "") !== (original.domaine || "")) changes.domaine = editForm.domaine || "";
      if (Boolean(editForm.remote) !== Boolean(original.remote)) changes.remote = Boolean(editForm.remote);
      
      const sm = toNum(editForm.salaire_min);
      const smOrig = original.salaire_min ?? undefined;
      if (sm !== smOrig) changes.salaire_min = sm;
      const sM = toNum(editForm.salaire_max);
      const sMOrig = original.salaire_max ?? undefined;
      if (sM !== sMOrig) changes.salaire_max = sM;
      if ((Number(editForm.nb_postes) || 1) !== (Number(original.nb_postes) || 1)) changes.nb_postes = Number(editForm.nb_postes) || 1;
      if ((Number(editForm.places_restantes) || 0) !== (Number(original.places_restantes) || 0)) changes.places_restantes = Number(editForm.places_restantes) || 0;

      // Mots-clés: comparer string vs array
      const newMotsCles = editForm.mots_cles.trim() ? editForm.mots_cles.split(',').map(k => k.trim()).filter(k => k) : [];
      const origMotsCles = Array.isArray(original.mots_cles) ? original.mots_cles : [];
      if (JSON.stringify(newMotsCles) !== JSON.stringify(origMotsCles)) changes.mots_cles = newMotsCles;

      if ((editForm.experience_requise || "") !== (original.experience_requise || "")) changes.experience_requise = editForm.experience_requise || "";
      if ((editForm.education_requise || "") !== (original.education_requise || "")) changes.education_requise = editForm.education_requise || "";
      
      // Date expiration
      const newDateExp = editForm.date_expiration ? new Date(editForm.date_expiration).toISOString() : null;
      const origDateExp = original.date_expiration ? new Date(original.date_expiration).toISOString() : null;
      if (newDateExp !== origDateExp) changes.date_expiration = newDateExp;

      // Si aucun changement détecté
      if (Object.keys(changes).length === 0) {
        setEditOpen(false);
        return;
      }

      const res = await fetch(`${API_OFFERS_URL}/offers/${editOffer.id}?recruiter_user_id=${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d?.detail || "Erreur lors de la mise à jour de l'offre");
        return;
      }
      closeEdit();
      refreshOffers();
    } catch (e) {
      setError("Erreur réseau");
    }
  };

  return (
    <div>
      {isReady && (
        <>
          <ProductTour steps={tourSteps} tourKey="offers_manager_page" userId={user?.id} onComplete={handleTourComplete} run={run} />
          <TourHelpButton onClick={startTour} isFirstVisit={isFirstVisit(user?.id)} />
        </>
      )}
      <h3>Mes offres</h3>
      {error && <div style={{ color: "#7f1d1d" }}>{error}</div>}

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 12 }}>
        <h4>Créer une offre</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
          <Input label="Titre" value={form.titre} onChange={(v) => setForm({ ...form, titre: v })} />
          <Select label="Type de contrat" value={form.type_contrat} onChange={(v) => setForm({ ...form, type_contrat: v })} options={["CDI","CDD","STAGE","FREELANCE","ALTERNANCE"]} />
          <Input label="Localisation" value={form.localisation} onChange={(v) => setForm({ ...form, localisation: v })} />
          <Input label="Domaine" value={form.domaine} onChange={(v) => setForm({ ...form, domaine: v })} />
          <Input label="Salaire min (CAD$)" type="number" value={form.salaire_min} onChange={(v) => setForm({ ...form, salaire_min: v })} />
          <Input label="Salaire max (CAD$)" type="number" value={form.salaire_max} onChange={(v) => setForm({ ...form, salaire_max: v })} />
          <Input label="Nombre total de postes" type="number" value={form.nb_postes} onChange={(v) => setForm({ ...form, nb_postes: parseInt(v || 1, 10), places_restantes: parseInt(v || 1, 10) })} />
          <Input label="Places disponibles" type="number" value={form.places_restantes} onChange={(v) => setForm({ ...form, places_restantes: parseInt(v || 1, 10) })} />
          <Checkbox label="Télétravail" checked={form.remote} onChange={(v) => setForm({ ...form, remote: v })} />
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Description</label>
          <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />
        </div>
        <button onClick={handleCreate} style={{ marginTop: 8 }}>Créer</button>
      </section>

      <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
        <h4>Liste de mes offres {entreprise && `(entreprise: ${entreprise})`}</h4>
        {loading && <div>Chargement...</div>}
        <div style={{ display: "grid", gap: 8 }}>
          {offers.map(o => (
            <div key={o.id} style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div onClick={() => openEdit(o)} style={{ cursor: "pointer" }} title="Cliquer pour modifier">
                  <div style={{ fontWeight: 600 }}>{o.titre}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>
                    {o.type_contrat} • {o.localisation || "Localisation"} • {o.statut} • {o.places_restantes || 0}/{o.nb_postes || 1} places
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {o.statut !== 'published' && <button onClick={(e) => { e.stopPropagation(); changeStatus(o.id, 'publish'); }}>Publier</button>}
                  {o.statut !== 'closed' && <button onClick={(e) => { e.stopPropagation(); changeStatus(o.id, 'close'); }}>Clore</button>}
                  <button onClick={(e) => { e.stopPropagation(); removeOffer(o.id); }} style={{ color: '#b91c1c', borderColor: '#b91c1c' }}>Supprimer</button>
                </div>
              </div>
            </div>
          ))}
          {offers.length === 0 && !loading && <div>Aucune offre pour le moment.</div>}
        </div>
      </section>

      {editOpen && (
        <EditModal
          form={editForm}
          setForm={setEditForm}
          onCancel={closeEdit}
          onSave={saveEdit}
          entreprise={entreprise}
        />
      )}
    </div>
  );
}

function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }} />
    </div>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <div>
      <label style={{ display: "block", marginBottom: 4 }}>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

function EditModal({ form, setForm, onCancel, onSave, entreprise }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, overflowY: 'auto', padding: '20px 0' }}>
      <div style={{ width: 'min(900px, 95vw)', background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', margin: 'auto' }}>
        <div style={{ padding: 16, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0 }}>Modifier l'offre</h3>
          <button onClick={onCancel} aria-label="Fermer" style={{ background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>
        <div style={{ padding: 16, maxHeight: '70vh', overflowY: 'auto' }}>
          <div style={{ marginBottom: 12, color: '#6b7280' }}>Entreprise: <strong>{entreprise || '—'}</strong></div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Input label="Titre" value={form.titre} onChange={(v) => setForm({ ...form, titre: v })} />
            <Select label="Type de contrat" value={form.type_contrat} onChange={(v) => setForm({ ...form, type_contrat: v })} options={["CDI","CDD","STAGE","FREELANCE","ALTERNANCE"]} />
            <Input label="Localisation" value={form.localisation} onChange={(v) => setForm({ ...form, localisation: v })} />
            <Input label="Domaine" value={form.domaine} onChange={(v) => setForm({ ...form, domaine: v })} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, marginBottom: 12 }}>
            <Input label="Salaire min (CAD$)" type="number" value={form.salaire_min} onChange={(v) => setForm({ ...form, salaire_min: v })} />
            <Input label="Salaire max (CAD$)" type="number" value={form.salaire_max} onChange={(v) => setForm({ ...form, salaire_max: v })} />
            <Input label="Nombre total de postes" type="number" value={form.nb_postes} onChange={(v) => setForm({ ...form, nb_postes: parseInt(v || 1, 10) })} />
            <Input label="Places restantes" type="number" value={form.places_restantes} onChange={(v) => setForm({ ...form, places_restantes: parseInt(v || 0, 10) })} />
            <Input label="Date d'expiration" type="date" value={form.date_expiration} onChange={(v) => setForm({ ...form, date_expiration: v })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Checkbox label="Télétravail possible" checked={form.remote} onChange={(v) => setForm({ ...form, remote: v })} />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Description</label>
            <textarea 
              rows={6} 
              value={form.description} 
              onChange={(e) => setForm({ ...form, description: e.target.value })} 
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }} 
              placeholder="Décrivez l'offre en détails..."
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Mots-clés</label>
            <input 
              type="text" 
              value={form.mots_cles} 
              onChange={(e) => setForm({ ...form, mots_cles: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
              placeholder="Ex: React, Python, Docker (séparés par des virgules)"
            />
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Séparez les mots-clés par des virgules</div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Expérience requise</label>
            <input 
              type="text" 
              value={form.experience_requise} 
              onChange={(e) => setForm({ ...form, experience_requise: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
              placeholder="Ex: 2-5 ans d'expérience en développement web"
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', marginBottom: 4, fontWeight: 600 }}>Formation requise</label>
            <input 
              type="text" 
              value={form.education_requise} 
              onChange={(e) => setForm({ ...form, education_requise: e.target.value })}
              style={{ width: '100%', padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14 }}
              placeholder="Ex: Bac+3/5 en informatique ou équivalent"
            />
          </div>
        </div>
        <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onCancel} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #d1d5db', borderRadius: 8, cursor: 'pointer' }}>Annuler</button>
          <button onClick={onSave} className="tl-btn-primary" style={{ padding: '10px 20px' }}>Enregistrer</button>
        </div>
      </div>
    </div>
  );
}
