# Migration du Service RAG - Guide de Vérification Frontend

## ✅ Changements effectués

### 1. **Service Backend**
- ✅ Dossier renommé : `BACKEND_RAG` → `service_rag`
- ✅ Architecture MVC créée (models, controllers, routes)
- ✅ Port changé : **8000 → 8008**
- ✅ Endpoints avec préfixe `/rag`
- ✅ Fichier de démarrage : `run_service_rag.bat`

### 2. **Configuration Frontend**

#### Fichier `src/constants/api.js`
```javascript
export const API_RAG_URL = 'http://localhost:8008'; // Nouvelle constante ajoutée
```

#### Fichier `src/components/candidate/TalentBot.jsx`
```javascript
// Ancien code
const RAG_API_URL = "http://localhost:8000";
fetch(`${RAG_API_URL}/query`);

// Nouveau code
import { API_RAG_URL } from "../../constants/api";
fetch(`${API_RAG_URL}/rag/query`);
```

## 📋 Checklist de vérification

### Backend
- [ ] Le service RAG démarre sur le port 8008
- [ ] L'endpoint `/rag/health` répond
- [ ] L'endpoint `/rag/` retourne les infos du service
- [ ] L'endpoint `/rag/query` traite les requêtes
- [ ] Les logs ne montrent pas d'erreurs

### Frontend
- [ ] Le fichier `api.js` exporte `API_RAG_URL`
- [ ] `TalentBot.jsx` importe `API_RAG_URL`
- [ ] Les appels utilisent le préfixe `/rag`
- [ ] Le port est bien 8008
- [ ] Les messages d'erreur mentionnent le port 8008

### Intégration
- [ ] Le service RAG apparaît dans `start_all_services.bat`
- [ ] Le service RAG apparaît dans `stop_all_services.bat`
- [ ] Le fichier `.env` contient `RAG_SERVICE_PORT=8008`

## 🧪 Tests à effectuer

### 1. Test Backend (PowerShell)
```powershell
# Démarrer le service RAG
cd backend\service_rag
.\run_service_rag.bat

# Dans un autre terminal, tester l'API
curl http://localhost:8008/rag/health
curl http://localhost:8008/rag/
```

### 2. Test avec le script Python
```bash
cd backend\service_rag
python test_rag_connection.py
```

### 3. Test Frontend
1. Démarrer tous les services : `.\start_all_services.bat`
2. Ouvrir le frontend : http://localhost:3000
3. Se connecter comme candidat
4. Accéder à TalentBot
5. Envoyer un message : "Qu'est-ce que TalentLink ?"
6. Vérifier que la réponse s'affiche correctement

## 🔧 Résolution des problèmes

### Le frontend ne peut pas se connecter au RAG

**Symptômes** :
- Erreur de connexion dans la console
- Message : "Assurez-vous que le serveur RAG est démarré sur le port 8008"

**Solutions** :
1. Vérifier que le service RAG est démarré
2. Vérifier le port avec : `netstat -ano | findstr :8008`
3. Vérifier les logs du service RAG
4. Vérifier que CORS est bien configuré

### Erreur 404 Not Found

**Symptômes** :
- Le service répond mais retourne 404
- Les endpoints ne sont pas trouvés

**Solutions** :
1. Vérifier que vous utilisez bien le préfixe `/rag`
   - ✅ Correct : `http://localhost:8008/rag/query`
   - ❌ Incorrect : `http://localhost:8008/query`
2. Redémarrer le service RAG

### L'index n'est pas chargé (503)

**Symptômes** :
- Erreur 503 Service Unavailable
- Message : "Le moteur de requête n'est pas initialisé"

**Solutions** :
1. Attendre que l'indexation se termine (première exécution)
2. Vérifier qu'il y a des documents dans `service_rag/data/`
3. Vérifier les logs pour voir le statut de l'indexation
4. Forcer une réindexation : `POST http://localhost:8008/rag/reindex`

### Erreur OpenAI API

**Symptômes** :
- Erreur lors de la requête
- Message d'erreur mentionnant OpenAI

**Solutions** :
1. Vérifier que `OPENAI_API_KEY` est dans `.env`
2. Vérifier que la clé API est valide
3. Vérifier votre quota OpenAI
4. Tester avec Ollama en local si nécessaire

## 📊 Structure des endpoints

### Avant (port 8000)
```
GET  http://localhost:8000/
GET  http://localhost:8000/health
POST http://localhost:8000/query
GET  http://localhost:8000/models
POST http://localhost:8000/reindex
```

### Après (port 8008 avec préfixe /rag)
```
GET  http://localhost:8008/rag/
GET  http://localhost:8008/rag/health
POST http://localhost:8008/rag/query
GET  http://localhost:8008/rag/models
POST http://localhost:8008/rag/reindex
```

## 🎯 Exemple de requête complète

### Depuis le frontend (JavaScript)
```javascript
import { API_RAG_URL } from "../../constants/api";

const response = await fetch(`${API_RAG_URL}/rag/query`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    question: "Qu'est-ce que TalentLink ?",
    model_type: "openai",
    model_name: "gpt-4o-mini",
    top_k: 5
  })
});

const data = await response.json();
console.log(data.answer);
```

### Avec curl (PowerShell)
```powershell
$body = @{
    question = "Qu'est-ce que TalentLink ?"
    model_type = "openai"
    model_name = "gpt-4o-mini"
    top_k = 5
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:8008/rag/query" `
    -Method POST `
    -ContentType "application/json" `
    -Body $body
```

## 📝 Notes importantes

1. **Tous les appels doivent utiliser le préfixe `/rag`**
2. **Le port est maintenant 8008 (plus 8000)**
3. **La constante `API_RAG_URL` est centralisée dans `api.js`**
4. **Le service suit maintenant l'architecture MVC comme les autres services**
5. **Le service est inclus dans `start_all_services.bat`**

## ✅ Validation finale

Pour confirmer que tout fonctionne :

```bash
# 1. Démarrer tous les services
.\start_all_services.bat

# 2. Dans un navigateur, vérifier chaque service
http://localhost:8001/docs  # Auth
http://localhost:8002/docs  # Profile
http://localhost:8003/docs  # Offers
http://localhost:8004/docs  # Messaging
http://localhost:8005/docs  # Mail
http://localhost:8006/docs  # Appointment
http://localhost:8007/docs  # Report
http://localhost:8008/docs  # RAG (nouveau)

# 3. Tester le frontend
http://localhost:3000
# Se connecter → Candidat → TalentBot → Poser une question
```

Si tous ces tests passent, la migration est réussie ! ✅
