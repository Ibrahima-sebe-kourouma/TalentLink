@echo off
echo ============================================
echo     TalentLink - Service Chatbot
echo ============================================
echo Demarrage du service avec integration Ollama...
echo.

cd /d "%~dp0"

echo [1/4] Verification d'Ollama...
ollama --version >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Ollama n'est pas installe ou accessible
    echo    Veuillez installer Ollama depuis: https://ollama.ai
    pause
    exit /b 1
) else (
    echo ✅ Ollama detecte
)

echo [2/4] Activation de l'environnement virtuel...
call "../env/Scripts/activate.bat"
if errorlevel 1 (
    echo ❌ ERREUR: Impossible d'activer l'environnement virtuel
    pause
    exit /b 1
)

echo [3/4] Installation du service en mode developpement...
pip install -e . >nul 2>&1
if errorlevel 1 (
    echo ❌ ERREUR: Installation echouee
    pause
    exit /b 1
) else (
    echo ✅ Service installe
)

echo [4/4] Verification des modeles Ollama...
echo Modeles disponibles:
ollama list

echo.
echo ============================================
echo   🤖 Service Chatbot pret!
echo   📍 URL: http://127.0.0.1:8007
echo   📚 API: http://127.0.0.1:8007/docs
echo ============================================
echo.

echo Demarrage du serveur...
python main.py

pause