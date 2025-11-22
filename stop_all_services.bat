@echo off
echo.
echo ==========================================
echo       ARRET DE TOUS LES SERVICES
echo ==========================================
echo.

echo 🛑 Arrêt de tous les services TalentLink...

REM Arrêter tous les processus Python/Uvicorn sur les ports TalentLink
echo.
echo 📍 Recherche des services actifs...

REM Liste des ports utilisés par TalentLink
set PORTS=8001 8002 8003 8004 8005 8006 3000

for %%p in (%PORTS%) do (
    echo Vérification du port %%p...
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%%p ^| findstr LISTENING') do (
        if not "%%a"=="" (
            echo ✋ Arrêt du processus sur le port %%p (PID: %%a)
            taskkill /PID %%a /F >nul 2>&1
            if errorlevel 1 (
                echo ⚠️  Impossible d'arrêter le PID %%a
            ) else (
                echo ✅ Processus %%a arrêté
            )
        )
    )
)

echo.
echo 🔍 Arrêt des processus par nom...

REM Arrêter tous les processus uvicorn
taskkill /F /IM "uvicorn.exe" >nul 2>&1
if not errorlevel 1 echo ✅ Processus uvicorn arrêtés

REM Arrêter tous les processus python qui pourraient être des services
for /f "tokens=2" %%i in ('tasklist /FI "IMAGENAME eq python.exe" /FO CSV ^| findstr /V "PID"') do (
    set "pid=%%i"
    set "pid=!pid:"=!"
    if not "!pid!"=="" (
        echo 🐍 Arrêt processus Python PID: !pid!
        taskkill /PID !pid! /F >nul 2>&1
    )
)

REM Arrêter Node.js (React)
taskkill /F /IM "node.exe" >nul 2>&1
if not errorlevel 1 echo ✅ Processus Node.js arrêtés

echo.
echo 🧹 Nettoyage des ports...
timeout /t 2 /nobreak >nul

echo.
echo ✅ TOUS LES SERVICES ONT ÉTÉ ARRÊTÉS !
echo.
echo 📋 Services arrêtés :
echo    - Service Auth (port 8001)
echo    - Service Profile (port 8002)  
echo    - Service Offers (port 8003)
echo    - Service Messaging (port 8004)
echo    - Service Mail (port 8005)
echo    - Service Appointment (port 8006)
echo    - Frontend React (port 3000)
echo.
echo 🚀 Pour redémarrer tous les services, utilisez:
echo    start_all_services.bat
echo.
pause