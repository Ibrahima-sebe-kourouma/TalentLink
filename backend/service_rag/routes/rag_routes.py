"""
Routes pour le service RAG avec support des conversations
"""
from fastapi import APIRouter, HTTPException
from models.rag_models import QueryRequest, QueryResponse
from models.conversation_models import (
    QueryWithContext,
    ConversationResponse,
    ConversationListResponse
)
from controllers.rag_controller import rag_controller
from controllers.conversation_manager import conversation_manager

router = APIRouter()


@router.get("/")
async def root():
    """Endpoint racine pour vérifier que l'API est en ligne."""
    return {
        "message": "API de requête de documents - TalentLink RAG",
        "status": "En ligne",
        "models_supportes": {
            "openai": ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-4o"],
            "ollama": ["llama2", "llama3.2"]
        }
    }


@router.get("/health")
async def health_check():
    """Endpoint pour vérifier la santé de l'API."""
    return rag_controller.get_health_status()


@router.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """Endpoint pour poser une question simple (sans conversation)."""
    return await rag_controller.query_documents(request)


@router.post("/chat", response_model=ConversationResponse)
async def chat_with_context(request: QueryWithContext):
    """
    Endpoint principal pour discuter avec le bot (avec historique).
    
    - **question**: La question à poser
    - **conversation_id** (optionnel): ID de la conversation à continuer
    - **user_id** (optionnel): ID de l'utilisateur
    - **model_type**: "openai" ou "ollama"
    - **model_name**: Nom du modèle à utiliser
    """
    return await rag_controller.query_with_conversation(request)


@router.get("/conversations/{user_id}", response_model=ConversationListResponse)
async def get_user_conversations(user_id: str, limit: int = 20):
    """Récupère la liste des conversations d'un utilisateur."""
    try:
        conversations = conversation_manager.get_user_conversations(user_id, limit=limit)
        return ConversationListResponse(
            conversations=conversations,
            total=len(conversations)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/{user_id}/{conversation_id}")
async def get_conversation(user_id: str, conversation_id: str):
    """Récupère une conversation complète."""
    try:
        conversation = conversation_manager.get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
        
        # Vérifier que la conversation appartient à l'utilisateur
        if conversation.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Accès refusé")
        
        return conversation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/conversations/{user_id}/{conversation_id}")
async def delete_conversation(user_id: str, conversation_id: str):
    """Supprime une conversation."""
    try:
        conversation = conversation_manager.get_conversation(conversation_id)
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation introuvable")
        
        if conversation.get("user_id") != user_id:
            raise HTTPException(status_code=403, detail="Accès refusé")
        
        success = conversation_manager.delete_conversation(conversation_id)
        
        if success:
            return {"message": "Conversation supprimée", "conversation_id": conversation_id}
        else:
            raise HTTPException(status_code=500, detail="Erreur lors de la suppression")
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/conversations/stats")
async def get_conversation_stats():
    """Récupère les statistiques des conversations."""
    return conversation_manager.get_statistics()


@router.post("/reindex")
async def reindex_documents():
    """Endpoint pour réindexer les documents dans le dossier ./data."""
    return await rag_controller.reindex_documents()


@router.get("/models")
async def list_models():
    """Endpoint pour lister les modèles supportés."""
    return rag_controller.get_supported_models()
