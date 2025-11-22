# Configuration Environnement - TalentLink Backend

## 📋 Aperçu

Toutes les données sensibles du backend TalentLink ont été déplacées vers un fichier de configuration `.env` pour améliorer la sécurité et faciliter le déploiement.

## 🔧 Configuration Initiale

### 1. Copier le fichier d'exemple
```bash
cp .env.example .env
```

### 2. Modifier les valeurs dans `.env`

**⚠️ IMPORTANT**: Ne jamais commiter le fichier `.env` dans Git !

## 📁 Structure de Configuration

### 🔐 Sécurité
- `SECRET_KEY`: Clé secrète pour JWT (256 bits minimum recommandé)
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Durée de vie des tokens (défaut: 30 min)

### 🗄️ Bases de Données
- `DATABASE_URL_AUTH`: Base auth (utilisateurs, admin)
- `DATABASE_URL_PROFILE`: Base profils (candidats, recruteurs)
- `DATABASE_URL_OFFERS`: Base offres d'emploi
- `DATABASE_URL_MESSAGING`: Base messagerie
- `DATABASE_URL_MAIL`: Base emails

### 🌐 Services (Ports)
- `SERVICE_AUTH_*`: Service authentification (défaut: 8001)
- `SERVICE_PROFILE_*`: Service profils (défaut: 8002)
- `SERVICE_OFFERS_*`: Service offres (défaut: 8003)
- `SERVICE_MESSAGING_*`: Service messagerie (défaut: 8004)
- `SERVICE_MAIL_*`: Service email (défaut: 8005)

### 📧 Email / SMTP
- `SMTP_HOST`: Serveur SMTP (défaut: smtp.gmail.com)
- `SMTP_PORT`: Port SMTP (défaut: 465)
- `SMTP_USER`: Adresse email d'expédition
- `SMTP_PASSWORD`: Mot de passe d'application Gmail
- `FROM_EMAIL`: Email affiché comme expéditeur
- `FROM_NAME`: Nom affiché comme expéditeur

### 🎯 CORS
- `CORS_ORIGINS`: Origines autorisées (séparées par des virgules)

## 🚀 Démarrage des Services

### Option 1: Script automatique (Windows)
```bash
.\start_all_services.bat
```

### Option 2: Script automatique (Linux/Mac)
```bash
./start_all_services.sh
```

### Option 3: Service individuel
```bash
cd service_auth
python main.py
```

## 🧪 Tests

### Vérifier la configuration
```bash
python test_env.py
```

### Tester un service
```bash
# Service Auth
curl http://127.0.0.1:8001/

# Service Profile  
curl http://127.0.0.1:8002/
```

## 📖 Documentation API

Une fois les services démarrés, la documentation Swagger est disponible:
- Auth: http://127.0.0.1:8001/docs
- Profile: http://127.0.0.1:8002/docs
- Offers: http://127.0.0.1:8003/docs
- Messaging: http://127.0.0.1:8004/docs
- Mail: http://127.0.0.1:8005/docs

## 🔒 Sécurité en Production

### Variables à modifier ABSOLUMENT en production:
1. `SECRET_KEY`: Générer une clé aléatoire unique
2. `SMTP_PASSWORD`: Utiliser un mot de passe d'application réel
3. `CORS_ORIGINS`: Restreindre aux domaines autorisés
4. `DEBUG`: Mettre à `false`

### Génération d'une clé secrète sécurisée:
```python
import secrets
print(secrets.token_urlsafe(32))
```

## ⚠️ Fichiers Sensibles

### Fichiers à ne JAMAIS commiter:
- `.env` (contient les secrets)
- `*.db` (bases de données locales)
- `logs/` (peut contenir des données sensibles)

### Fichiers à commiter:
- `.env.example` (structure sans les secrets)
- `test_env.py` (script de vérification)
- `start_all_services.*` (scripts de démarrage)

## 🐛 Débogage

### Problèmes fréquents:

**Service ne démarre pas:**
```bash
# Vérifier les variables d'environnement
python test_env.py

# Vérifier les dépendances
pip install -r requirements.txt
```

**Erreur de base de données:**
- Vérifier que les chemins dans `DATABASE_URL_*` sont corrects
- S'assurer que les répertoires existent

**Erreur CORS:**
- Vérifier `CORS_ORIGINS` dans `.env`
- Inclure l'URL complète du frontend

## 📝 Migration depuis l'ancienne configuration

Les anciens fichiers avec des valeurs hardcodées ont été automatiquement mis à jour pour:
- Charger les variables depuis `.env`
- Utiliser des valeurs par défaut si non définies
- Afficher des messages informatifs au démarrage

Aucune action manuelle requise sur le code existant.

## ✅ Checklist de Déploiement

- [ ] Fichier `.env` créé et configuré
- [ ] Clé `SECRET_KEY` unique générée
- [ ] Configuration email testée
- [ ] Ports des services vérifiés
- [ ] CORS configuré pour le bon domaine
- [ ] `DEBUG=false` en production
- [ ] Bases de données initialisées
- [ ] Tests de connectivité réussis