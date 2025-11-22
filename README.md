# 🚀 TalentLink - Plateforme de Recrutement Moderne

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688.svg)](https://fastapi.tiangolo.com)

> Une plateforme de recrutement intelligente qui connecte candidats et recruteurs avec une expérience utilisateur moderne et des fonctionnalités avancées.

## 🌟 Fonctionnalités Principales

### 👥 **Multi-Rôles**
- **Candidats** : Création de profil, recherche d'offres, candidatures
- **Recruteurs** : Gestion d'offres, analyse de candidatures, messagerie
- **Administrateurs** : Supervision, gestion utilisateurs, analytics

### 🔧 **Fonctionnalités Avancées**
- ✅ Authentication JWT sécurisée
- ✅ Upload et gestion de documents (CV, lettres de motivation)
- ✅ Système de messagerie en temps réel
- ✅ Système de rendez-vous automatisé
- ✅ Tableaux de bord analytiques
- ✅ Notifications par email
- 🔄 **TalentBot IA** (en développement) - Assistant intelligent pour optimiser le recrutement

## 🏗️ Architecture

### **Backend - Microservices**
```
📦 Backend (Python/FastAPI)
├── 🔐 service_auth      # Authentification & utilisateurs
├── 👤 service_profile   # Profils candidats/recruteurs
├── 💼 service_offers    # Offres d'emploi & candidatures
├── 💬 service_messaging # Messagerie instantanée
├── 📧 service_mail      # Notifications email
└── 📅 service_appointment # Gestion des rendez-vous
```

### **Frontend - React SPA**
```
📦 Frontend (React 18)
├── 👨‍💼 Interface Recruteur
├── 👤 Interface Candidat
├── 🔧 Interface Admin
└── 🤖 TalentBot (à venir)
```

## 🚀 Installation & Démarrage

### Prérequis
- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL** ou **SQLite**
- **Git**

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
MESSAGING_DATABASE_URL=sqlite:///./service_messaging.db

# Services
AUTH_SERVICE_PORT=8001
PROFILE_SERVICE_PORT=8002
OFFERS_SERVICE_PORT=8003
MESSAGING_SERVICE_PORT=8004
MAIL_SERVICE_PORT=8005
APPOINTMENT_SERVICE_PORT=8006

# Sécurité
JWT_SECRET_KEY=your-super-secure-secret-key
JWT_ALGORITHM=HS256

# Email (SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

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
| Auth | 8001 | `http://localhost:8001/docs` |
| Profile | 8002 | `http://localhost:8002/docs` |
| Offers | 8003 | `http://localhost:8003/docs` |
| Messaging | 8004 | `http://localhost:8004/docs` |
| Mail | 8005 | `http://localhost:8005/docs` |
| Appointment | 8006 | `http://localhost:8006/docs` |

### Endpoints Principaux

#### 🔐 Authentication (`/auth`)
```
POST /auth/register    # Inscription
POST /auth/login       # Connexion
POST /auth/logout      # Déconnexion
GET  /auth/me          # Profil utilisateur
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
GET    /conversations            # Liste conversations
POST   /conversations            # Créer conversation
GET    /conversations/{id}/messages # Messages
POST   /conversations/{id}/messages # Envoyer message
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
users: id, email, password_hash, role, created_at
```

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

#### Messages (service_messaging)
```sql
conversations: id, candidate_user_id, recruiter_user_id, created_at
messages: id, conversation_id, sender_user_id, content, sent_at
```

#### Appointments (service_appointment)
```sql
appointment_candidates: id, recruiter_id, candidate_id, offer_id, candidate_name, candidate_email
appointments: id, recruiter_id, candidate_id, offer_id, status, chosen_datetime, mode
appointment_slots: id, appointment_id, proposed_datetime, is_chosen
```

## 🧪 Tests

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

## 📁 Structure du Projet

```
TalentLink/
├── 📁 backend/                 # Services Python/FastAPI
│   ├── 📁 service_auth/        # Authentication & Users
│   ├── 📁 service_profile/     # Profils & CVs
│   ├── 📁 service_offers/      # Offres & Candidatures
│   ├── 📁 service_messaging/   # Messages & Conversations
│   ├── 📁 service_mail/        # Notifications Email
│   ├── 📁 service_appointment/ # Gestion des rendez-vous
│   ├── 📄 .env                 # Configuration
│   ├── 📄 requirements.txt     # Dépendances Python
│   └── 🔧 start_all_services.* # Scripts de démarrage
├── 📁 frontend/talentlink/     # Application React
│   ├── 📁 src/components/      # Composants React
│   ├── 📁 src/pages/           # Pages principales
│   ├── 📁 src/modules/         # Modules par rôle
│   └── 📄 package.json         # Dépendances Node.js
├── 📄 README.md               # Documentation principale
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

### 🔄 Phase 2 - Fonctionnalités Avancées (En cours)
- [x] Système de messagerie
- [x] Notifications email
- [x] Upload documents
- [x] **Système de rendez-vous** - Gestion automatisée des entretiens
- [ ] **TalentBot IA** - Assistant intelligent
- [ ] Système de notifications en temps réel

### 🎯 Phase 3 - Intelligence & Analytics
- [ ] Matching intelligent candidat-offre
- [ ] Analytics avancés
- [ ] API publique
- [ ] Application mobile

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

---

<div align="center">

**⭐ Si ce projet vous aide, n'hésitez pas à lui donner une étoile !**

[![Made with ❤️](https://img.shields.io/badge/Made%20with-❤️-red.svg)](https://github.com/Ibrahima-sebe-kourouma/TalentLink)

</div>