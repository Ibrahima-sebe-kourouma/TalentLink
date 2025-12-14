import { useState, useEffect } from 'react';
import { hasCompletedTour, markTourCompleted, isFirstVisit } from '../../utils/tourHelpers';

/**
 * Hook personnalisé pour gérer les tours produit
 * @param {string} tourKey - Clé unique du tour
 * @param {Array} steps - Étapes du tour
 * @param {number} userId - ID de l'utilisateur
 * @param {boolean} autoStart - Démarrer automatiquement si première visite
 * @returns {Object} - { run, startTour, stopTour }
 */
export const useProductTour = (tourKey, steps, userId, autoStart = true) => {
  const [run, setRun] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Attendre que le DOM soit prêt
    const timer = setTimeout(() => {
      setIsReady(true);
      
      if (autoStart && userId && !hasCompletedTour(tourKey, userId)) {
        // Vérifier si c'est la première visite globale
        const firstVisit = isFirstVisit(userId);
        
        if (firstVisit || tourKey.includes('dashboard')) {
          // Démarrer automatiquement pour les nouveaux utilisateurs ou sur les dashboards
          setRun(true);
        }
      }
    }, 1000); // Délai pour s'assurer que tous les éléments sont rendus

    return () => clearTimeout(timer);
  }, [tourKey, userId, autoStart]);

  const startTour = () => {
    if (isReady) {
      setRun(true);
    }
  };

  const stopTour = () => {
    setRun(false);
  };

  const handleTourComplete = (data) => {
    setRun(false);
    
    // Marquer comme complété seulement si terminé (pas skippé)
    if (data?.action === 'complete' && userId) {
      markTourCompleted(tourKey, userId);
    }
  };

  return {
    run,
    startTour,
    stopTour,
    handleTourComplete,
    isReady,
  };
};
