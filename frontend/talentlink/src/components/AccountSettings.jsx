import React, { useState } from 'react';
import { API_AUTH_URL } from '../constants/api';
import './AccountSettings.css';

const AccountSettings = ({ user, onLogout }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // L'API d'update utilisateur attend tous les champs requis.
      const response = await fetch(`${API_AUTH_URL}/auth/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: user.name,
          prenom: user.prenom,
          email: user.email,
          role: user.role,
          password: newPassword,
        }),
      });

      if (response.ok) {
        setMessage('Mot de passe modifié avec succès');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
      } else {
        setError('Erreur lors de la modification du mot de passe');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        // Supprimer le compte utilisateur (le service Auth s'occupe aussi de supprimer le profil candidat associé)
        const response = await fetch(`${API_AUTH_URL}/auth/users/${user.id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          onLogout(); // Déconnexion après suppression
        } else {
          setError('Erreur lors de la suppression du compte');
        }
      } catch (err) {
        setError('Erreur de connexion');
      }
    }
  };

  return (
    <div className="account-settings">
      <h2>Paramètres du compte</h2>
      
      <div className="settings-section">
        <h3>Modifier le mot de passe</h3>
        <form onSubmit={handlePasswordChange}>
          <div className="form-group">
            <label>Mot de passe actuel</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirmer le nouveau mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Modifier le mot de passe</button>
        </form>
      </div>

      <div className="settings-section danger-zone">
        <h3>Zone de danger</h3>
        <p>La suppression de votre compte est irréversible. Toutes vos données seront perdues.</p>
        <button onClick={handleDeleteAccount} className="delete-account">
          Supprimer mon compte
        </button>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default AccountSettings;