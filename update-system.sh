#!/bin/bash
# ============================================================
#   Konecta IT System - Smart Update Script
#   يقوم بتحديث النظام بالكامل دون المساس بأي بيانات
# ============================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# ─── الألوان للطباعة الجميلة ───────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Konecta IT System - Smart Updater     ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ─── الخطوة 1: التحقق من أن Docker يعمل ──────────────────
echo -e "${YELLOW}[1/5] Checking Docker status...${NC}"
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running! Please start Docker and try again.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Docker is running.${NC}"

# ─── الخطوة 2: عمل نسخة احتياطية تلقائية للبيانات ────────
echo ""
echo -e "${YELLOW}[2/5] Creating automatic database backup...${NC}"
BACKUP_DATE=$(date +%Y-%m-%d_%H-%M-%S)
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"

# نسخ ملف قاعدة البيانات من الـ Volume إلى مجلد backups
docker run --rm \
  -v konecta_it-managment-system_konecta_db:/data \
  -v "$BACKUP_DIR":/backup \
  alpine \
  cp /data/production.db /backup/backup_$BACKUP_DATE.db 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup saved: backups/backup_$BACKUP_DATE.db${NC}"
else
    echo -e "${YELLOW}⚠️  Backup skipped (first run or no existing data). Continuing...${NC}"
fi

# ─── الخطوة 3: إيقاف الكونتينر القديم (مع الحفاظ على البيانات) ─
echo ""
echo -e "${YELLOW}[3/5] Stopping current container (data is safe)...${NC}"
docker-compose stop
echo -e "${GREEN}✅ Container stopped. Volume data is untouched.${NC}"

# ─── الخطوة 4: إعادة بناء الـ Image بالكود الجديد ──────────
echo ""
echo -e "${YELLOW}[4/5] Building new Docker image with latest code...${NC}"
docker-compose build --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Rolling back to previous version...${NC}"
    docker-compose start
    exit 1
fi
echo -e "${GREEN}✅ New image built successfully.${NC}"

# ─── الخطوة 5: تشغيل الكونتينر الجديد مع نفس البيانات ─────
echo ""
echo -e "${YELLOW}[5/5] Starting updated system with existing data...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✅ Update Complete! System is ready.   ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e " 🌐 Access the system at: ${BLUE}http://localhost:3000${NC}"
echo -e " 💾 Backups saved in: ${BLUE}$BACKUP_DIR/${NC}"
echo ""

# فتح المتصفح تلقائياً بعد 5 ثوانٍ من التشغيل
echo "⏳ Opening browser in 5 seconds..."
sleep 5
xdg-open "http://localhost:3000" 2>/dev/null || open "http://localhost:3000" 2>/dev/null
