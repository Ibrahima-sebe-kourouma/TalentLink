#!/bin/bash

# Script de sauvegarde automatique pour TalentLink (SQLite + MongoDB)

BACKUP_DIR="/home/backups/talenlink"
DATE=$(date +%Y%m%d_%H%M%S)
PROJECT_DIR="/home/talenlink/backend"

echo "🚀 Démarrage du backup TalentLink - $DATE"

# Créer le dossier de backup
mkdir -p $BACKUP_DIR

# ===== BACKUP SQLITE =====
echo "📦 Backup des bases SQLite..."

# Copier toutes les bases SQLite
cp $PROJECT_DIR/service_auth/auth.db $BACKUP_DIR/auth_$DATE.db 2>/dev/null
cp $PROJECT_DIR/service_profile/profile.db $BACKUP_DIR/profile_$DATE.db 2>/dev/null
cp $PROJECT_DIR/service_offers/offers.db $BACKUP_DIR/offers_$DATE.db 2>/dev/null
cp $PROJECT_DIR/service_appointment/appointment.db $BACKUP_DIR/appointment_$DATE.db 2>/dev/null
cp $PROJECT_DIR/service_report/report.db $BACKUP_DIR/report_$DATE.db 2>/dev/null

# ===== BACKUP MONGODB =====
echo "🍃 Backup de MongoDB..."

# Dump MongoDB depuis le conteneur
docker exec mongodb mongodump \
  --out=/dump_$DATE \
  --username=talentlink \
  --password=$(grep MONGO_PASSWORD $PROJECT_DIR/.env | cut -d '=' -f2) \
  --authenticationDatabase=admin

# Copier le dump depuis le conteneur
docker cp mongodb:/dump_$DATE $BACKUP_DIR/mongodb_$DATE

# Nettoyer le dump dans le conteneur
docker exec mongodb rm -rf /dump_$DATE

# ===== BACKUP UPLOADS (CVs, lettres de motivation) =====
echo "📎 Backup des fichiers uploadés..."
cp -r $PROJECT_DIR/uploads $BACKUP_DIR/uploads_$DATE 2>/dev/null

# ===== COMPRESSION =====
echo "🗜️  Compression du backup..."
cd $BACKUP_DIR
tar -czf talenlink_full_backup_$DATE.tar.gz \
  auth_$DATE.db \
  profile_$DATE.db \
  offers_$DATE.db \
  appointment_$DATE.db \
  report_$DATE.db \
  mongodb_$DATE \
  uploads_$DATE

# Nettoyer les fichiers non compressés
rm -f *.db
rm -rf mongodb_$DATE uploads_$DATE

# ===== NETTOYAGE DES VIEUX BACKUPS =====
echo "🧹 Nettoyage des backups de plus de 7 jours..."
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

# ===== VÉRIFICATION =====
BACKUP_FILE="$BACKUP_DIR/talenlink_full_backup_$DATE.tar.gz"
if [ -f "$BACKUP_FILE" ]; then
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✅ Backup réussi : $BACKUP_FILE ($SIZE)"
else
    echo "❌ Erreur : le fichier de backup n'a pas été créé"
    exit 1
fi

echo "🎉 Backup terminé avec succès !"

# Optionnel : Envoyer le backup vers un cloud (S3, Dropbox, etc.)
# aws s3 cp $BACKUP_FILE s3://your-bucket/backups/
