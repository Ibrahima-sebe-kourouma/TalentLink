import React, { useEffect, useState } from "react";
import { API_PROFILE_URL } from "../../constants/api";
import "../Stepper.css";

export default function StepperRecruiter({ user }) {
  const [recruteur, setRecruteur] = useState(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setError("");
      try {
        const res = await fetch(`${API_PROFILE_URL}/recruiters/by-user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setRecruteur(data);
          setStep(data?.progression || 1);
        } else if (res.status === 404) {
          // create minimal profile
          const create = await fetch(`${API_PROFILE_URL}/recruiters/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ auth_user_id: user.id, name: user.name, prenom: user.prenom, email: user.email })
          });
          const d = await create.json();
          if (create.ok) {
            setRecruteur(d);
            setStep(d?.progression || 1);
          } else {
            setError(d?.detail || "Impossible de créer le profil recruteur");
          }
        } else {
          setError("Erreur de chargement du profil recruteur");
        }
      } catch {
        setError("Erreur de connexion");
      }
    };
    if (user?.id) loadProfile();
  }, [user?.id, user?.name, user?.prenom, user?.email]);

  const save = async (patch) => {
    if (!recruteur) return;
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`${API_PROFILE_URL}/recruiters/${recruteur.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      const d = await res.json();
      if (res.ok) {
        setRecruteur(d);
        setMessage("Enregistré");
      } else {
        setError(d?.detail || "Erreur lors de l'enregistrement");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setSaving(false);
    }
  };

  const updateProgress = async (newStep) => {
    setStep(newStep);
    if (recruteur) {
      try {
        await fetch(`${API_PROFILE_URL}/recruiters/${recruteur.id}/progression?step=${newStep}`, { method: "PATCH" });
      } catch (e) {
        // soft-fail
      }
    }
  };

  const nextStep = async () => {
    const newStep = Math.min((step || 1) + 1, 4);
    await updateProgress(newStep);
  };

  const prevStep = async () => {
    const newStep = Math.max((step || 1) - 1, 1);
    await updateProgress(newStep);
  };

  const finish = () => {
    setCompleted(true);
    setMessage("Profil recruteur complété ✅");
  };

  const stepLabels = [
    "Entreprise",
    "Coordonnées",
    "Liens",
    "Préférences"
  ];

  return (
    <div className="tl-stepper">
      <div className="tl-stepper-head">
        {stepLabels.map((label, i) => (
          <div key={i} className="tl-step">
            <div className={"tl-step-circle " + (step === i + 1 ? "active" : step > i + 1 ? "completed" : "")}>
              {i + 1}
            </div>
            <div className="tl-step-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="tl-stepper-body">
        {error && <div style={{ color: "#7f1d1d", marginBottom: 12 }}>{error}</div>}
        {message && <div style={{ color: "#065f46", marginBottom: 12 }}>{message}</div>}

        {completed && (
          <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12, marginBottom: 12 }}>
            <h4>Profil complété ✅</h4>
            <div style={{ color: "#6b7280", fontSize: 14 }}>Vos informations ont été sauvegardées avec succès.</div>
            <div className="tl-actions">
              <button className="tl-btn-secondary" onClick={() => updateProgress(1)}>Revenir au début</button>
            </div>
          </section>
        )}

        {/* Étape 1: Société */}
        {!completed && step === 1 && (
        <section className="tl-section">
          <h4>Informations sur l'entreprise</h4>
          <TextField label="Nom de l'entreprise" value={recruteur?.entreprise || ""} onCommit={v => save({ entreprise: v })} disabled={saving} />
          <TextField label="Rôle" value={recruteur?.role || ""} onCommit={v => save({ role: v })} disabled={saving} />
          <TextArea label="Description" value={recruteur?.description_entreprise || ""} onCommit={v => save({ description_entreprise: v })} disabled={saving} />
        </section>
      )}

      {/* Étape 2: Coordonnées */}
      {!completed && step === 2 && (
        <section className="tl-section">
          <h4>Coordonnées</h4>
          <TextField label="Téléphone" value={recruteur?.telephone || ""} onCommit={v => save({ telephone: v })} disabled={saving} />
          <TextField label="Adresse" value={recruteur?.adresse || ""} onCommit={v => save({ adresse: v })} disabled={saving} />
          <div style={{ display: "flex", gap: 8 }}>
            <TextField label="Ville" value={recruteur?.ville || ""} onCommit={v => save({ ville: v })} disabled={saving} />
            <TextField label="Pays" value={recruteur?.pays || ""} onCommit={v => save({ pays: v })} disabled={saving} />
            <TextField label="Code postal" value={recruteur?.code_postal || ""} onCommit={v => save({ code_postal: v })} disabled={saving} />
          </div>
        </section>
      )}

      {/* Étape 3: Liens */}
      {!completed && step === 3 && (
        <section className="tl-section">
          <h4>Liens</h4>
          <TextField label="Site web" value={recruteur?.site_web || ""} onCommit={v => save({ site_web: v })} disabled={saving} />
          <TextField label="Logo URL" value={recruteur?.logo_url || ""} onCommit={v => save({ logo_url: v })} disabled={saving} />
          <TextField label="LinkedIn" value={recruteur?.linkedin || ""} onCommit={v => save({ linkedin: v })} disabled={saving} />
          <TextField label="Twitter" value={recruteur?.twitter || ""} onCommit={v => save({ twitter: v })} disabled={saving} />
        </section>
      )}

      {/* Étape 4: Préférences */}
      {!completed && step === 4 && (
        <section className="tl-section">
          <h4>Préférences</h4>
          <TextArea label="Notes / préférences de recrutement" value={recruteur?.preferences_recrutement?.notes || ""} onCommit={v => save({ preferences_recrutement: { ...(recruteur?.preferences_recrutement || {}), notes: v } })} disabled={saving} />
          <div style={{ color: "#6b7280", fontSize: 13, marginTop: 8 }}>Astuce: nous pourrons structurer cela plus tard (domaines, contrats, remote, etc.).</div>
        </section>
      )}

      {!completed && (
        <div className="tl-actions">
          <button className="tl-btn-secondary" onClick={prevStep} disabled={saving || step <= 1}>Précédent</button>
          <div style={{ flex: 1 }} />
          {step < 4 ? (
            <button className="tl-btn-primary" onClick={nextStep} disabled={saving}>Suivant</button>
          ) : (
            <button className="tl-btn-primary" onClick={finish} disabled={saving}>Terminer</button>
          )}
        </div>
      )}
      </div>
    </div>
  );
}

function TextField({ label, value, onCommit, disabled }) {
  const [val, setVal] = React.useState(value || "");
  React.useEffect(() => {
    setVal(value || "");
  }, [value]);
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{label}</label>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onCommit && onCommit(val)}
        disabled={disabled}
        style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
      />
    </div>
  );
}

function TextArea({ label, value, onCommit, disabled }) {
  const [val, setVal] = React.useState(value || "");
  React.useEffect(() => {
    setVal(value || "");
  }, [value]);
  return (
    <div style={{ marginBottom: 8 }}>
      <label style={{ display: "block", fontSize: 14, marginBottom: 4 }}>{label}</label>
      <textarea
        rows={4}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => onCommit && onCommit(val)}
        disabled={disabled}
        style={{ width: "100%", padding: 8, border: "1px solid #d1d5db", borderRadius: 6 }}
      />
    </div>
  );
}
