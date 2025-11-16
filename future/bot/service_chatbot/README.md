# 🤖 Service Chatbot - TalentLink

## Description
Service de chatbot personnalisé avec intégration **Ollama** pour la plateforme TalentLink. Permet aux utilisateurs d'interagir avec des modèles d'IA locaux pour obtenir de l'aide, des conseils et des réponses personnalisées.

## 🎯 Fonctionnalités Principales

### 🧠 Intelligence Artificielle Locale
- **Intégration Ollama** : Utilisation de modèles IA locaux (Gemma, Llama, etc.)
- **Réponses personnalisées** : Adaptées au contexte TalentLink
- **Performance rapide** : Traitement local sans dépendance cloud
- **Confidentialité** : Données restent sur votre infrastructure

### 👤 Personnalités Personnalisées
- **Assistants spécialisés** : Expert Recrutement, Coach Candidat, Analyste RH
- **Prompts système configurables** : Définition du comportement de l'IA
- **Paramètres de modèle ajustables** : Température, créativité, précision
- **Personnalités publiques et privées** : Partage entre utilisateurs

### 💬 Gestion des Conversations
- **Historique persistant** : Sauvegarde des conversations
- **Contexte maintenu** : L'IA se souvient des échanges précédents
- **Organisation par thèmes** : Titre et catégorisation des discussions
- **Messages favoris** : Sauvegarde des réponses importantes

### 📚 Base de Connaissances
- **Enrichissement contextuel** : Injection d'informations pertinentes
- **Recherche intelligente** : Mots-clés et catégories
- **Sources vérifiées** : Validation des informations
- **Mise à jour collaborative** : Contribution des utilisateurs

## 🏗️ Architecture Technique

### Backend (FastAPI)
```
service_chatbot/
├── main.py                          # Point d'entrée (port 8007)
├── setup.py                         # Configuration package
├── run_service_chatbot.bat          # Script de démarrage
├── models/
│   └── chatbot.py                   # Modèles de données et schémas
├── controllers/
│   └── chatbot_controller.py        # Logique métier
├── routes/
│   └── chatbot_routes.py           # API REST endpoints
├── database/
│   └── database.py                 # Configuration SQLAlchemy
├── utils/
│   └── ollama_client.py            # Client Ollama
└── README.md                       # Documentation
```

### Modèles de Données
- **ChatbotConversation** : Conversations utilisateur
- **ChatbotMessage** : Messages individuels
- **ChatbotPersonality** : Personnalités d'IA
- **ChatbotKnowledge** : Base de connaissances

### Intégration Ollama
- **Communication REST** : API native Ollama
- **Support multi-modèles** : Gemma, Llama, Mistral, etc.
- **Streaming optionnel** : Réponses en temps réel
- **Gestion d'erreurs robuste** : Fallback et retry

## 🚀 Installation et Démarrage

### Prérequis
1. **Python 3.9+** avec environnement virtuel
2. **Ollama installé** : https://ollama.ai/download
3. **Au moins un modèle téléchargé** : `ollama pull gemma3:4b`

### Vérification Ollama
```bash
# Vérifier l'installation
ollama --version

# Lister les modèles disponibles
ollama list

# Télécharger un modèle (si nécessaire)
ollama pull gemma3:4b
```

### Démarrage Rapide
```bash
# Méthode 1: Script automatique
cd backend/service_chatbot
run_service_chatbot.bat

# Méthode 2: Manuel
pip install -e .
python main.py
```

**Service disponible sur** : `http://127.0.0.1:8007`

## 📋 API Reference

### Endpoints Principaux

#### Chat Principal
```http
POST /api/chatbot/chat
{
  "message": "Comment optimiser mon profil candidat?",
  "user_id": 123,
  "conversation_id": 456,  // optionnel
  "personality_id": 2      // optionnel
}
```

#### Gestion des Conversations
```http
GET    /api/chatbot/conversations/user/{user_id}     # Lister conversations
POST   /api/chatbot/conversations                   # Créer conversation
GET    /api/chatbot/conversations/{id}              # Détails + messages
PATCH  /api/chatbot/conversations/{id}              # Modifier
DELETE /api/chatbot/conversations/{id}              # Supprimer
```

#### Personnalités
```http
GET    /api/chatbot/personalities                   # Lister personnalités
POST   /api/chatbot/personalities                   # Créer personnalité
GET    /api/chatbot/personalities/{id}              # Détails
PATCH  /api/chatbot/personalities/{id}              # Modifier
DELETE /api/chatbot/personalities/{id}              # Supprimer
```

#### Modèles Ollama
```http
GET    /api/chatbot/models                          # Modèles disponibles
GET    /api/chatbot/models/suggestions               # Suggestions de téléchargement
POST   /api/chatbot/models/pull?model_name=llama3   # Télécharger modèle
```

#### Base de Connaissances
```http
GET    /api/chatbot/knowledge/search?q=recrutement  # Rechercher
POST   /api/chatbot/knowledge                       # Créer connaissance
```

#### Statistiques et Santé
```http
GET    /api/chatbot/stats                           # Statistiques d'usage
GET    /api/chatbot/health                          # Santé du service
GET    /docs                                        # Documentation Swagger
```

## 🎭 Personnalités Prédéfinies

### 1. Assistant Général
- **Rôle** : Assistant polyvalent pour TalentLink
- **Usage** : Questions générales, navigation, aide
- **Configuration** : Équilibré (température: 0.6)

### 2. Expert Recrutement
- **Rôle** : Spécialiste en stratégies de recrutement
- **Usage** : Optimisation des offres, sourcing candidats
- **Configuration** : Analytique (température: 0.2)

### 3. Coach Candidat
- **Rôle** : Accompagnement personnalisé des candidats
- **Usage** : CV, entretiens, stratégie de carrière
- **Configuration** : Créatif (température: 0.8)

### 4. Analyste RH
- **Rôle** : Expert en données et métriques RH
- **Usage** : KPI, tendances marché, analyses
- **Configuration** : Précis (température: 0.3)

### 5. Support Technique
- **Rôle** : Assistance utilisation de TalentLink
- **Usage** : Fonctionnalités, dépannage, guides
- **Configuration** : Précis (température: 0.3)

## 🔧 Configuration Avancée

### Paramètres de Modèle
```json
{
  "temperature": 0.7,      // Créativité (0.0-1.0)
  "top_p": 0.8,           // Diversité du vocabulaire
  "top_k": 40,            // Limitation des choix
  "repeat_penalty": 1.1    // Éviter les répétitions
}
```

### Configurations Prédéfinies
- **Creative** : Brainstorming, idées innovantes
- **Balanced** : Usage général, polyvalent
- **Precise** : Analyses, données factuelles
- **Analytical** : Recherche, conclusions détaillées

## 📊 Exemples d'Utilisation

### Chat Simple
```python
import requests

response = requests.post("http://localhost:8007/api/chatbot/chat", json={
    "message": "Comment rédiger une offre d'emploi attractive?",
    "user_id": 123,
    "personality_id": 2  # Expert Recrutement
})

print(response.json()["data"]["response"])
```

### Créer une Personnalité
```python
personality = {
    "name": "Consultant Startup",
    "description": "Expert en écosystème startup et innovation",
    "system_prompt": "Tu es un consultant spécialisé dans les startups...",
    "model_config": {"temperature": 0.8},
    "is_public": True,
    "created_by": 123
}

requests.post("http://localhost:8007/api/chatbot/personalities", json=personality)
```

### Recherche de Connaissances
```python
knowledge = requests.get(
    "http://localhost:8007/api/chatbot/knowledge/search",
    params={"q": "entretien technique", "limit": 5}
)

print(knowledge.json()["data"])
```

## 🔒 Sécurité et Confidentialité

### Traitement Local
- **Aucun envoi cloud** : Toutes les données restent locales
- **Modèles privés** : Ollama sur votre infrastructure
- **Contrôle total** : Gestion complète des données

### Authentification (À intégrer)
- **JWT Token** : Validation via service auth TalentLink
- **Permissions par conversation** : Accès utilisateur uniquement
- **Audit trail** : Logs des interactions

## 📈 Monitoring et Statistiques

### Métriques Disponibles
- **Conversations actives** : Nombre de discussions
- **Messages échangés** : Volume total
- **Temps de réponse** : Performance Ollama
- **Tokens utilisés** : Consommation des modèles
- **Personnalités populaires** : Usage statistiques

### Endpoints de Santé
```bash
# Statut général
curl http://localhost:8007/health

# Statistiques détaillées
curl http://localhost:8007/api/chatbot/stats

# État Ollama
curl http://localhost:8007/api/chatbot/models
```

## 🧪 Tests et Validation

### Lancement des Tests
```bash
# Tests automatiques (à créer)
python -m pytest tests/

# Test manuel de base
curl -X POST http://localhost:8007/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Bonjour","user_id":1}'
```

### Validation de l'Installation
1. ✅ **Ollama responsive** : `ollama list` fonctionne
2. ✅ **Service démarré** : http://localhost:8007/health
3. ✅ **Base initialisée** : Personnalités par défaut créées
4. ✅ **Chat fonctionnel** : Test d'un message simple

## 🔄 Intégration Frontend

### Composants React Suggérés
- **ChatInterface** : Interface de discussion
- **PersonalitySelector** : Choix de l'assistant
- **ConversationHistory** : Historique des échanges
- **KnowledgeSearch** : Recherche dans la base

### Exemple d'Intégration
```javascript
// Service API
const chatbotAPI = {
  sendMessage: async (message, conversationId, personalityId) => {
    const response = await fetch('/api/chatbot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        conversation_id: conversationId,
        personality_id: personalityId,
        user_id: currentUser.id
      })
    });
    return response.json();
  }
};
```

## 🚧 Développement Futur

### Fonctionnalités Prévues
- **Streaming en temps réel** : WebSocket pour réponses progressives
- **Modèles spécialisés** : Fine-tuning pour TalentLink
- **Plugins personnalisés** : Extensions métier
- **Intégration vocale** : Speech-to-text / text-to-speech
- **Analytics avancés** : Sentiment analysis, thèmes

### Optimisations
- **Cache intelligent** : Réponses fréquentes mises en cache
- **Load balancing** : Distribution multi-instances Ollama
- **Compression** : Optimisation des échanges
- **Indexation** : Recherche vectorielle dans les connaissances

## 🆘 Support et Dépannage

### Problèmes Courants

#### Ollama non accessible
```bash
# Vérifier le service
ollama serve

# Redémarrer Ollama
pkill ollama && ollama serve
```

#### Modèle non trouvé
```bash
# Lister les modèles
ollama list

# Télécharger un modèle
ollama pull gemma3:4b
```

#### Erreur de base de données
```bash
# Réinitialiser la base
python database/database.py
```

### Logs et Debugging
- **Logs service** : Console du service
- **Logs Ollama** : `~/.ollama/logs/server.log`
- **Debug mode** : `LOG_LEVEL=debug python main.py`

---

## 🎉 Conclusion

Le service Chatbot TalentLink offre une **intelligence artificielle locale** puissante et personnalisable pour enrichir l'expérience utilisateur de la plateforme. Avec l'intégration Ollama, vous bénéficiez de la **performance** des modèles modernes tout en gardant le **contrôle** et la **confidentialité** de vos données.

**Prêt à discuter avec votre IA personnalisée !** 🤖✨