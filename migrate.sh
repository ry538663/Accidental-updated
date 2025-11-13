#!/bin/bash
# MongoDB and PostgreSQL migration runner script
# Run this after deploying to set up both databases

set -e

echo "======================================="
echo "Database Migration Script"
echo "======================================="

# Load environment variables
export $(cat .env.local | xargs) 2>/dev/null || export $(cat .env | xargs) 2>/dev/null

# 1. MongoDB migration
echo ""
echo "[1/2] Running MongoDB migration..."
python backend/migrate_mongodb.py

# 2. PostgreSQL migration (Alembic)
echo ""
echo "[2/2] Running PostgreSQL migration (Alembic)..."
cd backend
alembic upgrade head
cd ..

echo ""
echo "======================================="
echo "✓ All migrations completed!"
echo "======================================="
