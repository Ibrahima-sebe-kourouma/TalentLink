/**
 * Helpers pour gérer les tours produit (onboarding)
 * Gère la persistance dans localStorage
 */

const TOUR_PREFIX = 'talenlink_tour_completed_';

/**
 * Vérifie si un utilisateur a déjà complété un tour spécifique
 * @param {string} tourKey - Clé unique du tour (ex: 'candidate_dashboard')
 * @param {number} userId - ID de l'utilisateur
 * @returns {boolean}
 */
export const hasCompletedTour = (tourKey, userId) => {
  if (!userId) return false;
  const key = `${TOUR_PREFIX}${tourKey}_${userId}`;
  return localStorage.getItem(key) === 'true';
};

/**
 * Marque un tour comme complété
 * @param {string} tourKey - Clé unique du tour
 * @param {number} userId - ID de l'utilisateur
 */
export const markTourCompleted = (tourKey, userId) => {
  if (!userId) return;
  const key = `${TOUR_PREFIX}${tourKey}_${userId}`;
  localStorage.setItem(key, 'true');
};

/**
 * Réinitialise un tour (pour permettre à l'utilisateur de le revoir)
 * @param {string} tourKey - Clé unique du tour
 * @param {number} userId - ID de l'utilisateur
 */
export const resetTour = (tourKey, userId) => {
  if (!userId) return;
  const key = `${TOUR_PREFIX}${tourKey}_${userId}`;
  localStorage.removeItem(key);
};

/**
 * Réinitialise tous les tours d'un utilisateur
 * @param {number} userId - ID de l'utilisateur
 */
export const resetAllTours = (userId) => {
  if (!userId) return;
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith(TOUR_PREFIX) && key.endsWith(`_${userId}`)) {
      localStorage.removeItem(key);
    }
  });
};

/**
 * Vérifie si c'est la première visite d'un utilisateur sur la plateforme
 * @param {number} userId - ID de l'utilisateur
 * @returns {boolean}
 */
export const isFirstVisit = (userId) => {
  if (!userId) return true;
  const key = `talenlink_first_visit_${userId}`;
  const hasVisited = localStorage.getItem(key);
  
  if (!hasVisited) {
    localStorage.setItem(key, 'true');
    return true;
  }
  
  return false;
};
