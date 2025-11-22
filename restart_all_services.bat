@echo off
echo.
echo ==========================================
echo      REDEMARRAGE DE TOUS LES SERVICES
echo ==========================================
echo.

echo 🔄 Redémarrage complet de TalentLink...
echo.

echo 🛑 Phase 1: Arrêt de tous les services...
call "%~dp0stop_all_services.bat"

echo.
echo ⏳ Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo 🚀 Phase 2: Démarrage de tous les services...
call "%~dp0start_all_services.bat"

echo.
echo ✅ REDEMARRAGE TERMINÉ !
echo.
pause