FROM python:3.11-slim

WORKDIR /app

# Copier les requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code du service
COPY . .

# Créer le dossier pour la base de données
RUN mkdir -p /app/data && chmod 755 /app/data

# Créer un utilisateur non-root pour la sécurité
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Port par défaut
EXPOSE 8001

# Commande de démarrage
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--proxy-headers"]
