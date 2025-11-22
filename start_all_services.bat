@echo off
echo.
echo ==========================================
echo      DEMARRAGE DE TOUS LES SERVICES
echo ==========================================
echo.

echo 🚀 Démarrage de tous les services TalentLink...
echo.

REM Démarrer tous les services backend
echo 📡 Démarrage des services backend...

start "Service Auth (8001)" cmd /k "cd /d %~dp0backend\service_auth && .\run_service_auth.bat"
timeout /t 1 /nobreak >nul

start "Service Profile (8002)" cmd /k "cd /d %~dp0backend\service_profile && .\run_service_profile.bat"  
timeout /t 1 /nobreak >nul

start "Service Offers (8003)" cmd /k "cd /d %~dp0backend\service_offers && .\run_service_offers.bat"
timeout /t 1 /nobreak >nul

start "Service Messaging (8004)" cmd /k "cd /d %~dp0backend\service_messaging && .\run_service_messaging.bat"
timeout /t 1 /nobreak >nul

start "Service Mail (8005)" cmd /k "cd /d %~dp0backend\service_mail && .\run_service_mail.bat"
timeout /t 1 /nobreak >nul

echo.
echo ⏳ Attente du démarrage des services backend...
timeout /t 5 /nobreak >nul

echo.
echo 🌐 Démarrage du frontend React...
start "Frontend React (3000)" cmd /k "cd /d %~dp0frontend\talentlink && npm start"

echo.
echo ✅ TOUS LES SERVICES SONT EN COURS DE DEMARRAGE !
echo.
echo 📋 Services démarrés dans des fenêtres séparées :
echo    🔐 Service Auth      : http://localhost:8001
echo    👤 Service Profile   : http://localhost:8002  
echo    💼 Service Offers    : http://localhost:8003
echo    💬 Service Messaging : http://localhost:8004
echo    📧 Service Mail      : http://localhost:8005
echo    🌐 Frontend React    : http://localhost:3000
echo.
echo ⚠️  Attendez 10-15 secondes que tous les services soient prêts
echo.
echo 🛑 Pour arrêter tous les services, utilisez:
echo    stop_all_services.bat
echo.
pause