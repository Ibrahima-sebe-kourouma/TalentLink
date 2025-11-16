from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime

from database.database import get_db
from models.chatbot import (
    ChatbotConversation, ChatbotConversationCreate, ChatbotConversationUpdate,
    ChatbotMessage, ChatbotQuery, ChatbotResponse, ChatbotStats,
    ChatbotPersonality, ChatbotPersonalityCreate, ChatbotPersonalityUpdate,
    ChatbotKnowledge, ChatbotKnowledgeCreate, OllamaModelInfo
)
from controllers.chatbot_controller import (
    create_conversation, get_user_conversations, get_conversation_with_messages,
    update_conversation, delete_conversation, process_chat_query, toggle_message_favorite,
    create_personality, get_personalities, get_personality_by_id, update_personality, delete_personality,
    create_knowledge, search_knowledge, get_chatbot_stats, cleanup_old_conversations
)
from utils.ollama_client import chatbot_service

router = APIRouter(prefix="/api/chatbot", tags=["chatbot"])

# ===== ROUTES PRINCIPALES DU CHAT =====

@router.post("/chat", response_model=Dict[str, Any], status_code=status.HTTP_200_OK)
async def chat_with_bot(query: ChatbotQuery, db: Session = Depends(get_db)):
    """Envoyer un message au chatbot et recevoir une réponse"""
    try:
        result = process_chat_query(db, query)
        return {
            "success": True,
            "data": result,
            "message": "Réponse générée avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du traitement: {str(e)}"
        )

@router.get("/chat/stream/{conversation_id}")
async def stream_chat_response():
    """Stream de réponse en temps réel (à implémenter avec WebSocket)"""
    return {"message": "Streaming à implémenter avec WebSocket"}

# ===== ROUTES DES CONVERSATIONS =====

@router.post("/conversations", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_chat_conversation(conversation_data: ChatbotConversationCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle conversation"""
    try:
        conversation = create_conversation(db, conversation_data)
        return {
            "success": True,
            "data": {
                "id": conversation.id,
                "title": conversation.title,
                "context": conversation.context,
                "llm_model": conversation.llm_model,
                "created_at": conversation.created_at
            },
            "message": "Conversation créée avec succès"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création: {str(e)}"
        )

@router.get("/conversations/user/{user_id}", response_model=Dict[str, Any])
async def get_user_chat_conversations(
    user_id: int,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    active_only: bool = Query(True),
    db: Session = Depends(get_db)
):
    """Récupérer les conversations d'un utilisateur"""
    try:
        conversations = get_user_conversations(db, user_id, limit, offset, active_only)
        return {
            "success": True,
            "data": conversations,
            "total": len(conversations),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@router.get("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def get_conversation_details(
    conversation_id: int,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Récupérer une conversation avec ses messages"""
    try:
        result = get_conversation_with_messages(db, conversation_id, user_id, limit, offset)
        return {
            "success": True,
            "data": result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@router.patch("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def update_chat_conversation(
    conversation_id: int,
    update_data: ChatbotConversationUpdate,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    db: Session = Depends(get_db)
):
    """Mettre à jour une conversation"""
    try:
        conversation = update_conversation(db, conversation_id, user_id, update_data)
        return {
            "success": True,
            "data": {
                "id": conversation.id,
                "title": conversation.title,
                "context": conversation.context,
                "is_active": conversation.is_active,
                "updated_at": conversation.updated_at
            },
            "message": "Conversation mise à jour avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

@router.delete("/conversations/{conversation_id}", response_model=Dict[str, Any])
async def delete_chat_conversation(
    conversation_id: int,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    db: Session = Depends(get_db)
):
    """Supprimer une conversation"""
    try:
        success = delete_conversation(db, conversation_id, user_id)
        return {
            "success": success,
            "message": "Conversation supprimée avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )

# ===== ROUTES DES MESSAGES =====

@router.patch("/messages/{message_id}/favorite", response_model=Dict[str, Any])
async def toggle_message_favorite_status(
    message_id: int,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    db: Session = Depends(get_db)
):
    """Basculer le statut favori d'un message"""
    try:
        is_favorite = toggle_message_favorite(db, message_id, user_id)
        return {
            "success": True,
            "is_favorite": is_favorite,
            "message": f"Message {'ajouté aux' if is_favorite else 'retiré des'} favoris"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

# ===== ROUTES DES PERSONNALITÉS =====

@router.get("/personalities", response_model=Dict[str, Any])
async def get_chatbot_personalities(
    user_id: Optional[int] = Query(None, description="ID utilisateur pour filtrer"),
    public_only: bool = Query(False, description="Seulement les personnalités publiques"),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Récupérer les personnalités disponibles"""
    try:
        personalities = get_personalities(db, user_id, public_only, limit)
        return {
            "success": True,
            "data": [
                {
                    "id": p.id,
                    "name": p.name,
                    "description": p.description,
                    "is_public": p.is_public,
                    "usage_count": p.usage_count,
                    "created_by": p.created_by,
                    "created_at": p.created_at
                }
                for p in personalities
            ],
            "total": len(personalities)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@router.get("/personalities/{personality_id}", response_model=Dict[str, Any])
async def get_personality_details(personality_id: int, db: Session = Depends(get_db)):
    """Récupérer les détails d'une personnalité"""
    try:
        personality = get_personality_by_id(db, personality_id)
        if not personality:
            raise HTTPException(status_code=404, detail="Personnalité non trouvée")
        
        return {
            "success": True,
            "data": {
                "id": personality.id,
                "name": personality.name,
                "description": personality.description,
                "system_prompt": personality.system_prompt,
                "llm_config": personality.llm_config,
                "is_public": personality.is_public,
                "usage_count": personality.usage_count,
                "created_by": personality.created_by,
                "created_at": personality.created_at,
                "updated_at": personality.updated_at
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération: {str(e)}"
        )

@router.post("/personalities", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_chatbot_personality(personality_data: ChatbotPersonalityCreate, db: Session = Depends(get_db)):
    """Créer une nouvelle personnalité de chatbot"""
    try:
        personality = create_personality(db, personality_data)
        return {
            "success": True,
            "data": {
                "id": personality.id,
                "name": personality.name,
                "description": personality.description,
                "is_public": personality.is_public,
                "created_at": personality.created_at
            },
            "message": "Personnalité créée avec succès"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création: {str(e)}"
        )

@router.patch("/personalities/{personality_id}", response_model=Dict[str, Any])
async def update_chatbot_personality(
    personality_id: int,
    update_data: ChatbotPersonalityUpdate,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    db: Session = Depends(get_db)
):
    """Mettre à jour une personnalité"""
    try:
        personality = update_personality(db, personality_id, user_id, update_data)
        return {
            "success": True,
            "data": {
                "id": personality.id,
                "name": personality.name,
                "description": personality.description,
                "updated_at": personality.updated_at
            },
            "message": "Personnalité mise à jour avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la mise à jour: {str(e)}"
        )

@router.delete("/personalities/{personality_id}", response_model=Dict[str, Any])
async def delete_chatbot_personality(
    personality_id: int,
    user_id: int = Query(..., description="ID de l'utilisateur"),
    db: Session = Depends(get_db)
):
    """Supprimer une personnalité"""
    try:
        success = delete_personality(db, personality_id, user_id)
        return {
            "success": success,
            "message": "Personnalité supprimée avec succès"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la suppression: {str(e)}"
        )

# ===== ROUTES DES CONNAISSANCES =====

@router.get("/knowledge/search", response_model=Dict[str, Any])
async def search_chatbot_knowledge(
    q: str = Query(..., description="Terme de recherche"),
    category: Optional[str] = Query(None, description="Catégorie à filtrer"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Rechercher dans la base de connaissances"""
    try:
        results = search_knowledge(db, q, category, limit)
        return {
            "success": True,
            "data": results,
            "total": len(results),
            "query": q
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la recherche: {str(e)}"
        )

@router.post("/knowledge", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_chatbot_knowledge(knowledge_data: ChatbotKnowledgeCreate, db: Session = Depends(get_db)):
    """Créer un élément de connaissance"""
    try:
        knowledge = create_knowledge(db, knowledge_data)
        return {
            "success": True,
            "data": {
                "id": knowledge.id,
                "title": knowledge.title,
                "category": knowledge.category,
                "created_at": knowledge.created_at
            },
            "message": "Connaissance créée avec succès"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la création: {str(e)}"
        )

# ===== ROUTES DES MODÈLES OLLAMA =====

@router.get("/models", response_model=Dict[str, Any])
async def get_available_models():
    """Récupérer les modèles Ollama disponibles"""
    try:
        models = chatbot_service.get_available_models()
        return {
            "success": True,
            "data": models,
            "total": len(models),
            "ollama_status": chatbot_service.is_ready()
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des modèles: {str(e)}"
        )

@router.get("/models/suggestions", response_model=Dict[str, Any])
async def get_model_suggestions():
    """Récupérer des suggestions de modèles à télécharger"""
    try:
        suggestions = chatbot_service.get_model_suggestions()
        return {
            "success": True,
            "data": suggestions,
            "message": "Modèles suggérés pour améliorer les capacités du chatbot"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des suggestions: {str(e)}"
        )

@router.post("/models/pull", response_model=Dict[str, Any])
async def pull_ollama_model(
    model_name: str = Query(..., description="Nom du modèle à télécharger"),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    """Télécharger un nouveau modèle Ollama"""
    try:
        # Lancer le téléchargement en arrière-plan
        def download_model():
            result = chatbot_service.ollama.pull_model(model_name)
            print(f"Téléchargement {model_name}: {'Réussi' if result['success'] else 'Échoué'}")
        
        background_tasks.add_task(download_model)
        
        return {
            "success": True,
            "message": f"Téléchargement de {model_name} démarré en arrière-plan",
            "model_name": model_name
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du téléchargement: {str(e)}"
        )

# ===== ROUTES DE STATISTIQUES =====

@router.get("/stats", response_model=Dict[str, Any])
async def get_chatbot_statistics(
    user_id: Optional[int] = Query(None, description="Filtrer par utilisateur"),
    db: Session = Depends(get_db)
):
    """Récupérer les statistiques du chatbot"""
    try:
        stats = get_chatbot_stats(db, user_id)
        return {
            "success": True,
            "data": {
                "total_conversations": stats.total_conversations,
                "total_messages": stats.total_messages,
                "active_users": stats.active_users,
                "popular_personalities": stats.popular_personalities,
                "average_response_time": stats.average_response_time,
                "total_tokens_used": stats.total_tokens_used,
                "ollama_status": chatbot_service.is_ready(),
                "available_models": len(chatbot_service.get_available_models())
            }
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la récupération des statistiques: {str(e)}"
        )

# ===== ROUTES DE MAINTENANCE =====

@router.post("/maintenance/cleanup", response_model=Dict[str, Any])
async def cleanup_old_data(
    days: int = Query(90, description="Supprimer les conversations inactives de plus de X jours"),
    confirm: bool = Query(False, description="Confirmer la suppression"),
    db: Session = Depends(get_db)
):
    """Nettoyer les anciennes données"""
    if not confirm:
        return {
            "success": False,
            "message": "Ajoutez ?confirm=true pour confirmer la suppression"
        }
    
    try:
        count = cleanup_old_conversations(db, days)
        return {
            "success": True,
            "message": f"{count} conversations supprimées",
            "deleted_count": count
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors du nettoyage: {str(e)}"
        )

@router.post("/maintenance/sync-data", response_model=Dict[str, Any])
async def sync_talentlink_data(
    background_tasks: BackgroundTasks = BackgroundTasks(),
    immediate: bool = Query(False, description="Synchronisation immédiate ou en arrière-plan"),
    db: Session = Depends(get_db)
):
    """Synchroniser les données TalentLink dans la base de connaissances"""
    try:
        if immediate:
            # Synchronisation immédiate
            from utils.data_integrator import TalentLinkDataIntegrator
            integrator = TalentLinkDataIntegrator()
            count = integrator.create_knowledge_entries(db)
            return {
                "success": True,
                "message": f"Synchronisation terminée: {count} entrées créées",
                "entries_created": count,
                "sync_type": "immediate"
            }
        else:
            # Synchronisation en arrière-plan
            def sync_data():
                from utils.data_integrator import sync_all_data
                count = sync_all_data()
                print(f"✅ Synchronisation arrière-plan terminée: {count} entrées")
            
            background_tasks.add_task(sync_data)
            return {
                "success": True,
                "message": "Synchronisation démarrée en arrière-plan",
                "sync_type": "background"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la synchronisation: {str(e)}"
        )

# ===== ROUTES DE SANTÉ =====

@router.get("/health", response_model=Dict[str, Any])
async def health_check():
    """Vérifier le statut du service chatbot"""
    ollama_ready = chatbot_service.is_ready()
    models = chatbot_service.get_available_models()
    
    return {
        "status": "healthy" if ollama_ready else "degraded",
        "service": "chatbot",
        "version": "1.0.0",
        "ollama_status": "connected" if ollama_ready else "disconnected",
        "models_available": len(models),
        "default_model": chatbot_service.default_model,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/", response_model=Dict[str, Any])
async def service_info():
    """Informations générales sur le service"""
    return {
        "service": "TalentLink Chatbot Service",
        "description": "Service de chatbot personnalisé avec intégration Ollama",
        "version": "1.0.0",
        "features": [
            "Chat avec modèles Ollama locaux",
            "Personnalités personnalisées",
            "Base de connaissances",
            "Historique des conversations",
            "Statistiques d'usage"
        ],
        "endpoints": {
            "chat": "/api/chatbot/chat",
            "conversations": "/api/chatbot/conversations",
            "personalities": "/api/chatbot/personalities",
            "models": "/api/chatbot/models",
            "stats": "/api/chatbot/stats",
            "health": "/api/chatbot/health",
            "docs": "/docs"
        }
    }