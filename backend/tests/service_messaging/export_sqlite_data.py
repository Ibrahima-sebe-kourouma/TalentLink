import sqlite3
import json
import os
from datetime import datetime
from typing import Dict, List, Any

def export_sqlite_to_json():
    """Exporter toutes les données SQLite vers des fichiers JSON pour MongoDB."""
    
    # Chemin vers la base SQLite
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, 'service_messaging', 'database', 'messaging.db')
    
    print(f"📤 Export des données SQLite vers JSON")
    print(f"📁 Base source: {db_path}")
    
    if not os.path.exists(db_path):
        print("❌ Base de données SQLite non trouvée!")
        return False
    
    # Dossier d'export
    export_dir = os.path.join(backend_dir, 'migration_data')
    os.makedirs(export_dir, exist_ok=True)
    
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row  # Pour avoir des dictionnaires
    cursor = conn.cursor()
    
    try:
        # Export des conversations
        print("\n📋 Export des conversations...")
        cursor.execute("SELECT * FROM conversations ORDER BY id")
        conversations = cursor.fetchall()
        
        conversations_data = []
        for row in conversations:
            conv_dict = dict(row)
            # Convertir les timestamps en format ISO
            if conv_dict['created_at']:
                conv_dict['created_at'] = datetime.fromisoformat(conv_dict['created_at']).isoformat()
            if conv_dict['last_message_at']:
                conv_dict['last_message_at'] = datetime.fromisoformat(conv_dict['last_message_at']).isoformat()
            
            conversations_data.append(conv_dict)
        
        # Sauvegarder conversations
        conv_file = os.path.join(export_dir, 'conversations.json')
        with open(conv_file, 'w', encoding='utf-8') as f:
            json.dump(conversations_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {len(conversations_data)} conversations exportées → {conv_file}")
        
        # Export des messages
        print("\n💬 Export des messages...")
        cursor.execute("SELECT * FROM messages ORDER BY conversation_id, created_at")
        messages = cursor.fetchall()
        
        messages_data = []
        for row in messages:
            msg_dict = dict(row)
            # Convertir les timestamps en format ISO
            if msg_dict['created_at']:
                msg_dict['created_at'] = datetime.fromisoformat(msg_dict['created_at']).isoformat()
            if msg_dict['read_at']:
                msg_dict['read_at'] = datetime.fromisoformat(msg_dict['read_at']).isoformat()
            
            messages_data.append(msg_dict)
        
        # Sauvegarder messages
        msg_file = os.path.join(export_dir, 'messages.json')
        with open(msg_file, 'w', encoding='utf-8') as f:
            json.dump(messages_data, f, indent=2, ensure_ascii=False)
        
        print(f"✅ {len(messages_data)} messages exportés → {msg_file}")
        
        # Créer un fichier de métadonnées
        metadata = {
            "export_date": datetime.now().isoformat(),
            "source_db": db_path,
            "collections": {
                "conversations": {
                    "file": "conversations.json",
                    "count": len(conversations_data)
                },
                "messages": {
                    "file": "messages.json", 
                    "count": len(messages_data)
                }
            },
            "migration_status": "exported_ready_for_mongodb"
        }
        
        metadata_file = os.path.join(export_dir, 'migration_metadata.json')
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        print(f"\n📊 Métadonnées sauvegardées → {metadata_file}")
        print(f"📁 Tous les fichiers d'export dans: {export_dir}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'export: {e}")
        return False
        
    finally:
        conn.close()

def preview_export_data():
    """Aperçu des données exportées."""
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    export_dir = os.path.join(backend_dir, 'migration_data')
    
    print("\n🔍 Aperçu des données exportées:")
    
    # Conversations
    conv_file = os.path.join(export_dir, 'conversations.json')
    if os.path.exists(conv_file):
        with open(conv_file, 'r', encoding='utf-8') as f:
            conversations = json.load(f)
        
        print(f"\n📋 CONVERSATIONS ({len(conversations)}):")
        for conv in conversations[:3]:  # 3 premiers
            print(f"   ID {conv['id']}: Candidat {conv['candidate_user_id']} ↔ Recruteur {conv['recruiter_user_id']}")
    
    # Messages
    msg_file = os.path.join(export_dir, 'messages.json')
    if os.path.exists(msg_file):
        with open(msg_file, 'r', encoding='utf-8') as f:
            messages = json.load(f)
        
        print(f"\n💬 MESSAGES ({len(messages)}):")
        for msg in messages[:3]:  # 3 premiers
            content = msg['content'][:50] + "..." if len(msg['content']) > 50 else msg['content']
            print(f"   Conv {msg['conversation_id']}: User {msg['sender_user_id']}: \"{content}\"")

if __name__ == "__main__":
    print("🚀 Démarrage de l'export SQLite → JSON")
    print("=" * 60)
    
    success = export_sqlite_to_json()
    
    if success:
        preview_export_data()
        print("\n" + "=" * 60)
        print("✅ EXPORT TERMINÉ - Prêt pour MongoDB !")
        print("🔄 Prochaine étape: Installer MongoDB et lancer la migration")
    else:
        print("\n❌ Export échoué - vérifiez la base SQLite")