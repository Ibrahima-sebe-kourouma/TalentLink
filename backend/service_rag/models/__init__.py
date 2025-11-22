"""
Modèles pour le service RAG
"""
from .rag_models import QueryRequest, SourceInfo, QueryResponse
from .conversation_models import (
    Message, 
    Conversation, 
    QueryWithContext, 
    ConversationListResponse,
    ConversationResponse
)

__all__ = [
    "QueryRequest", 
    "SourceInfo", 
    "QueryResponse",
    "Message",
    "Conversation",
    "QueryWithContext",
    "ConversationListResponse",
    "ConversationResponse"
]
