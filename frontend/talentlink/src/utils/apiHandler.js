import { toast } from 'react-toastify';

/**
 * Gestionnaire d'erreurs API centralisé
 * Gère les erreurs de connexion, timeouts, et erreurs HTTP
 */

const SERVICE_NAMES = {
  'localhost:8001': 'Authentification',
  'localhost:8002': 'Profils',
  'localhost:8003': 'Offres d\'emploi',
  'localhost:8004': 'Messagerie',
  'localhost:8005': 'Emails',
  'localhost:8006': 'Rendez-vous',
  'localhost:8007': 'Signalements'
};

/**
 * Extraire le nom du service depuis une URL
 */
const getServiceName = (url) => {
  try {
    const urlObj = new URL(url);
    const host = urlObj.host;
    return SERVICE_NAMES[host] || 'Service inconnu';
  } catch {
    return 'Service';
  }
};

/**
 * Wrapper pour fetch avec gestion d'erreurs améliorée
 */
export const fetchWithErrorHandling = async (url, options = {}) => {
  const serviceName = getServiceName(url);
  
  try {
    // Timeout par défaut de 10 secondes
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Gérer les erreurs HTTP
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      switch (response.status) {
        case 401:
          toast.error('🔐 Session expirée. Veuillez vous reconnecter.');
          // Rediriger vers login après 2 secondes
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          throw new Error('Unauthorized');
        
        case 403:
          toast.error('🚫 Accès refusé. Permissions insuffisantes.');
          throw new Error('Forbidden');
        
        case 404:
          toast.warning(`⚠️ Ressource non trouvée`);
          throw new Error('Not Found');
        
        case 500:
          toast.error(`❌ Erreur serveur (${serviceName}). Veuillez réessayer plus tard.`);
          throw new Error('Internal Server Error');
        
        case 503:
          toast.error(`🔧 Service ${serviceName} temporairement indisponible`);
          throw new Error('Service Unavailable');
        
        default:
          toast.error(`❌ Erreur ${response.status}: ${errorData.detail || errorData.message || 'Erreur inconnue'}`);
          throw new Error(`HTTP Error ${response.status}`);
      }
    }
    
    return response;
    
  } catch (error) {
    // Gérer les erreurs de réseau
    if (error.name === 'AbortError') {
      toast.error(`⏱️ Timeout: Le service ${serviceName} ne répond pas`);
      console.error(`Timeout sur ${serviceName}:`, url);
      throw new Error('Request Timeout');
    }
    
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
      toast.error(`🔌 Service ${serviceName} inaccessible. Vérifiez que le serveur est démarré.`, {
        autoClose: 5000
      });
      console.error(`Service ${serviceName} (${url}) est hors ligne`);
      throw new Error('Service Unavailable');
    }
    
    // Relancer les autres erreurs
    throw error;
  }
};

/**
 * Helper pour les requêtes GET
 */
export const apiGet = async (url, options = {}) => {
  const response = await fetchWithErrorHandling(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  return response.json();
};

/**
 * Helper pour les requêtes POST
 */
export const apiPost = async (url, data, options = {}) => {
  const response = await fetchWithErrorHandling(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  });
  
  return response.json();
};

/**
 * Helper pour les requêtes PUT
 */
export const apiPut = async (url, data, options = {}) => {
  const response = await fetchWithErrorHandling(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    body: JSON.stringify(data),
    ...options
  });
  
  return response.json();
};

/**
 * Helper pour les requêtes DELETE
 */
export const apiDelete = async (url, options = {}) => {
  const response = await fetchWithErrorHandling(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  });
  
  // DELETE peut retourner 204 No Content
  if (response.status === 204) {
    return null;
  }
  
  return response.json();
};

/**
 * Helper pour les uploads de fichiers
 */
export const apiUpload = async (url, formData, options = {}) => {
  const response = await fetchWithErrorHandling(url, {
    method: 'POST',
    // Ne pas définir Content-Type pour FormData (le navigateur le fait automatiquement)
    body: formData,
    ...options
  });
  
  return response.json();
};

/**
 * Vérifier la disponibilité d'un service
 */
export const checkServiceHealth = async (serviceUrl) => {
  try {
    const response = await fetch(`${serviceUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(3000) // 3 secondes max
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Vérifier tous les services
 */
export const checkAllServices = async () => {
  const services = Object.keys(SERVICE_NAMES).map(host => `http://${host}`);
  const results = await Promise.all(
    services.map(async (url) => ({
      url,
      name: getServiceName(url),
      available: await checkServiceHealth(url)
    }))
  );
  return results;
};
