@echo off
echo 🚀 Démarrage du service Profile TalentLink...

if exist ..\.env (
    echo 📍 Configuration trouvée dans .env
) else (
    echo ⚠️  Attention: fichier .env manquant!
)

if exist ..\env\Scripts\activate.bat (
    call ..\env\Scripts\activate.bat
)

echo 🎆 Lancement du service...
python main.py