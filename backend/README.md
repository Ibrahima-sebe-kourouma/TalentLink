# TalentLink Backend

Architecture microservices pour la plateforme de recrutement TalentLink.

## 🚀 Démarrage rapide

### Lancer les services
```bash
# Démarrer tous les services
.\start_services.bat

# Ou individuellement
cd service_auth && .\run_service_auth.bat
cd service_profile && .\run_service_profile.bat
# etc...
```

### Exécuter les tests
```bash
# Interface de test
.\run_tests.bat

# Ou directement
cd tests\service_auth && python test_admin_api.py
```

## 📁 Structure

### Services principaux
```
backend/
├── service_auth/          # Authentication (Port 8001)
│   ├── controllers/       # Logique métier
│   ├── models/           # Modèles de données
│   ├── routes/           # Points d'entrée API
│   ├── database/         # Configuration DB
│   └── utils/            # Utilitaires
├── service_profile/       # Profils (Port 8002)
├── service_offers/        # Offres d'emploi (Port 8003)
├── service_mail/          # Emails (Port 8004)
└── service_messaging/     # Messages (Port 8005)
```

### Tests et utilitaires
```
tests/
├── service_auth/         # Tests authentification
├── service_offers/       # Tests offres
├── service_auth_migrations/ # Migrations auth
└── README.md            # Documentation tests
```

## 🔧 Services

| Service | Port | Description |
|---------|------|-------------|
| **Auth** | 8001 | Authentification, autorisation, admin |
| **Profile** | 8002 | Gestion des profils candidats/recruteurs |
| **Offers** | 8003 | Offres d'emploi et candidatures |
| **Mail** | 8004 | Envoi d'emails |
| **Messaging** | 8005 | Messagerie interne |

## 🛡️ Admin

Le système admin est intégré au service Auth :
- **Route** : `/admin/*`
- **Accès** : Rôle `admin` requis
- **Features** : Gestion utilisateurs, statistiques, audit, modération

### Créer un admin
```bash
cd tests\service_auth
python promote_admin.py
```

## 📊 Base de données

- **SQLite** pour développement
- **Tables admin** : Migration automatique via `migrate_create_admin.py`
- **Reset DB** : `recreate_db.py` (⚠️ Perd les données)

## 🔍 Tests

- **Tests API** : Validation des endpoints
- **Tests Admin** : Système d'administration
- **Scripts utilitaires** : Migration, promotion admin

## 🚀 Déploiement

Chaque service est indépendant et peut être déployé séparément :
```bash
# Production
python -m uvicorn main:app --host 0.0.0.0 --port 8001
```

## 📝 Notes de développement

- **Architecture** : Microservices découplés
- **Communication** : API REST entre services
- **Authentification** : JWT avec middleware
- **Organisation** : Code de production séparé des tests