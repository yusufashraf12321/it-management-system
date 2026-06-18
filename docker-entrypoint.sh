#!/bin/sh
set -e

echo "🚀 Starting Konecta IT Management System..."

# Set the database URL to use the persistent data volume
export DATABASE_URL="file:/app/data/production.db"

# Run Prisma migrations/push on every start to keep schema in sync
echo "📦 Syncing database schema..."
node /app/node_modules/prisma/build/index.js db push

# Check if the database is empty (no users) and seed it if so
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient({ datasources: { db: { url: 'file:/app/data/production.db' } } });
p.user.count().then(c => { console.log(c); p.\$disconnect(); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 First run detected - seeding the database..."
  DATABASE_URL="file:/app/data/production.db" node prisma/seed.js
  echo "✅ Database seeded successfully!"
else
  echo "✅ Database already initialized with $USER_COUNT user(s). Skipping seed."
fi

echo "🌐 Starting Next.js server on port 3000..."
exec node server.js
