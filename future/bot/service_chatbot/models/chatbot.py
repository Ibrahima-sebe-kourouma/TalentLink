from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

Base = declarative_base()

# ===== MODÈLES DATABASE (SQLAlchemy) =====

class ChatbotConversationDB(Base):
    """Conversations avec le chatbot"""
    __tablename__ = "chatbot_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)  # ID de l'utilisateur TalentLink
    title = Column(String(200), nullable=False)  # Titre de la conversation
    context = Column(Text, nullable=True)  # Contexte de la conversation
    llm_model = Column(String(100), default="gemma3:4b")  # Modèle Ollama utilisé
    total_messages = Column(Integer, default=0)  # Nombre total de messages
    is_active = Column(Boolean, default=True)  # Conversation active
    meta_data = Column(JSON, default=dict)  # Métadonnées additionnelles
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relation avec les messages
    messages = relationship("ChatbotMessageDB", back_populates="conversation", cascade="all, delete-orphan")

class ChatbotMessageDB(Base):
    """Messages individuels dans les conversations chatbot"""
    __tablename__ = "chatbot_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("chatbot_conversations.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)  # Contenu du message
    tokens_used = Column(Integer, default=0)  # Nombre de tokens utilisés
    response_time = Column(Integer, default=0)  # Temps de réponse en ms
    llm_params = Column(JSON, default=dict)  # Paramètres du modèle utilisés
    is_favorite = Column(Boolean, default=False)  # Message marqué comme favori
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation avec la conversation
    conversation = relationship("ChatbotConversationDB", back_populates="messages")

class ChatbotPersonalityDB(Base):
    """Personnalités/Assistants personnalisés"""
    __tablename__ = "chatbot_personalities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)  # Nom de l'assistant
    description = Column(Text, nullable=True)  # Description
    system_prompt = Column(Text, nullable=False)  # Prompt système définissant la personnalité
    llm_config = Column(JSON, default=dict)  # Configuration du modèle (température, etc.)
    is_public = Column(Boolean, default=False)  # Disponible pour tous les utilisateurs
    created_by = Column(Integer, nullable=False)  # ID de l'utilisateur créateur
    usage_count = Column(Integer, default=0)  # Nombre d'utilisations
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ChatbotKnowledgeDB(Base):
    """Base de connaissances pour enrichir les réponses"""
    __tablename__ = "chatbot_knowledge"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)  # Catégorie (RH, Tech, etc.)
    keywords = Column(JSON, default=list)  # Mots-clés pour la recherche
    source = Column(String(200), nullable=True)  # Source de l'information
    meta_data = Column(JSON, default=dict)  # Données métier supplémentaires
    is_verified = Column(Boolean, default=False)  # Information vérifiée
    usage_count = Column(Integer, default=0)
    created_by = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# ===== MODÈLES PYDANTIC (API) =====

class ChatbotMessage(BaseModel):
    """Message pour l'API"""
    role: str = Field(..., description="Rôle du message: user, assistant, system")
    content: str = Field(..., description="Contenu du message")
    tokens_used: Optional[int] = Field(0, description="Nombre de tokens utilisés")
    response_time: Optional[int] = Field(0, description="Temps de réponse en ms")
    created_at: Optional[datetime] = None

class ChatbotMessageCreate(BaseModel):
    """Création d'un message"""
    conversation_id: int = Field(..., description="ID de la conversation")
    role: str = Field(..., description="Rôle: user ou system")
    content: str = Field(..., description="Contenu du message", min_length=1)

class ChatbotConversation(BaseModel):
    """Conversation pour l'API"""
    id: int
    user_id: int
    title: str
    context: Optional[str] = None
    llm_model: str = "gemma3:4b"
    total_messages: int = 0
    is_active: bool = True
    meta_data: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    messages: List[ChatbotMessage] = []

class ChatbotConversationCreate(BaseModel):
    """Création d'une conversation"""
    user_id: int = Field(..., description="ID de l'utilisateur")
    title: str = Field(..., description="Titre de la conversation", min_length=1, max_length=200)
    context: Optional[str] = Field(None, description="Contexte initial")
    llm_model: str = Field("gemma3:4b", description="Modèle à utiliser")
    personality_id: Optional[int] = Field(None, description="ID de la personnalité à utiliser")

class ChatbotConversationUpdate(BaseModel):
    """Mise à jour d'une conversation"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    context: Optional[str] = None
    is_active: Optional[bool] = None
    meta_data: Optional[Dict[str, Any]] = None

class ChatbotQuery(BaseModel):
    """Requête au chatbot"""
    conversation_id: Optional[int] = Field(None, description="ID de conversation existante")
    message: str = Field(..., description="Message de l'utilisateur", min_length=1)
    user_id: int = Field(..., description="ID de l'utilisateur")
    personality_id: Optional[int] = Field(None, description="ID de la personnalité à utiliser")
    llm_params: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Paramètres du modèle")

class ChatbotResponse(BaseModel):
    """Réponse du chatbot"""
    conversation_id: int
    message: str
    tokens_used: int
    response_time: int
    llm_model: str
    created_at: datetime

class ChatbotPersonality(BaseModel):
    """Personnalité de chatbot"""
    id: int
    name: str
    description: Optional[str] = None
    system_prompt: str
    llm_config: Dict[str, Any] = {}
    is_public: bool = False
    created_by: int
    usage_count: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

class ChatbotPersonalityCreate(BaseModel):
    """Création d'une personnalité"""
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: str = Field(..., min_length=10, description="Prompt système définissant la personnalité")
    llm_config: Dict[str, Any] = Field(default_factory=dict, description="Configuration du modèle")
    is_public: bool = Field(False, description="Rendre public")
    created_by: int = Field(..., description="ID du créateur")

class ChatbotPersonalityUpdate(BaseModel):
    """Mise à jour d'une personnalité"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    system_prompt: Optional[str] = Field(None, min_length=10)
    llm_config: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None
    is_active: Optional[bool] = None

class ChatbotKnowledge(BaseModel):
    """Élément de base de connaissances"""
    id: int
    title: str
    content: str
    category: Optional[str] = None
    keywords: List[str] = []
    source: Optional[str] = None
    is_verified: bool = False
    usage_count: int = 0
    created_by: int
    created_at: datetime
    updated_at: datetime

class ChatbotKnowledgeCreate(BaseModel):
    """Création d'un élément de connaissance"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=10)
    category: Optional[str] = Field(None, max_length=100)
    keywords: List[str] = Field(default_factory=list)
    source: Optional[str] = Field(None, max_length=200)
    created_by: int = Field(..., description="ID du créateur")

class ChatbotStats(BaseModel):
    """Statistiques du chatbot"""
    total_conversations: int
    total_messages: int
    active_users: int
    popular_personalities: List[Dict[str, Any]]
    average_response_time: float
    total_tokens_used: int

class OllamaModelInfo(BaseModel):
    """Informations sur les modèles Ollama disponibles"""
    name: str
    size: str
    modified: str
    digest: str = ""
    details: Dict[str, Any] = {}

# ===== PROMPTS SYSTÈME PRÉDÉFINIS =====

SYSTEM_PROMPTS = {
    "assistant_general": """Tu es un assistant IA intelligent et serviable pour la plateforme TalentLink. 
Tu aides les utilisateurs avec leurs questions professionnelles, de recrutement, et de gestion RH. 
Réponds de manière concise, professionnelle et bienveillante. Si tu ne connais pas une information, 
dis-le clairement plutôt que d'inventer.""",
    
    "recruteur_expert": """Tu es un expert en recrutement avec 10+ ans d'expérience. Tu aides les recruteurs 
sur TalentLink à optimiser leurs processus, rédiger des offres d'emploi attractives, évaluer des candidats, 
et améliorer leur stratégie de sourcing. Donne des conseils pratiques et actionables.""",
    
    "candidat_coach": """Tu es un coach professionnel qui aide les candidats sur TalentLink à améliorer 
leur recherche d'emploi. Tu donnes des conseils sur la rédaction de CV, la préparation d'entretiens, 
la stratégie de candidature et le développement de carrière. Sois encourageant et constructif.""",
    
    "analyste_rh": """Tu es un analyste RH spécialisé dans les données et métriques de recrutement. 
Tu aides les utilisateurs de TalentLink à comprendre les statistiques, analyser les tendances du marché, 
et optimiser leurs KPI RH. Présente les données de manière claire et actionnable.""",
    
    "assistant_technique": """Tu es un assistant technique pour la plateforme TalentLink. Tu aides 
avec l'utilisation des fonctionnalités, résous les problèmes techniques, et guides les utilisateurs 
dans l'optimisation de leur utilisation de la plateforme. Sois précis et pédagogique."""
}

# ===== CONFIGURATION DES MODÈLES =====

MODEL_CONFIGS = {
    "creative": {
        "temperature": 0.8,
        "top_p": 0.9,
        "top_k": 40,
        "repeat_penalty": 1.1
    },
    "balanced": {
        "temperature": 0.6,
        "top_p": 0.8,
        "top_k": 30,
        "repeat_penalty": 1.1
    },
    "precise": {
        "temperature": 0.3,
        "top_p": 0.7,
        "top_k": 20,
        "repeat_penalty": 1.2
    },
    "analytical": {
        "temperature": 0.2,
        "top_p": 0.6,
        "top_k": 15,
        "repeat_penalty": 1.2
    }
}