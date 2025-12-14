# 🗄️ Transférer tes bases de données existantes vers le VPS

## 📋 Situation

Tu as déjà des données en local dans :
- `service_auth/auth.db` (utilisateurs, admins)
- `service_profile/profile.db` (profils candidats/recruteurs)
- `service_offers/offers.db` (offres d'emploi, candidatures)
- `service_appointment/appointment.db` (rendez-vous)
- `service_report/report.db` (signalements)
- MongoDB local (conversations messagerie)

Tu veux **garder ces données** lors du déploiement.

---

## 🚀 ÉTAPE 1 : Préparer les bases de données locales

### 1.1 Localiser tes fichiers .db

Sur ton PC Windows, tes fichiers sont ici :

```
C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend\
├── service_auth/auth.db
├── service_profile/profile.db
├── service_offers/offers.db
├── service_appointment/appointment.db
├── service_report/report.db
└── uploads/  (CVs et lettres de motivation)
```

### 1.2 Vérifier l'intégrité des bases (optionnel mais recommandé)

```powershell
# Ouvre PowerShell dans le dossier backend
cd "C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend"

# Vérifier chaque base SQLite
sqlite3 service_auth/auth.db "PRAGMA integrity_check;"
sqlite3 service_profile/profile.db "PRAGMA integrity_check;"
sqlite3 service_offers/offers.db "PRAGMA integrity_check;"
sqlite3 service_appointment/appointment.db "PRAGMA integrity_check;"
sqlite3 service_report/report.db "PRAGMA integrity_check;"
```

Si tout affiche `ok`, c'est bon ✅

---

## 📦 ÉTAPE 2 : Compresser les données

### Option A : Avec PowerShell (recommandé)

```powershell
# Depuis le dossier backend
cd "C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend"

# Créer une archive avec toutes les bases de données
Compress-Archive -Path @(
    "service_auth\auth.db",
    "service_profile\profile.db",
    "service_offers\offers.db",
    "service_appointment\appointment.db",
    "service_report\report.db",
    "uploads"
) -DestinationPath "talenlink_databases.zip"

# Vérifier la création
ls talenlink_databases.zip
```

### Option B : Script batch automatique

J'ai créé `backup_databases.bat` - double-clique dessus, il créera une sauvegarde complète.

---

## 🌐 ÉTAPE 3 : Transférer vers le VPS

### Méthode 1 : Via SCP (Simple)

```powershell
# Depuis PowerShell
cd "C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend"

# Envoyer l'archive (remplace TON_IP_VPS)
scp talenlink_databases.zip root@TON_IP_VPS:/tmp/
```

### Méthode 2 : Via WinSCP (Interface graphique)

1. Télécharge WinSCP : https://winscp.net/
2. Connecte-toi à ton VPS
3. Glisse-dépose `talenlink_databases.zip` vers `/tmp/`

---

## 🐳 ÉTAPE 4 : Restaurer sur le VPS

### 4.1 Se connecter au VPS

```bash
ssh root@TON_IP_VPS
```

### 4.2 Décompresser les bases

```bash
# Aller dans le dossier temporaire
cd /tmp

# Décompresser
unzip talenlink_databases.zip -d /tmp/databases

# Vérifier le contenu
ls -lh /tmp/databases/
```

### 4.3 Placer les bases dans les bons dossiers

Avant de lancer Docker, copie les bases :

```bash
# Créer la structure si elle n'existe pas encore
cd /home/talenlink/backend

# Copier chaque base de données
cp /tmp/databases/service_auth/auth.db ./service_auth/auth.db
cp /tmp/databases/service_profile/profile.db ./service_profile/profile.db
cp /tmp/databases/service_offers/offers.db ./service_offers/offers.db
cp /tmp/databases/service_appointment/appointment.db ./service_appointment/appointment.db
cp /tmp/databases/service_report/report.db ./service_report/report.db

# Copier les uploads (CVs, lettres de motivation)
cp -r /tmp/databases/uploads ./uploads

# Donner les bonnes permissions
chmod 644 service_auth/auth.db
chmod 644 service_profile/profile.db
chmod 644 service_offers/offers.db
chmod 644 service_appointment/appointment.db
chmod 644 service_report/report.db
chmod -R 755 uploads/

# Vérifier
ls -lh service_*/*.db
```

---

## 🍃 ÉTAPE 5 : Transférer MongoDB (si tu as des conversations existantes)

### 5.1 Export depuis ton PC

```powershell
# Sur ton PC Windows
# Lance MongoDB localement d'abord
mongodump --db talentlink_messaging --out C:\temp\mongo_backup
```

### 5.2 Compresser et envoyer

```powershell
# Compresser
Compress-Archive -Path "C:\temp\mongo_backup" -DestinationPath "mongo_backup.zip"

# Envoyer au VPS
scp mongo_backup.zip root@TON_IP_VPS:/tmp/
```

### 5.3 Restaurer sur le VPS

```bash
# Sur le VPS, après avoir lancé docker-compose
ssh root@TON_IP_VPS

# Décompresser
cd /tmp
unzip mongo_backup.zip

# Attendre que le conteneur MongoDB soit lancé
docker-compose ps  # mongodb doit être "Up"

# Copier dans le conteneur
docker cp /tmp/mongo_backup mongodb:/tmp/

# Restaurer
docker exec mongodb mongorestore \
  /tmp/mongo_backup \
  --username talentlink \
  --password $(grep MONGO_PASSWORD /home/talenlink/backend/.env | cut -d'=' -f2) \
  --authenticationDatabase admin

# Vérifier
docker exec mongodb mongo \
  -u talentlink \
  -p $(grep MONGO_PASSWORD /home/talenlink/backend/.env | cut -d'=' -f2) \
  --authenticationDatabase admin \
  --eval "db.adminCommand('listDatabases')"
```

---

## ✅ ÉTAPE 6 : Vérifier que tout fonctionne

### 6.1 Lancer Docker Compose

```bash
cd /home/talenlink/backend
docker-compose up -d
```

### 6.2 Vérifier les logs

```bash
# Voir si les services démarrent sans erreur
docker-compose logs -f service_auth
docker-compose logs -f service_messaging
```

### 6.3 Tester les endpoints

```bash
# Depuis le VPS
# Auth service - devrait retourner les utilisateurs existants
curl http://127.0.0.1:8001/admin/users/public

# Offers service - devrait retourner les offres existantes
curl http://127.0.0.1:8003/offres/
```

---

## 🔄 SYNCHRONISATION CONTINUE (pendant le développement)

Si tu continues à développer en local et veux synchroniser :

### Script de synchronisation (PowerShell)

```powershell
# sync_to_vps.ps1
$VPS_IP = "TON_IP_VPS"
$PROJECT = "C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend"

# Synchroniser les bases de données
scp "$PROJECT\service_auth\auth.db" "root@${VPS_IP}:/home/talenlink/backend/service_auth/"
scp "$PROJECT\service_profile\profile.db" "root@${VPS_IP}:/home/talenlink/backend/service_profile/"
scp "$PROJECT\service_offers\offers.db" "root@${VPS_IP}:/home/talenlink/backend/service_offers/"

# Redémarrer les services
ssh root@$VPS_IP "cd /home/talenlink/backend && docker-compose restart"

Write-Host "✅ Synchronisation terminée"
```

---

## 🚨 IMPORTANT : Permissions et sécurité

### Sur le VPS, vérifier les permissions

```bash
cd /home/talenlink/backend

# Les fichiers .db doivent être lisibles/écribles par le conteneur
chown -R 1000:1000 service_auth/auth.db
chown -R 1000:1000 service_profile/profile.db
chown -R 1000:1000 service_offers/offers.db
chown -R 1000:1000 service_appointment/appointment.db
chown -R 1000:1000 service_report/report.db
chown -R 1000:1000 uploads/
```

---

## 📊 TAILLE DES BASES DE DONNÉES

### Vérifier la taille avant transfert

```powershell
# Sur Windows
Get-ChildItem -Recurse C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend\service_*\*.db | 
  Select-Object Name, @{Name="SizeMB";Expression={[math]::Round($_.Length/1MB,2)}}
```

### Vérifier sur le VPS

```bash
du -sh /home/talenlink/backend/service_*/*.db
```

---

## 🔐 SÉCURITÉ DES TRANSFERTS

### Utiliser SSH key au lieu du mot de passe

```powershell
# Sur Windows, générer une clé SSH (si pas déjà fait)
ssh-keygen -t ed25519 -C "ton_email@example.com"

# Copier la clé publique vers le VPS
type $env:USERPROFILE\.ssh\id_ed25519.pub | ssh root@TON_IP_VPS "cat >> ~/.ssh/authorized_keys"

# Maintenant tu peux te connecter sans mot de passe
ssh root@TON_IP_VPS
```

---

## ⚠️ CHECKLIST FINALE

Avant de lancer en production :

- [ ] Backup local créé (ZIP avec toutes les .db)
- [ ] Bases transférées sur le VPS
- [ ] Permissions correctes (644 pour .db, 755 pour uploads/)
- [ ] Docker Compose lancé avec succès
- [ ] Logs vérifiés (pas d'erreur de connexion DB)
- [ ] Test API : endpoints retournent les données existantes
- [ ] MongoDB restauré (si conversations existantes)
- [ ] Script de backup automatique configuré (cron)

---

## 🆘 DÉPANNAGE

### Erreur : "database is locked"

```bash
# Arrêter les conteneurs
docker-compose down

# Vérifier qu'aucun processus n'utilise la DB
lsof service_auth/auth.db

# Redémarrer
docker-compose up -d
```

### Erreur : "unable to open database file"

```bash
# Vérifier les permissions
ls -l service_auth/auth.db

# Corriger
chmod 666 service_auth/auth.db
```

### Les données n'apparaissent pas

```bash
# Vérifier que la base n'est pas vide
docker exec -it service_auth sh
sqlite3 /app/auth.db "SELECT COUNT(*) FROM users;"
```

---

## 📝 RÉSUMÉ

1. **Compresser** les bases locales (.db + uploads)
2. **Transférer** via SCP vers `/tmp/` sur le VPS
3. **Copier** dans les dossiers de services
4. **Permissions** : `chmod 644 *.db`
5. **Lancer** : `docker-compose up -d`
6. **Vérifier** : logs + test API

**Tes données seront préservées et utilisées en production !** 🎉
