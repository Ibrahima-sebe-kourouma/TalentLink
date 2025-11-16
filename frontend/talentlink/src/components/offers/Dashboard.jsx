import React, { useEffect, useState } from "react";
import { API_OFFERS_URL } from "../../constants/api";
import { formatStatus, statusStyle, formatDate } from "../../utils/format";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [offersById, setOffersById] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const [s, r] = await Promise.all([
          fetch(`${API_OFFERS_URL}/applications/stats/by-user?user_id=${user.id}`),
          fetch(`${API_OFFERS_URL}/applications?user_id=${user.id}`),
        ]);
        const sJson = await s.json();
        const rJson = await r.json();
        if (s.ok) setStats(sJson);
        else setError(sJson?.detail || "Erreur stats");
        if (r.ok) setRecent(Array.isArray(rJson) ? rJson.slice(0, 5) : []);
      } catch (e) {
        setError("Erreur de connexion");
      }
    };
    load();
  }, [user.id]);

  // Charger les offres liées aux candidatures récentes pour afficher titres/entreprises
  useEffect(() => {
    const ids = Array.from(new Set(recent.map(a => a.offre_id))).filter(id => !offersById[id]);
    if (ids.length === 0) return;
    const run = async () => {
      const entries = await Promise.all(ids.map(async (id) => {
        try {
          const r = await fetch(`${API_OFFERS_URL}/offers/${id}`);
          if (!r.ok) return [id, null];
          const d = await r.json();
          return [id, d];
        } catch {
          return [id, null];
        }
      }));
      const map = { ...offersById };
      entries.forEach(([id, d]) => { map[id] = d; });
      setOffersById(map);
    };
    run();
  }, [recent, offersById]);


  return (
    <div style={{ padding: 16 }}>
      <h2>Tableau de bord</h2>
      {error && <div style={{ color: "#7f1d1d" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 16 }}>
        <StatCard label="Total" value={stats?.total ?? "-"} />
        <StatCard label="Soumises" value={stats?.submitted ?? 0} />
        <StatCard label="En revue" value={stats?.in_review ?? 0} />
        <StatCard label="Entretiens" value={stats?.interview ?? 0} />
        <StatCard label="Offres" value={stats?.offered ?? 0} />
        <StatCard label="Refusées" value={stats?.rejected ?? 0} />
      </div>

      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
        <h3 style={{ marginTop: 0 }}>Dernières candidatures</h3>
        {recent.length === 0 && <div>Aucune activité récente.</div>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {recent.map((a) => {
            const off = offersById[a.offre_id];
            const titre = off?.titre || `Offre ${a.offre_id}`;
            const ent = off?.entreprise || "Entreprise";
            const statut = formatStatus(a.statut);
            const date = formatDate(a.date_candidature);
            return (
              <li key={a.id} style={{ marginBottom: 6 }}>
                {titre} • {ent} • <span style={statusStyle(a.statut)}>{statut}</span> • {date}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
      <div style={{ color: "#6b7280", fontSize: 14 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
