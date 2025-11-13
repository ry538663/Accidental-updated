@echo off
REM MongoDB and PostgreSQL migration runner script for Windows
REM Run this after deploying to set up both databases

echo.
echo =======================================
echo Database Migration Script (Windows)
echo =======================================
echo.

REM 1. MongoDB migration
echo [1/2] Running MongoDB migration...
python backend\migrate_mongodb.py

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MongoDB migration failed
    exit /b 1
)

REM 2. PostgreSQL migration (Alembic)
echo.
echo [2/2] Running PostgreSQL migration (Alembic)...
cd backend
alembic upgrade head
cd ..

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL migration failed
    exit /b 1
)

echo.
echo =======================================
echo ^✓ All migrations completed!
echo =======================================
pause
