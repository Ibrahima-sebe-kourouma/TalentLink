#!/bin/bash

# Activer l'environnement virtuel s'il existe
if [ -d "env" ]; then
    source env/bin/activate
fi

# Vérifier si les dépendances sont installées
if ! command -v uvicorn &> /dev/null; then
    echo "Installation des dépendances..."
    pip install fastapi uvicorn sqlalchemy
fi

# Lancer le service
echo "Démarrage du service..."
uvicorn main:app --reload --host 0.0.0.0 --port 8000