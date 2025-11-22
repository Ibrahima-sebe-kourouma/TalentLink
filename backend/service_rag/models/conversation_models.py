"""
Modèles pour les conversations avec historique
"""
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime


class Message(BaseModel):
    """Modèle pour un message dans une conversation."""
    role: str  # "user" ou "assistant"
    content: str
    timestamp: datetime = datetime.now()
    sources: List[dict] = []


class Conversation(BaseModel):
    """Modèle pour une conversation complète."""
    conversation_id: str
    user_id: Optional[str] = None
    title: str = "Nouvelle conversation"
    messages: List[Message] = []
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    is_active: bool = True


class QueryWithContext(BaseModel):
    """Modèle de requête avec contexte de conversation."""
    question: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    top_k: int = 5
    model_type: str = "openai"
    model_name: str = "gpt-4o-mini"


class ConversationListResponse(BaseModel):
    """Modèle pour la liste des conversations."""
    conversations: List[dict]
    total: int


class ConversationResponse(BaseModel):
    """Modèle de réponse avec conversation complète."""
    conversation_id: str
    question: str
    answer: str
    model_used: str
    sources: List[dict] = []
    conversation_history: List[dict] = []
