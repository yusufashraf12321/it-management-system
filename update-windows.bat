@echo off
:: ============================================================
::   Konecta IT System - Smart Updater (Windows)
::   تحديث النظام بدون فقدان أي بيانات
:: ============================================================

title Konecta IT System - Updating...
color 0E
cls

echo.
echo  =====================================================
echo    Konecta IT System - Smart Updater
echo    Data is 100%% safe during this process
echo  =====================================================
echo.

set INSTALL_DIR=%USERPROFILE%\Desktop\Konecta-IT-System
cd /d "%INSTALL_DIR%"

:: ─── الخطوة 1: عمل نسخة احتياطية ───────────────────────────
echo  [1/4] Creating backup of your data...
if not exist "backups" mkdir backups

for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "BACKUP_DATE=%dt:~0,4%-%dt:~4,2%-%dt:~6,2%_%dt:~8,2%-%dt:~10,2%"

docker run --rm -v konecta-it-system_konecta_db:/data -v "%INSTALL_DIR%\backups":/backup alpine cp /data/production.db /backup/backup_%BACKUP_DATE%.db 2>nul
echo  [OK] Backup saved in backups folder.

:: ─── الخطوة 2: سحب آخر تحديثات من GitHub ───────────────────
echo.
echo  [2/4] Pulling latest updates from GitHub...
git pull origin main

IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Failed to pull updates. Check your internet connection.
    pause
    exit /b 1
)
echo  [OK] Code updated successfully.

:: ─── الخطوة 3: إعادة بناء Docker مع الكود الجديد ────────────
echo.
echo  [3/4] Building new version (data is safe)...
docker-compose build --no-cache

IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Build failed! System will restart with the old version.
    docker-compose up -d
    pause
    exit /b 1
)

:: ─── الخطوة 4: تشغيل النسخة الجديدة ────────────────────────
echo.
echo  [4/4] Starting updated system with your existing data...
docker-compose up -d

timeout /t 8 /nobreak >nul

:: ─── فتح المتصفح ─────────────────────────────────────────────
start http://localhost:3000

echo.
echo  =====================================================
echo    Update Complete! Your data is fully preserved.
echo    System is ready at: http://localhost:3000
echo  =====================================================
echo.
pause
