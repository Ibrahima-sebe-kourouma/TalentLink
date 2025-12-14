import React, { useState, useEffect } from 'react';
import { API_AUTH_URL } from '../../constants/api';
import '../../styles/admin-settings.css';

export default function Settings({ user }) {
  const [settings, setSettings] = useState({
    platformName: 'TalentLink',
    currency: 'CAD',
    language: 'fr',
    emailNotifications: true,
    maintenanceMode: false,
    allowRegistrations: true,
    requireEmailVerification: false,
    maxApplicationsPerDay: 10,
    sessionTimeout: 30,
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [activeSection, setActiveSection] = useState('general');

  // Charger les paramètres actuels (simulé pour l'instant)
  useEffect(() => {
    // TODO: Charger les paramètres depuis le backend
    console.log('👤 Settings - User:', user);
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('');

    try {
      // TODO: Envoyer les paramètres au backend
      // const response = await fetch(`${API_AUTH_URL}/admin/settings`, {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${user?.access_token}`
      //   },
      //   body: JSON.stringify(settings)
      // });

      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      setSaveStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?')) {
      setSettings({
        platformName: 'TalentLink',
        currency: 'CAD',
        language: 'fr',
        emailNotifications: true,
        maintenanceMode: false,
        allowRegistrations: true,
        requireEmailVerification: false,
        maxApplicationsPerDay: 10,
        sessionTimeout: 30,
      });
      setSaveStatus('reset');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const sections = [
    { id: 'general', label: 'Général', icon: '⚙️' },
    { id: 'security', label: 'Sécurité', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'appearance', label: 'Apparence', icon: '🎨' },
    { id: 'advanced', label: 'Avancé', icon: '🔧' },
  ];

  return (
    <div className="settings-container">
      {/* En-tête */}
      <div className="settings-header">
        <div>
          <h2 className="settings-title">Paramètres système</h2>
          <p className="settings-subtitle">
            Configuration globale de la plateforme TalentLink
          </p>
        </div>
        <div className="settings-actions">
          <button
            className="btn-secondary"
            onClick={handleReset}
            disabled={loading}
          >
            🔄 Réinitialiser
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '💾 Enregistrement...' : '💾 Enregistrer'}
          </button>
        </div>
      </div>

      {/* Message de statut */}
      {saveStatus && (
        <div className={`status-message ${saveStatus}`}>
          {saveStatus === 'success' && '✅ Paramètres enregistrés avec succès'}
          {saveStatus === 'error' && '❌ Erreur lors de l\'enregistrement'}
          {saveStatus === 'reset' && '🔄 Paramètres réinitialisés'}
        </div>
      )}

      <div className="settings-layout">
        {/* Navigation des sections */}
        <aside className="settings-nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </aside>

        {/* Contenu des sections */}
        <main className="settings-content">
          {/* Section Général */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h3 className="section-title">⚙️ Paramètres généraux</h3>
              
              <div className="setting-group">
                <label className="setting-label">
                  Nom de la plateforme
                  <input
                    type="text"
                    className="setting-input"
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </label>
                <p className="setting-hint">
                  Le nom affiché sur toute la plateforme
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Devise
                  <select
                    className="setting-select"
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  >
                    <option value="CAD">Dollar Canadien (CAD $)</option>
                    <option value="USD">Dollar Américain (USD $)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="GBP">Livre Sterling (£)</option>
                  </select>
                </label>
                <p className="setting-hint">
                  Devise utilisée pour les salaires et rémunérations
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Langue par défaut
                  <select
                    className="setting-select"
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </label>
                <p className="setting-hint">
                  Langue par défaut de l'interface
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistrations}
                    onChange={(e) => setSettings({ ...settings, allowRegistrations: e.target.checked })}
                  />
                  <span>Autoriser les nouvelles inscriptions</span>
                </label>
                <p className="setting-hint">
                  Permet aux nouveaux utilisateurs de créer un compte
                </p>
              </div>
            </div>
          )}

          {/* Section Sécurité */}
          {activeSection === 'security' && (
            <div className="settings-section">
              <h3 className="section-title">🔒 Sécurité</h3>
              
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => setSettings({ ...settings, requireEmailVerification: e.target.checked })}
                  />
                  <span>Exiger la vérification de l'email</span>
                </label>
                <p className="setting-hint">
                  Les nouveaux utilisateurs doivent vérifier leur email avant d'accéder à la plateforme
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Durée de session (minutes)
                  <input
                    type="number"
                    className="setting-input"
                    min="5"
                    max="1440"
                    value={settings.sessionTimeout}
                    onChange={(e) => setSettings({ ...settings, sessionTimeout: parseInt(e.target.value) })}
                  />
                </label>
                <p className="setting-hint">
                  Temps avant déconnexion automatique pour inactivité
                </p>
              </div>

              <div className="setting-group">
                <label className="setting-label">
                  Candidatures max par jour (par utilisateur)
                  <input
                    type="number"
                    className="setting-input"
                    min="1"
                    max="100"
                    value={settings.maxApplicationsPerDay}
                    onChange={(e) => setSettings({ ...settings, maxApplicationsPerDay: parseInt(e.target.value) })}
                  />
                </label>
                <p className="setting-hint">
                  Limite le nombre de candidatures qu'un utilisateur peut soumettre par jour
                </p>
              </div>
            </div>
          )}

          {/* Section Notifications */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3 className="section-title">🔔 Notifications</h3>
              
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <span>Activer les notifications par email</span>
                </label>
                <p className="setting-hint">
                  Envoyer des emails pour les événements importants
                </p>
              </div>

              <div className="info-box">
                <div className="info-icon">ℹ️</div>
                <div>
                  <h4>Configuration des notifications</h4>
                  <p>
                    Les utilisateurs peuvent gérer leurs préférences de notifications
                    individuellement dans leur profil.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section Apparence */}
          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h3 className="section-title">🎨 Apparence</h3>
              
              <div className="info-box">
                <div className="info-icon">🚧</div>
                <div>
                  <h4>Bientôt disponible</h4>
                  <p>
                    La personnalisation de l'apparence (couleurs, logo, thème)
                    sera disponible dans une prochaine version.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section Avancé */}
          {activeSection === 'advanced' && (
            <div className="settings-section">
              <h3 className="section-title">🔧 Paramètres avancés</h3>
              
              <div className="setting-group">
                <label className="setting-checkbox">
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode}
                    onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  />
                  <span>Mode maintenance</span>
                </label>
                <p className="setting-hint danger">
                  ⚠️ Active le mode maintenance - seuls les administrateurs pourront accéder à la plateforme
                </p>
              </div>

              <div className="danger-zone">
                <h4>🚨 Zone dangereuse</h4>
                <p>Les actions suivantes sont irréversibles et peuvent affecter tous les utilisateurs.</p>
                
                <div className="danger-actions">
                  <button className="btn-danger" disabled>
                    🗑️ Purger les anciennes offres (30+ jours)
                  </button>
                  <button className="btn-danger" disabled>
                    🗑️ Nettoyer les comptes inactifs (90+ jours)
                  </button>
                  <button className="btn-danger" disabled>
                    📊 Exporter toutes les données
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
