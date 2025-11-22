#!/usr/bin/env python3
"""
Tests unitaires pour valider la migration SQLite vers MongoDB
Service Messaging TalentLink
"""

import os
import sys
import json
import unittest
from datetime import datetime

# Ajouter le répertoire parent au chemin pour importer les modèles
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from service_messaging.database.database import connect_to_mongo
from service_messaging.models.conversation import Conversation
from service_messaging.models.message import Message

class TestMigrationValidation(unittest.TestCase):
    """Tests de validation de la migration MongoDB"""
    
    @classmethod
    def setUpClass(cls):
        """Configuration initiale des tests"""
        # Connexion à MongoDB
        connect_to_mongo()
        
        # Charger les données de migration pour comparaison
        cls.load_migration_data()
    
    @classmethod
    def load_migration_data(cls):
        """Charge les données de migration depuis les fichiers JSON"""
        migration_dir = os.path.join(os.path.dirname(__file__), 'migration_data')
        
        # Charger les conversations originales
        with open(os.path.join(migration_dir, 'conversations.json'), 'r', encoding='utf-8') as f:
            cls.original_conversations = json.load(f)
        
        # Charger les messages originaux
        with open(os.path.join(migration_dir, 'messages.json'), 'r', encoding='utf-8') as f:
            cls.original_messages = json.load(f)
        
        # Charger le mapping si disponible
        mapping_file = os.path.join(migration_dir, 'sqlite_to_mongodb_mapping.json')
        cls.mapping = {}
        if os.path.exists(mapping_file):
            with open(mapping_file, 'r', encoding='utf-8') as f:
                cls.mapping = json.load(f)
    
    def test_conversation_count(self):
        """Test du nombre de conversations migrées"""
        mongo_count = Conversation.objects.count()
        original_count = len(self.original_conversations)
        
        self.assertEqual(
            mongo_count, 
            original_count,
            f"Nombre de conversations incorrect: {mongo_count} vs {original_count} attendues"
        )
        print(f"✅ Conversations: {mongo_count}/{original_count}")
    
    def test_message_count(self):
        """Test du nombre de messages migrés"""
        mongo_count = Message.objects.count()
        original_count = len(self.original_messages)
        
        self.assertEqual(
            mongo_count, 
            original_count,
            f"Nombre de messages incorrect: {mongo_count} vs {original_count} attendus"
        )
        print(f"✅ Messages: {mongo_count}/{original_count}")
    
    def test_conversation_data_integrity(self):
        """Test de l'intégrité des données des conversations"""
        all_conversations = list(Conversation.objects.all())
        
        for original in self.original_conversations:
            # Trouver la conversation correspondante
            found = False
            for mongo_conv in all_conversations:
                if (mongo_conv.user1_id == original['user1_id'] and 
                    mongo_conv.user2_id == original['user2_id']):
                    found = True
                    
                    # Vérifier la date de création (approximative)
                    original_date = datetime.fromisoformat(original['created_at'].replace('Z', '+00:00'))
                    time_diff = abs((mongo_conv.created_at - original_date).total_seconds())
                    self.assertLess(time_diff, 60, "Différence de timestamp trop importante")
                    
                    break
            
            self.assertTrue(found, f"Conversation non trouvée: {original['user1_id']} <-> {original['user2_id']}")
        
        print(f"✅ Intégrité des conversations validée")
    
    def test_message_data_integrity(self):
        """Test de l'intégrité des données des messages"""
        all_messages = list(Message.objects.all())
        all_conversations = list(Conversation.objects.all())
        
        # Créer un mapping user_pair -> conversation_id
        conv_mapping = {}
        for conv in all_conversations:
            key = tuple(sorted([conv.user1_id, conv.user2_id]))
            conv_mapping[key] = str(conv.id)
        
        for original in self.original_messages:
            # Trouver le message correspondant
            found = False
            for mongo_msg in all_messages:
                if (mongo_msg.sender_id == original['sender_id'] and 
                    mongo_msg.content == original['content']):
                    found = True
                    
                    # Vérifier le statut is_read
                    self.assertEqual(mongo_msg.is_read, original['is_read'])
                    
                    # Vérifier la date de création
                    original_date = datetime.fromisoformat(original['created_at'].replace('Z', '+00:00'))
                    time_diff = abs((mongo_msg.created_at - original_date).total_seconds())
                    self.assertLess(time_diff, 60, "Différence de timestamp trop importante")
                    
                    # Vérifier que la conversation existe
                    conv_exists = any(str(conv.id) == mongo_msg.conversation_id for conv in all_conversations)
                    self.assertTrue(conv_exists, f"Conversation {mongo_msg.conversation_id} introuvable")
                    
                    break
            
            self.assertTrue(found, f"Message non trouvé: {original['content'][:50]}...")
        
        print(f"✅ Intégrité des messages validée")
    
    def test_relationship_integrity(self):
        """Test de l'intégrité des relations conversations-messages"""
        all_conversations = list(Conversation.objects.all())
        all_messages = list(Message.objects.all())
        
        # Vérifier que tous les messages ont une conversation valide
        for message in all_messages:
            conv_exists = any(str(conv.id) == message.conversation_id for conv in all_conversations)
            self.assertTrue(conv_exists, f"Message {message.id} a une conversation invalide: {message.conversation_id}")
        
        # Vérifier qu'il n'y a pas de conversation sans messages
        for conv in all_conversations:
            messages_for_conv = [msg for msg in all_messages if msg.conversation_id == str(conv.id)]
            self.assertGreater(len(messages_for_conv), 0, f"Conversation {conv.id} sans messages")
        
        print(f"✅ Relations conversations-messages validées")
    
    def test_mapping_file_exists(self):
        """Test de l'existence du fichier de mapping"""
        mapping_file = os.path.join(os.path.dirname(__file__), 'migration_data', 'sqlite_to_mongodb_mapping.json')
        self.assertTrue(os.path.exists(mapping_file), "Fichier de mapping manquant")
        
        # Vérifier le contenu du mapping
        self.assertIn('migration_date', self.mapping, "Date de migration manquante")
        self.assertIn('conversation_mapping', self.mapping, "Mapping des conversations manquant")
        self.assertEqual(self.mapping.get('status'), 'completed', "Statut de migration incorrect")
        
        print(f"✅ Fichier de mapping validé")
    
    def test_mongodb_collections_exist(self):
        """Test de l'existence des collections MongoDB"""
        # Vérifier que les collections existent et ne sont pas vides
        conv_count = Conversation.objects.count()
        msg_count = Message.objects.count()
        
        self.assertGreater(conv_count, 0, "Collection conversations vide")
        self.assertGreater(msg_count, 0, "Collection messages vide")
        
        print(f"✅ Collections MongoDB: conversations({conv_count}), messages({msg_count})")

class TestServiceFunctionality(unittest.TestCase):
    """Tests de fonctionnalité du service après migration"""
    
    @classmethod
    def setUpClass(cls):
        """Configuration initiale des tests"""
        connect_to_mongo()
    
    def test_conversation_retrieval(self):
        """Test de récupération des conversations"""
        # Récupérer une conversation existante
        conversation = Conversation.objects.first()
        self.assertIsNotNone(conversation, "Aucune conversation trouvée")
        
        # Vérifier les propriétés
        self.assertIsNotNone(conversation.user1_id)
        self.assertIsNotNone(conversation.user2_id)
        self.assertIsNotNone(conversation.created_at)
        
        print(f"✅ Conversation récupérée: {conversation.id}")
    
    def test_message_retrieval(self):
        """Test de récupération des messages"""
        # Récupérer un message existant
        message = Message.objects.first()
        self.assertIsNotNone(message, "Aucun message trouvé")
        
        # Vérifier les propriétés
        self.assertIsNotNone(message.conversation_id)
        self.assertIsNotNone(message.sender_id)
        self.assertIsNotNone(message.content)
        self.assertIsNotNone(message.created_at)
        
        print(f"✅ Message récupéré: {message.id}")
    
    def test_conversation_messages_relationship(self):
        """Test de la relation conversation-messages"""
        conversation = Conversation.objects.first()
        if conversation:
            # Récupérer les messages de cette conversation
            messages = Message.objects.filter(conversation_id=str(conversation.id))
            
            # Vérifier qu'il y a des messages
            self.assertGreater(len(messages), 0, f"Aucun message pour la conversation {conversation.id}")
            
            # Vérifier que tous les messages appartiennent bien à cette conversation
            for message in messages:
                self.assertEqual(message.conversation_id, str(conversation.id))
            
            print(f"✅ Relation conversation-messages: {len(messages)} messages")

def run_migration_tests():
    """Lance tous les tests de validation de migration"""
    print("\n🧪 Tests de Validation de Migration MongoDB")
    print("=" * 50)
    
    # Créer la suite de tests
    suite = unittest.TestSuite()
    
    # Tests de validation de migration
    suite.addTest(unittest.makeSuite(TestMigrationValidation))
    
    # Tests de fonctionnalité
    suite.addTest(unittest.makeSuite(TestServiceFunctionality))
    
    # Lancer les tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    
    # Résumé
    print("\n📊 Résumé des Tests")
    print("=" * 30)
    print(f"Tests exécutés: {result.testsRun}")
    print(f"Erreurs: {len(result.errors)}")
    print(f"Échecs: {len(result.failures)}")
    
    if result.errors:
        print("\n❌ Erreurs:")
        for test, error in result.errors:
            print(f"  - {test}: {error}")
    
    if result.failures:
        print("\n❌ Échecs:")
        for test, failure in result.failures:
            print(f"  - {test}: {failure}")
    
    if result.wasSuccessful():
        print("\n✅ Tous les tests passent! Migration validée avec succès.")
    else:
        print("\n⚠️  Certains tests ont échoué. Vérifiez la migration.")
    
    return result.wasSuccessful()

if __name__ == '__main__':
    success = run_migration_tests()
    sys.exit(0 if success else 1)