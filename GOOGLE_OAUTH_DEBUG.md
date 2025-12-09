# Débogage Google OAuth - TalentLink

## Prérequis vérifiés ✅

### 1. Configuration Google Cloud Console
- ✅ Client ID: `your-google-client-id.apps.googleusercontent.com`
- ✅ Redirect URI: `http://localhost:8001/auth/google/callback`

**URIs autorisés dans Google Cloud Console :**
- JavaScript origins: `http://localhost:3000`
- Redirect URIs: `http://localhost:8001/auth/google/callback`

### 2. Vérifier la configuration backend

Fichier `.env` doit contenir :
```
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback
```

### 3. Migration de la base de données
```bash
cd backend/service_auth/database
python migrate_google_oauth.py
```
✅ Déjà exécuté avec succès

## Comment tester

### 1. Démarrer le service_auth
```bash
cd backend/service_auth
python main.py
```
Vérifier que le service démarre sur `http://localhost:8001`

### 2. Démarrer le frontend
```bash
cd frontend/talentlink
npm start
```
Le frontend démarre sur `http://localhost:3000`

### 3. Tester la connexion Google

1. Ouvrir http://localhost:3000/login
2. Cliquer sur le bouton "Sign in with Google" (rendu par Google)
3. Sélectionner un compte Google
4. Vérifier dans la console du navigateur :
   - "Google Identity Services loaded"
   - "Google Sign-In initialized"
   - "Google credential received"
   - "Backend response: {...}"
   - "Google login successful"

## Problèmes courants et solutions

### Problème 1 : Le bouton Google n'apparaît pas
**Symptôme :** Rien ne s'affiche à la place du bouton

**Solutions :**
1. Vérifier la console du navigateur pour des erreurs
2. Vérifier que le script Google se charge : `https://accounts.google.com/gsi/client`
3. Ouvrir les DevTools > Network et chercher `gsi/client`
4. Rafraîchir la page avec Ctrl+F5

### Problème 2 : "Impossible de charger Google Sign-In"
**Symptôme :** Erreur dans la console

**Solutions :**
1. Vérifier la connexion internet
2. Désactiver les bloqueurs de publicités (AdBlock, uBlock)
3. Autoriser les cookies tiers dans les paramètres du navigateur
4. Essayer en mode navigation privée

### Problème 3 : "Invalid client ID"
**Symptôme :** Popup Google avec erreur

**Solutions :**
1. Vérifier que le Client ID dans `GoogleLoginButton.jsx` correspond à celui de `.env`
2. Vérifier que le Client ID est actif dans Google Cloud Console
3. Attendre 5-10 minutes si vous venez de créer les credentials

### Problème 4 : "redirect_uri_mismatch"
**Symptôme :** Erreur 400 de Google

**Solutions :**
1. Aller sur https://console.cloud.google.com/apis/credentials
2. Cliquer sur le Client ID OAuth
3. Vérifier que les URIs autorisés incluent :
   - JavaScript origins: `http://localhost:3000`
   - Redirect URIs: `http://localhost:8001/auth/google/callback`
4. Cliquer sur "Save"
5. Attendre 5 minutes pour la propagation

### Problème 5 : Le backend ne répond pas
**Symptôme :** Erreur 404 ou ERR_CONNECTION_REFUSED

**Solutions :**
1. Vérifier que service_auth est démarré
2. Vérifier que le port 8001 est disponible : `netstat -ano | findstr :8001`
3. Tester l'endpoint : `curl http://localhost:8001/auth/google/login`
4. Vérifier les logs du service_auth

### Problème 6 : "Token verification failed"
**Symptôme :** Erreur après avoir sélectionné le compte Google

**Solutions :**
1. Vérifier que le GOOGLE_CLIENT_SECRET est correct dans `.env`
2. Vérifier que google-auth est installé : `pip show google-auth`
3. Vérifier les logs du service_auth pour plus de détails

## Vérification étape par étape

### Backend
```bash
# 1. Vérifier les variables d'environnement
cd backend
cat .env | grep GOOGLE

# 2. Tester l'endpoint de login
curl http://localhost:8001/auth/google/login

# Devrait retourner : {"url": "https://accounts.google.com/o/oauth2/auth?..."}
```

### Frontend
```javascript
// Ouvrir la console du navigateur (F12)
// Vérifier ces logs :
console.log('Google Identity Services loaded')  // Script chargé
console.log('Google Sign-In initialized')       // Bouton initialisé
console.log('Google credential received')        // Connexion réussie
```

## Structure des données

### Réponse du backend après connexion Google
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 123,
    "email": "user@example.com",
    "nom": "Doe",
    "prenom": "John",
    "role": "candidat",
    "google_id": "1234567890",
    "picture": "https://lh3.googleusercontent.com/..."
  }
}
```

### Stockage dans localStorage
```javascript
localStorage.getItem('token')     // JWT token
localStorage.getItem('user')      // JSON stringifié de l'objet user
```

## Contact et support

Si le problème persiste :
1. Capturer les logs de la console du navigateur
2. Capturer les logs du service_auth
3. Vérifier le Network tab pour voir les requêtes HTTP
4. Documenter les étapes qui causent l'erreur
