import React, { useState, useEffect } from "react";
import "../styles/cookies.css";

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Préférences des cookies
  const [preferences, setPreferences] = useState({
    necessary: true, // Toujours activés
    analytics: false,
    marketing: false,
    functional: false
  });

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà fait son choix
    const cookieConsent = localStorage.getItem('talentlink_cookie_consent');
    if (!cookieConsent) {
      // Petit délai avant d'afficher la bannière pour une meilleure UX
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Charger les préférences sauvegardées
      try {
        const savedPreferences = JSON.parse(cookieConsent);
        setPreferences(savedPreferences);
      } catch (e) {
        console.error("Erreur lecture préférences cookies:", e);
      }
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    savePreferences(allAccepted);
  };

  const acceptNecessary = () => {
    const necessaryOnly = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    savePreferences(necessaryOnly);
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  const savePreferences = (prefs) => {
    localStorage.setItem('talentlink_cookie_consent', JSON.stringify(prefs));
    setPreferences(prefs);
    setShowBanner(false);
    setShowPreferences(false);

    // Ici vous pouvez initialiser vos outils analytics/marketing selon les préférences
    if (prefs.analytics) {
      // Initialiser Google Analytics, etc.
      console.log("Analytics activés");
    }
    if (prefs.marketing) {
      // Initialiser pixels marketing, etc.
      console.log("Marketing activé");
    }
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="cookie-overlay" onClick={() => {}} />

      {/* Bannière principale */}
      {!showPreferences ? (
        <div className="cookie-banner">
          <div className="cookie-content">
            <div className="cookie-icon">🍪</div>
            <div className="cookie-text">
              <h3 className="cookie-title">Nous utilisons des cookies</h3>
              <p className="cookie-description">
                Nous utilisons des cookies pour améliorer votre expérience sur TalentLink, 
                personnaliser le contenu et analyser notre trafic. En cliquant sur "Tout accepter", 
                vous consentez à notre utilisation des cookies.
              </p>
            </div>
          </div>

          <div className="cookie-actions">
            <button 
              className="cookie-btn cookie-btn-secondary"
              onClick={acceptNecessary}
            >
              Nécessaires uniquement
            </button>
            <button 
              className="cookie-btn cookie-btn-outline"
              onClick={() => setShowPreferences(true)}
            >
              Personnaliser
            </button>
            <button 
              className="cookie-btn cookie-btn-primary"
              onClick={acceptAll}
            >
              Tout accepter
            </button>
          </div>

          <button 
            className="cookie-policy-link"
            onClick={() => {
              // Rediriger vers la politique de confidentialité
              window.open('/privacy-policy', '_blank');
            }}
          >
            Politique de confidentialité
          </button>
        </div>
      ) : (
        /* Panneau de préférences détaillées */
        <div className="cookie-preferences">
          <div className="cookie-preferences-header">
            <h3 className="cookie-title">Paramètres des cookies</h3>
            <button 
              className="cookie-close"
              onClick={() => setShowPreferences(false)}
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>

          <div className="cookie-preferences-body">
            <p className="cookie-description">
              Gérez vos préférences de cookies. Les cookies nécessaires sont toujours activés 
              car ils sont essentiels au fonctionnement du site.
            </p>

            <div className="cookie-categories">
              {/* Cookies nécessaires */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4 className="cookie-category-title">
                      Cookies nécessaires
                      <span className="cookie-badge required">Requis</span>
                    </h4>
                    <p className="cookie-category-desc">
                      Ces cookies sont essentiels pour le fonctionnement du site et ne peuvent pas être désactivés.
                    </p>
                  </div>
                  <label className="cookie-switch disabled">
                    <input 
                      type="checkbox" 
                      checked={preferences.necessary}
                      disabled
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>

              {/* Cookies analytiques */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4 className="cookie-category-title">Cookies analytiques</h4>
                    <p className="cookie-category-desc">
                      Ces cookies nous aident à comprendre comment les visiteurs utilisent notre site.
                    </p>
                  </div>
                  <label className="cookie-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>

              {/* Cookies marketing */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4 className="cookie-category-title">Cookies marketing</h4>
                    <p className="cookie-category-desc">
                      Ces cookies sont utilisés pour afficher des publicités pertinentes.
                    </p>
                  </div>
                  <label className="cookie-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>

              {/* Cookies fonctionnels */}
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <div>
                    <h4 className="cookie-category-title">Cookies fonctionnels</h4>
                    <p className="cookie-category-desc">
                      Ces cookies permettent des fonctionnalités améliorées et une personnalisation.
                    </p>
                  </div>
                  <label className="cookie-switch">
                    <input 
                      type="checkbox" 
                      checked={preferences.functional}
                      onChange={() => togglePreference('functional')}
                    />
                    <span className="cookie-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="cookie-preferences-footer">
            <button 
              className="cookie-btn cookie-btn-secondary"
              onClick={acceptNecessary}
            >
              Refuser tout
            </button>
            <button 
              className="cookie-btn cookie-btn-primary"
              onClick={saveCustomPreferences}
            >
              Confirmer mes choix
            </button>
          </div>
        </div>
      )}
    </>
  );
}
