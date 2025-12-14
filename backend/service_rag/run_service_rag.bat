@echo off
echo 🚀 Démarrage du service RAG TalentLink...

:: Activer l'environnement virtuel
if exist ..\.env (
    echo 📎 Configuration trouvée dans .env
) else (
    echo ⚠️  Attention: fichier .env manquant!
)

if exist ..\env\Scripts\activate.bat (
    call ..\env\Scripts\activate.bat
) else (
    echo ⚠️  Environnement virtuel non trouvé
)

:: Démarrer le service
echo 🎆 Lancement du service RAG...
python main.py
