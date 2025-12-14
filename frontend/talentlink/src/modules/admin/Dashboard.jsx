import React, { useState, useEffect } from "react";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import SignalementsAdmin from "../../components/admin/SignalementsAdmin";
import UserManagement from "../../components/admin/UserManagement";
import ContentManagement from "../../components/admin/ContentManagement";
import Settings from "../../components/admin/Settings";
import { ProductTour, TourHelpButton, useProductTour, adminDashboardTour } from "../../components/onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";
import "../../styles/dashboard.css";

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const API_AUTH = 'http://localhost:8001';
const API_REPORT = 'http://localhost:8007';

const adminItems = [
  { key: "dashboard", icon: "📊", label: "Tableau de bord" },
  { key: "users", icon: "👥", label: "Utilisateurs" },
  { key: "reports", icon: "🛡️", label: "Signalements" },
  { key: "content", icon: "📝", label: "Contenu" },
  { key: "settings", icon: "⚙️", label: "Paramètres" },
];

export default function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Configuration du tour
  const userId = user?.id;
  const { run, startTour, handleTourComplete, isReady } = useProductTour(
    'admin_dashboard',
    adminDashboardTour,
    userId,
    true
  );

  // Charger les statistiques
  useEffect(() => {
    if (user?.id) {
      fetchStatistics();
      fetchRecentReports();
      fetchAuditLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchStatistics = async () => {
    try {
      // Utiliser l'endpoint public pour éviter les problèmes d'auth
      const response = await fetch(`${API_AUTH}/admin/stats/public`);
      
      console.log('📊 Statistics Response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Statistics Data:', data);
        setStats(data);
      } else {
        const error = await response.text();
        console.error('❌ Statistics Error:', response.status, error);
      }
    } catch (error) {
      console.error('❌ Erreur chargement statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentReports = async () => {
    try {
      const response = await fetch(`${API_REPORT}/reports/admin/all?admin_user_id=${user.id}&limit=5`);
      if (response.ok) {
        const data = await response.json();
        setRecentReports(data);
      }
    } catch (error) {
      console.error('Erreur chargement signalements:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      // Utiliser l'endpoint public
      const response = await fetch(`${API_AUTH}/admin/audit-logs/public?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setAuditLogs(data);
      }
    } catch (error) {
      console.error('Erreur chargement audit logs:', error);
    }
  };

  // Données pour les graphiques
  const getUsersChartData = () => {
    if (!stats?.users?.per_day) return null;
    
    const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Nouveaux utilisateurs',
          data: stats.users.per_day,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
        },
      ],
    };
  };

  const getReportsChartData = () => {
    if (!stats?.reports) return null;
    
    return {
      labels: ['En attente', 'En révision', 'Résolus', 'Rejetés'],
      datasets: [
        {
          label: 'Signalements',
          data: [
            stats.reports.pending || 0,
            stats.reports.under_review || 0,
            stats.reports.resolved || 0,
            stats.reports.dismissed || 0
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(249, 115, 22, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(156, 163, 175, 0.8)',
          ],
        },
      ],
    };
  };

  const getApplicationsChartData = () => {
    if (!stats?.applications) return null;
    
    return {
      labels: ['Soumises', 'En révision', 'Entretien', 'Offre', 'Rejetées'],
      datasets: [
        {
          label: 'Candidatures',
          data: [
            stats.applications.submitted || 0,
            stats.applications.in_review || 0,
            stats.applications.interview || 0,
            stats.applications.offered || 0,
            stats.applications.rejected || 0
          ],
          backgroundColor: 'rgba(16, 185, 129, 0.8)',
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
    },
  };

  // Debug: Log user info
  console.log('AdminDashboard - User object:', user);
  console.log('AdminDashboard - User ID:', user?.id);
  console.log('AdminDashboard - User Role:', user?.role);

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ Erreur d'authentification</h2>
        <p>Utilisateur non connecté. Veuillez vous reconnecter.</p>
      </div>
    );
  }

  if (!user.id) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ Erreur</h2>
        <p>ID utilisateur manquant dans les données de session.</p>
        <pre style={{ background: '#f3f4f6', padding: '10px', borderRadius: '8px', textAlign: 'left', maxWidth: '600px', margin: '20px auto' }}>
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9fafb' }}>
      {/* Tour et bouton d'aide */}
      {isReady && (
        <>
          <ProductTour
            steps={adminDashboardTour}
            tourKey="admin_dashboard"
            userId={userId}
            onComplete={handleTourComplete}
            run={run}
          />
          <TourHelpButton
            onClick={startTour}
            isFirstVisit={isFirstVisit(userId)}
          />
        </>
      )}

      {/* Sidebar Admin */}
      <aside style={{ 
        width: 280, 
        background: '#fff', 
        borderRight: '1px solid #e5e7eb',
        padding: '24px 0',
        position: 'fixed',
        height: '100vh',
        overflowY: 'auto'
      }}>
        <div style={{ padding: '0 24px', marginBottom: '32px' }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: '20px', color: '#111827' }}>
            🛡️ Admin Panel
          </h2>
          <div style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>
            {user?.name || user?.email || "Administrateur"}
          </div>
          <div style={{ 
            fontSize: 11, 
            color: '#9ca3af', 
            marginTop: 2,
            fontFamily: 'monospace'
          }}>
            ID: {user?.id}
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
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'rgba(243, 244, 246, 1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '16px' }}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Déconnexion */}
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '12px', 
          right: '12px',
          padding: '0 12px'
        }}>
          <button
            onClick={() => {
              localStorage.removeItem('talentlink_user');
              window.location.href = '/login';
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: 'center'
            }}
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <main style={{ 
        flex: 1, 
        padding: '32px', 
        marginLeft: '280px',
        minHeight: '100vh'
      }}>
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ margin: 0, marginBottom: 8, fontSize: '28px', fontWeight: 700 }}>
                📊 Tableau de bord
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Vue d'ensemble de la plateforme TalentLink
              </p>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ color: '#6b7280' }}>Chargement des statistiques...</p>
              </div>
            ) : (
              <>
                {/* Cards de statistiques */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                  gap: 16, 
                  marginBottom: 24 
                }}>
                  <div style={{ 
                    padding: 24, 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: 16,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
                      Utilisateurs Total
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700 }}>
                      {stats?.users?.total || 0}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                      +{stats?.users?.new_this_week || 0} cette semaine
                    </div>
                  </div>

                  <div style={{ 
                    padding: 24, 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 16,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)'
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
                      Utilisateurs Actifs
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700 }}>
                      {stats?.users?.active || 0}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                      {stats?.users?.total ? Math.round((stats.users.active / stats.users.total) * 100) : 0}% du total
                    </div>
                  </div>

                  <div style={{ 
                    padding: 24, 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: 16,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(79, 172, 254, 0.4)'
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
                      Signalements
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700 }}>
                      {stats?.reports?.pending || 0}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                      En attente de traitement
                    </div>
                  </div>

                  <div style={{ 
                    padding: 24, 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    borderRadius: 16,
                    color: 'white',
                    boxShadow: '0 4px 12px rgba(67, 233, 123, 0.4)'
                  }}>
                    <div style={{ fontSize: 14, marginBottom: 8, opacity: 0.9 }}>
                      Offres d'emploi
                    </div>
                    <div style={{ fontSize: 36, fontWeight: 700 }}>
                      {stats?.offers?.active || 0}
                    </div>
                    <div style={{ fontSize: 12, marginTop: 8, opacity: 0.8 }}>
                      {stats?.offers?.total || 0} au total
                    </div>
                  </div>
                </div>

                {/* Graphiques */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                  gap: 24,
                  marginBottom: 24 
                }}>
                  {/* Graphique ligne - Nouveaux utilisateurs */}
                  <div style={{ 
                    padding: 24, 
                    background: '#fff', 
                    borderRadius: 16, 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
                      📈 Nouveaux utilisateurs (7 derniers jours)
                    </h3>
                    <div style={{ height: '300px' }}>
                      {getUsersChartData() && (
                        <Line data={getUsersChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>

                  {/* Graphique donut - Signalements */}
                  <div style={{ 
                    padding: 24, 
                    background: '#fff', 
                    borderRadius: 16, 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
                      🛡️ Distribution des signalements
                    </h3>
                    <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {getReportsChartData() && (
                        <Doughnut data={getReportsChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>

                  {/* Graphique barres - Candidatures */}
                  <div style={{ 
                    padding: 24, 
                    background: '#fff', 
                    borderRadius: 16, 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
                      📋 Candidatures par statut
                    </h3>
                    <div style={{ height: '300px' }}>
                      {getApplicationsChartData() && (
                        <Bar data={getApplicationsChartData()} options={chartOptions} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions récentes */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', 
                  gap: 24 
                }}>
                  {/* Signalements récents */}
                  <div style={{ 
                    padding: 24, 
                    background: '#fff', 
                    borderRadius: 16, 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
                      🛡️ Signalements récents
                    </h3>
                    {recentReports.length === 0 ? (
                      <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                        Aucun signalement récent
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {recentReports.slice(0, 5).map((report) => (
                          <div 
                            key={report.id}
                            style={{ 
                              padding: 16,
                              background: '#f9fafb',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#3b82f6';
                              e.currentTarget.style.background = '#eff6ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e5e7eb';
                              e.currentTarget.style.background = '#f9fafb';
                            }}
                            onClick={() => setActiveTab('reports')}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 600 }}>
                                {report.reported_type || report.report_type}
                              </span>
                              <span style={{ 
                                fontSize: 11,
                                padding: '2px 8px',
                                borderRadius: 4,
                                background: report.status === 'pending' ? '#fef3c7' : '#d1fae5',
                                color: report.status === 'pending' ? '#92400e' : '#065f46'
                              }}>
                                {report.status}
                              </span>
                            </div>
                            <p style={{ 
                              fontSize: 13, 
                              color: '#6b7280', 
                              margin: 0,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {report.description || report.reason}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions utilisateurs récentes */}
                  <div style={{ 
                    padding: 24, 
                    background: '#fff', 
                    borderRadius: 16, 
                    border: '1px solid #e5e7eb',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                  }}>
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: 600 }}>
                      👤 Actions administratives récentes
                    </h3>
                    {auditLogs.length === 0 ? (
                      <p style={{ color: '#9ca3af', textAlign: 'center', padding: '20px' }}>
                        Aucune action récente
                      </p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {auditLogs.map((log) => (
                          <div 
                            key={log.id}
                            style={{ 
                              padding: 16,
                              background: '#f9fafb',
                              borderRadius: 8,
                              border: '1px solid #e5e7eb'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 8 }}>
                              <span style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                                {log.action_type?.replace(/_/g, ' ').toUpperCase()}
                              </span>
                              <span style={{ fontSize: 11, color: '#9ca3af' }}>
                                {new Date(log.created_at).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                            <p style={{ 
                              fontSize: 13, 
                              color: '#6b7280', 
                              margin: 0
                            }}>
                              {log.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <UserManagement user={user} />
        )}

        {activeTab === 'reports' && (
          <SignalementsAdmin user={user} />
        )}

        {activeTab === 'content' && (
          <ContentManagement user={user} />
        )}

        {activeTab === 'settings' && (
          <Settings user={user} />
        )}
      </main>
    </div>
  );
}
