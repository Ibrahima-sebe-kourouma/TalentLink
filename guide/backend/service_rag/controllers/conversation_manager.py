"""
Gestionnaire de conversations avec historique et contexte
"""
import json
import os
import uuid
from datetime import datetime
from typing import List, Dict, Optional
from pathlib import Path


class ConversationManager:
    """Gère les conversations avec persistance en JSON."""
    
    def __init__(self, storage_path: str = "./conversations"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(exist_ok=True)
        self.active_conversations = {}  # Cache en mémoire
    
    def _get_conversation_file(self, conversation_id: str) -> Path:
        """Retourne le chemin du fichier de conversation."""
        return self.storage_path / f"{conversation_id}.json"
    
    def _get_user_index_file(self, user_id: str) -> Path:
        """Retourne le chemin du fichier d'index utilisateur."""
        return self.storage_path / f"user_{user_id}_index.json"
    
    def create_conversation(self, user_id: Optional[str] = None, title: str = "Nouvelle conversation") -> str:
        """Crée une nouvelle conversation."""
        conversation_id = str(uuid.uuid4())
        
        conversation = {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "title": title,
            "messages": [],
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "is_active": True
        }
        
        # Sauvegarder la conversation
        self._save_conversation(conversation)
        
        # Mettre en cache
        self.active_conversations[conversation_id] = conversation
        
        # Mettre à jour l'index utilisateur
        if user_id:
            self._update_user_index(user_id, conversation_id)
        
        print(f"✅ Conversation créée: {conversation_id}")
        return conversation_id
    
    def add_message(self, conversation_id: str, role: str, content: str, sources: List[dict] = None):
        """Ajoute un message à une conversation."""
        conversation = self.get_conversation(conversation_id)
        
        if not conversation:
            raise ValueError(f"Conversation {conversation_id} introuvable")
        
        message = {
            "role": role,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "sources": sources or []
        }
        
        conversation["messages"].append(message)
        conversation["updated_at"] = datetime.now().isoformat()
        
        # Générer un titre automatique pour la première question
        if len(conversation["messages"]) == 1 and role == "user":
            conversation["title"] = content[:50] + ("..." if len(content) > 50 else "")
        
        self._save_conversation(conversation)
        self.active_conversations[conversation_id] = conversation
        
        return message
    
    def get_conversation(self, conversation_id: str) -> Optional[Dict]:
        """Récupère une conversation."""
        # Vérifier le cache
        if conversation_id in self.active_conversations:
            return self.active_conversations[conversation_id]
        
        # Charger depuis le fichier
        file_path = self._get_conversation_file(conversation_id)
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                conversation = json.load(f)
                self.active_conversations[conversation_id] = conversation
                return conversation
        
        return None
    
    def get_conversation_history(self, conversation_id: str, limit: int = None) -> List[Dict]:
        """Récupère l'historique d'une conversation."""
        conversation = self.get_conversation(conversation_id)
        if not conversation:
            return []
        
        messages = conversation.get("messages", [])
        if limit:
            return messages[-limit:]
        return messages
    
    def get_user_conversations(self, user_id: str, limit: int = None) -> List[Dict]:
        """Récupère toutes les conversations d'un utilisateur."""
        index_file = self._get_user_index_file(user_id)
        
        if not index_file.exists():
            return []
        
        with open(index_file, 'r', encoding='utf-8') as f:
            index = json.load(f)
        
        conversations = []
        for conv_id in index.get("conversation_ids", []):
            conv = self.get_conversation(conv_id)
            if conv:
                # Retourner seulement les métadonnées
                conversations.append({
                    "conversation_id": conv["conversation_id"],
                    "title": conv["title"],
                    "created_at": conv["created_at"],
                    "updated_at": conv["updated_at"],
                    "message_count": len(conv.get("messages", [])),
                    "is_active": conv.get("is_active", True)
                })
        
        # Trier par date de mise à jour (plus récent en premier)
        conversations.sort(key=lambda x: x["updated_at"], reverse=True)
        
        if limit:
            return conversations[:limit]
        return conversations
    
    def delete_conversation(self, conversation_id: str) -> bool:
        """Supprime une conversation."""
        file_path = self._get_conversation_file(conversation_id)
        
        if file_path.exists():
            # Marquer comme inactive au lieu de supprimer
            conversation = self.get_conversation(conversation_id)
            if conversation:
                conversation["is_active"] = False
                self._save_conversation(conversation)
            
            # Retirer du cache
            if conversation_id in self.active_conversations:
                del self.active_conversations[conversation_id]
            
            print(f"✅ Conversation {conversation_id} marquée comme inactive")
            return True
        
        return False
    
    def build_context_from_history(self, conversation_id: str, max_messages: int = 10) -> str:
        """Construit un contexte à partir de l'historique de conversation."""
        messages = self.get_conversation_history(conversation_id, limit=max_messages)
        
        if not messages:
            return ""
        
        context_parts = ["Historique de la conversation précédente :\n"]
        
        for msg in messages:
            role = "Utilisateur" if msg["role"] == "user" else "Assistant"
            content = msg["content"]
            context_parts.append(f"{role}: {content}\n")
        
        return "\n".join(context_parts)
    
    def _save_conversation(self, conversation: Dict):
        """Sauvegarde une conversation sur disque."""
        file_path = self._get_conversation_file(conversation["conversation_id"])
        
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(conversation, f, ensure_ascii=False, indent=2)
    
    def _update_user_index(self, user_id: str, conversation_id: str):
        """Met à jour l'index des conversations d'un utilisateur."""
        index_file = self._get_user_index_file(user_id)
        
        if index_file.exists():
            with open(index_file, 'r', encoding='utf-8') as f:
                index = json.load(f)
        else:
            index = {
                "user_id": user_id,
                "conversation_ids": []
            }
        
        if conversation_id not in index["conversation_ids"]:
            index["conversation_ids"].append(conversation_id)
        
        with open(index_file, 'w', encoding='utf-8') as f:
            json.dump(index, f, ensure_ascii=False, indent=2)
    
    def get_statistics(self) -> Dict:
        """Retourne les statistiques des conversations."""
        total_conversations = len(list(self.storage_path.glob("*.json"))) - len(list(self.storage_path.glob("user_*_index.json")))
        active_conversations = len(self.active_conversations)
        
        return {
            "total_conversations": total_conversations,
            "active_in_memory": active_conversations,
            "storage_path": str(self.storage_path)
        }


# Instance globale
conversation_manager = ConversationManager()
