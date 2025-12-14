import React, { useState, useEffect } from 'react';
import RecruiterOffers from './RecruiterOffers';
import { API_AUTH_URL, API_OFFERS_URL } from '../../constants/api';
import '../../styles/admin-content.css';

export default function ContentManagement({ user }) {
  const [recruiters, setRecruiters] = useState([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalRecruiters: 0,
    activeRecruiters: 0,
    totalOffers: 0,
    publishedOffers: 0
  });

  useEffect(() => {
    fetchRecruiters();
    fetchStats();
  }, []);

  const fetchRecruiters = async () => {
    try {
      setLoading(true);
      setError('');

      // Récupérer tous les utilisateurs avec le rôle recruteur
      const response = await fetch(
        `${API_AUTH_URL}/admin/users/public?role=recruteur&limit=1000`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des recruteurs');
      }

      const data = await response.json();
      console.log('📊 Recruteurs chargés:', data);
      setRecruiters(data);
    } catch (err) {
      console.error('❌ Erreur chargement recruteurs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Statistiques des offres
      const offersRes = await fetch(`${API_OFFERS_URL}/offers/stats`);
      if (offersRes.ok) {
        const offersData = await offersRes.json();
        setStats(prev => ({
          ...prev,
          totalOffers: offersData.total || 0,
          publishedOffers: offersData.active || 0
        }));
      }

      // Compter les recruteurs
      const recruitersRes = await fetch(
        `${API_AUTH_URL}/admin/users/public?role=recruteur&limit=1000`
      );
      if (recruitersRes.ok) {
        const recruitersData = await recruitersRes.json();
        const active = recruitersData.filter(r => r.status === 'active').length;
        setStats(prev => ({
          ...prev,
          totalRecruiters: recruitersData.length,
          activeRecruiters: active
        }));
      }
    } catch (err) {
      console.error('❌ Erreur chargement statistiques:', err);
    }
  };

  const handleRecruiterClick = (recruiter) => {
    console.log('👤 Recruteur sélectionné:', recruiter);
    setSelectedRecruiter(recruiter);
  };

  const handleBack = () => {
    setSelectedRecruiter(null);
  };

  const filteredRecruiters = recruiters.filter(recruiter => {
    const searchLower = searchTerm.toLowerCase();
    return (
      recruiter.nom?.toLowerCase().includes(searchLower) ||
      recruiter.prenom?.toLowerCase().includes(searchLower) ||
      recruiter.email?.toLowerCase().includes(searchLower) ||
      `${recruiter.prenom} ${recruiter.nom}`.toLowerCase().includes(searchLower)
    );
  });

  if (selectedRecruiter) {
    return (
      <RecruiterOffers 
        recruiter={selectedRecruiter} 
        onBack={handleBack}
        user={user}
      />
    );
  }

  return (
    <div className="content-management">
      {/* En-tête avec statistiques */}
      <div className="content-header">
        <div>
          <h2 className="content-title">Gestion du Contenu</h2>
          <p className="content-subtitle">
            Gérez les recruteurs et leurs offres d'emploi publiées
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="content-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalRecruiters}</div>
            <div className="stat-label">Recruteurs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <div className="stat-value">{stats.activeRecruiters}</div>
            <div className="stat-label">Actifs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💼</div>
          <div className="stat-details">
            <div className="stat-value">{stats.totalOffers}</div>
            <div className="stat-label">Offres totales</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📢</div>
          <div className="stat-details">
            <div className="stat-value">{stats.publishedOffers}</div>
            <div className="stat-label">Publiées</div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="search-section">
        <input
          type="search"
          className="search-input"
          placeholder="Rechercher un recruteur par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Messages d'erreur ou de chargement */}
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des recruteurs...</p>
        </div>
      ) : (
        <>
          {/* Liste des recruteurs */}
          {filteredRecruiters.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Aucun recruteur trouvé</h3>
              <p>
                {searchTerm
                  ? 'Essayez de modifier votre recherche'
                  : 'Aucun recruteur inscrit sur la plateforme'}
              </p>
            </div>
          ) : (
            <div className="recruiters-grid">
              {filteredRecruiters.map((recruiter) => (
                <div
                  key={recruiter.id}
                  className="recruiter-card"
                  onClick={() => handleRecruiterClick(recruiter)}
                >
                  <div className="recruiter-avatar">
                    {recruiter.prenom?.[0]?.toUpperCase() || '?'}
                    {recruiter.nom?.[0]?.toUpperCase() || ''}
                  </div>
                  <div className="recruiter-info">
                    <h3 className="recruiter-name">
                      {recruiter.prenom} {recruiter.nom}
                    </h3>
                    <p className="recruiter-email">{recruiter.email}</p>
                    <div className="recruiter-meta">
                      <span
                        className={`status-badge ${
                          recruiter.status === 'active' ? 'active' : 'inactive'
                        }`}
                      >
                        {recruiter.status === 'active' ? '✓ Actif' : '⊘ Inactif'}
                      </span>
                      <span className="recruiter-id">ID: {recruiter.id}</span>
                    </div>
                  </div>
                  <div className="recruiter-arrow">→</div>
                </div>
              ))}
            </div>
          )}

          {/* Résumé de la recherche */}
          {searchTerm && (
            <div className="search-summary">
              {filteredRecruiters.length} recruteur(s) trouvé(s) sur{' '}
              {recruiters.length}
            </div>
          )}
        </>
      )}
    </div>
  );
}
