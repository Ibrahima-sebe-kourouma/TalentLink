"""
Modèles de données pour le service RAG
"""
from typing import List, Optional
from pydantic import BaseModel


class QueryRequest(BaseModel):
    """Modèle de requête pour poser une question."""
    question: str
    top_k: int = 5  # Nombre de passages similaires à récupérer
    model_type: str = "openai"  # Type de modèle: 'openai' ou 'ollama'
    model_name: str = "gpt-4o-mini"  # Nom du modèle


class SourceInfo(BaseModel):
    """Modèle pour les informations sur les sources."""
    index: int
    score: Optional[float] = None
    text: str
    document_name: str
    page_number: Optional[int] = None


class QueryResponse(BaseModel):
    """Modèle de réponse."""
    question: str
    answer: str
    model_used: str
    sources: List[SourceInfo] = []
