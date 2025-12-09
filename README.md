# 🚀 TalentLink - Plateforme de Recrutement Moderne

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com)

> Une plateforme de recrutement intelligente qui connecte candidats et recruteurs avec une expérience utilisateur moderne et des fonctionnalités avancées.

## 🌟 Fonctionnalités Principales

### 👥 **Multi-Rôles**
- **Candidats** : Création de profil complet (expériences, formations, compétences, certifications, projets), recherche et filtrage d'offres, candidatures avec suivi en temps réel
- **Recruteurs** : Publication et gestion d'offres, consultation et tri des candidatures, messagerie interne, planification de rendez-vous
- **Administrateurs** : Gestion complète des utilisateurs (suspension, bannissement, réactivation), modération des signalements (offres, profils, messages), statistiques et analytics en temps réel, audit trail des actions

### 🔧 **Fonctionnalités Avancées**
- ✅ Authentication JWT sécurisée avec gestion de rôles
- ✅ **Google OAuth 2.0** - Inscription/Connexion avec compte Google (One-Click Sign-In)
- ✅ Upload et gestion de documents (CV, lettres de motivation) - max 5MB
- ✅ Système de messagerie interne avec suppression de conversations
- ✅ Système de rendez-vous automatisé entre candidats et recruteurs
- ✅ Tableaux de bord analytiques pour admins et recruteurs
- ✅ Notifications par email (bienvenue, candidatures, alertes admin) avec mode dégradé
- ✅ **TalentBot IA** - Assistant RAG avec historique de conversations (LlamaIndex + OpenAI + gpt-4o-mini)
- ✅ **Conversations persistantes** - Historique de discussions avec le bot IA pour chaque utilisateur
- ✅ Système de signalement et modération de contenus
- ✅ Interface responsive (Desktop, Tablette, Mobile)
- ✅ Gestion des cookies et conformité RGPD
- ✅ Audit trail et logs de sécurité pour actions administratives
- ✅ **Tests de charge Locust** - Infrastructure complète pour tests de performance

## 🏗️ Architecture

### **Backend - Microservices**
```
📦 Backend (Python/FastAPI)
├── 🔐 service_auth      # Authentification & utilisateurs + Admin (Port 8001)
├── 👤 service_profile   # Profils candidats/recruteurs complets (Port 8002)
├── 💼 service_offers    # Offres d'emploi & candidatures (Port 8003)
├── 💬 service_messaging # Messagerie instantanée MongoDB (Port 8004)
├── 📧 service_mail      # Notifications email SMTP (Port 8005)
├── 📅 service_appointment # Gestion des rendez-vous (Port 8006)
├── 🚩 service_report    # Signalements et modération (Port 8007)
├── 🤖 service_rag       # TalentBot IA - RAG + LlamaIndex + OpenAI (Port 8008)
└── 🧪 service_locust_tests # Tests de charge et performance (Locust)
```

### **Frontend - React SPA**
```
📦 Frontend (React 18)
├── 👨‍💼 Interface Recruteur (dashboard, offres, candidatures, messaging, RDV, TalentBot)
├── 👤 Interface Candidat (profil stepper 8 étapes, recherche offres, messaging, TalentBot)
├── 🔧 Interface Admin (gestion users, modération, statistiques, audit logs)
├── 🤖 TalentBot avec Conversations (sidebar, historique, contexte, suppression)
└── 🍪 Cookie Banner (RGPD compliant)
```

## 🚀 Installation & Démarrage

### Prérequis
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** ou **SQLite** (auth, offers, profile, report, appointment)
- **MongoDB** (messaging, RAG embeddings)
- **Git**
- **OpenAI API Key** (pour TalentBot RAG)
- **SMTP Server** (pour notifications email)
- **Google Cloud Project** (pour OAuth 2.0 - optionnel)

### 1. Clonage du Repository
```bash
git clone https://github.com/Ibrahima-sebe-kourouma/TalentLink.git
cd TalentLink
```

### 2. Configuration Backend

#### Installation des dépendances
```bash
cd backend
python -m venv env
source env/bin/activate  # Windows: env\Scripts\activate
pip install -r requirements.txt
```

#### Configuration de l'environnement
```bash
# Copier le fichier d'exemple
cp .env.example .env

# Modifier .env avec vos paramètres
# DATABASE_URL, SMTP, JWT_SECRET, etc.
```

#### Démarrage des services
```bash
# Démarrage automatique de tous les services
./start_all_services.bat  # Windows
# ou
./start_all_services.sh   # Linux/Mac

# Ou démarrage manuel service par service
cd service_auth && python main.py
cd service_profile && python main.py
# ... etc
```

### 3. Configuration Frontend

```bash
cd frontend/talentlink
npm install
npm start
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Variables d'Environnement Backend
```env
# Base de données
AUTH_DATABASE_URL=sqlite:///./service_auth.db
PROFILE_DATABASE_URL=sqlite:///./service_profile.db
OFFERS_DATABASE_URL=sqlite:///./service_offers.db
REPORT_DATABASE_URL=sqlite:///./service_report.db
APPOINTMENT_DATABASE_URL=sqlite:///./service_appointment.db

# MongoDB
MONGODB_URI=mongodb://localhost:27017/
MONGODB_DATABASE=talentlink_messaging

# Services - URLs et Ports
AUTH_SERVICE_URL=http://127.0.0.1:8001
PROFILE_SERVICE_URL=http://127.0.0.1:8002
OFFERS_SERVICE_URL=http://127.0.0.1:8003
MESSAGING_SERVICE_URL=http://127.0.0.1:8004
MAIL_SERVICE_URL=http://127.0.0.1:8005
APPOINTMENT_SERVICE_URL=http://127.0.0.1:8006
REPORT_SERVICE_URL=http://127.0.0.1:8007
RAG_SERVICE_URL=http://127.0.0.1:8008

SERVICE_AUTH_PORT=8001
SERVICE_PROFILE_PORT=8002
SERVICE_OFFERS_PORT=8003
SERVICE_MESSAGING_PORT=8004
SERVICE_MAIL_PORT=8005
SERVICE_APPOINTMENT_PORT=8006
SERVICE_REPORT_PORT=8007
SERVICE_RAG_PORT=8008

# Sécurité
JWT_SECRET_KEY=your-super-secure-secret-key
JWT_ALGORITHM=HS256

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_SSL=true
FROM_EMAIL=your-email@gmail.com
FROM_NAME=TalentLink
EMAIL_DEBUG=false
# Mode dégradé : si SMTP échoue, log au lieu de crasher (utile pour tests)
GRACEFUL_EMAIL_FAILURE=true

# OpenAI (TalentBot RAG)
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# RAG - Conversations Storage
RAG_CONVERSATIONS_DIR=./conversations

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Configuration Google OAuth 2.0 (Optionnel)

Pour activer la connexion avec Google :

#### 1. Créer un projet Google Cloud
1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez-en un existant
3. Activez l'API **Google+ API** ou **Google Identity Services**

#### 2. Configurer OAuth 2.0
1. Allez dans **APIs & Services > Credentials**
2. Cliquez sur **Create Credentials > OAuth 2.0 Client ID**
3. Configurez l'écran de consentement OAuth :
   - Type : Externe
   - Ajoutez les scopes : `email`, `profile`, `openid`
4. Créez le Client ID OAuth 2.0 :
   - Type d'application : **Application Web**
   - Origines JavaScript autorisées : `http://localhost:3000`
   - URI de redirection : `http://localhost:8001/auth/google/callback`
5. Copiez le **Client ID** et **Client Secret**

#### 3. Configurer les variables d'environnement
```env
GOOGLE_CLIENT_ID=votre-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8001/auth/google/callback
```

#### 4. Migration de la base de données
```bash
cd backend/service_auth/database
python migrate_google_oauth.py
```

Cette migration ajoute les colonnes `google_id` et `picture` à la table `users`.

#### 5. Fonctionnalités OAuth
- ✅ Inscription en un clic avec compte Google
- ✅ Connexion automatique pour utilisateurs existants
- ✅ Création automatique de profil candidat
- ✅ Envoi d'email de bienvenue automatique
- ✅ Gestion de photo de profil Google
- ✅ Disponible sur pages Login et Register

**Note :** Si Google OAuth n'est pas configuré, les utilisateurs peuvent toujours utiliser l'inscription/connexion classique par email/mot de passe.

### Configuration Frontend (.env.local)
```env
REACT_APP_API_BASE_URL=http://localhost
REACT_APP_AUTH_SERVICE_PORT=8001
REACT_APP_PROFILE_SERVICE_PORT=8002
REACT_APP_OFFERS_SERVICE_PORT=8003
REACT_APP_MESSAGING_SERVICE_PORT=8004
REACT_APP_MAIL_SERVICE_PORT=8005
REACT_APP_APPOINTMENT_SERVICE_PORT=8006
```

## 📚 Documentation API

### Services & Ports
| Service | Port | Documentation |
|---------|------|---------------|
| Auth + Admin | 8001 | `http://localhost:8001/docs` |
| Profile | 8002 | `http://localhost:8002/docs` |
| Offers | 8003 | `http://localhost:8003/docs` |
| Messaging (MongoDB) | 8004 | `http://localhost:8004/docs` |
| Mail (SMTP) | 8005 | `http://localhost:8005/docs` |
| Appointment | 8006 | `http://localhost:8006/docs` |
| Report | 8007 | `http://localhost:8007/docs` |
| RAG (TalentBot) | 8008 | `http://localhost:8008/docs` |
| Locust Tests | 8089 | `http://localhost:8089` (Web UI) |

### Endpoints Principaux

#### 🔐 Authentication & Admin (`/auth` & `/admin`)
```
POST /auth/register              # Inscription
POST /auth/login                 # Connexion
GET  /auth/google/login          # URL de connexion Google OAuth
GET  /auth/google/callback       # Callback OAuth (redirection Google)
POST /auth/google/token          # Connexion avec token Google (frontend)
POST /auth/logout                # Déconnexion
GET  /auth/me                    # Profil utilisateur
GET  /admin/users                # Liste utilisateurs (admin)
PATCH /admin/users/{id}/status   # Suspendre/bannir utilisateur
POST /admin/users/{id}/change-role # Changer rôle utilisateur
GET  /admin/statistics           # Statistiques plateforme
GET  /admin/audit-logs           # Logs d'audit
```

#### 👤 Profils (`/profile`)
```
GET    /candidates               # Liste candidats
POST   /candidates               # Créer profil candidat
GET    /candidates/{id}          # Détail candidat
PUT    /candidates/{id}          # Modifier profil
POST   /candidates/{id}/upload-cv # Upload CV
```

#### 💼 Offres (`/offers`)
```
GET    /offers                   # Liste offres
POST   /offers                   # Créer offre
GET    /offers/{id}              # Détail offre
POST   /offers/{id}/apply        # Candidater
GET    /applications             # Candidatures
```

#### 💬 Messagerie (`/messaging`)
```
GET    /conversations                    # Liste conversations
POST   /conversations                    # Créer conversation
GET    /conversations/{id}/messages      # Messages
POST   /conversations/{id}/messages      # Envoyer message
DELETE /conversations/{id}               # Supprimer conversation
PATCH  /messages/conversation/{id}/mark-read # Marquer comme lus
```

#### 🚩 Signalements (`/reports`)
```
POST   /reports                         # Créer signalement
GET    /reports/user/{user_id}          # Signalements d'un utilisateur
GET    /reports/admin/all               # Tous signalements (admin)
PATCH  /reports/{id}                    # Traiter signalement
```

#### 🤖 TalentBot RAG (`/rag`)
```
POST   /rag/chat                               # Chat avec contexte conversationnel
POST   /rag/query                              # Query simple sans contexte
GET    /rag/conversations/{user_id}            # Liste conversations d'un utilisateur
GET    /rag/conversations/{user_id}/{conv_id}  # Détail d'une conversation
DELETE /rag/conversations/{user_id}/{conv_id}  # Supprimer conversation
GET    /rag/health                             # Statut du service RAG
```

#### 📅 Rendez-vous (`/appointments`)
```
POST   /candidates/add           # Ajouter candidat éligible
GET    /candidates/{recruiter_id} # Liste candidats éligibles
POST   /create                   # Créer proposition RDV
GET    /candidate/{candidate_id} # RDV d'un candidat
POST   /candidate/choose-slot    # Candidat choisit créneau
POST   /candidate/refuse-all/{id} # Candidat refuse tous créneaux
POST   /send-final-email/{id}    # Envoyer email final
```

## 🗄️ Base de Données

### Schéma Principal

#### Users (service_auth)
```sql
users: id, email, password_hash, role, status, suspended_until, google_id, picture, created_at
admin_audit: id, admin_user_id, target_user_id, action_type, action_details, created_at
user_status: id, user_id, status, reason, suspended_until, changed_by_admin_id
```

**Nouveaux champs Google OAuth :**
- `google_id` (VARCHAR, UNIQUE, NULLABLE) : Identifiant Google unique pour OAuth
- `picture` (VARCHAR, NULLABLE) : URL de la photo de profil Google

#### Candidates (service_profile)
```sql
candidates: id, auth_user_id, name, prenom, cv, resume_professionnel
experiences: id, candidat_id, title, company, start_date, end_date
formations: id, candidat_id, degree, institution, start_date, end_date
```

#### Offers (service_offers)
```sql
offers: id, titre, description, entreprise, statut, created_at
applications: id, candidat_id, offre_id, statut, date_candidature
```

#### Messages (service_messaging - MongoDB)
```js
conversations: {_id, candidate_user_id, recruiter_user_id, application_id, offer_id, created_at, last_message_at, is_archived}
messages: {_id, conversation_id, sender_user_id, content, created_at, is_read, read_at}
```

#### Reports (service_report)
```sql
reports: id, reporter_user_id, reported_type, reported_id, reason, description, status, severity, verdict, admin_user_id, admin_note, created_at, processed_at
```

#### Appointments (service_appointment)
```sql
appointment_candidates: id, recruiter_id, candidate_id, offer_id, candidate_name, candidate_email
appointments: id, recruiter_id, candidate_id, offer_id, status, chosen_datetime, mode
appointment_slots: id, appointment_id, proposed_datetime, is_chosen
```

## 🧪 Tests

### Tests Unitaires
```bash
# Tests backend
cd backend
python -m pytest tests/

# Tests des services individuels
python test_databases.py
python test_env.py

# Tests frontend
cd frontend/talentlink
npm test
```

### Tests de Charge (Locust)
```bash
# Démarrage de l'interface web Locust
cd backend/service_locust_tests
.\run_tests.bat  # Windows
# ou
./run_tests.sh   # Linux/Mac

# Options disponibles :
# 1. Interface Web (http://localhost:8089)
# 2. Test rapide Auth (CLI)
# 3. Test rapide RAG (CLI)
# 4. Test rapide Offers (CLI)
# 5. Scénario utilisateur complet (CLI)
# 6. Test de tous les services (CLI)

# Initialisation des utilisateurs de test
python init_test_users.py

# Nettoyage des données de test
python cleanup.py
```

**Tests de charge disponibles :**
- **AuthLoadTest** : Authentification (register, login, logout)
- **RAGLoadTest** : TalentBot (chat, conversations)
- **OffersLoadTest** : Offres (browse, search, filter)
- **UserJourneySimulation** : Parcours complets candidat/recruteur

**Rapports générés :** `backend/service_locust_tests/reports/*.html`

## 📁 Structure du Projet

```
TalentLink/
├── 📁 backend/                 # Services Python/FastAPI
│   ├── 📁 service_auth/        # Authentication & Admin (Port 8001)
│   ├── 📁 service_profile/     # Profils & CVs (Port 8002)
│   ├── 📁 service_offers/      # Offres & Candidatures (Port 8003)
│   ├── 📁 service_messaging/   # Messages MongoDB (Port 8004)
│   ├── 📁 service_mail/        # Notifications Email (Port 8005)
│   ├── 📁 service_appointment/ # Rendez-vous (Port 8006)
│   ├── 📁 service_report/      # Signalements (Port 8007)
│   ├── 📁 service_rag/         # TalentBot RAG + Conversations (Port 8008)
│   │   ├── 📁 controllers/     # RAG & Conversation managers
│   │   ├── 📁 models/          # Pydantic models
│   │   ├── 📁 routes/          # API endpoints
│   │   ├── 📁 data/            # Données indexées
│   │   ├── 📁 storage/         # Embeddings vectoriels (LlamaIndex)
│   │   ├── 📁 conversations/   # Historiques de conversations (JSON)
│   │   └── 📁 sequence_update_info_rag/ # Scripts MAJ données
│   ├── 📁 service_locust_tests/ # Tests de charge (Port 8089)
│   │   ├── 📁 tests/           # Tests individuels (auth, rag, offers)
│   │   ├── 📁 scenarios/       # Scénarios utilisateur complets
│   │   ├── 📁 config/          # Configuration des tests
│   │   ├── 📁 reports/         # Rapports HTML générés
│   │   ├── 📄 locustfile.py    # Point d'entrée principal
│   │   ├── 📄 init_test_users.py # Initialisation utilisateurs test
│   │   └── 📄 run_tests.bat    # Script de lancement
│   ├── 📄 .env                 # Configuration globale
│   ├── 📄 requirements.txt     # Dépendances Python
│   ├── 📄 CONFIGURATION.md     # Guide configuration
│   ├── 📄 SPRINT3_DIAGRAMS.md  # Diagrammes UML
│   └── 🔧 start_all_services.* # Scripts de démarrage
├── 📁 frontend/talentlink/     # Application React
│   ├── 📁 src/components/      # Composants React
│   │   ├── 📁 admin/           # Interface admin
│   │   ├── 📁 candidate/       # Interface candidat
│   │   │   ├── 📄 TalentBotWithConversations.jsx # Bot avec historique
│   │   │   ├── 📄 Messaging.jsx
│   │   │   └── ...
│   │   ├── 📁 recruiter/       # Interface recruteur
│   │   │   ├── 📄 TalentBot.jsx # Bot avec historique
│   │   │   ├── 📄 RecruiterMessaging.jsx
│   │   │   └── ...
│   │   └── 📁 steps/           # Stepper profil (8 étapes)
│   ├── 📁 src/pages/           # Pages principales
│   ├── 📁 src/modules/         # Modules par rôle
│   ├── 📁 src/styles/          # CSS global
│   ├── 📁 src/constants/       # Configuration API
│   └── 📄 package.json         # Dépendances Node.js
├── 📄 README.md               # Documentation principale
├── 📄 MANUEL_UTILISATEUR.md   # Guide utilisateur complet
└── 📄 LICENSE                 # Licence du projet
```

## 🚀 Déploiement

### Production avec Docker
```bash
# Construction des images
docker build -t talentlink-backend ./backend
docker build -t talentlink-frontend ./frontend

# Démarrage avec docker-compose
docker-compose up -d
```

### Variables de Production
```env
# Utiliser PostgreSQL en production
DATABASE_URL=postgresql://user:password@host:5432/talentlink

# Sécuriser les secrets
JWT_SECRET_KEY=complex-production-secret

# Configurer SMTP réel
SMTP_SERVER=your-smtp-server.com
```

## 🤝 Contribution

1. **Fork** le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changes (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### Standards de Code
- **Backend** : PEP 8, type hints, docstrings
- **Frontend** : ESLint, Prettier, composants fonctionnels
- **Tests** : Coverage minimum 80%
- **Commits** : Convention Conventional Commits

## 📝 Roadmap

### ✅ Phase 1 - MVP (Terminée)
- [x] Architecture microservices
- [x] Authentication sécurisée
- [x] CRUD candidats/recruteurs
- [x] Gestion offres & candidatures
- [x] Interface utilisateur moderne

### ✅ Phase 2 - Fonctionnalités Avancées (Terminée)
- [x] Système de messagerie avec MongoDB
- [x] Notifications email complètes (bienvenue, candidatures, alertes)
- [x] Upload documents (CV, lettres)
- [x] **Système de rendez-vous** - Gestion automatisée des entretiens
- [x] **TalentBot IA** - Assistant RAG avec LlamaIndex + OpenAI
- [x] Interface responsive (Desktop/Tablette/Mobile)
- [x] Gestion cookies et RGPD

### ✅ Phase 3 - Administration & Modération (Terminée)
- [x] Espace administrateur sécurisé
- [x] Gestion utilisateurs (suspension, bannissement, réactivation)
- [x] Système de signalements (offres, profils, messages)
- [x] Modération de contenus
- [x] Statistiques et analytics temps réel
- [x] Audit trail et logs de sécurité
- [x] Suppression de conversations (candidat/recruteur)
- [x] **TalentBot avec historique** - Conversations persistantes avec contexte
- [x] **Tests de charge Locust** - Infrastructure complète de performance testing
- [x] Mode dégradé pour emails (graceful failure)
- [x] **Google OAuth 2.0** - Inscription/Connexion One-Click avec compte Google
- [x] Envoi d'email de bienvenue automatique pour nouveaux utilisateurs OAuth
- [x] Migration base de données pour support Google OAuth (google_id, picture)

### 🎯 Phase 4 - Performance & Scalabilité (En cours)
- [x] Tests de charge avec Locust (auth, RAG, offers, user journeys)
- [x] Mode dégradé pour services externes (email)
- [ ] Optimisation bcrypt rounds pour auth
- [ ] Caching Redis pour tokens et sessions
- [ ] Rate limiting par service
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Load balancing et auto-scaling

### 🚀 Phase 5 - Intelligence & Optimisation (À venir)
- [ ] Amélioration matching intelligent avec ML
- [ ] Analytics avancés et prédictifs
- [ ] Notifications en temps réel (WebSockets)
- [ ] API publique pour intégrations
- [ ] Application mobile native (iOS/Android)
- [ ] Système de recommandations personnalisées
- [ ] Export de données et rapports PDF
- [ ] CI/CD avec GitHub Actions

## 👨‍💻 Équipe

- **[Ibrahima Sebe Kourouma](https://github.com/Ibrahima-sebe-kourouma)** - Développeur Backend

- **[Nanouga Daouda Yeo](https://github.com/Nanou04)** - Développeur Frontend

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🆘 Support

Pour toute question ou problème :
- 📧 **Email** : talentlinkmontreal@gmail.com
- 🐛 **Issues** : talentlinkmontreal@gmail.com
- 💬 **Discussions** : talentlinkmontreal@gmail.com
- 📘 **Manuel Utilisateur** : [MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md)
- 📊 **Diagrammes UML** : [backend/SPRINT3_DIAGRAMS.md](backend/SPRINT3_DIAGRAMS.md)

---

<div align="center">

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Ibrahima-sebe-kourouma/TalentLink)

</div>