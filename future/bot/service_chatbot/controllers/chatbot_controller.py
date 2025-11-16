from sqlalchemy.orm import Session
from sqlalchemy import desc, func, and_, or_
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from models.chatbot import (
    ChatbotConversationDB, ChatbotMessageDB, ChatbotPersonalityDB, ChatbotKnowledgeDB,
    ChatbotConversationCreate, ChatbotConversationUpdate, ChatbotMessageCreate,
    ChatbotPersonalityCreate, ChatbotPersonalityUpdate, ChatbotKnowledgeCreate,
    ChatbotQuery, ChatbotStats, MODEL_CONFIGS
)
from utils.ollama_client import chatbot_service, truncate_conversation_history

# ===== GESTION DES CONVERSATIONS =====

def create_conversation(db: Session, conversation_data: ChatbotConversationCreate) -> ChatbotConversationDB:
    """Créer une nouvelle conversation"""
    conversation = ChatbotConversationDB(
        user_id=conversation_data.user_id,
        title=conversation_data.title,
        context=conversation_data.context,
        llm_model=conversation_data.llm_model
    )
    
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    
    # Si une personnalité est spécifiée, ajouter le prompt système
    if conversation_data.personality_id:
        personality = get_personality_by_id(db, conversation_data.personality_id)
        if personality:
            system_message = ChatbotMessageDB(
                conversation_id=conversation.id,
                role="system",
                content=personality.system_prompt
            )
            db.add(system_message)
            
            # Incrémenter l'usage de la personnalité
            personality.usage_count += 1
            
            db.commit()
    
    return conversation

def get_user_conversations(
    db: Session, 
    user_id: int, 
    limit: int = 20, 
    offset: int = 0,
    active_only: bool = True
) -> List[Dict[str, Any]]:
    """Récupérer les conversations d'un utilisateur"""
    query = db.query(ChatbotConversationDB).filter(
        ChatbotConversationDB.user_id == user_id
    )
    
    if active_only:
        query = query.filter(ChatbotConversationDB.is_active == True)
    
    conversations = query.order_by(desc(ChatbotConversationDB.updated_at)).offset(offset).limit(limit).all()
    
    result = []
    for conv in conversations:
        # Récupérer le dernier message
        last_message = db.query(ChatbotMessageDB).filter(
            ChatbotMessageDB.conversation_id == conv.id
        ).order_by(desc(ChatbotMessageDB.created_at)).first()
        
        result.append({
            "id": conv.id,
            "title": conv.title,
            "context": conv.context,
            "llm_model": conv.llm_model,
            "total_messages": conv.total_messages,
            "is_active": conv.is_active,
            "created_at": conv.created_at,
            "updated_at": conv.updated_at,
            "last_message": last_message.content[:100] + "..." if last_message and len(last_message.content) > 100 else last_message.content if last_message else None,
            "last_message_at": last_message.created_at if last_message else None
        })
    
    return result

def get_conversation_with_messages(
    db: Session, 
    conversation_id: int, 
    user_id: int,
    limit: int = 50,
    offset: int = 0
) -> Dict[str, Any]:
    """Récupérer une conversation avec ses messages"""
    # Vérifier que la conversation appartient à l'utilisateur
    conversation = db.query(ChatbotConversationDB).filter(
        ChatbotConversationDB.id == conversation_id,
        ChatbotConversationDB.user_id == user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Récupérer les messages
    messages = db.query(ChatbotMessageDB).filter(
        ChatbotMessageDB.conversation_id == conversation_id
    ).order_by(ChatbotMessageDB.created_at).offset(offset).limit(limit).all()
    
    return {
        "conversation": {
            "id": conversation.id,
            "title": conversation.title,
            "context": conversation.context,
            "llm_model": conversation.llm_model,
            "total_messages": conversation.total_messages,
            "is_active": conversation.is_active,
            "metadata": conversation.meta_data,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at
        },
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "tokens_used": msg.tokens_used,
                "response_time": msg.response_time,
                "is_favorite": msg.is_favorite,
                "created_at": msg.created_at
            }
            for msg in messages
        ]
    }

def update_conversation(
    db: Session, 
    conversation_id: int, 
    user_id: int, 
    update_data: ChatbotConversationUpdate
) -> ChatbotConversationDB:
    """Mettre à jour une conversation"""
    conversation = db.query(ChatbotConversationDB).filter(
        ChatbotConversationDB.id == conversation_id,
        ChatbotConversationDB.user_id == user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Appliquer les mises à jour
    if update_data.title is not None:
        conversation.title = update_data.title
    if update_data.context is not None:
        conversation.context = update_data.context
    if update_data.is_active is not None:
        conversation.is_active = update_data.is_active
    if update_data.meta_data is not None:
        conversation.meta_data = {**conversation.meta_data, **update_data.meta_data}
    
    conversation.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(conversation)
    
    return conversation

def delete_conversation(db: Session, conversation_id: int, user_id: int) -> bool:
    """Supprimer une conversation"""
    conversation = db.query(ChatbotConversationDB).filter(
        ChatbotConversationDB.id == conversation_id,
        ChatbotConversationDB.user_id == user_id
    ).first()
    
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Supprimer les messages associés
    db.query(ChatbotMessageDB).filter(
        ChatbotMessageDB.conversation_id == conversation_id
    ).delete()
    
    # Supprimer la conversation
    db.delete(conversation)
    db.commit()
    
    return True

# ===== GESTION DES MESSAGES ET CHAT =====

def process_chat_query(db: Session, query: ChatbotQuery) -> Dict[str, Any]:
    """Traiter une requête de chat et générer la réponse"""
    
    # Vérifier si Ollama est disponible
    if not chatbot_service.is_ready():
        raise HTTPException(
            status_code=503, 
            detail="Service Ollama non disponible. Vérifiez qu'Ollama est démarré."
        )
    
    conversation = None
    conversation_id = query.conversation_id
    
    # Créer une nouvelle conversation si nécessaire
    if not conversation_id:
        conversation = create_conversation(db, ChatbotConversationCreate(
            user_id=query.user_id,
            title=query.message[:50] + "..." if len(query.message) > 50 else query.message,
            personality_id=query.personality_id
        ))
        conversation_id = conversation.id
    else:
        # Vérifier que la conversation existe et appartient à l'utilisateur
        conversation = db.query(ChatbotConversationDB).filter(
            ChatbotConversationDB.id == conversation_id,
            ChatbotConversationDB.user_id == query.user_id
        ).first()
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation non trouvée")
    
    # Récupérer l'historique de conversation
    history_messages = db.query(ChatbotMessageDB).filter(
        ChatbotMessageDB.conversation_id == conversation_id
    ).order_by(ChatbotMessageDB.created_at).all()
    
    # Convertir pour Ollama
    conversation_history = [
        {"role": msg.role, "content": msg.content}
        for msg in history_messages
        if msg.role in ["user", "assistant", "system"]
    ]
    
    # Tronquer si nécessaire
    conversation_history = truncate_conversation_history(conversation_history, max_tokens=3000)
    
    # Récupérer la personnalité si spécifiée
    system_prompt = None
    model_options = query.llm_params or {}
    
    if query.personality_id:
        personality = get_personality_by_id(db, query.personality_id)
        if personality:
            system_prompt = personality.system_prompt
            model_options = {**personality.llm_config, **model_options}
    
    # Récupérer les connaissances pertinentes
    knowledge_base = []
    if query.message:
        print(f"🧠 Recherche dans la base de connaissances pour: {query.message[:100]}...")
        try:
            knowledge_items = search_knowledge(db, query.message, limit=5)
            knowledge_base = [item["content"] for item in knowledge_items]
            print(f"📖 {len(knowledge_base)} éléments de connaissance trouvés")
        except Exception as e:
            print(f"⚠️  Erreur lors de la recherche de connaissances: {e}")
            import traceback
            traceback.print_exc()
            knowledge_base = []
    
    # Sauvegarder le message utilisateur
    user_message = ChatbotMessageDB(
        conversation_id=conversation_id,
        role="user",
        content=query.message
    )
    db.add(user_message)
    
    try:
        # Générer la réponse via Ollama
        print("🤖 Génération de la réponse via Ollama...")
        response = chatbot_service.generate_chat_response(
            user_message=query.message,
            conversation_history=conversation_history,
            model=conversation.llm_model,
            system_prompt=system_prompt,
            model_options=model_options,
            knowledge_base=knowledge_base
        )
        
        print(f"📝 Réponse reçue: success={response.get('success', False)}")
        
        if not response["success"]:
            print(f"❌ Erreur dans la génération: {response.get('error', 'Erreur inconnue')}")
            raise HTTPException(
                status_code=500, 
                detail=f"Erreur génération réponse: {response['error']}"
            )
        
        # Sauvegarder la réponse de l'assistant
        assistant_message = ChatbotMessageDB(
            conversation_id=conversation_id,
            role="assistant",
            content=response["message"],
            tokens_used=response["tokens_used"],
            response_time=response["response_time"]
        )
        db.add(assistant_message)
        
        # Mettre à jour la conversation
        conversation.total_messages += 2  # user + assistant
        conversation.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(assistant_message)
        
        return {
            "conversation_id": conversation_id,
            "user_message_id": user_message.id,
            "assistant_message_id": assistant_message.id,
            "response": response["message"],
            "tokens_used": response["tokens_used"],
            "response_time": response["response_time"],
            "llm_model": response["model_used"],
            "created_at": assistant_message.created_at
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erreur traitement: {str(e)}")

def toggle_message_favorite(db: Session, message_id: int, user_id: int) -> bool:
    """Basculer le statut favori d'un message"""
    # Vérifier que le message appartient à l'utilisateur via la conversation
    message = db.query(ChatbotMessageDB).join(ChatbotConversationDB).filter(
        ChatbotMessageDB.id == message_id,
        ChatbotConversationDB.user_id == user_id
    ).first()
    
    if not message:
        raise HTTPException(status_code=404, detail="Message non trouvé")
    
    message.is_favorite = not message.is_favorite
    db.commit()
    
    return message.is_favorite

# ===== GESTION DES PERSONNALITÉS =====

def create_personality(db: Session, personality_data: ChatbotPersonalityCreate) -> ChatbotPersonalityDB:
    """Créer une nouvelle personnalité"""
    personality = ChatbotPersonalityDB(
        name=personality_data.name,
        description=personality_data.description,
        system_prompt=personality_data.system_prompt,
        llm_config=personality_data.llm_config,
        is_public=personality_data.is_public,
        created_by=personality_data.created_by
    )
    
    db.add(personality)
    db.commit()
    db.refresh(personality)
    
    return personality

def get_personalities(
    db: Session, 
    user_id: Optional[int] = None, 
    public_only: bool = False,
    limit: int = 50
) -> List[ChatbotPersonalityDB]:
    """Récupérer les personnalités disponibles"""
    query = db.query(ChatbotPersonalityDB).filter(
        ChatbotPersonalityDB.is_active == True
    )
    
    if public_only:
        query = query.filter(ChatbotPersonalityDB.is_public == True)
    elif user_id:
        # Personnalités publiques + créées par l'utilisateur
        query = query.filter(
            or_(
                ChatbotPersonalityDB.is_public == True,
                ChatbotPersonalityDB.created_by == user_id
            )
        )
    
    return query.order_by(desc(ChatbotPersonalityDB.usage_count)).limit(limit).all()

def get_personality_by_id(db: Session, personality_id: int) -> Optional[ChatbotPersonalityDB]:
    """Récupérer une personnalité par son ID"""
    return db.query(ChatbotPersonalityDB).filter(
        ChatbotPersonalityDB.id == personality_id,
        ChatbotPersonalityDB.is_active == True
    ).first()

def update_personality(
    db: Session, 
    personality_id: int, 
    user_id: int, 
    update_data: ChatbotPersonalityUpdate
) -> ChatbotPersonalityDB:
    """Mettre à jour une personnalité"""
    personality = db.query(ChatbotPersonalityDB).filter(
        ChatbotPersonalityDB.id == personality_id,
        ChatbotPersonalityDB.created_by == user_id
    ).first()
    
    if not personality:
        raise HTTPException(status_code=404, detail="Personnalité non trouvée")
    
    # Appliquer les mises à jour
    if update_data.name is not None:
        personality.name = update_data.name
    if update_data.description is not None:
        personality.description = update_data.description
    if update_data.system_prompt is not None:
        personality.system_prompt = update_data.system_prompt
    if update_data.llm_config is not None:
        personality.llm_config = {**personality.llm_config, **update_data.llm_config}
    if update_data.is_public is not None:
        personality.is_public = update_data.is_public
    if update_data.is_active is not None:
        personality.is_active = update_data.is_active
    
    personality.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(personality)
    
    return personality

def delete_personality(db: Session, personality_id: int, user_id: int) -> bool:
    """Supprimer une personnalité"""
    personality = db.query(ChatbotPersonalityDB).filter(
        ChatbotPersonalityDB.id == personality_id,
        ChatbotPersonalityDB.created_by == user_id
    ).first()
    
    if not personality:
        raise HTTPException(status_code=404, detail="Personnalité non trouvée")
    
    db.delete(personality)
    db.commit()
    
    return True

# ===== GESTION DES CONNAISSANCES =====

def create_knowledge(db: Session, knowledge_data: ChatbotKnowledgeCreate) -> ChatbotKnowledgeDB:
    """Créer un élément de connaissance"""
    knowledge = ChatbotKnowledgeDB(
        title=knowledge_data.title,
        content=knowledge_data.content,
        category=knowledge_data.category,
        keywords=knowledge_data.keywords,
        source=knowledge_data.source,
        created_by=knowledge_data.created_by
    )
    
    db.add(knowledge)
    db.commit()
    db.refresh(knowledge)
    
    return knowledge

def search_knowledge(
    db: Session, 
    query: str, 
    category: Optional[str] = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """Rechercher dans la base de connaissances"""
    search_query = db.query(ChatbotKnowledgeDB)
    
    if category:
        search_query = search_query.filter(ChatbotKnowledgeDB.category == category)
    
    # Recherche simple par mots-clés dans le titre et le contenu
    search_terms = query.lower().split()
    knowledge_items = search_query.all()
    
    # Score de pertinence
    scored_items = []
    for item in knowledge_items:
        score = 0
        text = f"{item.title} {item.content}".lower()
        
        for term in search_terms:
            if term in text:
                score += 1
            if term in [k.lower() for k in item.keywords]:
                score += 2  # Bonus pour les mots-clés
        
        if score > 0:
            scored_items.append((item, score))
    
    # Trier par pertinence et limite
    scored_items.sort(key=lambda x: x[1], reverse=True)
    
    result = []
    for item, score in scored_items[:limit]:
        item.usage_count += 1  # Incrémenter l'usage
        result.append({
            "id": item.id,
            "title": item.title,
            "content": item.content,
            "category": item.category,
            "keywords": item.keywords,
            "source": item.source,
            "score": score
        })
    
    db.commit()
    return result

# ===== STATISTIQUES =====

def get_chatbot_stats(db: Session, user_id: Optional[int] = None) -> ChatbotStats:
    """Récupérer les statistiques du chatbot"""
    
    # Filtrer par utilisateur si spécifié
    conv_query = db.query(ChatbotConversationDB)
    msg_query = db.query(ChatbotMessageDB).join(ChatbotConversationDB)
    
    if user_id:
        conv_query = conv_query.filter(ChatbotConversationDB.user_id == user_id)
        msg_query = msg_query.filter(ChatbotConversationDB.user_id == user_id)
    
    # Statistiques générales
    total_conversations = conv_query.count()
    total_messages = msg_query.count()
    
    # Utilisateurs actifs (dernières 30 jours)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    active_users = db.query(func.count(func.distinct(ChatbotConversationDB.user_id))).filter(
        ChatbotConversationDB.updated_at >= thirty_days_ago
    ).scalar()
    
    # Personnalités populaires
    popular_personalities = db.query(
        ChatbotPersonalityDB.name,
        ChatbotPersonalityDB.usage_count
    ).filter(
        ChatbotPersonalityDB.is_active == True
    ).order_by(desc(ChatbotPersonalityDB.usage_count)).limit(5).all()
    
    # Temps de réponse moyen
    avg_response_time = db.query(func.avg(ChatbotMessageDB.response_time)).filter(
        ChatbotMessageDB.role == "assistant",
        ChatbotMessageDB.response_time > 0
    ).scalar() or 0
    
    # Total de tokens utilisés
    total_tokens = db.query(func.sum(ChatbotMessageDB.tokens_used)).scalar() or 0
    
    return ChatbotStats(
        total_conversations=total_conversations,
        total_messages=total_messages,
        active_users=active_users,
        popular_personalities=[
            {"name": name, "usage_count": count}
            for name, count in popular_personalities
        ],
        average_response_time=float(avg_response_time),
        total_tokens_used=total_tokens
    )

# ===== UTILITAIRES =====

def cleanup_old_conversations(db: Session, days: int = 90) -> int:
    """Nettoyer les anciennes conversations inactives"""
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Trouver les conversations à supprimer
    old_conversations = db.query(ChatbotConversationDB).filter(
        ChatbotConversationDB.updated_at < cutoff_date,
        ChatbotConversationDB.is_active == False
    ).all()
    
    count = 0
    for conv in old_conversations:
        # Supprimer les messages associés
        db.query(ChatbotMessageDB).filter(
            ChatbotMessageDB.conversation_id == conv.id
        ).delete()
        
        # Supprimer la conversation
        db.delete(conv)
        count += 1
    
    db.commit()
    return count