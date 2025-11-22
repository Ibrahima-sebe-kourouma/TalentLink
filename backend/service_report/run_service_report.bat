@echo off
echo 🚀 Démarrage du service Report TalentLink...

:: Vérifier la configuration
if exist ..\.env (
    echo 📎 Configuration trouvée dans .env
) else (
    echo ⚠️  Attention: fichier .env manquant!
)

:: Activer l'environnement virtuel
if exist ..\env\Scripts\activate.bat (
    call ..\env\Scripts\activate.bat
)

echo 🎆 Lancement du service Report...
python main.py