import React, { useEffect, useMemo, useState } from "react";
import { API_OFFERS_URL } from "../../constants/api";
import { formatStatus, statusStyle, formatDate } from "../../utils/format";

const statusOptions = [
  { value: "", label: "Tous" },
  { value: "submitted", label: "Soumise" },
  { value: "in_review", label: "En revue" },
  { value: "interview", label: "Entretien" },
  { value: "offered", label: "Offre" },
  { value: "rejected", label: "Refusée" },
  { value: "withdrawn", label: "Retirée" },
];

export default function MyApplications({ user }) {
  const [statut, setStatut] = useState("");
  const [apps, setApps] = useState([]);
  const [offersById, setOffersById] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [withdrawModal, setWithdrawModal] = useState({ open: false, appId: null, reason: "" });

  const params = useMemo(() => {
    const p = new URLSearchParams();
    p.set("user_id", user.id);
    if (statut) p.set("statut", statut);
    return p.toString();
  }, [user.id, statut]);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_OFFERS_URL}/applications?${params}`);
      if (!res.ok) throw new Error("Erreur lors du chargement des candidatures");
      const data = await res.json();
      setApps(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${API_OFFERS_URL}/applications?${params}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des candidatures");
        const data = await res.json();
        setApps(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [params]);

  useEffect(() => {
    // fetch missing offers details for labels
    const missing = new Set();
    apps.forEach(a => { if (!offersById[a.offre_id]) missing.add(a.offre_id); });
    if (missing.size === 0) return;

    const fetchMissing = async () => {
      const entries = await Promise.all(
        Array.from(missing).map(async (id) => {
          try {
            const r = await fetch(`${API_OFFERS_URL}/offers/${id}`);
            if (!r.ok) return [id, null];
            const d = await r.json();
            return [id, d];
          } catch {
            return [id, null];
          }
        })
      );
      const map = { ...offersById };
      entries.forEach(([id, d]) => { map[id] = d; });
      setOffersById(map);
    };
    fetchMissing();
  }, [apps, offersById]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Mes candidatures</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <select value={statut} onChange={(e) => setStatut(e.target.value)}>
          {statusOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
  <button onClick={refresh}>Rafraîchir</button>
      </div>

      {loading && <div>Chargement...</div>}
      {error && <div style={{ color: "#7f1d1d" }}>{error}</div>}

      {apps.length === 0 && !loading && <div>Aucune candidature pour le moment.</div>}

      <div style={{ display: "grid", gap: 8 }}>
        {apps.map((a) => {
          const off = offersById[a.offre_id];
          const canWithdraw = a.statut !== "withdrawn" && a.statut !== "rejected";
          
          const onWithdraw = () => {
            setWithdrawModal({ open: true, appId: a.id, reason: "" });
          };

          const onDelete = async () => {
            const ok = window.confirm("Supprimer cette candidature ? Cette action est irréversible.");
            if (!ok) return;
            try {
              const res = await fetch(`${API_OFFERS_URL}/applications/${a.id}?user_id=${user.id}`, { method: 'DELETE' });
              if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.detail || "Suppression impossible");
              }
              setApps(prev => prev.filter(x => x.id !== a.id));
            } catch (e) {
              alert(e.message || "Erreur lors de la suppression");
            }
          };
          
          return (
            <div key={a.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{off?.titre || `Offre #${a.offre_id}`}</div>
                  <div style={{ color: "#6b7280", fontSize: 14 }}>{off?.entreprise || "Entreprise"} • {off?.localisation || "Localisation"}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={statusStyle(a.statut)}>{formatStatus(a.statut)}</span>
                  {canWithdraw && (
                    <button onClick={onWithdraw} style={{ padding: '6px 10px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>↩️ Retirer</button>
                  )}
                  <button onClick={onDelete} style={{ padding: '6px 10px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>🗑️ Supprimer</button>
                </div>
              </div>
              <div style={{ marginTop: 8, color: "#4b5563", fontSize: 14 }}>Candidaté le {formatDate(a.date_candidature)}</div>
              {a.message_motivation && (
                <div style={{ marginTop: 6 }}>
                  <strong>Message:</strong> {a.message_motivation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de retrait avec raison */}
      {withdrawModal.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, width: '90%', maxWidth: 500, boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ marginTop: 0 }}>Retirer ma candidature</h3>
            <p style={{ color: '#6b7280', lineHeight: 1.6 }}>
              Vous êtes sur le point de retirer votre candidature. Le recruteur sera informé de ce retrait.
              Vous pouvez optionnellement indiquer une raison (visible pour le recruteur).
            </p>
            <textarea
              placeholder="Raison du retrait (optionnel)..."
              value={withdrawModal.reason}
              onChange={(e) => setWithdrawModal(prev => ({ ...prev, reason: e.target.value }))}
              style={{ width: '100%', minHeight: 80, padding: 10, border: '1px solid #d1d5db', borderRadius: 6, fontSize: 14, fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button
                onClick={() => setWithdrawModal({ open: false, appId: null, reason: "" })}
                style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: 6, cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  const { appId, reason } = withdrawModal;
                  try {
                    const params = new URLSearchParams({ user_id: user.id });
                    if (reason) params.set('reason', reason);
                    const res = await fetch(`${API_OFFERS_URL}/applications/${appId}/withdraw?${params.toString()}`, { method: 'PATCH' });
                    if (!res.ok) {
                      const j = await res.json().catch(() => ({}));
                      throw new Error(j.detail || "Retrait impossible");
                    }
                    const updated = await res.json();
                    setApps(prev => prev.map(x => x.id === appId ? updated : x));
                    setWithdrawModal({ open: false, appId: null, reason: "" });
                  } catch (e) {
                    alert(e.message || "Erreur lors du retrait");
                  }
                }}
                style={{ padding: '8px 16px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              >
                Confirmer le retrait
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
