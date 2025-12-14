import React, { useState, useEffect } from 'react';
import { API_OFFERS_URL } from '../../constants/api';
import '../../styles/admin-content.css';

export default function RecruiterOffers({ recruiter, onBack, user }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, published, draft, closed
  const [selectedOffer, setSelectedOffer] = useState(null);

  useEffect(() => {
    fetchRecruiterOffers();
  }, [recruiter.id]);

  const fetchRecruiterOffers = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('📊 Chargement des offres du recruteur:', recruiter.id);

      const response = await fetch(
        `${API_OFFERS_URL}/offers?recruiter_user_id=${recruiter.id}&statut=all`
      );

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des offres');
      }

      const data = await response.json();
      console.log('💼 Offres chargées:', data);
      setOffers(data);
    } catch (err) {
      console.error('❌ Erreur chargement offres:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      return;
    }

    try {
      const response = await fetch(`${API_OFFERS_URL}/offers/${offerId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression de l\'offre');
      }

      // Recharger les offres après suppression
      await fetchRecruiterOffers();
      alert('Offre supprimée avec succès');
    } catch (err) {
      console.error('❌ Erreur suppression offre:', err);
      alert('Erreur lors de la suppression: ' + err.message);
    }
  };

  const handleCloseOffer = async (offerId) => {
    try {
      const response = await fetch(`${API_OFFERS_URL}/offers/${offerId}/close`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la fermeture de l\'offre');
      }

      // Recharger les offres
      await fetchRecruiterOffers();
      alert('Offre fermée avec succès');
    } catch (err) {
      console.error('❌ Erreur fermeture offre:', err);
      alert('Erreur lors de la fermeture: ' + err.message);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      published: 'Publiée',
      draft: 'Brouillon',
      closed: 'Fermée',
      archived: 'Archivée'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      published: 'status-published',
      draft: 'status-draft',
      closed: 'status-closed',
      archived: 'status-archived'
    };
    return classes[status] || '';
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true;
    return offer.statut === filter;
  });

  const stats = {
    total: offers.length,
    published: offers.filter(o => o.statut === 'published').length,
    draft: offers.filter(o => o.statut === 'draft').length,
    closed: offers.filter(o => o.statut === 'closed').length
  };

  return (
    <div className="recruiter-offers">
      {/* En-tête avec bouton retour */}
      <div className="offers-header">
        <button className="back-button" onClick={onBack}>
          ← Retour à la liste
        </button>
        <div className="recruiter-info-header">
          <div className="recruiter-avatar-large">
            {recruiter.prenom?.[0]?.toUpperCase() || '?'}
            {recruiter.nom?.[0]?.toUpperCase() || ''}
          </div>
          <div>
            <h2 className="recruiter-name-large">
              {recruiter.prenom} {recruiter.nom}
            </h2>
            <p className="recruiter-email-large">{recruiter.email}</p>
          </div>
        </div>
      </div>

      {/* Statistiques des offres */}
      <div className="offers-stats">
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-details">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Publiées</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-details">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Brouillons</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔒</div>
          <div className="stat-details">
            <div className="stat-value">{stats.closed}</div>
            <div className="stat-label">Fermées</div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="filters-bar">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes ({stats.total})
        </button>
        <button
          className={`filter-btn ${filter === 'published' ? 'active' : ''}`}
          onClick={() => setFilter('published')}
        >
          Publiées ({stats.published})
        </button>
        <button
          className={`filter-btn ${filter === 'draft' ? 'active' : ''}`}
          onClick={() => setFilter('draft')}
        >
          Brouillons ({stats.draft})
        </button>
        <button
          className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          onClick={() => setFilter('closed')}
        >
          Fermées ({stats.closed})
        </button>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Liste des offres */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des offres...</p>
        </div>
      ) : (
        <>
          {filteredOffers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <h3>Aucune offre trouvée</h3>
              <p>
                {filter === 'all'
                  ? 'Ce recruteur n\'a pas encore publié d\'offres'
                  : `Aucune offre avec le statut "${getStatusLabel(filter)}"`}
              </p>
            </div>
          ) : (
            <div className="offers-list">
              {filteredOffers.map((offer) => (
                <div key={offer.id} className="offer-card">
                  <div className="offer-main">
                    <div className="offer-header-row">
                      <h3 className="offer-title">{offer.titre}</h3>
                      <span className={`offer-status ${getStatusClass(offer.statut)}`}>
                        {getStatusLabel(offer.statut)}
                      </span>
                    </div>
                    
                    <div className="offer-details">
                      <div className="offer-detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{offer.localisation || 'Non spécifié'}</span>
                      </div>
                      <div className="offer-detail-item">
                        <span className="detail-icon">💼</span>
                        <span>{offer.type_contrat || 'Non spécifié'}</span>
                      </div>
                      <div className="offer-detail-item">
                        <span className="detail-icon">🏢</span>
                        <span>{offer.domaine || 'Non spécifié'}</span>
                      </div>
                      {offer.remote && (
                        <div className="offer-detail-item">
                          <span className="detail-icon">🏠</span>
                          <span>Télétravail possible</span>
                        </div>
                      )}
                    </div>

                    {offer.description && (
                      <p className="offer-description">
                        {offer.description.substring(0, 200)}
                        {offer.description.length > 200 ? '...' : ''}
                      </p>
                    )}

                    <div className="offer-footer">
                      <span className="offer-date">
                        Créée le{' '}
                        {new Date(offer.date_creation).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="offer-id">ID: {offer.id}</span>
                    </div>
                  </div>

                  <div className="offer-actions">
                    <button
                      className="action-btn view-btn"
                      onClick={() => setSelectedOffer(offer)}
                      title="Voir les détails"
                    >
                      👁️ Voir
                    </button>
                    
                    {offer.statut === 'published' && (
                      <button
                        className="action-btn close-btn"
                        onClick={() => handleCloseOffer(offer.id)}
                        title="Fermer l'offre"
                      >
                        🔒 Fermer
                      </button>
                    )}
                    
                    <button
                      className="action-btn delete-btn"
                      onClick={() => handleDeleteOffer(offer.id)}
                      title="Supprimer l'offre"
                    >
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal de détails de l'offre */}
      {selectedOffer && (
        <div className="modal-overlay" onClick={() => setSelectedOffer(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedOffer.titre}</h2>
              <button
                className="modal-close"
                onClick={() => setSelectedOffer(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>📋 Informations générales</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Statut:</strong>
                    <span className={`offer-status ${getStatusClass(selectedOffer.statut)}`}>
                      {getStatusLabel(selectedOffer.statut)}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Localisation:</strong>
                    <span>{selectedOffer.localisation || 'Non spécifié'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Type de contrat:</strong>
                    <span>{selectedOffer.type_contrat || 'Non spécifié'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Domaine:</strong>
                    <span>{selectedOffer.domaine || 'Non spécifié'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Télétravail:</strong>
                    <span>{selectedOffer.remote ? 'Oui' : 'Non'}</span>
                  </div>
                  <div className="info-item">
                    <strong>Salaire:</strong>
                    <span>
                      {selectedOffer.salaire_min && selectedOffer.salaire_max
                        ? `${selectedOffer.salaire_min} CAD$ - ${selectedOffer.salaire_max} CAD$`
                        : 'Non spécifié'}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Date de création:</strong>
                    <span>
                      {new Date(selectedOffer.date_creation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>ID de l'offre:</strong>
                    <span>{selectedOffer.id}</span>
                  </div>
                </div>
              </div>

              {selectedOffer.description && (
                <div className="modal-section">
                  <h3>📝 Description</h3>
                  <p className="offer-description-full">{selectedOffer.description}</p>
                </div>
              )}

              {selectedOffer.exigences && (
                <div className="modal-section">
                  <h3>✅ Exigences</h3>
                  <p className="offer-description-full">{selectedOffer.exigences}</p>
                </div>
              )}

              {selectedOffer.avantages && (
                <div className="modal-section">
                  <h3>🎁 Avantages</h3>
                  <p className="offer-description-full">{selectedOffer.avantages}</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedOffer(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
