import React, { useState, useEffect } from 'react';

const API_REPORT = 'http://localhost:8007';

export default function SignalementsAdmin({ user }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [processingReport, setProcessingReport] = useState(null);

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const statusParam = filter !== 'all' ? `&status=${filter}` : '';
      const url = `${API_REPORT}/reports/admin/all?admin_user_id=${user?.id || 1}${statusParam}`;
      
      console.log('📡 Fetching reports from:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Reports loaded:', data);
      
      setReports(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('❌ Error loading reports:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleProcess = async (reportId, verdict) => {
    try {
      const status = verdict === 'valid' ? 'resolved' : 'rejected';
      const adminNote = verdict === 'valid' 
        ? 'Signalement validé - Actions appropriées prises'
        : 'Signalement rejeté - Contenu conforme aux règles';

      const response = await fetch(
        `${API_REPORT}/reports/admin/${reportId}/process?admin_user_id=${user?.id || 1}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verdict, status, admin_note: adminNote })
        }
      );

      if (response.ok) {
        alert('✅ Signalement traité avec succès');
        setProcessingReport(null);
        setSelectedReport(null);
        loadReports();
      } else {
        const error = await response.json();
        alert(`❌ Erreur: ${JSON.stringify(error.detail)}`);
      }
    } catch (err) {
      alert(`❌ Erreur: ${err.message}`);
    }
  };

  const getTypeIcon = (type) => {
    const icons = { offer: '💼', profile: '👤', message: '💬' };
    return icons[type] || '📄';
  };

  const getTypeLabel = (type) => {
    const labels = { offer: 'Offre', profile: 'Profil', message: 'Message' };
    return labels[type] || type;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', label: '⏳ En attente' },
      under_review: { bg: '#dbeafe', color: '#1e40af', label: '👀 En examen' },
      resolved: { bg: '#d1fae5', color: '#065f46', label: '✅ Résolu' },
      rejected: { bg: '#fee2e2', color: '#991b1b', label: '❌ Rejeté' }
    };
    const style = styles[status] || styles.pending;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: 600
      }}>
        {style.label}
      </span>
    );
  };

  const getSeverityBadge = (severity) => {
    const colors = { critical: '#dc2626', medium: '#f59e0b', low: '#10b981' };
    return (
      <span style={{
        background: colors[severity] || '#6b7280',
        color: 'white',
        padding: '4px 12px',
        borderRadius: '12px',
        fontSize: '12px',
        fontWeight: 700
      }}>
        {severity?.toUpperCase()}
      </span>
    );
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

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <h3>Chargement des signalements...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>❌</div>
        <h3>Erreur de chargement</h3>
        <p style={{ color: '#dc2626', marginBottom: '16px' }}>{error}</p>
        <button 
          onClick={loadReports}
          style={{
            padding: '10px 20px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          🔄 Réessayer
        </button>
      </div>
    );
  }

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    critical: reports.filter(r => r.severity === 'critical').length,
    resolved: reports.filter(r => r.status === 'resolved').length
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: '28px', fontWeight: 700 }}>
          🛡️ Gestion des Signalements
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Modération et traitement des signalements utilisateurs
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: 16, 
        marginBottom: 24 
      }}>
        <div style={{ 
          padding: 20, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Total</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#111827' }}>{stats.total}</div>
        </div>

        <div style={{ 
          padding: 20, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>En attente</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b' }}>{stats.pending}</div>
        </div>

        <div style={{ 
          padding: 20, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Critiques</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#dc2626' }}>{stats.critical}</div>
        </div>

        <div style={{ 
          padding: 20, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Résolus</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#10b981' }}>{stats.resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        marginBottom: 24, 
        display: 'flex', 
        gap: 12,
        background: '#fff',
        padding: 16,
        borderRadius: 12,
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px',
            border: filter === 'all' ? '2px solid #2563eb' : '1px solid #e5e7eb',
            borderRadius: '8px',
            background: filter === 'all' ? 'rgba(37, 99, 235, 0.1)' : 'white',
            color: filter === 'all' ? '#2563eb' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'all' ? 600 : 400
          }}
        >
          Tous ({reports.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          style={{
            padding: '8px 16px',
            border: filter === 'pending' ? '2px solid #f59e0b' : '1px solid #e5e7eb',
            borderRadius: '8px',
            background: filter === 'pending' ? 'rgba(245, 158, 11, 0.1)' : 'white',
            color: filter === 'pending' ? '#f59e0b' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'pending' ? 600 : 400
          }}
        >
          ⏳ En attente ({stats.pending})
        </button>
        <button
          onClick={() => setFilter('resolved')}
          style={{
            padding: '8px 16px',
            border: filter === 'resolved' ? '2px solid #10b981' : '1px solid #e5e7eb',
            borderRadius: '8px',
            background: filter === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'white',
            color: filter === 'resolved' ? '#10b981' : '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: filter === 'resolved' ? 600 : 400
          }}
        >
          ✅ Résolus ({stats.resolved})
        </button>
      </div>

      {/* Reports Table */}
      {reports.length === 0 ? (
        <div style={{ 
          padding: 40, 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h3>Aucun signalement trouvé</h3>
          <p style={{ color: '#6b7280' }}>Les signalements apparaîtront ici</p>
        </div>
      ) : (
        <div style={{ 
          background: '#fff', 
          borderRadius: 12, 
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Type</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Raison</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Sévérité</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Statut</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Reporter</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: 600, fontSize: '13px', color: '#374151' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report, index) => (
                <tr 
                  key={report.id}
                  style={{ 
                    borderBottom: index < reports.length - 1 ? '1px solid #f3f4f6' : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>#{report.id}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px' }}>{getTypeIcon(report.reported_type)}</span>
                      <span>{getTypeLabel(report.reported_type)}</span>
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#374151', maxWidth: '200px' }}>
                    {report.reason}
                  </td>
                  <td style={{ padding: '12px' }}>{getSeverityBadge(report.severity)}</td>
                  <td style={{ padding: '12px' }}>{getStatusBadge(report.status)}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>
                    Candidat #{report.reporter_user_id}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: '#9ca3af' }}>
                    {formatDate(report.created_at)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button
                        onClick={() => setSelectedReport(report)}
                        style={{
                          padding: '6px 12px',
                          background: '#2563eb',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 500
                        }}
                      >
                        👁️ Voir
                      </button>
                      {(report.status === 'pending' || report.status === 'under_review') && (
                        <button
                          onClick={() => setProcessingReport(report)}
                          style={{
                            padding: '6px 12px',
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 500
                          }}
                        >
                          ⚖️ Traiter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Détails */}
      {selectedReport && (
        <div 
          onClick={() => setSelectedReport(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>
                {getTypeIcon(selectedReport.reported_type)} Signalement #{selectedReport.id}
              </h2>
              <button 
                onClick={() => setSelectedReport(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Type:</strong>
                <div style={{ marginTop: 4 }}>{getTypeLabel(selectedReport.reported_type)}</div>
              </div>
              
              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Raison:</strong>
                <div style={{ marginTop: 4 }}>{selectedReport.reason}</div>
              </div>

              {selectedReport.description && (
                <div>
                  <strong style={{ color: '#6b7280', fontSize: '13px' }}>Description:</strong>
                  <div style={{ marginTop: 4 }}>{selectedReport.description}</div>
                </div>
              )}

              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Statut:</strong>
                <div style={{ marginTop: 4 }}>{getStatusBadge(selectedReport.status)}</div>
              </div>

              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Sévérité:</strong>
                <div style={{ marginTop: 4 }}>{getSeverityBadge(selectedReport.severity)}</div>
              </div>

              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Reporter:</strong>
                <div style={{ marginTop: 4 }}>Candidat #{selectedReport.reporter_user_id}</div>
              </div>

              <div>
                <strong style={{ color: '#6b7280', fontSize: '13px' }}>Date:</strong>
                <div style={{ marginTop: 4 }}>{formatDate(selectedReport.created_at)}</div>
              </div>

              {selectedReport.admin_note && (
                <div style={{ padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
                  <strong style={{ color: '#6b7280', fontSize: '13px' }}>📝 Note admin:</strong>
                  <div style={{ marginTop: 4 }}>{selectedReport.admin_note}</div>
                </div>
              )}
            </div>

            {(selectedReport.status === 'pending' || selectedReport.status === 'under_review') && (
              <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setProcessingReport(selectedReport);
                  }}
                  style={{
                    padding: '10px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  ⚖️ Traiter ce signalement
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Traitement */}
      {processingReport && (
        <div 
          onClick={() => setProcessingReport(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '500px',
              width: '90%'
            }}
          >
            <h2 style={{ margin: '0 0 20px 0', fontSize: '20px' }}>
              ⚖️ Traiter le signalement #{processingReport.id}
            </h2>

            <div style={{ 
              padding: 16, 
              background: '#f9fafb', 
              borderRadius: 8, 
              marginBottom: 20 
            }}>
              <div style={{ marginBottom: 8 }}>
                <strong>Type:</strong> {getTypeLabel(processingReport.reported_type)}
              </div>
              <div style={{ marginBottom: 8 }}>
                <strong>Raison:</strong> {processingReport.reason}
              </div>
              <div>
                <strong>Sévérité:</strong> {getSeverityBadge(processingReport.severity)}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 12 }}>Choisissez un verdict:</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => handleProcess(processingReport.id, 'valid')}
                  style={{
                    padding: '12px 20px',
                    background: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                >
                  ✅ Signalement justifié - Actions prises
                </button>
                <button
                  onClick={() => handleProcess(processingReport.id, 'invalid')}
                  style={{
                    padding: '12px 20px',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600,
                    textAlign: 'left'
                  }}
                >
                  ❌ Signalement non justifié - Contenu conforme
                </button>
                <button
                  onClick={() => setProcessingReport(null)}
                  style={{
                    padding: '12px 20px',
                    background: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
