import React, { useEffect, useState } from "react";
import { API_AUTH_URL } from "../../constants/api";
import "../../styles/dashboard.css";

export default function ReportManagement({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    search: ''
  });
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [resolution, setResolution] = useState("");

  // Charger tous les signalements
  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = user?.access_token;
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`${API_AUTH_URL}/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des signalements");
      }
      
      const data = await res.json();
      setReports(data);
    } catch (e) {
      console.error("Erreur chargement signalements:", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Résoudre un signalement
  const resolveReport = async (reportId, resolution) => {
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'resolved', admin_notes: resolution })
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de la résolution");
      }
      
      setShowDetailModal(false);
      setSelectedReport(null);
      setResolution("");
      fetchReports();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  // Rejeter un signalement
  const rejectReport = async (reportId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir rejeter ce signalement ?")) {
      return;
    }
    
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'dismissed', admin_notes: 'Signalement rejeté' })
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors du rejet");
      }
      
      fetchReports();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  useEffect(() => {
    fetchReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { background: '#fef3c7', color: '#92400e' },
      resolved: { background: '#d1fae5', color: '#065f46' },
      rejected: { background: '#fee2e2', color: '#991b1b' }
    };
    
    const labels = {
      pending: 'En attente',
      resolved: 'Résolu',
      rejected: 'Rejeté'
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        ...styles[status]
      }}>
        {labels[status] || status}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const styles = {
      offer: { background: '#dbeafe', color: '#1e40af' },
      profile: { background: '#dcfce7', color: '#166534' },
      message: { background: '#fef3c7', color: '#92400e' },
      other: { background: '#f3f4f6', color: '#374151' }
    };
    
    const labels = {
      offer: 'Offre',
      profile: 'Profil',
      message: 'Message',
      other: 'Autre'
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        ...styles[type]
      }}>
        {labels[type] || type}
      </span>
    );
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10b981',
      medium: '#f59e0b',
      high: '#dc2626',
      critical: '#7c2d12'
    };
    return colors[priority] || '#6b7280';
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

  const getTimeAgo = (dateString) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `il y a ${days}j`;
    if (hours > 0) return `il y a ${hours}h`;
    if (minutes > 0) return `il y a ${minutes}min`;
    return 'À l\'instant';
  };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Gestion des signalements</h2>
        <div>Chargement...</div>
      </div>
    );
  }

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4 }}>Gestion des signalements</h2>
          <p style={{ color: 'var(--tl-text-secondary)', margin: 0 }}>
            {reports.length} signalement(s) • {pendingCount} en attente
          </p>
        </div>
        
        {pendingCount > 0 && (
          <div style={{ 
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            color: 'white',
            padding: '8px 16px',
            borderRadius: 20,
            fontSize: 14,
            fontWeight: 600
          }}>
            🚨 {pendingCount} à traiter
          </div>
        )}
      </div>

      {/* Filtres et recherche */}
      <div className="tl-card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Rechercher dans les signalements..."
            value={filters.search}
            onChange={handleSearch}
            style={{
              flex: 1,
              padding: 12,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14
            }}
          />
          
          <select
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            style={{
              padding: 12,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              minWidth: 120
            }}
          >
            <option value="">Tous les types</option>
            <option value="offer">Offre</option>
            <option value="profile">Profil</option>
            <option value="message">Message</option>
            <option value="other">Autre</option>
          </select>
          
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            style={{
              padding: 12,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              minWidth: 120
            }}
          >
            <option value="">Tous les statuts</option>
            <option value="pending">En attente</option>
            <option value="resolved">Résolu</option>
            <option value="rejected">Rejeté</option>
          </select>
        </div>
      </div>

      {/* Liste des signalements */}
      <div style={{ display: 'grid', gap: 16 }}>
        {reports.map((report) => (
          <div 
            key={report.id} 
            className="tl-card" 
            style={{ 
              padding: 20,
              borderLeft: `4px solid ${getPriorityColor(report.priority || 'medium')}`,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onClick={() => {
              setSelectedReport(report);
              setShowDetailModal(true);
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {getTypeBadge(report.report_type)}
                {getStatusBadge(report.status)}
                <span style={{ 
                  fontSize: 12, 
                  color: getPriorityColor(report.priority || 'medium'),
                  fontWeight: 600
                }}>
                  {report.priority?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {getTimeAgo(report.created_at)}
              </span>
            </div>
            
            <h4 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
              {report.reason}
            </h4>
            
            {report.description && (
              <p style={{ 
                margin: '0 0 12px 0', 
                fontSize: 14, 
                color: '#6b7280',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {report.description}
              </p>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#9ca3af' }}>
              <div>
                <span>Signalé par: Utilisateur #{report.reporter_user_id}</span>
                {report.reported_entity_id && (
                  <span> • Concernant: {report.report_type} #{report.reported_entity_id}</span>
                )}
              </div>
              <div>
                {formatDate(report.created_at)}
              </div>
            </div>
            
            {report.status === 'pending' && (
              <div style={{ 
                marginTop: 12, 
                paddingTop: 12, 
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                gap: 8
              }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReport(report);
                    setShowDetailModal(true);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Examiner
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    rejectReport(report.id);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: 6,
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  Rejeter
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {reports.length === 0 && (
        <div className="tl-card" style={{ padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3 style={{ margin: 0, marginBottom: 8, color: '#6b7280' }}>
            Aucun signalement trouvé
          </h3>
          <p style={{ margin: 0, color: '#9ca3af' }}>
            Les signalements des utilisateurs apparaîtront ici
          </p>
        </div>
      )}

      {/* Modal de détail */}
      {showDetailModal && selectedReport && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            width: '100%',
            maxWidth: 600,
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ padding: 24, borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>Détail du signalement #{selectedReport.id}</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 20,
                    cursor: 'pointer',
                    color: '#6b7280'
                  }}
                >
                  ×
                </button>
              </div>
              
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {getTypeBadge(selectedReport.report_type)}
                {getStatusBadge(selectedReport.status)}
                <span style={{ 
                  padding: '4px 12px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: '#f3f4f6',
                  color: getPriorityColor(selectedReport.priority || 'medium')
                }}>
                  Priorité: {selectedReport.priority?.toUpperCase() || 'MEDIUM'}
                </span>
              </div>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Raison</h4>
                <p style={{ margin: 0, fontSize: 14, color: '#374151' }}>
                  {selectedReport.reason}
                </p>
              </div>
              
              {selectedReport.description && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Description</h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', lineHeight: '1.5' }}>
                    {selectedReport.description}
                  </p>
                </div>
              )}
              
              <div style={{ marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Informations</h4>
                <div style={{ fontSize: 14, color: '#6b7280' }}>
                  <div>Signalé par: Utilisateur #{selectedReport.reporter_user_id}</div>
                  {selectedReport.reported_entity_id && (
                    <div>Concernant: {selectedReport.report_type} #{selectedReport.reported_entity_id}</div>
                  )}
                  <div>Date: {formatDate(selectedReport.created_at)}</div>
                </div>
              </div>
              
              {selectedReport.resolution && (
                <div style={{ marginBottom: 20 }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Résolution</h4>
                  <p style={{ margin: 0, fontSize: 14, color: '#374151', background: '#f9fafb', padding: 12, borderRadius: 8 }}>
                    {selectedReport.resolution}
                  </p>
                </div>
              )}
              
              {selectedReport.status === 'pending' && (
                <div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: 16 }}>Actions</h4>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                      Notes de résolution
                    </label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Indiquez les actions prises pour résoudre ce signalement..."
                      style={{
                        width: '100%',
                        minHeight: 80,
                        padding: 12,
                        border: '1px solid #d1d5db',
                        borderRadius: 8,
                        fontSize: 14,
                        resize: 'vertical'
                      }}
                    />
                  </div>
                  
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => rejectReport(selectedReport.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => resolveReport(selectedReport.id, resolution)}
                      style={{
                        padding: '8px 16px',
                        background: '#16a34a',
                        color: 'white',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer'
                      }}
                      disabled={!resolution.trim()}
                    >
                      Résoudre
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}