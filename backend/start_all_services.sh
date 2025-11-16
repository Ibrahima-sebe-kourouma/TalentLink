#!/bin/bash
# Script de démarrage de tous les services TalentLink
# Utilise les variables d'environnement définies dans .env

echo "🚀 Démarrage de tous les services TalentLink..."

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    echo "❌ Erreur: fichier .env non trouvé!"
    echo "📄 Copier .env.example en .env et configurer les variables"
    exit 1
fi

# Charger les variables d'environnement
source .env

echo "📦 Configuration chargée depuis .env"

# Démarrer les services en arrière-plan
echo "🔧 Démarrage service Auth (port $SERVICE_AUTH_PORT)..."
cd service_auth && python main.py &
AUTH_PID=$!

echo "👤 Démarrage service Profile (port $SERVICE_PROFILE_PORT)..."
cd ../service_profile && python main.py &
PROFILE_PID=$!

echo "💼 Démarrage service Offers (port $SERVICE_OFFERS_PORT)..."
cd ../service_offers && python main.py &
OFFERS_PID=$!

echo "💬 Démarrage service Messaging (port $SERVICE_MESSAGING_PORT)..."
cd ../service_messaging && python main.py &
MESSAGING_PID=$!

echo "📧 Démarrage service Mail (port $SERVICE_MAIL_PORT)..."
cd ../service_mail && python main.py &
MAIL_PID=$!

echo ""
echo "✅ Tous les services sont en cours de démarrage..."
echo "🌐 Services disponibles:"
echo "   - Auth: http://$SERVICE_AUTH_HOST:$SERVICE_AUTH_PORT"
echo "   - Profile: http://$SERVICE_PROFILE_HOST:$SERVICE_PROFILE_PORT" 
echo "   - Offers: http://$SERVICE_OFFERS_HOST:$SERVICE_OFFERS_PORT"
echo "   - Messaging: http://$SERVICE_MESSAGING_HOST:$SERVICE_MESSAGING_PORT"
echo "   - Mail: http://$SERVICE_MAIL_HOST:$SERVICE_MAIL_PORT"
echo ""
echo "⏹️  Pour arrêter tous les services: Ctrl+C"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt de tous les services..."
    kill $AUTH_PID $PROFILE_PID $OFFERS_PID $MESSAGING_PID $MAIL_PID 2>/dev/null
    echo "✅ Tous les services arrêtés"
    exit 0
}

# Capturer Ctrl+C
trap cleanup INT

# Attendre que tous les processus se terminent
wait