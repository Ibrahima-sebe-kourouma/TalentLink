import React, { useEffect, useState } from "react";
import { API_AUTH_URL } from "../../constants/api";
import "../../styles/dashboard.css";

export default function UserManagement({ user }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    search: ''
  });
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [actionUser, setActionUser] = useState(null);

  // Charger tous les utilisateurs
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = user?.access_token;
      if (!token) {
        throw new Error("Token d'authentification manquant");
      }
      
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      
      const res = await fetch(`${API_AUTH_URL}/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors du chargement des utilisateurs");
      }
      
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error("Erreur chargement utilisateurs:", e.message);
    } finally {
      setLoading(false);
    }
  };

  // Action sur un utilisateur
  const updateUserStatus = async (userId, status, reason = '') => {
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: status, reason })
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors de la mise à jour");
      }
      
      // Recharger les utilisateurs
      fetchUsers();
      setActionUser(null);
      setShowBanModal(false);
      setBanReason("");
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  // Changer le rôle d'un utilisateur
  const updateUserRole = async (userId, newRole) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir changer le rôle de cet utilisateur vers ${newRole} ?`)) {
      return;
    }
    
    try {
      const token = user?.access_token;
      if (!token) return;
      const res = await fetch(`${API_AUTH_URL}/admin/users/${userId}/change-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_role: newRole, reason: 'Modification via interface admin' })
      });
      
      if (!res.ok) {
        throw new Error("Erreur lors du changement de rôle");
      }
      
      fetchUsers();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  // Actions groupées
  const batchUpdateStatus = async (status, reason = "") => {
    if (selectedUsers.length === 0) {
      alert("Veuillez sélectionner des utilisateurs");
      return;
    }
    
    if (!window.confirm(`Êtes-vous sûr de vouloir ${status} ${selectedUsers.length} utilisateur(s) ?`)) {
      return;
    }
    
    try {
      const token = user?.access_token;
      if (!token) return;
      
      if (status === 'suspended') {
        const res = await fetch(`${API_AUTH_URL}/admin/batch/suspend-users`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            user_ids: selectedUsers, 
            reason: `Action en lot: ${status}`,
            suspended_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
        });
        
        if (!res.ok) {
          throw new Error("Erreur lors de la suspension groupée");
        }
      }
      
      setSelectedUsers([]);
      fetchUsers();
    } catch (e) {
      alert("Erreur: " + e.message);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleSearch = (e) => {
    setFilters({ ...filters, search: e.target.value });
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { background: '#d1fae5', color: '#065f46' },
      suspended: { background: '#fef3c7', color: '#92400e' },
      banned: { background: '#fee2e2', color: '#991b1b' }
    };
    
    const labels = {
      active: 'Actif',
      suspended: 'Suspendu',
      banned: 'Banni'
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

  const getRoleBadge = (role) => {
    const styles = {
      candidat: { background: '#dbeafe', color: '#1e40af' },
      recruteur: { background: '#dcfce7', color: '#166534' },
      admin: { background: '#fee2e2', color: '#991b1b' }
    };
    
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        ...styles[role]
      }}>
        {role.toUpperCase()}
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
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Gestion des utilisateurs</h2>
        <div>Chargement...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, marginBottom: 4 }}>Gestion des utilisateurs</h2>
          <p style={{ color: 'var(--tl-text-secondary)', margin: 0 }}>
            {users.length} utilisateur(s) • {selectedUsers.length} sélectionné(s)
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="tl-card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
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
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            style={{
              padding: 12,
              border: '1px solid #d1d5db',
              borderRadius: 8,
              fontSize: 14,
              minWidth: 120
            }}
          >
            <option value="">Tous les rôles</option>
            <option value="candidat">Candidat</option>
            <option value="recruteur">Recruteur</option>
            <option value="admin">Admin</option>
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
            <option value="active">Actif</option>
            <option value="suspended">Suspendu</option>
            <option value="banned">Banni</option>
          </select>
        </div>

        {/* Actions groupées */}
        {selectedUsers.length > 0 && (
          <div style={{ display: 'flex', gap: 12, padding: 12, background: '#f3f4f6', borderRadius: 8 }}>
            <button
              onClick={() => batchUpdateStatus('suspended', 'Suspension groupée')}
              style={{
                padding: '6px 12px',
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Suspendre ({selectedUsers.length})
            </button>
            <button
              onClick={() => batchUpdateStatus('banned', 'Bannissement groupé')}
              style={{
                padding: '6px 12px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Bannir ({selectedUsers.length})
            </button>
            <button
              onClick={() => batchUpdateStatus('active', 'Réactivation groupée')}
              style={{
                padding: '6px 12px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12
              }}
            >
              Réactiver ({selectedUsers.length})
            </button>
          </div>
        )}
      </div>

      {/* Liste des utilisateurs */}
      <div className="tl-card" style={{ padding: 0 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left' }}>
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={selectAllUsers}
                  />
                </th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Utilisateur</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Email</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Rôle</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Statut</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Inscription</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 14, fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td style={{ padding: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {user.nom} {user.prenom}
                      </div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>ID: {user.id}</div>
                    </div>
                  </td>
                  <td style={{ padding: 12, fontSize: 14 }}>{user.email}</td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {getRoleBadge(user.role)}
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        style={{
                          padding: '2px 6px',
                          fontSize: 10,
                          border: '1px solid #d1d5db',
                          borderRadius: 4
                        }}
                      >
                        <option value="candidat">Candidat</option>
                        <option value="recruteur">Recruteur</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td style={{ padding: 12 }}>
                    {getStatusBadge(user.status || 'active')}
                  </td>
                  <td style={{ padding: 12, fontSize: 12, color: '#6b7280' }}>
                    {formatDate(user.created_at)}
                  </td>
                  <td style={{ padding: 12 }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {user.status !== 'suspended' && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'suspended', 'Suspension manuelle')}
                          style={{
                            padding: '4px 8px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                          title="Suspendre"
                        >
                          ⏸️
                        </button>
                      )}
                      
                      {user.status !== 'banned' && (
                        <button
                          onClick={() => {
                            setActionUser(user);
                            setShowBanModal(true);
                          }}
                          style={{
                            padding: '4px 8px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                          title="Bannir"
                        >
                          🚫
                        </button>
                      )}
                      
                      {(user.status === 'suspended' || user.status === 'banned') && (
                        <button
                          onClick={() => updateUserStatus(user.id, 'active', 'Réactivation manuelle')}
                          style={{
                            padding: '4px 8px',
                            background: '#16a34a',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            cursor: 'pointer',
                            fontSize: 11
                          }}
                          title="Réactiver"
                        >
                          ✅
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {users.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>
            Aucun utilisateur trouvé
          </div>
        )}
      </div>

      {/* Modal de bannissement */}
      {showBanModal && actionUser && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: 24,
            borderRadius: 12,
            minWidth: 400,
            maxWidth: 500
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>
              Bannir l'utilisateur {actionUser.nom} {actionUser.prenom}
            </h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600 }}>
                Raison du bannissement
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Indiquez la raison du bannissement..."
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
                onClick={() => {
                  setShowBanModal(false);
                  setActionUser(null);
                  setBanReason("");
                }}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => updateUserStatus(actionUser.id, 'banned', banReason)}
                style={{
                  padding: '8px 16px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer'
                }}
              >
                Bannir définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}