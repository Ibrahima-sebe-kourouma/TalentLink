import React, { useState } from "react";
import TalentBotAdmin from "../../components/admin/TalentBot";

const adminItems = [
  { key: "dashboard", icon: "📊", label: "Tableau de bord" },
  { key: "users", icon: "👥", label: "Utilisateurs" },
  { key: "content", icon: "📝", label: "Contenu" },
  { key: "settings", icon: "⚙️", label: "Paramètres" },
];

const botItems = [
  { key: "talentbot", icon: "🤖", label: "TalentBot", disabled: false },
];

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Admin */}
      <aside style={{ 
        width: 280, 
        background: '#fff', 
        borderRight: '1px solid #e5e7eb',
        padding: '24px 0'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '20px' }}>Admin Panel</h2>
          <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            Bienvenue {user?.name || user?.email || ""}
          </div>
        </div>

        <nav style={{ padding: '0 12px' }}>
          {adminItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  margin: '4px 0',
                  border: 'none',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  color: isActive ? '#2563eb' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Séparateur pour l'IA */}
          <div style={{ 
            margin: '24px 16px 16px', 
            borderTop: '1px solid rgba(156, 163, 175, 0.3)',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#fff',
              padding: '0 12px',
              fontSize: '11px',
              color: 'rgba(107, 114, 128, 0.8)',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}>
              INTELLIGENCE ARTIFICIELLE
            </div>
          </div>

          {/* Onglet TalentBot */}
          {botItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => item.disabled ? null : setActiveTab(item.key)}
                disabled={item.disabled}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  margin: '4px 0',
                  border: 'none',
                  borderRadius: '8px',
                  background: isActive ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  color: isActive ? '#2563eb' : '#374151',
                  cursor: item.disabled ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  opacity: item.disabled ? 0.5 : 1
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
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
        </nav>
      </aside>

      {/* Contenu principal */}
      <main style={{ flex: 1, padding: '32px', background: '#f9fafb' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2>Tableau de bord administrateur</h2>
            <p>Ici vous pourrez superviser les utilisateurs, offres, statistiques, etc.</p>
            <div style={{ marginTop: 24, padding: 20, background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb' }}>
              <h3>Statistiques générales</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginTop: 16 }}>
                <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 6 }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>-</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Utilisateurs actifs</div>
                </div>
                <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 6 }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>-</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Offres publiées</div>
                </div>
                <div style={{ padding: 16, background: '#f3f4f6', borderRadius: 6 }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>-</div>
                  <div style={{ color: '#6b7280', fontSize: 14 }}>Candidatures</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h2>Gestion des utilisateurs</h2>
            <p style={{ color: '#6b7280' }}>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        )}

        {activeTab === 'content' && (
          <div>
            <h2>Gestion du contenu</h2>
            <p style={{ color: '#6b7280' }}>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h2>Paramètres système</h2>
            <p style={{ color: '#6b7280' }}>Cette fonctionnalité sera bientôt disponible</p>
          </div>
        )}

        {activeTab === 'talentbot' && (
          <TalentBotAdmin user={user} />
        )}
      </main>
    </div>
  );
}
