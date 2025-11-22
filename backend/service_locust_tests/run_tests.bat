@echo off
echo ========================================
echo   Tests de charge Locust - TalentLink
echo ========================================
echo.

REM Activer l'environnement virtuel si disponible
if exist ..\env\Scripts\activate.bat (
    call ..\env\Scripts\activate.bat
) else (
    echo Warning: Virtual environment not found
)

REM Vérifier si Locust est installé
python -c "import locust" 2>nul
if errorlevel 1 (
    echo Installing dependencies...
    pip install -r requirements.txt
)

echo.
echo Choisissez le type de test:
echo 1. Interface Web (recommande)
echo 2. Test rapide Auth (CLI)
echo 3. Test rapide RAG (CLI)
echo 4. Test rapide Offers (CLI)
echo 5. Scenario utilisateur complet (CLI)
echo 6. Test de tous les services (CLI)
echo.

set /p choice="Votre choix (1-6): "

if "%choice%"=="1" (
    echo.
    echo Lancement de l'interface web Locust...
    echo Ouvrez http://localhost:8089 dans votre navigateur
    echo.
    locust -f locustfile.py
) else if "%choice%"=="2" (
    echo.
    echo Test de charge du service Auth...
    locust -f tests/test_auth.py --headless -u 10 -r 2 -t 1m --html reports/auth_report.html --host http://localhost:8001
) else if "%choice%"=="3" (
    echo.
    echo Test de charge du service RAG...
    locust -f tests/test_rag.py --headless -u 5 -r 1 -t 2m --html reports/rag_report.html --host http://localhost:8008
) else if "%choice%"=="4" (
    echo.
    echo Test de charge du service Offers...
    locust -f tests/test_offers.py --headless -u 10 -r 2 -t 1m --html reports/offers_report.html --host http://localhost:8003
) else if "%choice%"=="5" (
    echo.
    echo Scenario utilisateur complet...
    locust -f scenarios/user_journey.py --headless -u 5 -r 1 -t 3m --html reports/journey_report.html --host http://localhost:8001
) else if "%choice%"=="6" (
    echo.
    echo Test de tous les services...
    locust -f locustfile.py --headless -u 20 -r 4 -t 2m --html reports/all_services_report.html --host http://localhost:8001
) else (
    echo Choix invalide
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Tests termines !
echo   Consultez les rapports dans /reports
echo ========================================
pause
