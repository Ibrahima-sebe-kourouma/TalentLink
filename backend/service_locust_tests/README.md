# Service de Tests de Charge Locust - TalentLink

Service dédié aux tests de performance et de charge pour l'ensemble de l'infrastructure TalentLink.

## 📋 Table des matières

- [Installation](#installation)
- [Utilisation](#utilisation)
- [Types de tests disponibles](#types-de-tests-disponibles)
- [Structure du projet](#structure-du-projet)
- [Configuration](#configuration)
- [Exemples de commandes](#exemples-de-commandes)
- [Interprétation des résultats](#interprétation-des-résultats)

## 🚀 Installation

### 1. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 2. Configurer l'environnement

Copier `.env.example` vers `.env` et ajuster les URLs si nécessaire :

```bash
copy .env.example .env
```

## 📖 Utilisation

### Méthode 1 : Interface Web (Recommandée)

```bash
run_tests.bat
# Choisir l'option 1
# Ouvrir http://localhost:8089
```

**Avantages** :
- Interface graphique intuitive
- Graphiques en temps réel
- Contrôle total (start/stop/ajuster)
- Visualisation des métriques

### Méthode 2 : Ligne de commande

```bash
# Test rapide Auth
locust -f locustfile.py --class-name AuthLoadTest --headless -u 10 -r 2 -t 1m

# Test RAG avec rapport HTML
locust -f locustfile.py --class-name RAGLoadTest --headless -u 5 -r 1 -t 2m --html reports/rag.html
```

## 🧪 Types de tests disponibles

### 1. Tests unitaires par service

#### Service Auth (`test_auth.py`)
```bash
locust -f locustfile.py --class-name AuthLoadTest
```
- ✅ Health check
- ✅ Login utilisateur existant
- ✅ Inscription nouveau utilisateur
- ✅ Récupération profil (avec token)
- ✅ Déconnexion

#### Service RAG (`test_rag.py`)
```bash
locust -f locustfile.py --class-name RAGLoadTest
```
- ✅ Chat nouvelle conversation
- ✅ Chat continuation conversation
- ✅ Liste conversations utilisateur
- ✅ Détails conversation
- ✅ Query simple (sans historique)

#### Service Offers (`test_offers.py`)
```bash
locust -f locustfile.py --class-name OffersLoadTest
```
- ✅ Liste toutes les offres
- ✅ Détails offre par ID
- ✅ Recherche avec filtres
- ✅ Offres par type de contrat

### 2. Tests de stress

Tests avec charge élevée et temps de réponse courts :

```bash
# Stress Auth
locust -f locustfile.py --class-name AuthStressTest --headless -u 50 -r 10 -t 30s

# Stress RAG
locust -f locustfile.py --class-name RAGStressTest --headless -u 20 -r 5 -t 1m
```

### 3. Scénarios utilisateur (`user_journey.py`)

Simule des parcours utilisateur complets :

```bash
locust -f locustfile.py --class-name UserJourneySimulation
```

**Parcours Candidat** :
1. Inscription
2. Complétion du profil
3. Navigation dans les offres
4. Recherche d'offres
5. Discussion avec le bot
6. Déconnexion

**Parcours Recruteur** :
1. Connexion
2. Consultation des offres
3. Utilisation de l'assistant IA
4. Déconnexion

### 4. Test global

Teste tous les services simultanément :

```bash
locust -f locustfile.py --class-name TalentLinkUser
```

## 📁 Structure du projet

```
service_locust_tests/
│
├── config/
│   └── config.py              # Configuration centralisée
│
├── tests/                     # Tests par service
│   ├── test_auth.py          # Tests authentification
│   ├── test_rag.py           # Tests chatbot RAG
│   └── test_offers.py        # Tests offres d'emploi
│
├── scenarios/
│   └── user_journey.py       # Parcours utilisateur complets
│
├── reports/                  # Rapports HTML générés
│
├── locustfile.py            # Point d'entrée principal
├── requirements.txt         # Dépendances Python
├── run_tests.bat           # Script de lancement Windows
└── README.md               # Cette documentation
```

## ⚙️ Configuration

### Fichier `.env`

```env
SERVICE_AUTH_URL=http://localhost:8001
SERVICE_PROFILE_URL=http://localhost:8002
SERVICE_OFFERS_URL=http://localhost:8003
SERVICE_RAG_URL=http://localhost:8008
```

### Fichier `config/config.py`

Modifier pour ajuster :
- URLs des services
- Utilisateurs de test
- Configuration Locust par défaut

## 💡 Exemples de commandes

### Tests rapides (1 minute)

```bash
# Auth - 10 utilisateurs, 2/sec
locust -f locustfile.py --class-name AuthLoadTest --headless -u 10 -r 2 -t 1m --html reports/auth.html

# RAG - 5 utilisateurs, 1/sec (plus lent car IA)
locust -f locustfile.py --class-name RAGLoadTest --headless -u 5 -r 1 -t 1m --html reports/rag.html

# Offers - 15 utilisateurs, 3/sec
locust -f locustfile.py --class-name OffersLoadTest --headless -u 15 -r 3 -t 1m --html reports/offers.html
```

### Tests de charge moyens (5 minutes)

```bash
# Auth - 50 utilisateurs
locust -f locustfile.py --class-name AuthLoadTest --headless -u 50 -r 5 -t 5m --html reports/auth_medium.html

# RAG - 20 utilisateurs (attention à la charge OpenAI)
locust -f locustfile.py --class-name RAGLoadTest --headless -u 20 -r 2 -t 5m --html reports/rag_medium.html
```

### Tests de stress (charge maximale)

```bash
# Auth - 100 utilisateurs, montée rapide
locust -f locustfile.py --class-name AuthStressTest --headless -u 100 -r 20 -t 2m --html reports/auth_stress.html

# Attention : Peut faire crasher les services !
```

### Scénario utilisateur réaliste

```bash
# 10 utilisateurs (7 candidats, 3 recruteurs)
locust -f locustfile.py --class-name UserJourneySimulation --headless -u 10 -r 2 -t 5m --html reports/journey.html
```

## 📊 Interprétation des résultats

### Métriques importantes

1. **Response Time (ms)**
   - Acceptable : < 200ms
   - Moyen : 200-500ms
   - Lent : 500-1000ms
   - Problématique : > 1000ms

2. **Requests per Second (RPS)**
   - Mesure la capacité du service
   - Plus élevé = meilleur

3. **Failure Rate (%)**
   - Idéal : 0%
   - Acceptable : < 1%
   - Problématique : > 5%

4. **95th Percentile**
   - 95% des requêtes sont plus rapides
   - Indicateur de performance stable

### Rapports HTML

Les rapports générés contiennent :
- 📈 Graphiques de performance
- 📋 Tableau des endpoints testés
- 🔍 Détails des erreurs
- 📊 Statistiques agrégées

Ouvrir avec un navigateur :
```bash
start reports\auth_report.html
```

## 🎯 Bonnes pratiques

### Avant de lancer les tests

1. ✅ Tous les services sont démarrés
2. ✅ Base de données prête
3. ✅ Données de test créées
4. ✅ Clés API configurées (OpenAI pour RAG)

### Pendant les tests

1. 👀 Surveiller les logs des services
2. 📊 Observer l'utilisation CPU/RAM
3. 🔍 Vérifier les temps de réponse
4. ⚠️ Arrêter si services instables

### Après les tests

1. 📝 Analyser les rapports
2. 🔍 Identifier les goulots
3. 📈 Comparer avec tests précédents
4. 🧹 Nettoyer les données de test

## 🚨 Limitations et précautions

### Service RAG
- ⚠️ Coûte de l'argent (OpenAI API)
- 🐌 Plus lent que les autres services
- 💡 Limiter à 5-10 utilisateurs simultanés pour tests

### Base de données
- ⚠️ Les tests créent beaucoup de données
- 🗑️ Penser à nettoyer régulièrement
- 💡 Utiliser une base de test séparée

### Réseau
- ⚠️ Tests locaux = pas de latence réseau réelle
- 💡 Pour tests réalistes, héberger sur serveur

## 📚 Ressources

- [Documentation Locust](https://docs.locust.io/)
- [Guide des bonnes pratiques](https://docs.locust.io/en/stable/writing-a-locustfile.html)
- [Exemples Locust](https://github.com/locustio/locust/tree/master/examples)

## 🆘 Dépannage

### Erreur "Module not found"
```bash
pip install -r requirements.txt
```

### Port 8089 déjà utilisé
```bash
locust -f locustfile.py --web-port 8090
```

### Services ne répondent pas
1. Vérifier que tous les services sont démarrés
2. Vérifier les URLs dans `.env`
3. Tester manuellement avec curl/Postman

### RAG timeout
- Augmenter le timeout : `timeout=120`
- Réduire le nombre d'utilisateurs simultanés
- Vérifier la clé OpenAI

## 📞 Support

Pour toute question ou problème :
1. Consulter cette documentation
2. Vérifier les logs des services
3. Consulter la documentation Locust
