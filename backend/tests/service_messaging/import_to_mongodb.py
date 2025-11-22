#!/usr/bin/env python3
"""
Script d'import des données SQLite vers MongoDB
Partie de la suite de migration pour le service messaging TalentLink
"""

import os
import json
import sys
from datetime import datetime

# Ajouter le répertoire parent au chemin pour importer les modèles
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from service_messaging.database.database import connect_to_mongo
from service_messaging.models.conversation import Conversation
from service_messaging.models.message import Message

def load_migration_data():
    """Charge les données de migration depuis les fichiers JSON"""
    migration_dir = os.path.join(os.path.dirname(__file__), 'migration_data')
    
    # Charger les conversations
    with open(os.path.join(migration_dir, 'conversations.json'), 'r', encoding='utf-8') as f:
        conversations_data = json.load(f)
    
    # Charger les messages
    with open(os.path.join(migration_dir, 'messages.json'), 'r', encoding='utf-8') as f:
        messages_data = json.load(f)
    
    # Charger le mapping si disponible
    mapping_file = os.path.join(migration_dir, 'sqlite_to_mongodb_mapping.json')
    mapping = {}
    if os.path.exists(mapping_file):
        with open(mapping_file, 'r', encoding='utf-8') as f:
            mapping = json.load(f)
    
    return conversations_data, messages_data, mapping

def import_conversations(conversations_data):
    """Importe les conversations dans MongoDB"""
    conversation_mapping = {}
    
    print(f"📥 Import de {len(conversations_data)} conversations...")
    
    for conv_data in conversations_data:
        # Créer la nouvelle conversation
        conversation = Conversation(
            user1_id=conv_data['user1_id'],
            user2_id=conv_data['user2_id'],
            created_at=datetime.fromisoformat(conv_data['created_at'].replace('Z', '+00:00'))
        )
        
        # Sauvegarder en base
        conversation.save()
        
        # Mapper l'ancien ID vers le nouveau
        conversation_mapping[conv_data['id']] = str(conversation.id)
        
        print(f"  ✅ Conversation {conv_data['id']} → {conversation.id}")
    
    return conversation_mapping

def import_messages(messages_data, conversation_mapping):
    """Importe les messages dans MongoDB"""
    print(f"📥 Import de {len(messages_data)} messages...")
    
    for msg_data in messages_data:
        # Trouver l'ID de conversation MongoDB correspondant
        old_conv_id = msg_data['conversation_id']
        new_conv_id = conversation_mapping.get(old_conv_id)
        
        if not new_conv_id:
            print(f"  ⚠️  Conversation {old_conv_id} introuvable pour le message {msg_data['id']}")
            continue
        
        # Créer le nouveau message
        message = Message(
            conversation_id=new_conv_id,
            sender_id=msg_data['sender_id'],
            content=msg_data['content'],
            created_at=datetime.fromisoformat(msg_data['created_at'].replace('Z', '+00:00')),
            is_read=msg_data['is_read']
        )
        
        # Sauvegarder en base
        message.save()
        
        print(f"  ✅ Message {msg_data['id']} → {message.id}")

def save_mapping(conversation_mapping):
    """Sauvegarde le mapping des IDs pour référence future"""
    mapping_data = {
        'migration_date': datetime.now().isoformat(),
        'conversation_mapping': conversation_mapping,
        'status': 'completed'
    }
    
    mapping_file = os.path.join(os.path.dirname(__file__), 'migration_data', 'sqlite_to_mongodb_mapping.json')
    with open(mapping_file, 'w', encoding='utf-8') as f:
        json.dump(mapping_data, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Mapping sauvegardé dans {mapping_file}")

def main():
    """Fonction principale d'import"""
    print("🚀 Début de l'import des données vers MongoDB...")
    
    try:
        # Connexion à MongoDB
        print("📡 Connexion à MongoDB...")
        connect_to_mongo()
        print("✅ Connecté à MongoDB")
        
        # Charger les données de migration
        print("📂 Chargement des données de migration...")
        conversations_data, messages_data, existing_mapping = load_migration_data()
        
        # Vérifier si la migration a déjà été effectuée
        if existing_mapping and existing_mapping.get('status') == 'completed':
            print("⚠️  Migration déjà effectuée. Utilisez --force pour forcer la re-migration.")
            return
        
        # Importer les conversations
        conversation_mapping = import_conversations(conversations_data)
        
        # Importer les messages
        import_messages(messages_data, conversation_mapping)
        
        # Sauvegarder le mapping
        save_mapping(conversation_mapping)
        
        print("✅ Migration terminée avec succès!")
        print(f"   📊 {len(conversations_data)} conversations importées")
        print(f"   📊 {len(messages_data)} messages importés")
        
    except Exception as e:
        print(f"❌ Erreur lors de la migration: {str(e)}")
        raise

if __name__ == '__main__':
    main()