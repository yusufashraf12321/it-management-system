@echo off
:: ============================================================
::   Konecta IT System - First Time Setup (Windows)
::   التشغيل الأول على جهاز الستوك - يُشغَّل مرة واحدة فقط
:: ============================================================

title Konecta IT System - First Setup
color 0B
cls

echo.
echo  =====================================================
echo    Konecta IT Management System - First Time Setup
echo  =====================================================
echo.

:: ─── التحقق من وجود Docker ─────────────────────────────────
docker --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Docker is not installed!
    echo  Please download and install Docker Desktop from:
    echo  https://www.docker.com/products/docker-desktop
    echo.
    pause
    exit /b 1
)
echo  [OK] Docker is installed.

:: ─── التحقق من وجود Git ─────────────────────────────────────
git --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Git is not installed!
    echo  Please download and install Git from:
    echo  https://git-scm.com/download/win
    echo.
    pause
    exit /b 1
)
echo  [OK] Git is installed.

:: ─── طلب رابط الـ GitHub Repository ────────────────────────
echo.
echo  Enter your GitHub repository URL:
echo  (Example: https://github.com/YourName/IT-MANAGMENT-SYSTEM.git)
echo.
set /p REPO_URL=  GitHub URL: 

:: ─── تحديد مجلد التثبيت ─────────────────────────────────────
set INSTALL_DIR=%USERPROFILE%\Desktop\Konecta-IT-System

echo.
echo  [INFO] Cloning project to: %INSTALL_DIR%
git clone %REPO_URL% "%INSTALL_DIR%"

IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Failed to clone the repository. Check the URL and try again.
    pause
    exit /b 1
)

:: ─── إنشاء ملف .env.local للإعدادات المحلية ─────────────────
echo NEXTAUTH_URL=http://localhost:3000 > "%INSTALL_DIR%\.env.local"
echo NEXTAUTH_SECRET=konecta-super-secret-2024 >> "%INSTALL_DIR%\.env.local"
echo DATABASE_URL=file:/app/data/production.db >> "%INSTALL_DIR%\.env.local"

echo.
echo  [3/4] Building Docker image (this may take 3-5 minutes)...
cd /d "%INSTALL_DIR%"
docker-compose build

IF %ERRORLEVEL% NEQ 0 (
    echo  [ERROR] Docker build failed! Check the error messages above.
    pause
    exit /b 1
)

echo.
echo  [4/4] Starting the system...
docker-compose up -d

:: ─── الانتظار حتى يصبح النظام جاهزاً ──────────────────────
echo  Waiting for the system to be ready...
timeout /t 8 /nobreak >nul

:: ─── نسخ سكربت التحديث للديسكتوب ──────────────────────────
copy "%INSTALL_DIR%\update-windows.bat" "%USERPROFILE%\Desktop\Konecta-Update.bat"
copy "%INSTALL_DIR%\start-windows.bat" "%USERPROFILE%\Desktop\Konecta-IT-System.bat"

:: ─── فتح المتصفح ─────────────────────────────────────────────
start http://localhost:3000

echo.
echo  =====================================================
echo    Setup Complete! System is ready.
echo    Shortcuts created on your Desktop:
echo    1. Konecta-IT-System.bat   (to START the system)
echo    2. Konecta-Update.bat      (to UPDATE the system)
echo  =====================================================
echo.
pause
