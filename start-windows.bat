@echo off
:: ============================================================
::   Konecta IT System - Daily Launcher (Windows)
::   تشغيل يومي - يفتح النظام تلقائياً
:: ============================================================

title Konecta IT System - Starting...
color 0A
cls

echo.
echo  =====================================================
echo    Konecta IT Management System
echo    Starting...
echo  =====================================================
echo.

set INSTALL_DIR=%USERPROFILE%\Desktop\Konecta-IT-System
cd /d "%INSTALL_DIR%"

:: تشغيل الكونتينر إذا لم يكن يعمل
docker-compose up -d >nul 2>&1

echo  Waiting for the system to be ready...
timeout /t 5 /nobreak >nul

:: فتح المتصفح
start http://localhost:3000

echo  System is running!
echo  Access: http://localhost:3000
timeout /t 3 /nobreak >nul
