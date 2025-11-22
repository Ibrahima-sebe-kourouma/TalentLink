# 🛡️ Système de Gestion d'Erreurs API - TalentLink

## 📖 Vue d'ensemble

Ce système gère automatiquement les erreurs de communication avec les microservices backend et affiche des notifications claires à l'utilisateur.

## 🎯 Fonctionnalités

- ✅ **Détection automatique** des services hors ligne
- ✅ **Messages d'erreur contextuels** avec le nom du service
- ✅ **Gestion des timeouts** (10 secondes par défaut)
- ✅ **Gestion des erreurs HTTP** (401, 403, 404, 500, 503, etc.)
- ✅ **Notifications visuelles** avec react-toastify
- ✅ **Helpers simplifiés** pour GET, POST, PUT, DELETE
- ✅ **Support des uploads** de fichiers

## 📦 Installation

Déjà fait ! Les dépendances sont installées :
- `react-toastify` : Notifications toast

## 🚀 Utilisation

### Import des helpers

```javascript
import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from '../utils/apiHandler';
import { API_MESSAGING_URL } from '../constants/api';
```

### Exemples d'utilisation

#### 1. **GET - Récupérer des données**

```javascript
// Avant (méthode classique)
const response = await fetch(`${API_MESSAGING_URL}/conversations/?user_id=${userId}`);
if (response.ok) {
  const data = await response.json();
  setConversations(data);
}

// Après (avec gestion d'erreurs automatique)
try {
  const data = await apiGet(`${API_MESSAGING_URL}/conversations/?user_id=${userId}`);
  setConversations(data);
} catch (error) {
  // L'erreur est déjà affichée à l'utilisateur !
  console.error('Erreur:', error);
}
```

#### 2. **POST - Envoyer des données**

```javascript
// Envoyer un message
try {
  const newMessage = await apiPost(
    `${API_MESSAGING_URL}/messages/`,
    {
      conversation_id: convId,
      sender_id: userId,
      content: messageText
    }
  );
  setMessages([...messages, newMessage]);
} catch (error) {
  // Notification d'erreur automatique
}
```

#### 3. **PUT - Mettre à jour**

```javascript
// Mettre à jour un profil
try {
  const updated = await apiPut(
    `${API_PROFILE_URL}/users/${userId}`,
    { name: 'Nouveau nom', email: 'email@example.com' }
  );
  setUser(updated);
} catch (error) {
  // Erreur gérée automatiquement
}
```

#### 4. **DELETE - Supprimer**

```javascript
// Supprimer une conversation
try {
  await apiDelete(`${API_MESSAGING_URL}/conversations/${convId}`);
  setConversations(convs => convs.filter(c => c.id !== convId));
} catch (error) {
  // Message d'erreur affiché
}
```

#### 5. **Upload de fichiers**

```javascript
// Upload CV
try {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);
  formData.append('user_id', userId);
  
  const result = await apiUpload(`${API_PROFILE_URL}/upload/cv`, formData);
  console.log('CV uploadé:', result);
} catch (error) {
  // Gestion d'erreur automatique
}
```

#### 6. **Authentification avec token**

```javascript
// Requête avec Authorization header
const token = localStorage.getItem('talentlink_token');

try {
  const data = await apiGet(
    `${API_AUTH_URL}/admin/users`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
} catch (error) {
  // Si 401: redirection automatique vers /login
}
```

#### 7. **Timeout personnalisé**

```javascript
// Requête avec timeout de 5 secondes
try {
  const data = await apiGet(
    `${API_OFFERS_URL}/offers`,
    { timeout: 5000 }
  );
} catch (error) {
  // Timeout géré avec message clair
}
```

## 🔔 Types de notifications

### 🔌 Service inaccessible
```
🔌 Service Messagerie inaccessible. Vérifiez que le serveur est démarré.
```

### ⏱️ Timeout
```
⏱️ Timeout: Le service Rendez-vous ne répond pas
```

### 🔐 Session expirée (401)
```
🔐 Session expirée. Veuillez vous reconnecter.
```
→ **Redirection automatique** vers `/login` après 2 secondes

### 🚫 Accès refusé (403)
```
🚫 Accès refusé. Permissions insuffisantes.
```

### ⚠️ Ressource non trouvée (404)
```
⚠️ Ressource non trouvée
```

### ❌ Erreur serveur (500)
```
❌ Erreur serveur (Authentification). Veuillez réessayer plus tard.
```

### 🔧 Service indisponible (503)
```
🔧 Service Messagerie temporairement indisponible
```

## 🎨 Configuration du ToastContainer

Dans `App.js`, le ToastContainer est configuré :

```javascript
<ToastContainer
  position="top-right"
  autoClose={4000}
  hideProgressBar={false}
  newestOnTop={true}
  closeOnClick
  pauseOnHover
  theme="light"
/>
```

### Options modifiables :
- `position` : `"top-right"`, `"top-center"`, `"bottom-right"`, etc.
- `autoClose` : Durée en ms (4000 = 4 secondes)
- `theme` : `"light"`, `"dark"`, `"colored"`

## 🔧 Vérification de santé des services

### Vérifier un service spécifique

```javascript
import { checkServiceHealth } from '../utils/apiHandler';

const isMessagingUp = await checkServiceHealth(API_MESSAGING_URL);
if (!isMessagingUp) {
  console.warn('Service messaging hors ligne');
}
```

### Vérifier tous les services

```javascript
import { checkAllServices } from '../utils/apiHandler';

const servicesStatus = await checkAllServices();
servicesStatus.forEach(service => {
  console.log(`${service.name}: ${service.available ? '✅' : '❌'}`);
});

// Résultat :
// Authentification: ✅
// Profils: ✅
// Offres d'emploi: ✅
// Messagerie: ❌ (hors ligne)
// Emails: ✅
```

## 📊 Mapping des services

Les services sont automatiquement identifiés par leur port :

| Port | Service | Nom affiché |
|------|---------|-------------|
| 8001 | service_auth | Authentification |
| 8002 | service_profile | Profils |
| 8003 | service_offers | Offres d'emploi |
| 8004 | service_messaging | Messagerie |
| 8005 | service_mail | Emails |
| 8006 | service_appointment | Rendez-vous |
| 8007 | service_report | Signalements |

## 🐛 Debugging

### Activer les logs détaillés

Les erreurs sont automatiquement loggées dans la console :

```javascript
try {
  const data = await apiGet(url);
} catch (error) {
  // La console affichera:
  // "Service Messagerie (http://localhost:8004/...) est hors ligne"
}
```

### Tester manuellement

```javascript
import { fetchWithErrorHandling } from '../utils/apiHandler';

// Test avec service arrêté
try {
  await fetchWithErrorHandling('http://localhost:8004/test');
} catch (error) {
  // Notification: "🔌 Service Messagerie inaccessible..."
}
```

## ⚡ Performance

- **Timeout par défaut** : 10 secondes
- **Pas de retry automatique** : L'utilisateur choisit de réessayer
- **Léger** : Pas de dépendances lourdes (seulement react-toastify)

## 🔄 Migration des composants existants

### Avant
```javascript
const response = await fetch(url);
if (!response.ok) {
  alert('Erreur !');
  return;
}
const data = await response.json();
```

### Après
```javascript
try {
  const data = await apiGet(url);
  // Utiliser data...
} catch (error) {
  // Déjà géré !
}
```

## 🎯 Composants déjà migrés

- ✅ `Messaging.jsx` (candidat)
- 🔄 À migrer : 
  - `RecruiterMessaging.jsx`
  - `Dashboard.jsx` (admin)
  - `UserManagement.jsx`
  - `OffersBrowser.jsx`
  - Et tous les autres composants faisant des appels API

## 📝 Checklist de migration

Pour chaque composant :

1. [ ] Importer `apiGet`, `apiPost`, etc.
2. [ ] Remplacer `fetch()` par les helpers
3. [ ] Supprimer les `if (!response.ok)` manuels
4. [ ] Garder les `try/catch` pour la logique métier
5. [ ] Tester avec service arrêté
6. [ ] Vérifier que la notification s'affiche

## 🚀 Prochaines étapes

- [ ] Migrer tous les composants vers les helpers
- [ ] Ajouter un indicateur de santé des services dans le header
- [ ] Implémenter un système de retry automatique (optionnel)
- [ ] Ajouter des endpoints `/health` sur tous les services backend

## 📞 Support

En cas de problème, vérifier :
1. ✅ `react-toastify` installé
2. ✅ `ToastContainer` présent dans `App.js`
3. ✅ Import CSS : `import 'react-toastify/dist/ReactToastify.css'`
4. ✅ Service backend démarré sur le bon port
