# =====================================
# INSTALLATION MONGODB POUR WINDOWS
# =====================================

# Étapes d'installation MongoDB Community Edition

## 1. TÉLÉCHARGEMENT
# Visitez: https://www.mongodb.com/try/download/community
# Sélectionnez: Windows x64, MSI
# Téléchargez la dernière version

## 2. INSTALLATION
# - Exécutez le fichier .msi téléchargé
# - Suivez l'assistant d'installation
# - Choisissez "Complete" installation
# - Installez MongoDB Compass (interface graphique)
# - MongoDB sera installé comme service Windows

## 3. VÉRIFICATION DE L'INSTALLATION
# Ouvrez PowerShell en tant qu'administrateur et exécutez:
mongod --version
mongo --version

## 4. DÉMARRAGE DU SERVICE
# MongoDB devrait démarrer automatiquement
# Pour vérifier:
net start MongoDB

## 5. TEST DE CONNEXION
# Dans PowerShell:
mongo

## 6. CONFIGURATION POUR TALENTLINK
# MongoDB sera accessible sur: mongodb://localhost:27017
# Base de données: talentlink_messaging
# Collections: conversations, messages

# =====================================
# SCRIPTS D'INSTALLATION AUTOMATIQUE
# =====================================