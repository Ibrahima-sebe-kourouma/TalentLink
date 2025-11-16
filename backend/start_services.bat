@echo off
echo ========================================
echo    TalentLink - Demarrage des Services
echo ========================================
echo.
echo 1. Service Auth (Port 8001)
echo 2. Service Profile (Port 8002) 
echo 3. Service Offers (Port 8003)
echo 4. Service Mail (Port 8004)
echo 5. Service Messaging (Port 8005)
echo 6. Tous les services
echo 7. Quitter
echo.
set /p choice="Votre choix (1-7): "

if %choice%==1 (
    echo Demarrage du Service Auth sur le port 8001...
    cd service_auth
    start "Service Auth" .\run_service_auth.bat
    cd ..
) else if %choice%==2 (
    echo Demarrage du Service Profile sur le port 8002...
    cd service_profile
    start "Service Profile" .\run_service_profile.bat
    cd ..
) else if %choice%==3 (
    echo Demarrage du Service Offers sur le port 8003...
    cd service_offers
    start "Service Offers" .\run_service_offers.bat
    cd ..
) else if %choice%==4 (
    echo Demarrage du Service Mail sur le port 8004...
    cd service_mail
    start "Service Mail" .\run_service_mail.bat
    cd ..
) else if %choice%==5 (
    echo Demarrage du Service Messaging sur le port 8005...
    cd service_messaging
    start "Service Messaging" .\run_service_messaging.bat
    cd ..
) else if %choice%==6 (
    echo Demarrage de tous les services...
    cd service_auth
    start "Service Auth (8001)" .\run_service_auth.bat
    cd ..\service_profile
    start "Service Profile (8002)" .\run_service_profile.bat
    cd ..\service_offers
    start "Service Offers (8003)" .\run_service_offers.bat
    cd ..\service_mail
    start "Service Mail (8004)" .\run_service_mail.bat
    cd ..\service_messaging
    start "Service Messaging (8005)" .\run_service_messaging.bat
    cd ..
    echo Tous les services ont ete demarre dans des fenetres separees.
) else if %choice%==7 (
    echo Au revoir !
    exit /b
) else (
    echo Choix invalide !
)

echo.
echo Services demarre(s). Verifiez les fenetres separees.
echo Appuyez sur une touche...
pause >nul