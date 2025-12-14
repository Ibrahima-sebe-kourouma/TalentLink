import React, { useEffect, useState, useCallback } from "react";
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
import { Bar, Line, Pie } from 'react-chartjs-2';
import { API_OFFERS_URL, API_PROFILE_URL } from "../../constants/api";
import NotificationCenter from "../../components/recruiter/NotificationCenter";
import { ProductTour, TourHelpButton, useProductTour, recruiterDashboardTour } from "../../components/onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";
import "../../components/Stepper.css";

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

export default function RecruiterDashboard({ user }) {
  const [stats, setStats] = useState({
    totalOffers: 0,
    activeOffers: 0,
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    recentApplications: [],
    applicationsByOffer: [],
    applicationsByMonth: [],
    applicationsByStatus: { pending: 0, accepted: 0, rejected: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [recruiter, setRecruiter] = useState(null);

  // Configuration du tour
  const userId = user?.id;
  const { run, startTour, handleTourComplete, isReady } = useProductTour(
    'recruiter_dashboard',
    recruiterDashboardTour,
    userId,
    true
  );

  const loadDashboardData = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // 1. Charger le profil recruteur
      const recruiterRes = await fetch(`${API_PROFILE_URL}/recruiters/by-user/${user.id}`);
      let recruiterData = null;
      if (recruiterRes.ok) {
        recruiterData = await recruiterRes.json();
        setRecruiter(recruiterData);
      }

      // 2. Charger les offres du recruteur
      const offersRes = await fetch(`${API_OFFERS_URL}/offers?recruiter_id=${user.id}`);
      let offers = [];
      if (offersRes.ok) {
        offers = await offersRes.json();
      }

      // 3. Charger toutes les candidatures pour chaque offre
      const applicationPromises = offers.map(offer =>
        fetch(`${API_OFFERS_URL}/applications/?offre_id=${offer.id}`)
          .then(r => r.ok ? r.json() : [])
          .catch(() => [])
      );
      const applicationsArrays = await Promise.all(applicationPromises);
      const allApplications = applicationsArrays.flat().filter(Boolean);

      // 4. Calculer les statistiques (utiliser les vrais champs du modèle)
      const activeOffers = offers.filter(o => o.statut === "published").length;
      const byStatus = {
        pending: allApplications.filter(a => a?.statut === "submitted" || a?.statut === "in_review").length,
        accepted: allApplications.filter(a => a?.statut === "offered").length,
        rejected: allApplications.filter(a => a?.statut === "rejected").length,
        interview: allApplications.filter(a => a?.statut === "interview").length,
        withdrawn: allApplications.filter(a => a?.statut === "withdrawn").length
      };

      // Applications par offre (top 5)
      const appsByOffer = offers.map(offer => ({
        offerTitle: offer.titre || 'Sans titre',
        count: allApplications.filter(a => a?.offre_id === offer.id).length
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

      // Applications par mois (6 derniers mois)
      const now = new Date();
      const monthsData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        const count = allApplications.filter(app => {
          if (!app || !app.date_candidature) return false;
          const appDate = new Date(app.date_candidature);
          return appDate.getMonth() === date.getMonth() && appDate.getFullYear() === date.getFullYear();
        }).length;
        monthsData.push({ month: monthName, count });
      }

      // Candidatures récentes (5 dernières)
      const recent = allApplications
        .filter(a => a && a.date_candidature)
        .sort((a, b) => new Date(b.date_candidature) - new Date(a.date_candidature))
        .slice(0, 5);

      setStats({
        totalOffers: offers.length,
        activeOffers,
        totalApplications: allApplications.length,
        pendingApplications: byStatus.pending,
        acceptedApplications: byStatus.accepted,
        rejectedApplications: byStatus.rejected,
        recentApplications: recent,
        applicationsByOffer: appsByOffer,
        applicationsByMonth: monthsData,
        applicationsByStatus: byStatus
      });
    } catch (err) {
      console.error("Erreur chargement dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Données pour le graphique des candidatures par offre
  const offerChartData = {
    labels: (stats.applicationsByOffer || []).map(item => item.offerTitle.length > 30 ? item.offerTitle.substring(0, 30) + '...' : item.offerTitle),
    datasets: [
      {
        label: 'Candidatures',
        data: (stats.applicationsByOffer || []).map(item => item.count),
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 1,
        borderRadius: 6
      }
    ]
  };

  // Données pour le graphique temporel
  const timeChartData = {
    labels: (stats.applicationsByMonth || []).map(item => item.month),
    datasets: [
      {
        label: 'Candidatures reçues',
        data: (stats.applicationsByMonth || []).map(item => item.count),
        fill: true,
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        tension: 0.4,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Données pour le graphique en donut (statuts)
  const statusChartData = {
    labels: ['En attente / Examen', 'Entretien', 'Offre faite', 'Rejetées', 'Retirées'],
    datasets: [
      {
        data: [
          stats.applicationsByStatus?.pending || 0,
          stats.applicationsByStatus?.interview || 0,
          stats.applicationsByStatus?.accepted || 0,
          stats.applicationsByStatus?.rejected || 0,
          stats.applicationsByStatus?.withdrawn || 0
        ],
        backgroundColor: [
          'rgba(245, 158, 11, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(156, 163, 175, 0.8)'
        ],
        borderColor: [
          'rgba(245, 158, 11, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(156, 163, 175, 1)'
        ],
        borderWidth: 2
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--tl-text-secondary)' }}>
          Chargement des données...
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Tour et bouton d'aide */}
      {isReady && (
        <>
          <ProductTour
            steps={recruiterDashboardTour}
            tourKey="recruiter_dashboard"
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

      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4 }}>Tableau de bord</h2>
          <p style={{ color: 'var(--tl-text-secondary)', margin: 0 }}>
            Bienvenue {recruiter?.entreprise || user?.prenom || user?.name || user?.email}
          </p>
        </div>
        <NotificationCenter user={user} />
      </div>

      {/* KPIs Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid var(--tl-primary-500)' }}>
          <div style={{ fontSize: 14, color: 'var(--tl-text-secondary)', marginBottom: 8 }}>Offres publiées</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tl-text)' }}>{stats.totalOffers}</div>
          <div style={{ fontSize: 12, color: 'var(--tl-text-secondary)', marginTop: 4 }}>
            {stats.activeOffers} actives
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid var(--tl-success-500)' }}>
          <div style={{ fontSize: 14, color: 'var(--tl-text-secondary)', marginBottom: 8 }}>Candidatures totales</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tl-text)' }}>{stats.totalApplications}</div>
          <div style={{ fontSize: 12, color: 'var(--tl-text-secondary)', marginTop: 4 }}>
            Toutes offres confondues
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid var(--tl-warning-500)' }}>
          <div style={{ fontSize: 14, color: 'var(--tl-text-secondary)', marginBottom: 8 }}>En attente</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tl-text)' }}>{stats.pendingApplications}</div>
          <div style={{ fontSize: 12, color: 'var(--tl-text-secondary)', marginTop: 4 }}>
            À traiter
          </div>
        </div>

        <div className="tl-card" style={{ padding: 20, borderLeft: '4px solid var(--tl-success-600)' }}>
          <div style={{ fontSize: 14, color: 'var(--tl-text-secondary)', marginBottom: 8 }}>Offres faites</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--tl-text)' }}>{stats.acceptedApplications}</div>
          <div style={{ fontSize: 12, color: 'var(--tl-text-secondary)', marginTop: 4 }}>
            Candidats retenus
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Line Chart - Evolution */}
        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>📈 Évolution des candidatures</h3>
          <div style={{ height: 280 }}>
            <Line data={timeChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Pie Chart - Statuts */}
        <div className="tl-card" style={{ padding: 20 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>📊 Répartition par statut</h3>
          <div style={{ height: 280 }}>
            <Pie data={statusChartData} options={pieOptions} />
          </div>
        </div>
      </div>

      {/* Bar Chart - Top Offres */}
      {stats.applicationsByOffer && stats.applicationsByOffer.length > 0 && (
        <div className="tl-card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>🎯 Top offres par candidatures</h3>
          <div style={{ height: 300 }}>
            <Bar data={offerChartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Recent Applications */}
      <div className="tl-card" style={{ padding: 20 }}>
        <h3 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>🕒 Candidatures récentes</h3>
        {!stats.recentApplications || stats.recentApplications.length === 0 ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--tl-text-secondary)' }}>
            Aucune candidature récente
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.recentApplications.map((app, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 12,
                  background: 'var(--tl-surface-muted)',
                  borderRadius: 'var(--tl-radius-sm)',
                  border: '1px solid var(--tl-border)'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    Candidat #{app.candidat_id || app.auth_user_id}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--tl-text-secondary)' }}>
                    Offre #{app.offre_id} • {new Date(app.date_candidature).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <div>
                  <span className={`tl-pill tl-pill--${
                    app.statut === 'offered' ? 'success' : 
                    app.statut === 'rejected' ? 'danger' :
                    app.statut === 'interview' ? 'info' :
                    'warning'
                  }`}>
                    {app.statut === 'submitted' ? 'Soumise' :
                     app.statut === 'in_review' ? 'En examen' :
                     app.statut === 'interview' ? 'Entretien' :
                     app.statut === 'offered' ? 'Offre faite' :
                     app.statut === 'rejected' ? 'Rejetée' :
                     app.statut === 'withdrawn' ? 'Retirée' : app.statut}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
