@echo off
echo 🚀 Démarrage du service Offers TalentLink...

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

echo 🎆 Lancement du service...
python main.py
