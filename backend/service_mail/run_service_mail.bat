@echo off
echo Demarrage du service mail...

:: Activer l'environnement virtuel s'il existe
if exist env\Scripts\activate.bat (
    call env\Scripts\activate.bat
) else (
    if exist ..\env\Scripts\activate.bat (
        call ..\env\Scripts\activate.bat
    )
)

echo Demarrage du serveur...
uvicorn main:app --reload --host 127.0.0.1 --port 8004
