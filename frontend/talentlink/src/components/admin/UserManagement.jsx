import React, { useState, useEffect } from 'react';

const API_AUTH = 'http://localhost:8001';

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState('');
  const [actionReason, setActionReason] = useState('');
  const [suspendUntil, setSuspendUntil] = useState('');
  const [newRole, setNewRole] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 10;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let url = `${API_AUTH}/admin/users/public?limit=100`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (statusFilter) url += `&status=${statusFilter}`;

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Erreur chargement utilisateurs');
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const handleAction = async () => {
    if (!selectedUser || !actionReason.trim()) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    try {
      let url = '';
      let body = {};
      let method = 'PATCH';

      if (actionType === 'change_role') {
        url = `${API_AUTH}/admin/users/${selectedUser.id}/change-role?new_role=${newRole}&reason=${encodeURIComponent(actionReason)}`;
        method = 'POST';
      } else {
        // Ban, suspend, reactive
        url = `${API_AUTH}/admin/users/${selectedUser.id}/status`;
        body = {
          status: actionType === 'ban' ? 'banned' : actionType === 'suspend' ? 'suspended' : 'active',
          reason: actionReason,
          suspended_until: suspendUntil || null
        };
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('talentlink_token')}`
        },
        body: method === 'PATCH' ? JSON.stringify(body) : undefined
      });

      if (response.ok) {
        alert('Action effectuée avec succès');
        setShowActionModal(false);
        setSelectedUser(null);
        setActionType('');
        setActionReason('');
        setSuspendUntil('');
        setNewRole('');
        fetchUsers();
      } else {
        const error = await response.json();
        alert(`Erreur: ${error.detail || 'Action échouée'}`);
      }
    } catch (error) {
      console.error('Erreur action:', error);
      alert('Erreur lors de l\'exécution de l\'action');
    }
  };

  const openActionModal = (usr, action) => {
    setSelectedUser(usr);
    setActionType(action);
    setShowActionModal(true);
    setActionReason('');
    setSuspendUntil('');
    if (action === 'change_role') {
      setNewRole(usr.role);
    }
  };

  // Filtrer et paginer
  const filteredUsers = users.filter(u => {
    const searchLower = searchTerm.toLowerCase();
    return (
      u.name?.toLowerCase().includes(searchLower) ||
      u.prenom?.toLowerCase().includes(searchLower) ||
      u.email?.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const displayedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#d1fae5', color: '#065f46', text: '✅ Actif' },
      suspended: { bg: '#fef3c7', color: '#92400e', text: '⏸️ Suspendu' },
      banned: { bg: '#fee2e2', color: '#991b1b', text: '🚫 Banni' }
    };
    const style = styles[status] || styles.active;
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: style.bg,
        color: style.color
      }}>
        {style.text}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const isAdmin = role === 'admin';
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        background: isAdmin ? '#e0e7ff' : '#f3e8ff',
        color: isAdmin ? '#3730a3' : '#6b21a8'
      }}>
        {isAdmin ? '👑 Admin' : '👤 Candidat'}
      </span>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8, fontSize: '28px', fontWeight: 700 }}>
          👥 Gestion des utilisateurs
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Gérez les comptes, statuts et permissions des utilisateurs de la plateforme
        </p>
      </div>

      {/* Filtres et recherche */}
      <div style={{
        padding: 24,
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              🔍 Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom, prénom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              Rôle
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="">Tous</option>
              <option value="admin">Admin</option>
              <option value="candidat">Candidat</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1px solid #d1d5db',
                borderRadius: 8,
                fontSize: 14,
                outline: 'none',
                background: 'white'
              }}
            >
              <option value="">Tous</option>
              <option value="active">Actif</option>
              <option value="suspended">Suspendu</option>
              <option value="banned">Banni</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques rapides */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Total utilisateurs</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#2563eb' }}>{users.length}</div>
        </div>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Actifs</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#10b981' }}>
            {users.filter(u => u.status === 'active').length}
          </div>
        </div>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Suspendus</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>
            {users.filter(u => u.status === 'suspended').length}
          </div>
        </div>
        <div style={{ padding: 20, background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 8 }}>Bannis</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#dc2626' }}>
            {users.filter(u => u.status === 'banned').length}
          </div>
        </div>
      </div>

      {/* Tableau des utilisateurs */}
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {loading ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <p style={{ color: '#6b7280' }}>Chargement des utilisateurs...</p>
          </div>
        ) : displayedUsers.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <p style={{ color: '#6b7280' }}>Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Utilisateur
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Email
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Rôle
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Statut
                    </th>
                    <th style={{ padding: 16, textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Inscription
                    </th>
                    <th style={{ padding: 16, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#374151' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedUsers.map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: 16 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: '#111827', marginBottom: 4 }}>
                          {usr.name} {usr.prenom}
                        </div>
                        <div style={{ fontSize: 12, color: '#9ca3af' }}>ID: {usr.id}</div>
                      </td>
                      <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                        {usr.email}
                      </td>
                      <td style={{ padding: 16 }}>
                        {getRoleBadge(usr.role)}
                      </td>
                      <td style={{ padding: 16 }}>
                        {getStatusBadge(usr.status)}
                      </td>
                      <td style={{ padding: 16, fontSize: 14, color: '#6b7280' }}>
                        {new Date(usr.date_creation).toLocaleDateString('fr-FR')}
                      </td>
                      <td style={{ padding: 16, textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          {usr.status === 'active' && (
                            <>
                              <button
                                onClick={() => openActionModal(usr, 'suspend')}
                                style={{
                                  padding: '6px 12px',
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                title="Suspendre"
                              >
                                ⏸️
                              </button>
                              <button
                                onClick={() => openActionModal(usr, 'ban')}
                                style={{
                                  padding: '6px 12px',
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  border: 'none',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: 'pointer'
                                }}
                                title="Bannir"
                              >
                                🚫
                              </button>
                            </>
                          )}
                          {(usr.status === 'suspended' || usr.status === 'banned') && (
                            <button
                              onClick={() => openActionModal(usr, 'reactive')}
                              style={{
                                padding: '6px 12px',
                                background: '#d1fae5',
                                color: '#065f46',
                                border: 'none',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer'
                              }}
                              title="Réactiver"
                            >
                              ✅ Réactiver
                            </button>
                          )}
                          <button
                            onClick={() => openActionModal(usr, 'change_role')}
                            style={{
                              padding: '6px 12px',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              border: 'none',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                            title="Changer le rôle"
                          >
                            🔄
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                padding: 16,
                borderTop: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 8
              }}>
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    background: currentPage === 1 ? '#f3f4f6' : 'white',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  ← Précédent
                </button>
                <span style={{ fontSize: 14, color: '#6b7280' }}>
                  Page {currentPage} sur {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #d1d5db',
                    borderRadius: 6,
                    background: currentPage === totalPages ? '#f3f4f6' : 'white',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: 14,
                    fontWeight: 500
                  }}
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal d'action */}
      {showActionModal && selectedUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: 20
        }}>
          <div style={{
            background: 'white',
            borderRadius: 16,
            padding: 32,
            maxWidth: 500,
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
          }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: 24, fontWeight: 700 }}>
              {actionType === 'ban' && '🚫 Bannir l\'utilisateur'}
              {actionType === 'suspend' && '⏸️ Suspendre l\'utilisateur'}
              {actionType === 'reactive' && '✅ Réactiver l\'utilisateur'}
              {actionType === 'change_role' && '🔄 Changer le rôle'}
            </h2>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 14, color: '#6b7280', margin: 0 }}>
                <strong>Utilisateur:</strong> {selectedUser.name} {selectedUser.prenom} ({selectedUser.email})
              </p>
            </div>

            {actionType === 'change_role' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                  Nouveau rôle
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none'
                  }}
                >
                  <option value="admin">Admin</option>
                  <option value="candidat">Candidat</option>
                </select>
              </div>
            )}

            {actionType === 'suspend' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                  Suspendu jusqu'au (optionnel)
                </label>
                <input
                  type="date"
                  value={suspendUntil}
                  onChange={(e) => setSuspendUntil(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    border: '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 14,
                    outline: 'none'
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, marginBottom: 8, color: '#374151' }}>
                Raison * <span style={{ color: '#dc2626' }}>obligatoire</span>
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Expliquez la raison de cette action..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedUser(null);
                  setActionType('');
                  setActionReason('');
                  setSuspendUntil('');
                  setNewRole('');
                }}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: '1px solid #d1d5db',
                  borderRadius: 8,
                  background: 'white',
                  color: '#374151',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: 8,
                  background: actionType === 'ban' ? '#dc2626' : actionType === 'suspend' ? '#f59e0b' : '#10b981',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
