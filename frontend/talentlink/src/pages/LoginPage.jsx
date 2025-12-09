import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API_AUTH_URL } from '../constants/api';
import GoogleLoginButton from '../components/GoogleLoginButton';
import '../styles/Auth.css';

const LoginPage = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await fetch(`${API_AUTH_URL}/auth/login?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
          method: 'POST'
      });

      const data = await response.json();

      if (response.ok) {
        // Sauvegarder les données utilisateur et le token
        const userData = {
          ...data.user,
          access_token: data.access_token
        };
        setUser(userData);
        const role = (data?.user?.role || '').toLowerCase();
        if (role === 'recruteur') {
          navigate('/recruiter');
        } else if (role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/candidate');
        }
      } else {
          setError(typeof data.detail === 'string' ? data.detail : 'Identifiants invalides');
      }
    } catch {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = (data) => {
    // Connexion réussie avec Google
    const userData = {
      ...data.user,
      access_token: data.access_token
    };
    setUser(userData);
    
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
    setError('Échec de la connexion avec Google. Veuillez réessayer.');
    console.error('Erreur Google Login:', error);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">TalentLink</Link>
          <h1 className="auth-title">Bienvenue sur TalentLink</h1>
          <p className="auth-subtitle">Connectez-vous ou inscrivez-vous pour commencer votre parcours.</p>
        </div>

        <div className="auth-body">
          <div className="auth-tabs">
            <Link to="/login" className="auth-tab active">Connexion</Link>
            <Link to="/register" className="auth-tab">Inscription</Link>
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
              <label htmlFor="email" className="form-label">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="votre.email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <Link to="/forgot-password" className="auth-link">Mot de passe oublié ?</Link>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>

        <div className="auth-footer">
          <p>
            Pas encore de compte ?{' '}
            <Link to="/register" className="auth-link">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
