import React, { useEffect, useRef, useCallback } from 'react';
import './GoogleLoginButton.css';
import { API_AUTH_URL } from '../constants/api';

const GoogleLoginButton = ({ onSuccess, onError }) => {
  const GOOGLE_CLIENT_ID = "520017097188-m2ag24dha7pp5ssecm393g130n9lpdci.apps.googleusercontent.com";
  const buttonRef = useRef(null);

  const handleCredentialResponse = useCallback(async (response) => {
    console.log('Google credential received');
    try {
      // Envoyer le token au backend
      const res = await fetch(`${API_AUTH_URL}/auth/google/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: response.credential }),
      });

      const data = await res.json();
      console.log('Backend response:', data);

      if (res.ok) {
        // Stocker le token et les données utilisateur
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        console.log('Google login successful');
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        throw new Error(data.detail || 'Échec de la connexion Google');
      }
    } catch (error) {
      console.error('Erreur lors de la connexion Google:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [onSuccess, onError]);

  const initializeGoogleSignIn = useCallback(() => {
    if (!window.google || !buttonRef.current) {
      console.error('Google API or button ref not available');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Rendre le bouton Google
      window.google.accounts.id.renderButton(
        buttonRef.current,
        {
          theme: 'outline',
          size: 'large',
          width: buttonRef.current.offsetWidth,
          text: 'signin_with',
          locale: 'fr',
        }
      );

      console.log('Google Sign-In initialized');
    } catch (error) {
      console.error('Error initializing Google Sign-In:', error);
      if (onError) {
        onError(error);
      }
    }
  }, [GOOGLE_CLIENT_ID, handleCredentialResponse, onError]);

  useEffect(() => {
    // Charger le script Google Identity Services
    const loadGoogleScript = () => {
      if (window.google) {
        initializeGoogleSignIn();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log('Google Identity Services loaded');
        initializeGoogleSignIn();
      };
      script.onerror = () => {
        console.error('Failed to load Google Identity Services');
        if (onError) {
          onError(new Error('Impossible de charger Google Sign-In'));
        }
      };
      document.body.appendChild(script);
    };

    loadGoogleScript();
  }, [initializeGoogleSignIn, onError]);

  return (
    <div className="google-login-wrapper">
      <div ref={buttonRef} className="google-login-button-container"></div>
    </div>
  );
};

export default GoogleLoginButton;
