import requests
import json
import time
from typing import Dict, Any, List, Optional, Generator
from datetime import datetime

class OllamaClient:
    """Client pour communiquer avec Ollama"""
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def is_available(self) -> bool:
        """Vérifier si Ollama est disponible"""
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    def get_models(self) -> List[Dict[str, Any]]:
        """Récupérer la liste des modèles disponibles"""
        try:
            response = self.session.get(f"{self.base_url}/api/tags", timeout=10)
            if response.status_code == 200:
                data = response.json()
                return data.get("models", [])
            return []
        except Exception as e:
            print(f"Erreur récupération modèles: {e}")
            return []
    
    def check_model(self, model_name: str) -> bool:
        """Vérifier si un modèle est disponible"""
        models = self.get_models()
        return any(model.get("name", "").startswith(model_name) for model in models)
    
    def generate_response(
        self, 
        model: str, 
        messages: List[Dict[str, str]], 
        options: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Générer une réponse avec le modèle"""
        
        if not self.check_model(model):
            raise ValueError(f"Modèle '{model}' non trouvé")
        
        # Préparer la requête
        payload = {
            "model": model,
            "messages": messages,
            "stream": False
        }
        
        if options:
            payload["options"] = options
        
        start_time = time.time()
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=120  # 2 minutes max
            )
            
            end_time = time.time()
            response_time = int((end_time - start_time) * 1000)  # en ms
            
            if response.status_code == 200:
                data = response.json()
                
                return {
                    "success": True,
                    "response": data.get("message", {}).get("content", ""),
                    "model": data.get("model", model),
                    "tokens": {
                        "prompt": data.get("prompt_eval_count", 0),
                        "completion": data.get("eval_count", 0),
                        "total": data.get("prompt_eval_count", 0) + data.get("eval_count", 0)
                    },
                    "response_time": response_time,
                    "created_at": data.get("created_at", datetime.utcnow().isoformat())
                }
            else:
                return {
                    "success": False,
                    "error": f"Erreur HTTP {response.status_code}: {response.text}",
                    "response_time": response_time
                }
                
        except requests.exceptions.Timeout:
            return {
                "success": False,
                "error": "Timeout - Le modèle met trop de temps à répondre",
                "response_time": int((time.time() - start_time) * 1000)
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Erreur de communication: {str(e)}",
                "response_time": int((time.time() - start_time) * 1000)
            }
    
    def generate_stream_response(
        self, 
        model: str, 
        messages: List[Dict[str, str]], 
        options: Optional[Dict[str, Any]] = None
    ) -> Generator[Dict[str, Any], None, None]:
        """Générer une réponse en streaming"""
        
        if not self.check_model(model):
            raise ValueError(f"Modèle '{model}' non trouvé")
        
        payload = {
            "model": model,
            "messages": messages,
            "stream": True
        }
        
        if options:
            payload["options"] = options
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                stream=True,
                timeout=120
            )
            
            if response.status_code == 200:
                for line in response.iter_lines():
                    if line:
                        try:
                            data = json.loads(line)
                            yield {
                                "success": True,
                                "chunk": data.get("message", {}).get("content", ""),
                                "done": data.get("done", False),
                                "model": data.get("model", model)
                            }
                            
                            if data.get("done", False):
                                break
                                
                        except json.JSONDecodeError:
                            continue
            else:
                yield {
                    "success": False,
                    "error": f"Erreur HTTP {response.status_code}: {response.text}"
                }
                
        except Exception as e:
            yield {
                "success": False,
                "error": f"Erreur de streaming: {str(e)}"
            }
    
    def pull_model(self, model_name: str) -> Dict[str, Any]:
        """Télécharger un nouveau modèle"""
        payload = {
            "name": model_name,
            "stream": False
        }
        
        try:
            response = self.session.post(
                f"{self.base_url}/api/pull",
                json=payload,
                timeout=600  # 10 minutes pour téléchargement
            )
            
            if response.status_code == 200:
                return {
                    "success": True,
                    "message": f"Modèle {model_name} téléchargé avec succès"
                }
            else:
                return {
                    "success": False,
                    "error": f"Erreur lors du téléchargement: {response.text}"
                }
        except Exception as e:
            return {
                "success": False,
                "error": f"Erreur: {str(e)}"
            }

class ChatbotService:
    """Service principal pour le chatbot TalentLink"""
    
    def __init__(self):
        self.ollama = OllamaClient()
        self.default_model = "gemma3:4b"
    
    def is_ready(self) -> bool:
        """Vérifier si le service est prêt"""
        return self.ollama.is_available() and self.ollama.check_model(self.default_model)
    
    def get_available_models(self) -> List[Dict[str, Any]]:
        """Récupérer les modèles disponibles formatés"""
        models = self.ollama.get_models()
        formatted_models = []
        
        for model in models:
            formatted_models.append({
                "name": model.get("name", ""),
                "size": model.get("size", "Unknown"),
                "modified": model.get("modified_at", ""),
                "digest": model.get("digest", ""),
                "details": model.get("details", {})
            })
        
        return formatted_models
    
    def prepare_messages(
        self, 
        user_message: str, 
        conversation_history: List[Dict[str, str]], 
        system_prompt: Optional[str] = None
    ) -> List[Dict[str, str]]:
        """Préparer les messages pour Ollama"""
        messages = []
        
        # Ajouter le prompt système si fourni
        if system_prompt:
            messages.append({
                "role": "system",
                "content": system_prompt
            })
        
        # Ajouter l'historique de conversation (limité aux 10 derniers échanges)
        for msg in conversation_history[-20:]:  # 20 messages max pour éviter le débordement
            if msg.get("role") in ["user", "assistant"]:
                messages.append({
                    "role": msg["role"],
                    "content": msg["content"]
                })
        
        # Ajouter le nouveau message utilisateur
        messages.append({
            "role": "user",
            "content": user_message
        })
        
        return messages
    
    def enhance_with_knowledge(self, user_message: str, knowledge_base: List[str]) -> str:
        """Enrichir le message utilisateur avec des connaissances pertinentes"""
        if not knowledge_base:
            return user_message
        
        # Recherche simple par mots-clés
        relevant_knowledge = []
        message_lower = user_message.lower()
        
        for knowledge in knowledge_base:
            knowledge_lower = knowledge.lower()
            # Score simple de pertinence
            score = sum(1 for word in message_lower.split() if word in knowledge_lower)
            if score > 0:
                relevant_knowledge.append((knowledge, score))
        
        # Trier par pertinence et prendre les 3 meilleurs
        relevant_knowledge.sort(key=lambda x: x[1], reverse=True)
        top_knowledge = [k[0] for k in relevant_knowledge[:3]]
        
        if top_knowledge:
            knowledge_context = "\n\nInformations contextuelles:\n" + "\n".join(f"- {k}" for k in top_knowledge)
            return user_message + knowledge_context
        
        return user_message
    
    def generate_chat_response(
        self,
        user_message: str,
        conversation_history: List[Dict[str, str]] = None,
        model: str = None,
        system_prompt: str = None,
        model_options: Dict[str, Any] = None,
        knowledge_base: List[str] = None
    ) -> Dict[str, Any]:
        """Générer une réponse de chat complète"""
        
        if conversation_history is None:
            conversation_history = []
        
        if model is None:
            model = self.default_model
        
        # Enrichir avec la base de connaissances
        enhanced_message = self.enhance_with_knowledge(user_message, knowledge_base or [])
        
        # Préparer les messages
        messages = self.prepare_messages(enhanced_message, conversation_history, system_prompt)
        
        # Générer la réponse
        result = self.ollama.generate_response(model, messages, model_options)
        
        if result["success"]:
            return {
                "success": True,
                "message": result["response"],
                "model_used": result["model"],
                "tokens_used": result["tokens"]["total"],
                "response_time": result["response_time"],
                "created_at": datetime.utcnow()
            }
        else:
            return {
                "success": False,
                "error": result["error"],
                "response_time": result.get("response_time", 0)
            }
    
    def get_model_suggestions(self) -> List[str]:
        """Suggérer des modèles populaires à télécharger"""
        suggestions = [
            "llama3.2:3b",
            "llama3.2:1b", 
            "qwen2.5:7b",
            "mistral:7b",
            "gemma2:9b",
            "phi3:3.8b"
        ]
        
        available_models = [m["name"] for m in self.get_available_models()]
        
        # Retourner seulement ceux qui ne sont pas déjà installés
        return [model for model in suggestions if not any(model in available for available in available_models)]

# Instance globale du service
chatbot_service = ChatbotService()

def get_chatbot_service() -> ChatbotService:
    """Récupérer l'instance du service chatbot"""
    return chatbot_service

# Fonctions utilitaires
def format_conversation_for_display(messages: List[Dict[str, Any]]) -> str:
    """Formater une conversation pour affichage"""
    formatted = []
    
    for msg in messages:
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        timestamp = msg.get("created_at", "")
        
        if role == "user":
            formatted.append(f"👤 Utilisateur ({timestamp}):\n{content}")
        elif role == "assistant":
            formatted.append(f"🤖 Assistant ({timestamp}):\n{content}")
        elif role == "system":
            formatted.append(f"⚙️ Système:\n{content}")
    
    return "\n\n" + "\n\n".join(formatted) + "\n"

def estimate_tokens(text: str) -> int:
    """Estimation approximative du nombre de tokens"""
    # Approximation: ~4 caractères par token en moyenne
    return max(1, len(text) // 4)

def truncate_conversation_history(
    messages: List[Dict[str, str]], 
    max_tokens: int = 2000
) -> List[Dict[str, str]]:
    """Tronquer l'historique pour respecter la limite de tokens"""
    total_tokens = 0
    truncated = []
    
    # Parcourir dans l'ordre inverse pour garder les messages les plus récents
    for message in reversed(messages):
        message_tokens = estimate_tokens(message.get("content", ""))
        
        if total_tokens + message_tokens > max_tokens:
            break
            
        truncated.insert(0, message)
        total_tokens += message_tokens
    
    return truncated