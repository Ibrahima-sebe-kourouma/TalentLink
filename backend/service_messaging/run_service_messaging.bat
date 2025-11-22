@echo off
REM Script de lancement du service de messagerie
echo Demarrage du service Messaging...
cd /d %~dp0
python -m uvicorn main:app --reload --port 8004
