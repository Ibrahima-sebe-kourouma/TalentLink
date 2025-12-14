import React, { useEffect, useState } from "react";
import { API_OFFERS_URL, API_REPORT_URL } from "../../constants/api";
import { ProductTour, TourHelpButton, useProductTour, offersPageTour } from "../onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";
import "../../styles/offers.css";

export default function OffersBrowser({ user, candidat }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState(null);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyStatus, setApplyStatus] = useState({ ok: null, msg: "" });
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState({ ok: null, msg: "" });

  // Tour
  const { run, startTour, handleTourComplete, isReady } = useProductTour(
    'offers_page',
    offersPageTour,
    user?.id,
    true
  );

  const refresh = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const url = `${API_OFFERS_URL}/offers?statut=published&sort_by=date&order=desc`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur lors du chargement des offres");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setOffers(arr);
      setSelected(prev => (prev && !arr.some(o => o.id === prev.id)) ? null : prev);
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger toutes les offres publiées au démarrage
  useEffect(() => { refresh(); }, [refresh]);

  const handleApply = async () => {
    if (!selected) return;
    setApplyStatus({ ok: null, msg: "" });
    try {
      const res = await fetch(`${API_OFFERS_URL}/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offre_id: selected.id,
          auth_user_id: user.id,
          candidat_id: candidat?.id || null,
          message_motivation: applyMessage || null,
          cv_url: null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApplyStatus({ ok: true, msg: "Candidature envoyée avec succès" });
        setApplyMessage("");
      } else {
        setApplyStatus({ ok: false, msg: data?.detail || "Impossible de postuler" });
      }
    } catch (e) {
      setApplyStatus({ ok: false, msg: "Erreur de connexion" });
    }
  };

  const handleReportOffer = async () => {
    if (!selected || !reportReason.trim()) {
      alert("Veuillez sélectionner une raison");
      return;
    }
    setReportStatus({ ok: null, msg: "" });
    try {
      const res = await fetch(`${API_REPORT_URL}/reports/?user_id=${user.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reported_type: "offer",
          reported_id: String(selected.id),
          reason: reportReason,
          description: reportDescription.trim() || null
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReportStatus({ ok: true, msg: "Signalement envoyé avec succès" });
        setTimeout(() => {
          setShowReportModal(false);
          setReportReason("");
          setReportDescription("");
          setReportStatus({ ok: null, msg: "" });
        }, 2000);
      } else {
        setReportStatus({ ok: false, msg: data?.detail || "Erreur lors du signalement" });
      }
    } catch (e) {
      setReportStatus({ ok: false, msg: "Erreur de connexion" });
    }
  };

  // Filtres (tous optionnels)
  const [domaine, setDomaine] = useState("");
  const [localisation, setLocalisation] = useState("");
  const [motsCles, setMotsCles] = useState("");
  const [typeContrat, setTypeContrat] = useState("");
  
  // Tri
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");

  const applyFilters = async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      params.set("statut", "published");
      params.set("sort_by", sortBy);
      params.set("order", order);
      if (domaine.trim()) params.set("domaine", domaine.trim());
      if (localisation.trim()) params.set("localisation", localisation.trim());
      if (typeContrat) params.set("type_contrat", typeContrat);
      if (motsCles.trim()) params.set("q", motsCles.trim()); // mots-clés via q (titre/desc/mots_cles)
      const url = `${API_OFFERS_URL}/offers?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Erreur lors du chargement des offres");
      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      setOffers(arr);
      setSelected(prev => (prev && !arr.some(o => o.id === prev.id)) ? null : prev);
    } catch (e) {
      setError(e.message || "Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = async () => {
    setDomaine("");
    setLocalisation("");
    setMotsCles("");
    setTypeContrat("");
    setSortBy("date");
    setOrder("desc");
    await refresh();
  };

  return (
    <div className="offers-browser">
      {isReady && (
        <>
          <ProductTour steps={offersPageTour} tourKey="offers_page" userId={user?.id} onComplete={handleTourComplete} run={run} />
          <TourHelpButton onClick={startTour} isFirstVisit={isFirstVisit(user?.id)} />
        </>
      )}
      <h2>Annonces d'emploi</h2>

      {/* Barre de filtres */}
      <div className="offers-filters">
        <div className="offers-filter-item">
          <label>Domaine</label>
          <input value={domaine} onChange={e => setDomaine(e.target.value)} placeholder="ex: Informatique" />
        </div>
        <div className="offers-filter-item">
          <label>Localisation</label>
          <input value={localisation} onChange={e => setLocalisation(e.target.value)} placeholder="ex: Paris" />
        </div>
        <div className="offers-filter-item">
          <label>Mots-clés</label>
          <input value={motsCles} onChange={e => setMotsCles(e.target.value)} placeholder="ex: React, Python" />
        </div>
        <div className="offers-filter-item">
          <label>Type de contrat</label>
          <select value={typeContrat} onChange={e => setTypeContrat(e.target.value)}>
            <option value="">Tous</option>
            <option value="CDI">CDI</option>
            <option value="CDD">CDD</option>
            <option value="STAGE">STAGE</option>
            <option value="FREELANCE">FREELANCE</option>
            <option value="ALTERNANCE">ALTERNANCE</option>
          </select>
        </div>
        <div className="offers-filter-actions">
          <button onClick={applyFilters} className="btn-search">Rechercher</button>
          <button onClick={clearFilters} className="btn-clear">Effacer</button>
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 32, fontSize: 16, color: "var(--tl-text-muted)" }}>Chargement des offres...</div>}
      {error && <div style={{ color: "#7f1d1d", padding: 14, background: "#fef2f2", borderRadius: 8, marginBottom: 16, fontSize: 15 }}>{error}</div>}

      {/* Barre de tri */}
      <div className="offers-sort-bar">
        <div className="offers-count">
          {offers.length} offre{offers.length > 1 ? "s" : ""} publiée{offers.length > 1 ? "s" : ""}
        </div>
        <div className="offers-sort">
          <label>Trier par:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="date">Date de publication</option>
            <option value="salaire">Salaire</option>
            <option value="localisation">Localisation</option>
          </select>
          <select value={order} onChange={e => setOrder(e.target.value)}>
            <option value="desc">Décroissant</option>
            <option value="asc">Croissant</option>
          </select>
          <button onClick={applyFilters}>Appliquer</button>
        </div>
      </div>

      <div className={selected ? "offers-grid with-detail" : "offers-grid"}>
        {/* Liste des offres */}
        <div className={selected ? "offers-list scrollable" : "offers-list"}>
          {offers.length === 0 && !loading && (
            <div className="offers-empty">
              <div className="offers-empty-icon">🔍</div>
              <div className="offers-empty-text">Aucune offre publiée pour le moment.</div>
              <button onClick={refresh}>Recharger</button>
            </div>
          )}
          
          {offers.map((o) => (
            <div 
              key={o.id} 
              className={selected?.id === o.id ? "offer-card selected" : "offer-card"}
              onClick={() => setSelected(o)}
            >
              <div className="offer-card-header">
                <div className="offer-card-content">
                  <h3 className="offer-title">{o.titre}</h3>
                  <div className="offer-company">{o.entreprise || "Entreprise"}</div>
                  <div className="offer-location">📍 {o.localisation || "Localisation non spécifiée"}</div>
                  <div className="offer-meta">
                    <span className="offer-meta-item">{o.type_contrat}</span>
                    {o.remote && <span className="offer-meta-item">🏠 Remote</span>}
                    {o.salaire_min && (
                      <span className="offer-meta-item">
                        💰 {o.salaire_min.toLocaleString()} {o.salaire_max && `- ${o.salaire_max.toLocaleString()}`} CAD$
                      </span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelected(o); }}
                  className="offer-btn-view"
                >
                  Voir
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Détail de l'offre */}
        {selected && (
          <div className="offer-detail">
            <div className="offer-detail-header">
              <h3 className="offer-detail-title">{selected.titre}</h3>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="offer-btn-report"
                  style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
                  title="Signaler cette offre"
                >
                  🚩 Signaler
                </button>
                <button 
                  onClick={() => setSelected(null)}
                  className="offer-detail-close"
                  aria-label="Fermer"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="offer-detail-company">
              🏢 {selected.entreprise || "Entreprise"} • 📍 {selected.localisation || "Localisation"}
            </div>
            
            <div className="offer-badges">
              <span className="offer-badge contract">{selected.type_contrat}</span>
              {selected.remote && <span className="offer-badge remote">🏠 Remote</span>}
              {selected.domaine && <span className="offer-badge domain">{selected.domaine}</span>}
            </div>

            {(selected.salaire_min || selected.salaire_max) && (
              <div className="offer-section">
                <div className="offer-section-title">Salaire</div>
                <div className="offer-salary">
                  {selected.salaire_min?.toLocaleString() || "—"} {selected.salaire_max && `- ${selected.salaire_max.toLocaleString()}`} CAD$ /an
                </div>
              </div>
            )}

            <div className="offer-section">
              <div className="offer-section-title">Description</div>
              <p className="offer-description">{selected.description}</p>
            </div>

            {Array.isArray(selected.mots_cles) && selected.mots_cles.length > 0 && (
              <div className="offer-section">
                <div className="offer-section-title">Mots-clés</div>
                <div className="offer-keywords">
                  {selected.mots_cles.map((k, i) => (
                    <span key={i} className="offer-keyword">{k}</span>
                  ))}
                </div>
              </div>
            )}

            {selected.experience_requise && (
              <div className="offer-section">
                <div className="offer-section-title">Expérience requise</div>
                <div>{selected.experience_requise}</div>
              </div>
            )}

            {selected.education_requise && (
              <div className="offer-section">
                <div className="offer-section-title">Formation requise</div>
                <div>{selected.education_requise}</div>
              </div>
            )}

            {/* Affichage des places disponibles */}
            <div className="offer-section">
              <div className="offer-section-title">Places disponibles</div>
              <div className="offer-places-info">
                <span className={`offer-places ${selected.places_restantes <= 0 ? 'full' : selected.places_restantes <= 2 ? 'low' : 'available'}`}>
                  {selected.places_restantes > 0 
                    ? `${selected.places_restantes} place${selected.places_restantes > 1 ? 's' : ''} disponible${selected.places_restantes > 1 ? 's' : ''} sur ${selected.nb_postes} poste${selected.nb_postes > 1 ? 's' : ''}`
                    : `Aucune place disponible sur ${selected.nb_postes} poste${selected.nb_postes > 1 ? 's' : ''}`
                  }
                </span>
                {selected.places_restantes <= 0 && (
                  <span className="offer-closed-badge">🚫 Offre complète</span>
                )}
              </div>
            </div>

            <div className="offer-apply">
              <h4>Postuler à cette offre</h4>
              {!candidat && (
                <div className="offer-apply-warning">
                  <span>⚠️</span>
                  <span>Votre profil candidat est introuvable. Veuillez compléter votre profil avant de postuler.</span>
                </div>
              )}
              {selected.places_restantes <= 0 && (
                <div className="offer-apply-warning">
                  <span>🚫</span>
                  <span>Cette offre n'accepte plus de candidatures car toutes les places sont prises.</span>
                </div>
              )}
              <textarea
                rows={4}
                placeholder="Message de motivation (optionnel)"
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
                disabled={selected.places_restantes <= 0}
              />
              <button 
                disabled={!candidat || selected.places_restantes <= 0} 
                onClick={handleApply}
                className={candidat && selected.places_restantes > 0 ? "offer-apply-btn enabled" : "offer-apply-btn"}
              >
                {!candidat 
                  ? "Profil requis" 
                  : selected.places_restantes <= 0 
                    ? "Plus de places disponibles"
                    : "📤 Envoyer ma candidature"
                }
              </button>
              {applyStatus.msg && (
                <div className={applyStatus.ok ? "offer-apply-status success" : "offer-apply-status error"}>
                  {applyStatus.msg}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de signalement */}
      {showReportModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: '12px', padding: '24px', width: '90%', maxWidth: '500px', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>🚩 Signaler cette offre</h3>
              <button onClick={() => { setShowReportModal(false); setReportStatus({ ok: null, msg: "" }); }} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Raison du signalement *</label>
              <select 
                value={reportReason} 
                onChange={(e) => setReportReason(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px' }}
              >
                <option value="">-- Sélectionnez une raison --</option>
                <option value="Contenu inapproprié">Contenu inapproprié</option>
                <option value="Fausse offre">Fausse offre</option>
                <option value="Discrimination">Discrimination</option>
                <option value="Salaire trompeur">Salaire trompeur</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description (optionnel)</label>
              <textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Donnez plus de détails sur votre signalement..."
                rows={4}
                style={{ width: '100%', padding: '10px', border: '1px solid #d1d5db', borderRadius: '6px', resize: 'vertical' }}
              />
            </div>
            {reportStatus.msg && (
              <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '16px', background: reportStatus.ok ? '#d1fae5' : '#fee2e2', color: reportStatus.ok ? '#065f46' : '#7f1d1d' }}>
                {reportStatus.msg}
              </div>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => { setShowReportModal(false); setReportStatus({ ok: null, msg: "" }); }}
                style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '6px', background: 'white', cursor: 'pointer' }}
              >
                Annuler
              </button>
              <button 
                onClick={handleReportOffer}
                disabled={!reportReason.trim()}
                style={{ padding: '10px 20px', border: 'none', borderRadius: '6px', background: '#ef4444', color: 'white', cursor: reportReason.trim() ? 'pointer' : 'not-allowed', opacity: reportReason.trim() ? 1 : 0.5 }}
              >
                Envoyer le signalement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
