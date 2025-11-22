# Tests Service Messaging - Suite de Migration SQLite vers MongoDB

Ce dossier contient tous les outils et données relatifs à la migration du service messaging de SQLite vers MongoDB.

## 📁 Structure

```
service_messaging/
├── README.md                           # Ce fichier
├── analyze_messaging_data.py           # Script d'analyse des données SQLite
├── export_sqlite_data.py              # Script d'export SQLite vers JSON
├── import_to_mongodb.py               # Script d'import JSON vers MongoDB
└── migration_data/                    # Données de migration
    ├── conversations.json             # Export des conversations SQLite
    ├── messages.json                  # Export des messages SQLite
    └── sqlite_to_mongodb_mapping.json # Mapping des IDs après migration
```

## 🔧 Outils de Migration

### 1. `analyze_messaging_data.py`
Script d'analyse des données SQLite avant migration.

**Usage :**
```bash
cd backend/tests/service_messaging
python analyze_messaging_data.py
```

**Fonctionnalités :**
- Analyse la structure de la base SQLite
- Compte les enregistrements par table
- Affiche des exemples de données
- Génère un rapport de structure

### 2. `export_sqlite_data.py`
Script d'export des données SQLite vers des fichiers JSON.

**Usage :**
```bash
cd backend/tests/service_messaging
python export_sqlite_data.py
```

**Fonctionnalités :**
- Export des conversations vers `migration_data/conversations.json`
- Export des messages vers `migration_data/messages.json`
- Préservation des relations entre tables
- Validation des données exportées

### 3. `import_to_mongodb.py`
Script d'import des données JSON vers MongoDB.

**Usage :**
```bash
cd backend/tests/service_messaging
python import_to_mongodb.py
```

**Fonctionnalités :**
- Import des conversations vers MongoDB
- Import des messages vers MongoDB
- Mapping des anciens IDs vers les nouveaux ObjectIds
- Sauvegarde du mapping pour traçabilité

## 📊 Données de Migration

### `migration_data/conversations.json`
Contient l'export de toutes les conversations :
```json
[
  {
    "id": 1,
    "user1_id": 4,
    "user2_id": 14,
    "created_at": "2024-11-19T00:45:30.123456+00:00"
  }
]
```

### `migration_data/messages.json`
Contient l'export de tous les messages :
```json
[
  {
    "id": 1,
    "conversation_id": 1,
    "sender_id": 4,
    "content": "Bonjour, je suis intéressé par votre offre.",
    "created_at": "2024-11-19T00:45:30.123456+00:00",
    "is_read": false
  }
]
```

### `migration_data/sqlite_to_mongodb_mapping.json`
Mapping des IDs SQLite vers MongoDB après migration :
```json
{
  "migration_date": "2024-11-19T01:30:45.678901",
  "conversation_mapping": {
    "1": "674c8263d9aad5f4483a",
    "2": "674c8263d9aad5f4483b"
  },
  "status": "completed"
}
```

## 🚀 Processus de Migration Complet

1. **Analyse des données SQLite :**
   ```bash
   python analyze_messaging_data.py
   ```

2. **Export des données :**
   ```bash
   python export_sqlite_data.py
   ```

3. **Vérification des fichiers JSON générés :**
   - `migration_data/conversations.json`
   - `migration_data/messages.json`

4. **Import vers MongoDB :**
   ```bash
   python import_to_mongodb.py
   ```

5. **Vérification du mapping généré :**
   - `migration_data/sqlite_to_mongodb_mapping.json`

## ✅ Résultats de Migration

**Migration effectuée le :** 19 novembre 2024

**Données migrées :**
- ✅ 4 conversations
- ✅ 10 messages
- ✅ Relations préservées
- ✅ Timestamps convertis
- ✅ Statut de lecture préservé

**Base MongoDB :**
- Database: `talentlink_messaging`
- Collections: `conversation`, `message`
- Connexion: `mongodb://localhost:27017`

## 🧪 Tests et Validation

Pour valider la migration, vérifiez :

1. **Nombre d'enregistrements :**
   ```javascript
   // Dans MongoDB Compass ou mongo shell
   use talentlink_messaging
   db.conversation.countDocuments()  // Doit retourner 4
   db.message.countDocuments()       // Doit retourner 10
   ```

2. **Intégrité des relations :**
   ```javascript
   // Vérifier qu'tous les messages ont une conversation valide
   db.message.find({}).forEach(function(msg) {
     var conv = db.conversation.findOne({_id: ObjectId(msg.conversation_id)});
     if (!conv) print("Message orphelin: " + msg._id);
   })
   ```

3. **Service fonctionnel :**
   ```bash
   cd ../../service_messaging
   python main.py
   # Vérifier http://localhost:8004/conversations/?user_id=14
   ```

## 🔒 Sécurité et Sauvegarde

- ⚠️ Les anciens fichiers SQLite ont été supprimés après migration
- ✅ Les données sont sauvegardées dans `migration_data/`
- ✅ Le mapping est conservé pour traçabilité
- ✅ MongoDB utilise ObjectIds uniques pour éviter les conflits

## 📝 Notes

- Cette migration a été effectuée dans le cadre du projet TalentLink
- Architecture microservices avec FastAPI et MongoEngine
- Migration réussie sans perte de données
- Service messaging opérationnel sur le port 8004