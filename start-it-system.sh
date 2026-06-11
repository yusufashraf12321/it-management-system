#!/bin/bash

# الحصول على المسار الحالي للمشروع
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "⏳ Starting Konecta IT Management System via Docker..."

# تشغيل الكونتينر في الخلفية
docker-compose up -d

# الانتظار حتى يصبح الخادم جاهزاً
echo "🔄 Waiting for the system to be ready..."
MAX_RETRIES=30
RETRY_COUNT=0

while ! curl -s http://localhost:3000 > /dev/null; do
    sleep 2
    RETRY_COUNT=$((RETRY_COUNT+1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        echo "❌ Timeout waiting for the system to start."
        exit 1
    fi
done

echo "✅ System is running! Opening browser..."

# فتح المتصفح التلقائي حسب نظام التشغيل
if which xdg-open > /dev/null; then
  xdg-open "http://localhost:3000"
elif which gnome-open > /dev/null; then
  gnome-open "http://localhost:3000"
else
  # للماك
  open "http://localhost:3000"
fi
