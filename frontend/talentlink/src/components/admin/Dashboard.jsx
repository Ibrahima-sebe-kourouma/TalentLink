import React, { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';
import { API_AUTH_URL } from "../../constants/api";
import "../../styles/dashboard.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function AdminDashboard({ user }) {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentReports, setRecentReports] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);

  // Charger les statistiques
  const fetchStatistics = async () => {
    try {
      const token = user?.access_token;
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      const res = await fetch(`${API_AUTH_URL}/admin/statistics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        if (res.status === 403) {
          throw new Error("Accès refusé - Droits administrateur requis");
        }
        throw new Error("Erreur lors du chargement des statistiques");
      }
      
      const data = await res.json();
      setStats(data);
    } catch (e) {
      setError(e.message);
    }
  };

  // Charger les rapports récents
  const fetchRecentReports = async () => {
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/reports?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setRecentReports(data);
      }
    } catch (e) {
      console.error("Erreur chargement signalements:", e);
    }
  };

  // Charger les audits récents
  const fetchRecentAudits = async () => {
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/audit-logs?limit=5`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setRecentAudits(data);
      }
    } catch (e) {
      console.error("Erreur chargement audits:", e);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchStatistics(),
        fetchRecentReports(),
        fetchRecentAudits()
      ]);
      setLoading(false);
    };
    
    loadData();
    
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Tableau de bord administrateur</h2>
        <div>Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Tableau de bord administrateur</h2>
        <div style={{ color: '#dc2626', padding: 16, background: '#fee2e2', borderRadius: 8 }}>
          {error}
        </div>
      </div>
    );
  }

  // Configuration des graphiques
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  // Données pour le graphique utilisateurs par rôle
  const userRoleData = {
    labels: ['Candidats', 'Recruteurs', 'Administrateurs'],
    datasets: [
      {
        label: 'Nombre d\'utilisateurs',
        data: [
          stats.users?.by_role?.candidat || 0,
          stats.users?.by_role?.recruteur || 0,
          stats.users?.by_role?.admin || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  // Données pour le graphique d'évolution des utilisateurs
  const userGrowthData = {
    labels: ['Aujourd\'hui', 'Cette semaine', 'Ce mois'],
    datasets: [
      {
        label: 'Nouveaux utilisateurs',
        data: [
          stats.users?.new_today || 0,
          stats.users?.new_this_week || 0,
          stats.users?.new_this_month || 0
        ],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };

  const formatActionType = (type) => {
    const types = {
      user_suspended: 'Utilisateur suspendu',
      user_banned: 'Utilisateur banni',
      user_reactivated: 'Utilisateur réactivé',
      offer_moderated: 'Offre modérée',
      profile_moderated: 'Profil modéré',
      report_resolved: 'Signalement résolu',
      role_changed: 'Rôle changé'
    };
    return types[type] || type;
  };

  const formatReportType = (type) => {
    const types = {
      offer: 'Offre',
      profile: 'Profil',
      message: 'Message',
      other: 'Autre'
    };
    return types[type] || type;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4 }}>Administration</h2>
          <p style={{ color: 'var(--tl-text-secondary)', margin: 0 }}>
            Tableau de bord administrateur
          </p>
        </div>
        <div style={{ 
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: 20,
          fontSize: 14,
          fontWeight: 600
        }}>
          🛡️ ADMIN
        </div>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid #3b82f6' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Total utilisateurs</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{stats.users?.total || 0}</div>
          <div style={{ fontSize: 12, color: '#16a34a', marginTop: 4 }}>
            {stats.users?.active || 0} actifs
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Utilisateurs suspendus/bannis</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>
            {(stats.users?.suspended || 0) + (stats.users?.banned || 0)}
          </div>
          <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
            {stats.users?.suspended || 0} suspendus, {stats.users?.banned || 0} bannis
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Signalements en attente</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{stats.reports?.pending || 0}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            sur {stats.reports?.total || 0} total
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Nouveaux utilisateurs (mois)</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{stats.users?.new_this_month || 0}</div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
            {stats.users?.new_this_week || 0} cette semaine
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>👥 Répartition des utilisateurs</h3>
          <div style={{ height: 300 }}>
            <Pie data={userRoleData} options={chartOptions} />
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>📈 Croissance des utilisateurs</h3>
          <div style={{ height: 300 }}>
            <Line data={userGrowthData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 16 }}>
        {/* Signalements récents */}
        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>🚨 Signalements récents</h3>
          {recentReports.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
              Aucun signalement récent
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  style={{
                    padding: 12,
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>
                      {formatReportType(report.report_type)}
                    </span>
                    <span style={{ 
                      fontSize: 12, 
                      padding: '2px 8px', 
                      borderRadius: 12,
                      background: report.status === 'pending' ? '#fef3c7' : '#d1fae5',
                      color: report.status === 'pending' ? '#92400e' : '#065f46'
                    }}>
                      {report.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    {report.reason}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    {formatDate(report.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Logs d'audit récents */}
        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>📋 Actions administratives récentes</h3>
          {recentAudits.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#6b7280' }}>
              Aucune action récente
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {recentAudits.map((audit) => (
                <div
                  key={audit.id}
                  style={{
                    padding: 12,
                    background: '#f9fafb',
                    borderRadius: 8,
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                    {formatActionType(audit.action_type)}
                  </div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    {audit.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    Admin #{audit.admin_user_id} • {formatDate(audit.created_at)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}