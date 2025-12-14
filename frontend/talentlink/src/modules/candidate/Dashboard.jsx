import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
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
import { Line, Doughnut } from 'react-chartjs-2';
import { API_OFFERS_URL, API_PROFILE_URL } from "../../constants/api";
import { ProductTour, TourHelpButton, useProductTour, candidateDashboardPageTour } from "../../components/onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";
import "../../styles/dashboard.css";

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

export default function CandidateDashboard({ user }) {
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    interviewApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    recentApplications: [],
    applicationsByMonth: [],
    applicationsByStatus: {},
    profileViews: 0,
    uniqueRecruiters: 0,
    lastProfileViewAt: null
  });
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(0);

  // Configuration du tour
  const userId = user?.id;
  const { run, startTour, handleTourComplete, isReady } = useProductTour(
    'candidate_dashboard_page',
    candidateDashboardPageTour,
    userId,
    true // Auto-start pour les nouveaux utilisateurs
  );

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Stocker localement les métriques de vues de profil pour éviter d'être écrasées plus bas
      let pv = 0;
      let ur = 0;
      let lva = null;

      // 1. Charger le profil candidat pour vérifier la complétion
      let candidatProfile = null;
      try {
        const profileRes = await fetch(`${API_PROFILE_URL}/candidates/by-user/${user.id}`);
        if (profileRes.ok) {
          candidatProfile = await profileRes.json();
          // Calculer le pourcentage de complétion
          let completion = 0;
          if (candidatProfile?.nom) completion += 15;
          if (candidatProfile?.prenom) completion += 15;
          if (candidatProfile?.email) completion += 10;
          if (candidatProfile?.telephone) completion += 10;
          if (candidatProfile?.cv_url) completion += 20;
          if (candidatProfile?.experiences?.length > 0) completion += 15;
          if (candidatProfile?.formations?.length > 0) completion += 15;
          setProfileComplete(completion);

          // Charger le résumé des vues de profil
          try {
            const sv = await fetch(`${API_PROFILE_URL}/candidates/${candidatProfile.id}/profile-views/summary`);
            if (sv.ok) {
              const summary = await sv.json();
              pv = summary.total_views || 0;
              ur = summary.unique_recruiters || 0;
              lva = summary.last_view_at || null;
            }
          } catch (e) {
            // ignorer
          }
        }
      } catch (err) {
        console.error("Erreur chargement profil:", err);
      }

      // 2. Charger toutes les candidatures du candidat
      const appsRes = await fetch(`${API_OFFERS_URL}/applications/?user_id=${user.id}`);
      const applications = appsRes.ok ? await appsRes.json() : [];

      // 3. Calculer les statistiques
      const byStatus = {
        pending: applications.filter(a => a?.statut === "submitted" || a?.statut === "in_review").length,
        interview: applications.filter(a => a?.statut === "interview").length,
        accepted: applications.filter(a => a?.statut === "offered").length,
        rejected: applications.filter(a => a?.statut === "rejected").length,
        withdrawn: applications.filter(a => a?.statut === "withdrawn").length
      };

      // Applications par mois (6 derniers mois)
      const now = new Date();
      const monthsData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        const count = applications.filter(app => {
          if (!app || !app.date_candidature) return false;
          const appDate = new Date(app.date_candidature);
          return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
        }).length;
        monthsData.push({ month: monthName, count });
      }

      // Candidatures récentes (5 dernières)
      const recent = applications
        .filter(a => a && a.date_candidature)
        .sort((a, b) => new Date(b.date_candidature) - new Date(a.date_candidature))
        .slice(0, 5);

      setStats({
        totalApplications: applications.length,
        pendingApplications: byStatus.pending,
        interviewApplications: byStatus.interview,
        acceptedApplications: byStatus.accepted,
        rejectedApplications: byStatus.rejected,
        recentApplications: recent,
        applicationsByMonth: monthsData,
        applicationsByStatus: byStatus,
        profileViews: pv,
        uniqueRecruiters: ur,
        lastProfileViewAt: lva
      });
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Configuration du graphique d'évolution
  const timeChartData = {
    labels: (stats.applicationsByMonth || []).map(m => m.month),
    datasets: [
      {
        label: 'Candidatures',
        data: (stats.applicationsByMonth || []).map(m => m.count),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  };

  const timeChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  // Configuration du graphique par statut
  const statusChartData = {
    labels: ['En cours', 'Entretien', 'Acceptées', 'Refusées'],
    datasets: [
      {
        data: [
          stats.applicationsByStatus.pending || 0,
          stats.applicationsByStatus.interview || 0,
          stats.applicationsByStatus.accepted || 0,
          stats.applicationsByStatus.rejected || 0
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(234, 179, 8, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderWidth: 0
      }
    ]
  };

  const statusChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: false }
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      submitted: 'Soumise',
      in_review: 'En révision',
      interview: 'Entretien',
      offered: 'Offre reçue',
      rejected: 'Refusée',
      withdrawn: 'Retirée'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="dashboard-container" style={{ textAlign: 'center' }}>
        <p>Chargement du tableau de bord...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Tour et bouton d'aide */}
      {isReady && (
        <>
          <ProductTour
            steps={candidateDashboardPageTour}
            tourKey="candidate_dashboard_page"
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

      {/* En-tête */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="dashboard-title">
          Tableau de bord
        </h1>
        <p className="dashboard-subtitle">
          Bienvenue {user?.prenom || user?.name || ''} ! Voici un aperçu de vos candidatures.
        </p>
      </div>

      {/* KPIs */}
      <div className="dashboard-kpis">
        <div className="kpi-card primary">
          <div className="kpi-label">Vues du profil</div>
          <div className="kpi-value">{stats.profileViews}</div>
          <div className="kpi-subtext">
            {stats.uniqueRecruiters} recruteur(s) • {stats.lastProfileViewAt ? new Date(stats.lastProfileViewAt).toLocaleDateString('fr-FR') : '—'}
          </div>
        </div>
        <div className="kpi-card primary">
          <div className="kpi-label">
            Total candidatures
          </div>
          <div className="kpi-value">
            {stats.totalApplications}
          </div>
        </div>

        <div className="kpi-card blue">
          <div className="kpi-label">
            En cours
          </div>
          <div className="kpi-value">
            {stats.pendingApplications}
          </div>
        </div>

        <div className="kpi-card yellow">
          <div className="kpi-label">
            Entretiens
          </div>
          <div className="kpi-value">
            {stats.interviewApplications}
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-label">
            Profil complété
          </div>
          <div className="kpi-value">
            {profileComplete}%
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="dashboard-charts">
        {/* Évolution des candidatures */}
        <div className="chart-card">
          <h3 className="chart-title">
            Évolution (6 derniers mois)
          </h3>
          <Line data={timeChartData} options={timeChartOptions} />
        </div>

        {/* Répartition par statut */}
        <div className="chart-card">
          <h3 className="chart-title">
            Répartition par statut
          </h3>
          <Doughnut data={statusChartData} options={statusChartOptions} />
        </div>
      </div>

      {/* Candidatures récentes */}
      <div className="recent-applications">
        <h3 className="section-title">
          Candidatures récentes
        </h3>
        {stats.recentApplications.length === 0 ? (
          <p className="empty-message">
            Aucune candidature pour le moment. 
            <Link to="?tab=annonces" className="link-primary">
              Parcourir les offres
            </Link>
          </p>
        ) : (
          <div className="table-wrapper">
            <table className="applications-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Offre ID</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentApplications.map((app, idx) => (
                  <tr key={app.id || idx}>
                    <td>
                      {new Date(app.date_candidature).toLocaleDateString('fr-FR')}
                    </td>
                    <td>
                      #{app.offre_id}
                    </td>
                    <td>
                      <span className={`status-pill ${app.statut}`}>
                        {getStatusLabel(app.statut)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions rapides */}
      <div className="quick-actions">
        <Link to="?tab=update" className="tl-btn-primary">
          Compléter mon profil
        </Link>
        <Link to="?tab=annonces" className="tl-btn-secondary">
          Parcourir les offres
        </Link>
      </div>
    </div>
  );
}
