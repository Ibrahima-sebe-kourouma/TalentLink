import React, { useState, useEffect } from 'react';
import './ReportManagement.css';

const REPORT_SERVICE_URL = 'http://localhost:8007';

const ReportManagement = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.id) {
      loadReports();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, filter]);

  const loadReports = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const response = await fetch(
        `${REPORT_SERVICE_URL}/reports/my-reports?user_id=${user.id}${statusParam}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des signalements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'under_review': return '👀';
      case 'resolved': return '✅';
      case 'rejected': return '❌';
      default: return '📋';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'under_review': return 'En cours d\'examen';
      case 'resolved': return 'Résolu';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#dc3545';
      case 'medium': return '#fd7e14';
      case 'low': return '#198754';
      default: return '#6c757d';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'offer': return '💼';
      case 'profile': return '👤';
      case 'message': return '💬';
      default: return '📄';
    }
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

  const ReportModal = ({ report, onClose }) => (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h3>
            {getTypeIcon(report.report_type)} 
            Signalement #{report.id}
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="report-modal-content">
          <div className="report-info-grid">
            <div className="report-info-item">
              <label>Statut</label>
              <span className={`status-badge ${report.status}`}>
                {getStatusIcon(report.status)} {getStatusLabel(report.status)}
              </span>
            </div>
            
            <div className="report-info-item">
              <label>Sévérité</label>
              <span 
                className="severity-badge" 
                style={{ backgroundColor: getSeverityColor(report.severity) }}
              >
                {report.severity.toUpperCase()}
              </span>
            </div>
            
            <div className="report-info-item">
              <label>Date de création</label>
              <span>{formatDate(report.created_at)}</span>
            </div>
            
            {report.processed_at && (
              <div className="report-info-item">
                <label>Date de traitement</label>
                <span>{formatDate(report.processed_at)}</span>
              </div>
            )}
          </div>
          
          <div className="report-details">
            <div className="detail-section">
              <h4>Raison du signalement</h4>
              <p>{report.reason}</p>
            </div>
            
            {report.description && (
              <div className="detail-section">
                <h4>Description</h4>
                <p>{report.description}</p>
              </div>
            )}
            
            {report.admin_note && (
              <div className="detail-section admin-note">
                <h4>📝 Réponse de l'administration</h4>
                <p>{report.admin_note}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="report-management">
      <div className="report-header">
        <h2>📋 Mes Signalements</h2>
        <button 
          className="create-report-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Nouveau signalement
        </button>
      </div>

      <div className="report-filters">
        <button 
          className={filter === 'all' ? 'active' : ''}
          onClick={() => setFilter('all')}
        >
          Tous ({reports.length})
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''}
          onClick={() => setFilter('pending')}
        >
          ⏳ En attente
        </button>
        <button 
          className={filter === 'resolved' ? 'active' : ''}
          onClick={() => setFilter('resolved')}
        >
          ✅ Résolus
        </button>
        <button 
          className={filter === 'rejected' ? 'active' : ''}
          onClick={() => setFilter('rejected')}
        >
          ❌ Rejetés
        </button>
      </div>

      {loading ? (
        <div className="loading">Chargement des signalements...</div>
      ) : reports.length === 0 ? (
        <div className="no-reports">
          <h3>Aucun signalement trouvé</h3>
          <p>Vous n'avez encore effectué aucun signalement.</p>
        </div>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div 
              key={report.id} 
              className="report-card"
              onClick={() => setSelectedReport(report)}
            >
              <div className="report-card-header">
                <div className="report-type">
                  {getTypeIcon(report.report_type)}
                  <span>Signalement #{report.id}</span>
                </div>
                <div className="report-status">
                  <span className={`status-badge ${report.status}`}>
                    {getStatusIcon(report.status)} {getStatusLabel(report.status)}
                  </span>
                </div>
              </div>
              
              <div className="report-card-content">
                <h4>{report.reason}</h4>
                {report.description && (
                  <p className="report-description">
                    {report.description.substring(0, 100)}
                    {report.description.length > 100 ? '...' : ''}
                  </p>
                )}
                
                <div className="report-meta">
                  <span className="report-date">
                    📅 {formatDate(report.created_at)}
                  </span>
                  <span 
                    className="severity-indicator"
                    style={{ color: getSeverityColor(report.severity) }}
                  >
                    ● {report.severity}
                  </span>
                </div>
                
                {report.admin_note && (
                  <div className="admin-note-indicator">
                    📝 Réponse administrative disponible
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
        />
      )}

      {showCreateModal && (
        <CreateReportModal 
          user={user}
          onClose={() => setShowCreateModal(false)}
          onReportCreated={loadReports}
        />
      )}
    </div>
  );
};

// Composant pour créer un nouveau signalement
const CreateReportModal = ({ user, onClose, onReportCreated }) => {
  const [formData, setFormData] = useState({
    reported_type: '',
    reported_id: '',
    reason: '',
    description: ''
  });
  const [reasons, setReasons] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    try {
      const response = await fetch(`${REPORT_SERVICE_URL}/reports/reasons`);
      if (response.ok) {
        const data = await response.json();
        setReasons(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des raisons:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reported_type || !formData.reported_id || !formData.reason) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${REPORT_SERVICE_URL}/reports/?user_id=${user.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reported_type: formData.reported_type,
          reported_id: parseInt(formData.reported_id),
          reason: formData.reason,
          description: formData.description || null
        })
      });

      if (response.ok) {
        alert('Signalement créé avec succès');
        onReportCreated();
        onClose();
      } else {
        const error = await response.json();
        const errorMessage = typeof error.detail === 'string' 
          ? error.detail 
          : Array.isArray(error.detail) 
            ? error.detail.map(e => e.msg || JSON.stringify(e)).join(', ')
            : JSON.stringify(error.detail || error);
        alert(`Erreur: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Erreur lors de la création du signalement:', error);
      alert('Erreur lors de la création du signalement');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentReasons = () => {
    switch (formData.reported_type) {
      case 'offer': return reasons.offer_reasons || [];
      case 'profile': return reasons.profile_reasons || [];
      case 'message': return reasons.message_reasons || [];
      default: return [];
    }
  };

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal create-report-modal" onClick={(e) => e.stopPropagation()}>
        <div className="report-modal-header">
          <h3>🚨 Nouveau signalement</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="create-report-form">
          <div className="form-group">
            <label>Type d'élément à signaler *</label>
            <select
              value={formData.reported_type}
              onChange={(e) => setFormData({...formData, reported_type: e.target.value, reason: ''})}
              required
            >
              <option value="">Sélectionner...</option>
              <option value="offer">💼 Offre d'emploi</option>
              <option value="profile">👤 Profil recruteur</option>
              <option value="message">💬 Message</option>
            </select>
          </div>

          <div className="form-group">
            <label>ID de l'élément *</label>
            <input
              type="number"
              value={formData.reported_id}
              onChange={(e) => setFormData({...formData, reported_id: e.target.value})}
              placeholder="Ex: 123"
              required
            />
            <small>Vous pouvez trouver l'ID dans l'URL de l'élément</small>
          </div>

          {formData.reported_type && (
            <div className="form-group">
              <label>Raison du signalement *</label>
              <select
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                required
              >
                <option value="">Sélectionner une raison...</option>
                {getCurrentReasons().map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Description détaillée</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Décrivez en détail le problème rencontré..."
              rows="4"
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le signalement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportManagement;