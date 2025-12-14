import React, { useEffect, useState } from "react";
import { API_OFFERS_URL, API_PROFILE_URL, API_AUTH_URL, API_MESSAGING_URL } from "../../constants/api";
import { formatDate, formatStatus, statusStyle } from "../../utils/format";
import { ProductTour, TourHelpButton, useProductTour, applicationsRecruiterPageTour } from "../onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";

export default function Applications({ user }) {
  const [recruteur, setRecruteur] = useState(null);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [apps, setApps] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [namesByAppId, setNamesByAppId] = useState({});
  const [error, setError] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [docPreview, setDocPreview] = useState({ open: false, url: '', title: '' });

  // Filtres et tri
  const [statusFilter, setStatusFilter] = useState('');
  const [searchFilter, setSearchFilter] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  // Tour guidé
  const { isReady, run, tourSteps, startTour, handleTourComplete } = useProductTour(
    'applications_recruiter_page',
    applicationsRecruiterPageTour,
    user?.id,
    true
  );

  const entreprise = recruteur?.entreprise || "";

  useEffect(() => {
    const load = async () => {
      setError("");
      try {
        const r = await fetch(`${API_PROFILE_URL}/recruiters/by-user/${user.id}`);
        if (r.ok) {
          const d = await r.json();
          setRecruteur(d);
        } else if (r.status === 404) {
          setRecruteur(null);
        } else {
          setError("Erreur lors du chargement du profil recruteur");
        }
      } catch (e) {
        setError("Erreur de connexion");
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const res = await fetch(`${API_OFFERS_URL}/offers?statut=`);
        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        const mine = entreprise ? arr.filter(o => (o.entreprise || "").toLowerCase() === entreprise.toLowerCase()) : arr;
        setOffers(mine);
        if (!selectedOffer && mine.length > 0) setSelectedOffer(mine[0]);
      } catch (e) {
        setError("Erreur lors du chargement des offres");
      }
    };
    if (entreprise) fetchOffers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entreprise]);

  useEffect(() => {
    const fetchApps = async () => {
      if (!selectedOffer) return;
      try {
        const res = await fetch(`${API_OFFERS_URL}/applications?offre_id=${selectedOffer.id}`);
        const data = await res.json();
        setApps(Array.isArray(data) ? data : []);
      } catch (e) {
        setError("Erreur lors du chargement des candidatures");
      }
    };
    fetchApps();
  }, [selectedOffer]);

  // Récupérer et mettre en cache les noms des candidats pour les listes
  useEffect(() => {
    const missing = apps.filter(a => !namesByAppId[a.id]);
    if (missing.length === 0) return;

    const run = async () => {
      const updates = {};
      for (const a of missing) {
        let label = '';
        try {
          if (a.candidat_id) {
            const r = await fetch(`${API_PROFILE_URL}/candidates/${a.candidat_id}`);
            if (r.ok) {
              const d = await r.json();
              const nom = [d.prenom, d.name].filter(Boolean).join(' ').trim();
              label = nom || label;
            }
          }
          if (!label && a.auth_user_id) {
            const r2 = await fetch(`${API_AUTH_URL}/auth/users/${a.auth_user_id}`);
            if (r2.ok) {
              const u = await r2.json();
              const nom = [u.prenom, u.name].filter(Boolean).join(' ').trim();
              label = nom || (u.email || 'Utilisateur');
            }
          }
        } catch {}
        updates[a.id] = label || `Candidat ${a.id}`;
      }
      setNamesByAppId(prev => ({ ...prev, ...updates }));
    };
    run();
  }, [apps, namesByAppId]);

  // Filtrage et tri des candidatures
  React.useEffect(() => {
    let result = [...apps];

    // Filtrage par statut
    if (statusFilter) {
      result = result.filter(app => app.statut === statusFilter);
    }

    // Filtrage par recherche (nom du candidat)
    if (searchFilter.trim()) {
      const search = searchFilter.toLowerCase();
      result = result.filter(app => {
        const name = namesByAppId[app.id] || '';
        return name.toLowerCase().includes(search);
      });
    }

    // Tri
    result.sort((a, b) => {
      let compareA, compareB;
      
      switch (sortBy) {
        case 'date':
          compareA = new Date(a.date_candidature);
          compareB = new Date(b.date_candidature);
          break;
        case 'status':
          compareA = a.statut;
          compareB = b.statut;
          break;
        case 'candidate':
          compareA = namesByAppId[a.id] || '';
          compareB = namesByAppId[b.id] || '';
          break;
        default:
          compareA = a.id;
          compareB = b.id;
      }

      if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
      if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredApps(result);
  }, [apps, statusFilter, searchFilter, sortBy, sortOrder, namesByAppId]);

  const setStatus = async (appId, statut) => {
    try {
      const res = await fetch(`${API_OFFERS_URL}/applications/${appId}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ statut })
      });
      if (res.ok) {
        // refresh
        const updated = apps.map(a => a.id === appId ? { ...a, statut } : a);
        setApps(updated);
      }
    } catch {}
  };

  const viewCandidateProfile = async (app) => {
    setSelectedCandidate(app);
    setLoadingProfile(true);
    setCandidateProfile(null);
    try {
      // Tenter de charger le profil candidat via candidat_id
      if (app.candidat_id) {
        const res = await fetch(`${API_PROFILE_URL}/candidates/${app.candidat_id}`);
        if (res.ok) {
          const data = await res.json();
          // fallback: si nom/prenom manquent dans le profil, tenter depuis le service d'auth
          if ((!data?.name || !data?.prenom) && app.auth_user_id) {
            try {
              const r2 = await fetch(`${API_AUTH_URL}/auth/users/${app.auth_user_id}`);
              if (r2.ok) {
                const u = await r2.json();
                data.name = data.name || u?.name || null;
                data.prenom = data.prenom || u?.prenom || null;
              }
            } catch {}
          }
          setCandidateProfile(data);
          // Enregistrer la vue du profil par le recruteur (tracking)
          try {
            await fetch(`${API_PROFILE_URL}/candidates/${data.id}/profile-views?recruiter_auth_user_id=${user.id}` , {
              method: 'POST'
            });
          } catch (_) {
            // ignorer les erreurs de tracking pour ne pas gêner l'UX
          }
        } else {
          setCandidateProfile({ error: "Profil candidat non trouvé" });
        }
      } else {
        setCandidateProfile({ error: "Aucun profil candidat lié à cette candidature" });
      }
    } catch (e) {
      setCandidateProfile({ error: "Erreur lors du chargement du profil" });
    } finally {
      setLoadingProfile(false);
    }
  };

  const closeCandidateView = () => {
    setSelectedCandidate(null);
    setCandidateProfile(null);
  };

  const startConversation = async (candidateUserId, applicationId, offerId) => {
    try {
      // Create or get conversation
      const res = await fetch(`${API_MESSAGING_URL}/conversations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidate_user_id: candidateUserId,
          recruiter_user_id: user.id,
          application_id: applicationId,
          offer_id: offerId
        })
      });
      if (res.ok) {
        closeCandidateView();
        alert("Conversation créée ! Allez dans l'onglet Messagerie pour communiquer.");
      } else {
        alert("Le service de messagerie n'est pas encore disponible. Cette fonctionnalité sera activée prochainement.");
      }
    } catch (e) {
      alert("Le service de messagerie n'est pas encore disponible. Cette fonctionnalité sera activée prochainement.");
    }
  };

  return (
    <>
    <div>
      {isReady && (
        <>
          <ProductTour steps={tourSteps} tourKey="applications_recruiter_page" userId={user?.id} onComplete={handleTourComplete} run={run} />
          <TourHelpButton onClick={startTour} isFirstVisit={isFirstVisit(user?.id)} />
        </>
      )}
      <h3>Candidatures reçues</h3>
      {error && <div style={{ color: '#7f1d1d' }}>{error}</div>}

      {/* Modal de profil candidat */}
      {selectedCandidate && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 24, maxWidth: 800, maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
            <button onClick={closeCandidateView} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', fontSize: 24, cursor: 'pointer', color: '#6b7280' }}>✕</button>
            
            <h2 style={{ marginTop: 0 }}>Profil du candidat</h2>
            <div style={{ margin: '8px 0 16px', padding: 12, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: 8, fontSize: 14 }}>
              Pour protéger la vie privée du candidat, seules les informations d'identité (Nom, Prénom) sont visibles. Pour entrer en contact, utilisez le service de messagerie intégré (bientôt disponible).
            </div>
            
            {loadingProfile && <div>Chargement du profil...</div>}
            
            {candidateProfile?.error && (
              <div style={{ color: '#7f1d1d', padding: 12, background: '#fef2f2', borderRadius: 6 }}>
                {candidateProfile.error}
              </div>
            )}
            
            {candidateProfile && !candidateProfile.error && (
              <div>
                <section style={{ marginBottom: 20 }}>
                  <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Identité</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
                    <div><strong>Nom:</strong> {candidateProfile.name || "—"}</div>
                    <div><strong>Prénom:</strong> {candidateProfile.prenom || "—"}</div>
                  </div>
                </section>

                {candidateProfile.resume_professionnel && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Résumé professionnel</h3>
                    <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{candidateProfile.resume_professionnel}</p>
                  </section>
                )}

                {candidateProfile.experience && candidateProfile.experience.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Expériences</h3>
                    {candidateProfile.experience.map((exp, i) => (
                      <div key={i} style={{ marginBottom: 12, padding: 12, background: '#f9fafb', borderRadius: 6 }}>
                        <div style={{ fontWeight: 600 }}>{exp.title || exp.poste || "Poste"}</div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>{exp.company || exp.entreprise} • {exp.start_date || ""} - {exp.end_date || "Présent"}</div>
                        {exp.description && <div style={{ marginTop: 6 }}>{exp.description}</div>}
                      </div>
                    ))}
                  </section>
                )}

                {candidateProfile.formation && candidateProfile.formation.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Formations</h3>
                    {candidateProfile.formation.map((f, i) => (
                      <div key={i} style={{ marginBottom: 12, padding: 12, background: '#f9fafb', borderRadius: 6 }}>
                        <div style={{ fontWeight: 600 }}>{f.degree || f.diplome || f.title || "Formation"}</div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>{f.institution || f.school || ""} • {f.start_date || ""} - {f.end_date || ""}</div>
                        {f.description && <div style={{ marginTop: 6 }}>{f.description}</div>}
                      </div>
                    ))}
                  </section>
                )}

                {candidateProfile.competences && candidateProfile.competences.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Compétences</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {candidateProfile.competences.map((c, i) => (
                        <span key={i} style={{ padding: '6px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: 6, fontSize: 14 }}>
                          {c.name || c.nom} {c.level && `(${c.level})`}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {candidateProfile.langues && candidateProfile.langues.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Langues</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {candidateProfile.langues.map((l, i) => (
                        <span key={i} style={{ padding: '6px 12px', background: '#d1fae5', color: '#065f46', borderRadius: 6, fontSize: 14 }}>
                          {typeof l === 'string' ? l : `${l.langue || l.name} ${l.niveau ? `(${l.niveau})` : ""}`}
                        </span>
                      ))}
                    </div>
                  </section>
                )}

                {candidateProfile.certifications && candidateProfile.certifications.length > 0 && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Certifications</h3>
                    <ul style={{ paddingLeft: 20 }}>
                      {candidateProfile.certifications.map((cert, i) => (
                        <li key={i}>{cert.nom || cert.name} {cert.organisme && `— ${cert.organisme}`}</li>
                      ))}
                    </ul>
                  </section>
                )}

                {(candidateProfile.cv || candidateProfile.lettre_motivation) && (
                  <section style={{ marginBottom: 20 }}>
                    <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: 8 }}>Documents</h3>
                    {candidateProfile.cv ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <div>CV: <strong>{String(candidateProfile.cv).split('/').pop()}</strong></div>
                        <button
                          onClick={() => window.open(`${API_PROFILE_URL}/candidates/${candidateProfile.id}/download-cv`, '_blank')}
                          style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                        >
                          Télécharger CV
                        </button>
                        {String(candidateProfile.cv).toLowerCase().endsWith('.pdf') && (
                          <button
                            onClick={() => setDocPreview({ open: true, url: `${API_PROFILE_URL}/candidates/${candidateProfile.id}/download-cv?inline=1`, title: 'Aperçu CV' })}
                            style={{ padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                          >
                            Aperçu
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#6b7280' }}>CV: non fourni</div>
                    )}

                    {candidateProfile.lettre_motivation ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div>Lettre: <strong>{String(candidateProfile.lettre_motivation).split('/').pop()}</strong></div>
                        <button
                          onClick={() => window.open(`${API_PROFILE_URL}/candidates/${candidateProfile.id}/download-cover-letter`, '_blank')}
                          style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                        >
                          Télécharger Lettre
                        </button>
                        {String(candidateProfile.lettre_motivation).toLowerCase().endsWith('.pdf') && (
                          <button
                            onClick={() => setDocPreview({ open: true, url: `${API_PROFILE_URL}/candidates/${candidateProfile.id}/download-cover-letter?inline=1`, title: 'Aperçu Lettre' })}
                            style={{ padding: '6px 12px', background: '#111827', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                          >
                            Aperçu
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ color: '#6b7280' }}>Lettre de motivation: non fournie</div>
                    )}
                  </section>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
                  <button 
                    onClick={() => startConversation(selectedCandidate.auth_user_id, selectedCandidate.id, selectedCandidate.offre_id)}
                    style={{ padding: '8px 12px', borderRadius: 6, border: 'none', background: 'var(--tl-primary-500)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
                  >
                    💬 Démarrer une conversation
                  </button>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 300 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Mes offres</div>
          <div style={{ display: 'grid', gap: 6 }}>
            {offers.map(o => (
              <div key={o.id} onClick={() => setSelectedOffer(o)} style={{ padding: 8, border: '1px solid #e5e7eb', borderRadius: 6, cursor: 'pointer', background: selectedOffer?.id === o.id ? '#eff6ff' : '#fff' }}>
                {o.titre}
              </div>
            ))}
            {offers.length === 0 && <div>Aucune offre</div>}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {!selectedOffer && <div>Sélectionnez une offre pour voir les candidatures.</div>}
          {selectedOffer && (
            <div>
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 18 }}>Offre: {selectedOffer.titre}</div>
              
              {/* Filtres et tri */}
              <div style={{ 
                background: '#f8fafc', 
                padding: 16, 
                borderRadius: 8, 
                marginBottom: 16, 
                border: '1px solid #e2e8f0',
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: 12 
              }}>
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>🔍 Rechercher candidat</label>
                  <input
                    type="text"
                    placeholder="Nom du candidat..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>📊 Statut</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="">Tous les statuts</option>
                    <option value="submitted">Soumise</option>
                    <option value="in_review">En revue</option>
                    <option value="interview">Entretien</option>
                    <option value="offered">Offre</option>
                    <option value="rejected">Refusée</option>
                    <option value="withdrawn">Retirée</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>🔄 Trier par</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="date">Date de candidature</option>
                    <option value="status">Statut</option>
                    <option value="candidate">Nom du candidat</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ display: 'block', marginBottom: 4, fontSize: 14, fontWeight: 500 }}>↕️ Ordre</label>
                  <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '8px 12px', 
                      border: '1px solid #d1d5db', 
                      borderRadius: 6,
                      fontSize: 14
                    }}
                  >
                    <option value="desc">Décroissant</option>
                    <option value="asc">Croissant</option>
                  </select>
                </div>
              </div>

              {/* Compteur de résultats */}
              <div style={{ marginBottom: 12, color: '#6b7280', fontSize: 14 }}>
                {filteredApps.length} candidature{filteredApps.length > 1 ? 's' : ''} 
                {apps.length !== filteredApps.length && ` sur ${apps.length} total${apps.length > 1 ? 'es' : ''}`}
              </div>
              
              {filteredApps.length === 0 && apps.length > 0 && (
                <div style={{ 
                  padding: 20, 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  background: '#f9fafb', 
                  borderRadius: 8,
                  border: '1px solid #e5e7eb' 
                }}>
                  Aucune candidature ne correspond aux filtres sélectionnés.
                </div>
              )}
              
              {apps.length === 0 && (
                <div style={{ 
                  padding: 20, 
                  textAlign: 'center', 
                  color: '#6b7280', 
                  background: '#f9fafb', 
                  borderRadius: 8,
                  border: '1px solid #e5e7eb' 
                }}>
                  Aucune candidature pour cette offre.
                </div>
              )}
              
              <div style={{ display: 'grid', gap: 8 }}>
                {filteredApps.map(a => (
                  <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div><strong>Candidature #{a.id}</strong></div>
                        <div style={{ color: '#6b7280', fontSize: 14 }}>Candidat: {namesByAppId[a.id] || '—'} • {formatDate(a.date_candidature)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button 
                          onClick={() => viewCandidateProfile(a)}
                          style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}
                        >
                          👤 Voir profil
                        </button>
                        <span style={{ marginRight: 8 }}>
                          <span style={statusStyle(a.statut)}>{formatStatus(a.statut)}</span>
                        </span>
                        <select value={a.statut} onChange={(e) => setStatus(a.id, e.target.value)} style={{ padding: '6px 8px', border: '1px solid #d1d5db', borderRadius: 6 }}>
                          <option value="submitted">Soumise</option>
                          <option value="in_review">En revue</option>
                          <option value="interview">Entretien</option>
                          <option value="offered">Offre</option>
                          <option value="rejected">Refusée</option>
                          <option value="withdrawn">Retirée</option>
                        </select>
                      </div>
                    </div>
                    {a.message_motivation && (
                      <div style={{ marginTop: 6 }}>
                        <strong>Message:</strong> {a.message_motivation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    {docPreview.open && (
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
        <div style={{ background: '#fff', borderRadius: 12, padding: 0, width: '90%', height: '85%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #e5e7eb' }}>
            <div style={{ fontWeight: 600 }}>{docPreview.title}</div>
            <button onClick={() => setDocPreview({ open: false, url: '', title: '' })} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
          </div>
          <iframe title={docPreview.title} src={docPreview.url} style={{ width: '100%', height: 'calc(100% - 44px)', border: 'none' }} />
        </div>
      </div>
    )}
  </>
  );
}
