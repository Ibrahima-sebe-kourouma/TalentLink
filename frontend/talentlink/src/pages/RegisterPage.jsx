import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_AUTH_URL } from '../constants/api';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../styles/Auth.css';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mot_de_passe: '',
    role: 'candidat',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (field, value) => setFormData({ ...formData, [field]: value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const apiData = {
      name: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      password: formData.mot_de_passe,
      role: formData.role,
    };

    try {
      const response = await fetch(`${API_AUTH_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/login');
      } else {
        setError(data.detail || 'Une erreur est survenue lors de l\'inscription');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (data) => {
    // Inscription réussie avec Google - redirection automatique selon le rôle
    const role = (data?.user?.role || '').toLowerCase();
    if (role === 'recruteur') {
      navigate('/recruiter');
    } else if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/candidate');
    }
  };

  const handleGoogleError = (error) => {
    setError('Échec de l\'inscription avec Google. Veuillez réessayer.');
    console.error('Erreur Google Register:', error);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">TalentLink</Link>
          <h1 className="auth-title">Créer un compte TalentLink</h1>
          <p className="auth-subtitle">Rejoignez notre communauté de talents</p>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab">Connexion</Link>
            <Link to="/register" className="auth-tab active">Inscription</Link>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && <div className="form-error">{error}</div>}
            
            {/* Bouton Google OAuth */}
            <GoogleLoginButton 
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            
            <div className="auth-divider">
              <span>ou</span>
            </div>
            
            <div className="form-group">
              <label htmlFor="prenom" className="form-label">Prénom</label>
              <input
                id="prenom"
                type="text"
                className="form-input"
                value={formData.prenom}
                onChange={e => handleChange('prenom', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="nom" className="form-label">Nom</label>
              <input
                id="nom"
                type="text"
                className="form-input"
                value={formData.nom}
                onChange={e => handleChange('nom', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={formData.mot_de_passe}
                onChange={e => handleChange('mot_de_passe', e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">Je suis un</label>
              <select
                id="role"
                className="form-input"
                value={formData.role}
                onChange={e => handleChange('role', e.target.value)}
                required
              >
                <option value="candidat">Candidat</option>
                <option value="recruteur">Recruteur</option>
              </select>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Déjà inscrit ?{' '}
            <Link to="/login" className="auth-link">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
