# Test de connexion Frontend -> Service RAG

## Description
Ce script teste la connexion entre le frontend et le service RAG pour s'assurer que TalentBot fonctionne correctement.

## Prérequis
1. Le service RAG doit être démarré sur le port 8008
2. Python avec la bibliothèque `requests` installée

## Installation
```bash
pip install requests
```

## Utilisation

### Depuis le dossier service_rag
```bash
cd backend\service_rag
python test_rag_connection.py
```

### Depuis la racine du projet
```bash
python backend\service_rag\test_rag_connection.py
```

## Tests effectués

1. **Santé du service** - Vérifie que `/rag/health` répond
2. **Endpoint racine** - Vérifie que `/rag/` retourne les infos du service
3. **Liste des modèles** - Vérifie que `/rag/models` retourne les modèles supportés
4. **Requête RAG** - Teste une requête réelle avec `/rag/query`

## Résolution des problèmes

### Le service ne répond pas
- Vérifiez que le service RAG est démarré : `.\run_service_rag.bat`
- Vérifiez que le port 8008 n'est pas utilisé : `netstat -ano | findstr :8008`

### L'index n'est pas chargé (503)
- C'est normal au premier démarrage
- Attendez quelques secondes que l'indexation se termine
- Vérifiez les logs du service RAG

### Erreur OpenAI
- Vérifiez que la clé API OpenAI est configurée dans `.env`
- Variable : `OPENAI_API_KEY`

## Configuration Frontend

Le frontend utilise maintenant :
- **URL** : `http://localhost:8008`
- **Constante** : `API_RAG_URL` (dans `src/constants/api.js`)
- **Endpoints** :
  - `GET /rag/` - Informations du service
  - `GET /rag/health` - Santé du service
  - `POST /rag/query` - Requêtes RAG
  - `GET /rag/models` - Liste des modèles
  - `POST /rag/reindex` - Réindexation

## Intégration dans le Frontend

Le composant `TalentBot.jsx` a été mis à jour pour :
1. Utiliser `API_RAG_URL` depuis `constants/api.js`
2. Utiliser les endpoints avec le préfixe `/rag`
3. Afficher des messages d'erreur appropriés

## Vérification manuelle

### Avec curl (PowerShell)
```powershell
# Test de santé
curl http://localhost:8008/rag/health

# Test d'une requête
curl -X POST http://localhost:8008/rag/query `
  -H "Content-Type: application/json" `
  -d '{"question":"Qu''est-ce que TalentLink ?","model_type":"openai","model_name":"gpt-4o-mini","top_k":3}'
```

### Avec le navigateur
Ouvrez : http://localhost:8008/rag/

Vous devriez voir :
```json
{
  "message": "API de requête de documents - TalentLink RAG",
  "status": "En ligne",
  "models_supportes": {
    "openai": [...],
    "ollama": [...]
  }
}
```
