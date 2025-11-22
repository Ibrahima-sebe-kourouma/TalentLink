import React from "react";
import "./ProfilePage.css";
import "../styles/nav.css";

const menuItems = [
  { key: "profil", icon: "🧑", label: "Profil" },
  { key: "dashboard", icon: "📊", label: "Tableau de bord" },
  { key: "annonces", icon: "💼", label: "Annonces" },
  { key: "update", icon: "📝", label: "Mettre à jour" },
  { key: "messages", icon: "💬", label: "Messagerie" },
  { key: "candidatures", icon: "📂", label: "Mes candidatures" },
  { key: "rendezvous", icon: "📅", label: "Rendez-vous" },
  { key: "signalements", icon: "🚩", label: "Mes Signalements" },
  { key: "compte", icon: "⚙️", label: "Compte" },
];

const botItems = [
  { key: "talentbot", icon: "🤖", label: "TalentBot", disabled: false },
];

export default function Sidebar({ user, activeMenu, setActiveMenu, onLogout }) {
  const activeIndex = Math.max(0, menuItems.findIndex(m => m.key === activeMenu));
  return (
    <aside className="tl-sidebar-modern">
      <div className="tl-header">
        <h2 style={{ marginBottom: 6 }}>TalentLink</h2>
        <div className="tl-user">
          <strong>{user?.prenom || user?.name || user?.email}</strong>
          <div className="tl-email">{user?.email}</div>
        </div>
      </div>

      <nav className="nav-modern">
        <div className="nav-list">
          {/* Active indicator */}
          <div
            className="active-indicator"
            style={{ transform: `translateY(${activeIndex * 44}px)` }}
            aria-hidden
          />
          {menuItems.map((item) => {
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                className={"nav-item " + (isActive ? "active" : "")}
                onClick={() => setActiveMenu(item.key)}
              >
                <span className="nav-icon" aria-hidden>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </button>
            );
          })}
          
          {/* Séparateur pour l'IA */}
          <div style={{ 
            margin: '16px 0 12px', 
            borderTop: '1px solid rgba(156, 163, 175, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'var(--tl-surface)',
              padding: '0 12px',
              fontSize: '12px',
              color: 'rgba(107, 114, 128, 0.8)',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}>
              INTELLIGENCE ARTIFICIELLE
            </div>
          </div>
          
          {/* Onglet TalentBot */}
          {botItems.map((item) => {
            const isActive = activeMenu === item.key;
            return (
              <button
                key={item.key}
                className={"nav-item " + (isActive ? "active" : "") + (item.disabled ? " disabled" : "")}
                onClick={() => item.disabled ? null : setActiveMenu(item.key)}
                disabled={item.disabled}
                style={{
                  opacity: item.disabled ? 0.5 : 1,
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  position: 'relative'
                }}
              >
                <span className="nav-icon" aria-hidden>{item.icon}</span>
                <span className="nav-label">{item.label}</span>
                {item.disabled && (
                  <span style={{
                    fontSize: '10px',
                    background: 'rgba(156, 163, 175, 0.2)',
                    color: 'rgba(107, 114, 128, 0.8)',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    marginLeft: 'auto',
                    fontWeight: 500
                  }}>
                    Bientôt
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="tl-footer" style={{ marginTop: 16 }}>
        <button className="tl-logout" onClick={onLogout}>🚪 Déconnexion</button>
      </div>
    </aside>
  );
}
