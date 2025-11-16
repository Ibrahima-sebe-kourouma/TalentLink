import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import UserManagement from "./UserManagement";
import ReportManagement from "./ReportManagement";
import { API_AUTH_URL } from "../../constants/api";
import "../../styles/dashboard.css";

export default function AdminPanel({ user }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({});
  const navigate = useNavigate();

  // Vérifier les permissions admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    
    // Charger les statistiques pour les badges
    fetchQuickStats();
  }, [user, navigate]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchQuickStats = async () => {
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Erreur chargement stats:", e);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <h2>Accès refusé</h2>
        <p>Seuls les administrateurs peuvent accéder à cette section.</p>
      </div>
    );
  }

  const tabs = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: '📊',
      component: <Dashboard user={user} />,
      description: 'Vue d\'ensemble de la plateforme'
    },
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: '👥',
      component: <UserManagement user={user} />,
      description: 'Gestion des comptes utilisateurs',
      badge: (stats.users?.suspended || 0) + (stats.users?.banned || 0)
    },
    {
      id: 'reports',
      label: 'Signalements',
      icon: '🚨',
      component: <ReportManagement user={user} />,
      description: 'Modération des contenus signalés',
      badge: stats.reports?.pending || 0
    }
  ];

  const currentTab = tabs.find(tab => tab.id === activeTab);

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb' }}>
      {/* Header administrateur */}
      <div style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
        color: 'white',
        padding: '16px 24px',
        borderBottom: '1px solid #374151'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, marginBottom: 4, fontSize: 24, fontWeight: 700 }}>
              🛡️ Administration TalentLink
            </h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: 14 }}>
              Panneau de contrôle administrateur
            </p>
          </div>
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)',
            border: '2px solid #ef4444',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600
          }}>
            ADMIN • {user.nom} {user.prenom}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex' }}>
        {/* Sidebar navigation */}
        <div style={{
          width: 280,
          background: 'white',
          borderRight: '1px solid #e5e7eb',
          minHeight: 'calc(100vh - 80px)',
          padding: 0
        }}>
          {/* Navigation */}
          <div style={{ padding: 16 }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              fontSize: 14, 
              fontWeight: 600, 
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Navigation
            </h3>
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  marginBottom: 4,
                  background: activeTab === tab.id ? '#f3f4f6' : 'transparent',
                  border: activeTab === tab.id ? '1px solid #d1d5db' : '1px solid transparent',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: activeTab === tab.id ? 600 : 400,
                  color: activeTab === tab.id ? '#111827' : '#6b7280',
                  transition: 'all 0.2s',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) {
                    e.target.style.background = 'transparent';
                  }
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 16 }}>{tab.icon}</span>
                  <div>
                    <div style={{ fontWeight: activeTab === tab.id ? 600 : 400 }}>
                      {tab.label}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                      {tab.description}
                    </div>
                  </div>
                </div>
                
                {tab.badge > 0 && (
                  <span style={{
                    background: '#ef4444',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 10,
                    minWidth: 16,
                    textAlign: 'center'
                  }}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Statistiques rapides */}
          <div style={{ padding: 16, borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Statistiques rapides
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>Utilisateurs totaux</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{stats.users?.total || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>Utilisateurs actifs</span>
                <span style={{ fontWeight: 600, color: '#16a34a' }}>{stats.users?.active || 0}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>Signalements en attente</span>
                <span style={{ 
                  fontWeight: 600, 
                  color: (stats.reports?.pending || 0) > 0 ? '#dc2626' : '#6b7280'
                }}>
                  {stats.reports?.pending || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                <span style={{ color: '#6b7280' }}>Nouveaux ce mois</span>
                <span style={{ fontWeight: 600, color: '#111827' }}>{stats.users?.new_this_month || 0}</span>
              </div>
            </div>
          </div>

          {/* Actions rapides */}
          <div style={{ padding: 16, borderTop: '1px solid #e5e7eb' }}>
            <h4 style={{ 
              margin: '0 0 12px 0', 
              fontSize: 12, 
              fontWeight: 600, 
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Actions rapides
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                onClick={() => fetchQuickStats()}
                style={{
                  width: '100%',
                  padding: 8,
                  background: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 12,
                  color: '#374151'
                }}
              >
                🔄 Actualiser les données
              </button>
              
              {stats.reports?.pending > 0 && (
                <button
                  onClick={() => setActiveTab('reports')}
                  style={{
                    width: '100%',
                    padding: 8,
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12,
                    color: 'white',
                    fontWeight: 600
                  }}
                >
                  🚨 {stats.reports.pending} signalement(s) à traiter
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div style={{ 
          flex: 1, 
          padding: 24,
          background: '#f9fafb',
          minHeight: 'calc(100vh - 80px)',
          overflow: 'auto'
        }}>
          {currentTab && currentTab.component}
        </div>
      </div>
    </div>
  );
}