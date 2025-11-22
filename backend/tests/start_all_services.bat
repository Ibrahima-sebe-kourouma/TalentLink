@echo off
echo 🚀 Démarrage de tous les services TalentLink...

REM Vérifier que le fichier .env existe
if not exist ".env" (
    echo ❌ Erreur: fichier .env non trouvé!
    echo 📄 Copier .env.example en .env et configurer les variables
    pause
    exit /b 1
)

echo 📦 Configuration chargée depuis .env

REM Activer l'environnement virtuel
if exist "env\Scripts\activate.bat" (
    call env\Scripts\activate.bat
)

REM Démarrer les services
echo 🔧 Démarrage des services TalentLink...

start "Auth Service" cmd /c "cd service_auth && python main.py"
timeout /t 2 /nobreak >nul

start "Profile Service" cmd /c "cd service_profile && python main.py"
timeout /t 2 /nobreak >nul

start "Offers Service" cmd /c "cd service_offers && python main.py"
timeout /t 2 /nobreak >nul

start "Messaging Service" cmd /c "cd service_messaging && python main.py"
timeout /t 2 /nobreak >nul

start "Mail Service" cmd /c "cd service_mail && python main.py"

echo ✅ Tous les services sont en cours de démarrage...
echo 🌐 Services disponibles (selon configuration .env):
echo    - Auth: http://127.0.0.1:8001
echo    - Profile: http://127.0.0.1:8002
echo    - Offers: http://127.0.0.1:8003
echo    - Messaging: http://127.0.0.1:8004
echo    - Mail: http://127.0.0.1:8005
echo.
echo 📖 Documentation API disponible sur chaque service /docs
echo ⏹️  Pour arrêter: fermer les fenêtres de commande des services
pause