@echo off
REM Script de backup pour Windows (développement local)

set BACKUP_DIR=C:\backups\talenlink
set DATE=%date:~-4%%date:~3,2%%date:~0,2%_%time:~0,2%%time:~3,2%%time:~6,2%
set DATE=%DATE: =0%
set PROJECT_DIR=C:\Users\kibse\OneDrive\Documents\Cours_documentation_technique\Talenlink\backend

echo 🚀 Démarrage du backup TalentLink - %DATE%

REM Créer le dossier de backup
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

REM ===== BACKUP SQLITE =====
echo 📦 Backup des bases SQLite...

copy "%PROJECT_DIR%\service_auth\auth.db" "%BACKUP_DIR%\auth_%DATE%.db" >nul 2>&1
copy "%PROJECT_DIR%\service_profile\profile.db" "%BACKUP_DIR%\profile_%DATE%.db" >nul 2>&1
copy "%PROJECT_DIR%\service_offers\offers.db" "%BACKUP_DIR%\offers_%DATE%.db" >nul 2>&1
copy "%PROJECT_DIR%\service_appointment\appointment.db" "%BACKUP_DIR%\appointment_%DATE%.db" >nul 2>&1
copy "%PROJECT_DIR%\service_report\report.db" "%BACKUP_DIR%\report_%DATE%.db" >nul 2>&1

REM ===== BACKUP UPLOADS =====
echo 📎 Backup des fichiers uploadés...
xcopy "%PROJECT_DIR%\uploads" "%BACKUP_DIR%\uploads_%DATE%\" /E /I /Q >nul 2>&1

echo ✅ Backup terminé : %BACKUP_DIR%
echo.
dir "%BACKUP_DIR%" /O-D

pause
