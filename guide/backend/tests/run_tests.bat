@echo off
echo ========================================
echo    TalentLink - Tests et Utilitaires
echo ========================================
echo.
echo 1. Tests Service Auth
echo 2. Tests Service Offers  
echo 3. Tests Admin API
echo 4. Promouvoir Admin
echo 5. Migration Admin
echo 6. Recreer DB
echo 7. Quitter
echo.
set /p choice="Votre choix (1-7): "

if %choice%==1 (
    cd tests\service_auth
    echo Execution de tous les tests auth...
    python test_login.py
    python test_admin_api.py
    cd ..\..
) else if %choice%==2 (
    cd tests\service_offers
    echo Execution des tests offers...
    python test_offers_api.py
    cd ..\..
) else if %choice%==3 (
    cd tests\service_auth
    echo Test API Admin...
    python test_admin_api.py
    cd ..\..
) else if %choice%==4 (
    cd tests\service_auth
    echo Promotion d'utilisateur en admin...
    python promote_admin.py
    cd ..\..
) else if %choice%==5 (
    cd tests\service_auth
    echo Migration des tables admin...
    python migrate_create_admin.py
    cd ..\..
) else if %choice%==6 (
    cd tests\service_auth
    echo Recreation de la base de donnees...
    python recreate_db.py
    cd ..\..
) else if %choice%==7 (
    echo Au revoir !
    exit /b
) else (
    echo Choix invalide !
)

echo.
echo Operation terminee. Appuyez sur une touche...
pause >nul