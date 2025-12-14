# 🚀 Guide de Déploiement TalentLink

## Prérequis sur ton VPS

✅ Tu dois avoir :
- Un VPS avec Ubuntu 20.04/22.04
- NGINX installé
- Docker et Docker Compose installés
- Un nom de domaine pointant vers ton VPS (ex: talentlink.ca)
- Accès SSH root ou sudo

---

## 📦 ÉTAPE 1 : Installer Docker (si pas déjà fait)

Connecte-toi en SSH à ton VPS :

```bash
ssh root@ton_ip_vps
```

Installe Docker :

```bash
# Mise à jour
apt update && apt upgrade -y

# Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Installation Docker Compose
apt install docker-compose -y

# Vérification
docker --version
docker-compose --version
```

---

## 📂 ÉTAPE 2 : Envoyer ton code sur le VPS

### Option A : Via Git (RECOMMANDÉ)

Sur ton VPS :

```bash
cd /home
git clone https://github.com/ton-username/talenlink.git
cd talenlink/backend
```

### Option B : Via SCP (si pas de Git)

Depuis ton PC Windows (PowerShell) :

```powershell
# Compresser le dossier backend
Compress-Archive -Path "C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend" -DestinationPath "backend.zip"

# Envoyer sur le VPS
scp backend.zip root@ton_ip_vps:/home/

# Sur le VPS, décompresser
ssh root@ton_ip_vps
cd /home
unzip backend.zip
```

---

## ⚙️ ÉTAPE 3 : Configurer les variables d'environnement

Sur le VPS :

```bash
cd /home/talenlink/backend

# Créer le fichier .env à partir du template
cp .env.production .env

# Éditer avec nano
nano .env
```

**Modifie ces valeurs IMPORTANTES :**

```env
# Génère une clé secrète forte (utilise cette commande) :
SECRET_KEY=$(openssl rand -hex 32)

# Google OAuth (récupère sur console.cloud.google.com)
GOOGLE_CLIENT_ID=ton_vrai_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=ton_vrai_secret

# Email (si tu utilises Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=ton_email@gmail.com
SMTP_PASSWORD=ton_app_password  # Pas ton mot de passe Gmail !

# Domaine
CORS_ORIGINS=https://talentlink.ca,https://www.talentlink.ca
```

**Pour générer SECRET_KEY :**
```bash
openssl rand -hex 32
```

Sauvegarde : `Ctrl+X`, puis `Y`, puis `Enter`

---

## 🐳 ÉTAPE 4 : Construire et lancer les conteneurs

```bash
cd /home/talenlink/backend

# Construction des images (peut prendre 5-10 min)
docker-compose build

# Lancement en arrière-plan
docker-compose up -d

# Vérifier que tout tourne
docker-compose ps
```

**Tu devrais voir 8 conteneurs "Up" :**
- service_auth
- service_profile
- service_offers
- service_mail
- service_messaging
- service_appointment
- service_report
- service_rag

**Voir les logs en temps réel :**
```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f service_auth
```

---

## 🌐 ÉTAPE 5 : Configurer NGINX

### 5.1 Créer la configuration

```bash
nano /etc/nginx/sites-available/talentlink
```

**Colle cette configuration :**

```nginx
# Redirection HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name talentlink.ca www.talentlink.ca;
    
    location / {
        return 301 https://$host$request_uri;
    }
}

# Configuration HTTPS
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name talentlink.ca www.talentlink.ca;

    # Certificats SSL (Certbot les créera automatiquement)
    ssl_certificate /etc/letsencrypt/live/talentlink.ca/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/talentlink.ca/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;

    # Taille maximale des uploads (pour CV/lettres de motivation)
    client_max_body_size 10M;

    # === MICROSERVICES ===
    
    # Auth
    location /api/auth/ {
        proxy_pass http://127.0.0.1:8001/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Profile
    location /api/profile/ {
        proxy_pass http://127.0.0.1:8002/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Offers
    location /api/offers/ {
        proxy_pass http://127.0.0.1:8003/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Mail
    location /api/mail/ {
        proxy_pass http://127.0.0.1:8004/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Messaging (WebSocket support)
    location /api/messaging/ {
        proxy_pass http://127.0.0.1:8005/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Appointment
    location /api/appointment/ {
        proxy_pass http://127.0.0.1:8006/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Report
    location /api/report/ {
        proxy_pass http://127.0.0.1:8007/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # RAG (Chatbot)
    location /api/rag/ {
        proxy_pass http://127.0.0.1:8008/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # === FRONTEND REACT ===
    location / {
        root /var/www/talentlink;
        try_files $uri $uri/ /index.html;
    }

    # Logs
    access_log /var/log/nginx/talentlink.access.log;
    error_log /var/log/nginx/talentlink.error.log;
}
```

Sauvegarde : `Ctrl+X`, `Y`, `Enter`

### 5.2 Activer le site

```bash
# Créer un lien symbolique
ln -s /etc/nginx/sites-available/talentlink /etc/nginx/sites-enabled/

# Supprimer le site par défaut (optionnel)
rm /etc/nginx/sites-enabled/default

# Tester la config
nginx -t

# Si OK, recharger NGINX
systemctl reload nginx
```

---

## 🔒 ÉTAPE 6 : Activer HTTPS avec Certbot

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir un certificat SSL (remplace par ton domaine)
certbot --nginx -d talentlink.ca -d www.talentlink.ca
```

**Pendant l'installation, Certbot va :**
1. Te demander ton email
2. Accepter les termes
3. Créer automatiquement les certificats
4. Modifier la config NGINX

**Le renouvellement est automatique !** Certbot crée un cron job.

---

## 📱 ÉTAPE 7 : Déployer le Frontend React

### 7.1 Build local (sur ton PC)

```powershell
cd C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\frontend\talentlink

# Modifier les URLs d'API dans .env
# Remplace localhost par ton domaine
echo "REACT_APP_API_AUTH_URL=https://talentlink.ca/api/auth" > .env.production
echo "REACT_APP_API_PROFILE_URL=https://talentlink.ca/api/profile" >> .env.production
echo "REACT_APP_API_OFFERS_URL=https://talentlink.ca/api/offers" >> .env.production

# Build production
npm run build
```

### 7.2 Envoyer sur le VPS

```powershell
# Compresser le dossier build
Compress-Archive -Path ".\build" -DestinationPath "frontend-build.zip"

# Envoyer
scp frontend-build.zip root@ton_ip_vps:/tmp/
```

### 7.3 Installer sur le VPS

```bash
# Sur le VPS
cd /tmp
unzip frontend-build.zip

# Créer le dossier web
mkdir -p /var/www/talentlink

# Copier les fichiers
cp -r build/* /var/www/talentlink/

# Permissions
chown -R www-data:www-data /var/www/talentlink
```

---

## 🔥 ÉTAPE 8 : Configurer le Firewall

```bash
# Autoriser SSH, HTTP et HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Activer le firewall
ufw enable

# Vérifier
ufw status
```

---

## ✅ ÉTAPE 9 : Vérifications

### 9.1 Vérifier les conteneurs

```bash
docker-compose ps
```

Tous doivent être "Up".

### 9.2 Tester les API localement

```bash
# Depuis le VPS
curl http://127.0.0.1:8001/
curl http://127.0.0.1:8002/
curl http://127.0.0.1:8003/
# etc...
```

### 9.3 Tester depuis Internet

Depuis ton navigateur :
- `https://talentlink.ca` → Frontend
- `https://talentlink.ca/api/auth/` → API Auth
- `https://talentlink.ca/api/offers/` → API Offers

---

## 🛠️ Commandes Utiles

### Gérer les conteneurs

```bash
# Voir les logs
docker-compose logs -f service_auth

# Redémarrer un service
docker-compose restart service_auth

# Reconstruire après modification
docker-compose build service_auth
docker-compose up -d service_auth

# Arrêter tout
docker-compose down

# Arrêter et supprimer volumes (⚠️ perte de données)
docker-compose down -v
```

### Gérer NGINX

```bash
# Recharger la config
systemctl reload nginx

# Redémarrer
systemctl restart nginx

# Voir les erreurs
tail -f /var/log/nginx/talentlink.error.log
```

### Sauvegardes

```bash
# Backup des bases de données SQLite
tar -czf backup-$(date +%Y%m%d).tar.gz \
  service_auth/auth.db \
  service_profile/profile.db \
  service_offers/offers.db \
  service_messaging/messaging.db \
  service_appointment/appointment.db \
  service_report/report.db \
  uploads/

# Télécharger sur ton PC
scp root@ton_ip:/home/talenlink/backend/backup-*.tar.gz .
```

---

## 🐛 Dépannage

### Problème : Conteneur ne démarre pas

```bash
docker-compose logs service_auth
```

### Problème : 502 Bad Gateway

- Vérifier que le conteneur tourne : `docker-compose ps`
- Vérifier les logs : `docker-compose logs -f`

### Problème : CORS errors

Vérifie que `CORS_ORIGINS` dans `.env` contient ton domaine.

### Problème : SSL certificate error

Renouveler manuellement :
```bash
certbot renew --nginx
```

---

## 📊 Monitoring

### Voir l'utilisation des ressources

```bash
# CPU/RAM par conteneur
docker stats

# Espace disque
df -h
```

---

## 🔄 Mise à jour du code

```bash
cd /home/talenlink/backend

# Pull les modifications
git pull

# Rebuild et restart
docker-compose build
docker-compose up -d
```

---

## 📞 Support

Si problème :
1. Vérifie les logs : `docker-compose logs -f`
2. Vérifie NGINX : `nginx -t`
3. Vérifie le firewall : `ufw status`

---

**Bon déploiement ! 🚀**
