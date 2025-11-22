@echo off
REM Script de lancement du service de rendez-vous
echo Demarrage du service Appointment...
cd /d %~dp0
python -m uvicorn main:app --reload --port 8006