#!/bin/bash
# ============================================================
#   Konecta IT System - Manual Backup Script
#   نسخ احتياطي يدوي فوري لقاعدة البيانات
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"

BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_FILE="$BACKUP_DIR/manual_backup_$BACKUP_DATE.db"

echo "💾 Creating manual backup..."

docker run --rm \
  -v konecta_it-managment-system_konecta_db:/data \
  -v "$BACKUP_DIR":/backup \
  alpine \
  cp /data/production.db /backup/manual_backup_$BACKUP_DATE.db

if [ $? -eq 0 ]; then
    echo "✅ Backup saved successfully!"
    echo "📁 Location: $BACKUP_FILE"
else
    echo "❌ Backup failed. Is Docker running?"
fi
