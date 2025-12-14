# 🗄️ SQLite vs PostgreSQL pour TalentLink

## 📋 Situation actuelle

Tu utilises :
- **SQLite** pour : auth, profile, offers, appointment, report
- **MongoDB** pour : messaging (conversations en temps réel)

---

## ✅ OPTION 1 : GARDER SQLITE + MONGODB (Recommandé pour débuter)

### Avantages
- ✅ **Aucune migration** de données nécessaire
- ✅ Configuration **ultra simple**
- ✅ Fichiers de base de données **faciles à sauvegarder** (simple copie)
- ✅ **Idéal pour démarrer** et tester en production
- ✅ Pas de serveur DB externe à gérer

### Inconvénients
- ⚠️ **Limite de concurrence** : SQLite verrouille le fichier lors des écritures
- ⚠️ **Performance** : moins bon avec >100 utilisateurs simultanés
- ⚠️ **Backup** : manuel (mais simple avec Docker volumes)
- ⚠️ **Scalabilité** : difficile si grosse croissance

### Quand utiliser SQLite ?
- ✅ Lancement du projet (MVP)
- ✅ <50-100 utilisateurs simultanés
- ✅ Application principalement en lecture
- ✅ Tu veux déployer vite sans complexité

---

## 🚀 OPTION 2 : MIGRER VERS POSTGRESQL

### Avantages
- ✅ **Concurrence excellente** : plusieurs utilisateurs simultanés sans problème
- ✅ **Performance** : optimisé pour production
- ✅ **Transactions ACID** complètes
- ✅ **Backup automatique** : pg_dump, réplication
- ✅ **Scalabilité** : peut gérer des millions de lignes

### Inconvénients
- ⚠️ **Migration nécessaire** : transfert des données SQLite → PostgreSQL
- ⚠️ Plus complexe à configurer
- ⚠️ Nécessite un conteneur supplémentaire (ou service cloud)

### Quand migrer vers PostgreSQL ?
- 🎯 >100 utilisateurs simultanés
- 🎯 Grosse quantité de données (>2GB)
- 🎯 Beaucoup d'écritures concurrentes
- 🎯 Besoin de réplication/haute disponibilité

---

## 🔧 CONFIGURATION ACTUELLE (SQLite + MongoDB)

### Docker Compose adapté

```yaml
services:
  # MongoDB pour messaging
  mongodb:
    image: mongo:7
    volumes:
      - mongodb_data:/data/db
    ports:
      - "127.0.0.1:27017:27017"

  # Chaque service utilise SQLite
  service_auth:
    volumes:
      - ./service_auth/auth.db:/app/auth.db  # Fichier SQLite persistant

  service_offers:
    volumes:
      - ./service_offers/offers.db:/app/offers.db
      - ./uploads:/app/uploads  # CVs et lettres de motivation
```

### Ce qui se passe avec les bases de données :

1. **Les fichiers `.db` restent SUR TON VPS** (via Docker volumes)
2. Tes données actuelles peuvent être copiées sur le serveur
3. MongoDB tourne dans un conteneur séparé pour le messaging

---

## 📦 MIGRATION DES DONNÉES (si tu choisis PostgreSQL plus tard)

### Étape 1 : Exporter SQLite

```bash
# Pour chaque base de données
sqlite3 auth.db .dump > auth_dump.sql
sqlite3 profile.db .dump > profile_dump.sql
sqlite3 offers.db .dump > offers_dump.sql
```

### Étape 2 : Convertir pour PostgreSQL

Outil recommandé : **pgloader**

```bash
# Installer pgloader
apt install pgloader

# Convertir
pgloader auth.db postgresql://user:pass@localhost/talentlinkdb
```

### Étape 3 : Adapter le code

Aucun changement de code nécessaire avec SQLAlchemy ! Juste changer la `DATABASE_URL` :

```python
# Avant (SQLite)
DATABASE_URL = "sqlite:///./auth.db"

# Après (PostgreSQL)
DATABASE_URL = "postgresql://talentlink:password@postgres:5432/talentlinkdb"
```

---

## 🎯 RECOMMANDATION POUR TOI

### Phase 1 : Lancement (maintenant)
**→ Garde SQLite + MongoDB**
- Déploie avec la config actuelle
- Teste en conditions réelles
- Collecte des métriques d'usage

### Phase 2 : Si succès (dans 3-6 mois)
**→ Migre vers PostgreSQL** quand :
- Tu dépasses 50 utilisateurs actifs simultanés
- Tu vois des ralentissements
- Tu veux automatiser les backups
- Tu lèves des fonds ou passes en prod sérieuse

---

## 🔄 BACKUP AVEC SQLITE

### Backup automatique (cron sur le VPS)

Crée `/root/backup_sqlite.sh` :

```bash
#!/bin/bash
BACKUP_DIR="/home/backups/talenlink"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Copier toutes les bases SQLite
cp /home/talenlink/backend/service_auth/auth.db $BACKUP_DIR/auth_$DATE.db
cp /home/talenlink/backend/service_profile/profile.db $BACKUP_DIR/profile_$DATE.db
cp /home/talenlink/backend/service_offers/offers.db $BACKUP_DIR/offers_$DATE.db
cp /home/talenlink/backend/service_appointment/appointment.db $BACKUP_DIR/appointment_$DATE.db
cp /home/talenlink/backend/service_report/report.db $BACKUP_DIR/report_$DATE.db

# Compresser
tar -czf $BACKUP_DIR/talenlink_backup_$DATE.tar.gz $BACKUP_DIR/*.db
rm $BACKUP_DIR/*.db

# Garder seulement les 7 derniers jours
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Ajoute au cron :

```bash
chmod +x /root/backup_sqlite.sh
crontab -e

# Ajoute cette ligne : backup quotidien à 2h du matin
0 2 * * * /root/backup_sqlite.sh
```

### Backup MongoDB

```bash
# Dump MongoDB
docker exec mongodb mongodump --out=/dump --username=talentlink --password=changeme123

# Copier depuis le conteneur
docker cp mongodb:/dump /home/backups/mongodb_$(date +%Y%m%d)
```

---

## 📊 MONITORING AVEC SQLITE

### Vérifier la taille des bases

```bash
# Sur le VPS
du -sh /home/talenlink/backend/service_*/*.db

# Exemple de sortie :
# 2.4M  service_auth/auth.db
# 1.8M  service_profile/profile.db
# 15M   service_offers/offers.db
```

### Performance check

Si une DB dépasse **500MB**, considère PostgreSQL.

---

## ⚡ OPTIMISATION SQLITE POUR PRODUCTION

Dans chaque `database/database.py`, ajoute ces paramètres :

```python
from sqlalchemy import create_engine, event

engine = create_engine(
    "sqlite:///./auth.db",
    connect_args={
        "check_same_thread": False,
        # Optimisations SQLite
        "timeout": 30,  # Attendre 30s si verrouillé
    },
    pool_pre_ping=True,
    pool_recycle=3600,
)

# Activer WAL mode (Write-Ahead Logging) pour meilleures perfs
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    cursor = dbapi_conn.cursor()
    cursor.execute("PRAGMA journal_mode=WAL")
    cursor.execute("PRAGMA synchronous=NORMAL")
    cursor.execute("PRAGMA cache_size=-64000")  # 64MB cache
    cursor.close()
```

---

## 🎓 RÉSUMÉ

| Critère | Ta situation |
|---------|-------------|
| **Base actuelle** | SQLite + MongoDB ✅ |
| **Migration obligatoire ?** | ❌ NON |
| **Action immédiate** | Déployer avec SQLite + MongoDB |
| **Quand migrer ?** | Quand >50 users simultanés ou DB >500MB |
| **Complexité** | Faible (juste changer DATABASE_URL) |

**→ Commence avec SQLite, migre vers PostgreSQL si nécessaire plus tard.**

C'est comme acheter une voiture : commence avec une Civic (SQLite), upgrade vers une Mercedes (PostgreSQL) quand tu réussis ! 🚗→🏎️
