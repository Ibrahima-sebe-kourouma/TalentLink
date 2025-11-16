import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AccountSettings from "../components/AccountSettings";
import OffersBrowser from "../components/offers/OffersBrowser";
import MyApplications from "../components/offers/MyApplications";
import CandidateDashboard from "../modules/candidate/Dashboard";
import CandidateMessaging from "../components/candidate/Messaging";
import StepperProfile from "../components/StepperProfile";
import TalentBotCandidate from "../components/candidate/TalentBot";
import "../components/ProfilePage.css";
import { API_PROFILE_URL } from "../constants/api";

export default function ProfilePage({ user, onLogout }) {
  const [candidat, setCandidat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState("profil");
  const [preview, setPreview] = useState({ open: false, url: "", title: "" });
  const location = useLocation();
  const navigate = useNavigate();

  // Synchroniser l'onglet actif avec le paramètre d'URL ?tab=
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");
    const allowed = new Set(["profil", "dashboard", "annonces", "update", "messages", "candidatures", "compte", "talentbot"]);
    if (tab && allowed.has(tab)) {
      setActiveMenu(tab);
    }
  }, [location.search]);

  // Enveloppe qui met aussi à jour le paramètre ?tab=
  const handleSetActiveMenu = (menu) => {
    setActiveMenu(menu);
    const params = new URLSearchParams(location.search);
    params.set("tab", menu);
    navigate({ search: params.toString() }, { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_PROFILE_URL}/candidates/by-user/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          if (mounted) setCandidat(data);
        } else {
          if (mounted) setCandidat(null);
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
        if (mounted) setCandidat(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [user]);

  if (!user) {
    return <div className="p-6">Vous devez être connecté pour voir votre profil.</div>;
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
  <Sidebar user={user} activeMenu={activeMenu} setActiveMenu={handleSetActiveMenu} onLogout={onLogout} />
      <main style={{ flex: 1, padding: 24, background: "#f4f7fb" }}>
        <h1 style={{ marginBottom: 12 }}>Mon Espace</h1>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          {/* La suppression de compte est gérée exclusivement dans l'onglet "Gestion du compte" */}

          {activeMenu === "profil" && (
            <div className="tl-cv-container">
              <div className="cv-card">
                <header className="cv-header">
                  <div>
                    <h2>{user?.prenom ? `${user.prenom} ${user.name || ""}` : user?.email}</h2>
                    <div className="cv-contact">{user?.email}</div>
                  </div>
                </header>

                <section className="cv-section">
                  <h3>Résumé</h3>
                  <p>{candidat?.resume_professionnel || "Aucun résumé fourni."}</p>
                </section>

                <section className="cv-section">
                  <h3>Expériences</h3>
                  {candidat?.experience && candidat.experience.length > 0 ? (
                    candidat.experience.map((exp, i) => (
                      <div key={i} className="cv-item">
                        <strong>{exp.title || exp.poste || "Intitulé"}</strong>
                        <div className="cv-sub">{exp.company || exp.entreprise} — {exp.start_date || ""} to {exp.end_date || ""}</div>
                        <div>{exp.description}</div>
                      </div>
                    ))
                  ) : (
                    <div className="cv-item">Aucune expérience enregistrée.</div>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Formations</h3>
                  {candidat?.formation && candidat.formation.length > 0 ? (
                    candidat.formation.map((f, i) => (
                      <div key={i} className="cv-item">
                        <strong>{f.degree || f.diplome || f.title || "Formation"}</strong>
                        <div className="cv-sub">{f.institution || f.school || ""} — {f.start_date || ""} to {f.end_date || ""}</div>
                        <div>{f.description || ""}</div>
                      </div>
                    ))
                  ) : (
                    <div className="cv-item">Aucune formation enregistrée.</div>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Compétences</h3>
                  {candidat?.competences && candidat.competences.length > 0 ? (
                    <ul className="cv-list">
                      {candidat.competences.map((c, i) => (
                        <li key={i}>{c.name || c.nom} {c.level ? `— ${c.level}` : ""}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="cv-item">Aucune compétence enregistrée.</div>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Langues</h3>
                  {candidat?.langues && candidat.langues.length > 0 ? (
                    <ul className="cv-list">
                      {candidat.langues.map((l, i) => (
                        <li key={i}>{typeof l === 'string' ? l : `${l.langue || l.name} ${l.niveau ? `— ${l.niveau}` : ""}`}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="cv-item">Aucune langue enregistrée.</div>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Certifications</h3>
                  {candidat?.certifications && candidat.certifications.length > 0 ? (
                    <ul className="cv-list">
                      {candidat.certifications.map((cert, i) => (
                        <li key={i}>{cert.nom || cert.name} {cert.organisme ? `— ${cert.organisme}` : ""}</li>
                      ))}
                    </ul>
                  ) : (
                    <div className="cv-item">Aucune certification enregistrée.</div>
                  )}
                </section>

                <section className="cv-section">
                  <h3>Documents</h3>
                  <div className="cv-item" style={{ display: 'grid', gap: 8 }}>
                    <div>
                      <strong>Mon CV:</strong>
                      {candidat?.cv ? (
                        <span style={{ marginLeft: 8 }}>
                          {candidat.cv.split('/').pop()}
                          <button
                            onClick={() => window.open(`${API_PROFILE_URL}/candidates/${candidat.id}/download-cv`, '_blank')}
                            className="tl-btn-secondary"
                            style={{ marginLeft: 10 }}
                          >
                            Télécharger CV
                          </button>
                          {String(candidat.cv).toLowerCase().endsWith('.pdf') && (
                            <button
                              onClick={() => setPreview({ open: true, url: `${API_PROFILE_URL}/candidates/${candidat.id}/download-cv?inline=1`, title: 'Aperçu CV' })}
                              className="tl-btn-secondary"
                              style={{ marginLeft: 8 }}
                            >
                              Aperçu
                            </button>
                          )}
                        </span>
                      ) : (
                        <span style={{ marginLeft: 8, color: '#6b7280' }}>Non fourni</span>
                      )}
                    </div>

                    <div>
                      <strong>Lettre de motivation:</strong>
                      {candidat?.lettre_motivation ? (
                        <span style={{ marginLeft: 8 }}>
                          {candidat.lettre_motivation.split('/').pop()}
                          <button
                            onClick={() => window.open(`${API_PROFILE_URL}/candidates/${candidat.id}/download-cover-letter`, '_blank')}
                            className="tl-btn-secondary"
                            style={{ marginLeft: 10 }}
                          >
                            Télécharger Lettre
                          </button>
                          {String(candidat.lettre_motivation).toLowerCase().endsWith('.pdf') && (
                            <button
                              onClick={() => setPreview({ open: true, url: `${API_PROFILE_URL}/candidates/${candidat.id}/download-cover-letter?inline=1`, title: 'Aperçu Lettre' })}
                              className="tl-btn-secondary"
                              style={{ marginLeft: 8 }}
                            >
                              Aperçu
                            </button>
                          )}
                        </span>
                      ) : (
                        <span style={{ marginLeft: 8, color: '#6b7280' }}>Non fournie</span>
                      )}
                    </div>

                    <div>
                      <button
                        className="tl-btn-primary"
                        onClick={() => setActiveMenu('update')}
                        style={{ marginTop: 6 }}
                      >
                        Mettre à jour mes documents
                      </button>
                    </div>
                  </div>
                </section>

              </div>
            </div>
          )}

          {activeMenu === "update" && (
            <div>
              <StepperProfile candidat={candidat} user={user} onCandidatChange={setCandidat} />
            </div>
          )}

          {/* Placeholder content for other tabs (except 'compte' which has its own component) */}
          {activeMenu === 'dashboard' && (
            <CandidateDashboard user={user} />
          )}

          {activeMenu === 'annonces' && (
            <OffersBrowser user={user} candidat={candidat} />
          )}

          {activeMenu === 'messages' && (
            <CandidateMessaging user={user} />
          )}

          {activeMenu === 'candidatures' && (
            <MyApplications user={user} />
          )}

          {activeMenu === 'compte' && (
            <AccountSettings user={user} onLogout={onLogout} />
          )}

          {activeMenu === 'talentbot' && (
            <TalentBotCandidate user={user} />
          )}
        </div>
      </main>
      {preview.open && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 0, width: '90%', height: '85%', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ fontWeight: 600 }}>{preview.title}</div>
              <button onClick={() => setPreview({ open: false, url: '', title: '' })} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <iframe title={preview.title} src={preview.url} style={{ width: '100%', height: 'calc(100% - 44px)', border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}
