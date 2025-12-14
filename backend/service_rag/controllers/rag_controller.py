"""
Contrôleur pour les opérations RAG (Retrieval-Augmented Generation)
Avec support des conversations et historique
"""
import os
import shutil
from typing import List
from fastapi import HTTPException
from llama_index.core import (
    VectorStoreIndex,
    SimpleDirectoryReader,
    load_index_from_storage,
    StorageContext
)
from llama_index.core.prompts import PromptTemplate
from llama_index.llms.openai import OpenAI
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.embeddings.huggingface import HuggingFaceEmbedding

from models.rag_models import QueryRequest, QueryResponse, SourceInfo
from models.conversation_models import QueryWithContext, ConversationResponse
from controllers.conversation_manager import conversation_manager


# CONSTANTES
PERSIST_DIR = "./storage"
DATA_DIR = "./data"

# PROMPT PERSONNALISÉ AVEC CONTEXTE DE CONVERSATION
TEXT_QR_TEMPLATE_STR = (
    "{conversation_context}"
    "Les informations contextuelles ci-dessous proviennent de notre base de données TalentLink.\n"
    "{context_str}\n\n"
    "En tant qu'assistant TalentBot, réponds à la question de manière claire et professionnelle.\n"
    "Si tu fais référence à la conversation précédente, utilise le contexte fourni ci-dessus.\n"
    "Si l'information n'est pas disponible, dis-le clairement.\n\n"
    "Question: {query_str}\n"
    "Réponse:"
)

TEXT_QR_TEMPLATE = PromptTemplate(TEXT_QR_TEMPLATE_STR)


class RAGController:
    """Contrôleur pour gérer les opérations RAG"""
    
    def __init__(self):
        self.index = None
    
    def get_llm(self, model_type: str, model_name: str):
        """Crée et retourne le LLM selon le type et le nom du modèle."""
        if model_type == "openai":
            llm = OpenAI(
                model=model_name,
                temperature=0.1,
                max_tokens=2000
            )
            print(f"✅ LLM OpenAI {model_name} créé avec succès.")
        elif model_type == "ollama":
            llm = Ollama(
                model=model_name,
                base_url="http://localhost:11434",
                temperature=0.1,
                request_timeout=120.0
            )
            print(f"✅ LLM Ollama {model_name} créé avec succès.")
        else:
            raise ValueError(f"Type de modèle inconnu: {model_type}")
        
        return llm
    
    def get_embedding_model(self, model_type: str):
        """Crée et retourne le modèle d'embedding selon le type choisi."""
        if model_type == "openai":
            embedding_model = OpenAIEmbedding(
                model="text-embedding-3-small",
                embed_batch_size=100
            )
            print("✅ Modèle d'embedding OpenAI configuré avec succès.")
        elif model_type == "ollama":
            embedding_model = HuggingFaceEmbedding(
                model_name="BAAI/bge-small-en-v1.5"
            )
            print("✅ Modèle d'embedding HuggingFace configuré avec succès.")
        else:
            raise ValueError(f"Type d'embedding inconnu: {model_type}")
        
        return embedding_model
    
    async def initialize_index(self):
        """Initialise l'index au démarrage de l'application."""
        print("🚀 Démarrage de l'application et initialisation de l'index...")

        embedding_model = self.get_embedding_model("openai")  # Par défaut OpenAI

        # Créer les répertoires s'ils n'existent pas
        os.makedirs(PERSIST_DIR, exist_ok=True)
        os.makedirs(DATA_DIR, exist_ok=True)

        # Vérifier si l'index existe déjà (docstore.json)
        docstore_path = os.path.join(PERSIST_DIR, "docstore.json")
        
        if not os.path.exists(docstore_path):
            # Si le répertoire n'existe pas, créer les indices
            print("📚 Création des indices à partir des documents...")
            
            # Charger les documents
            documents = SimpleDirectoryReader(
                DATA_DIR,
                filename_as_id=True
            ).load_data()
            
            if len(documents) == 0:
                print(f"⚠️ Aucun document trouvé dans le dossier {DATA_DIR}.")
                print("📝 Création d'un index vide...")
                # Créer un index vide
                self.index = VectorStoreIndex.from_documents(
                    [],
                    embed_model=embedding_model
                )
            else:
                print(f"📄 {len(documents)} document(s) chargé(s)")
                # Créer l'index vectoriel
                self.index = VectorStoreIndex.from_documents(
                    documents,
                    embed_model=embedding_model,
                    show_progress=True
                )
            
            # Sauvegarder l'index
            self.index.storage_context.persist(persist_dir=PERSIST_DIR)
            print(f"✅ Index créé et sauvegardé dans {PERSIST_DIR}")
        
        else:
            # Charger l'index existant
            print("📂 Chargement de l'index depuis le stockage persistant...")
            storage_context = StorageContext.from_defaults(persist_dir=PERSIST_DIR)
            
            self.index = load_index_from_storage(
                storage_context,
                embed_model=embedding_model
            )
            
            print("✅ Index chargé avec succès")
        
        print("✨ Application démarrée avec succès!")
    
    async def query_with_conversation(self, request: QueryWithContext) -> ConversationResponse:
        """Traite une requête avec contexte de conversation."""
        
        if self.index is None:
            raise HTTPException(
                status_code=503,
                detail="Le moteur de requête n'est pas initialisé."
            )
        
        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="La question ne peut pas être vide."
            )
        
        try:
            # Créer ou récupérer la conversation
            if request.conversation_id:
                conversation_id = request.conversation_id
                print(f"📖 Reprise de la conversation: {conversation_id}")
            else:
                conversation_id = conversation_manager.create_conversation(
                    user_id=request.user_id,
                    title=request.question[:50]
                )
                print(f"✨ Nouvelle conversation créée: {conversation_id}")
            
            # Ajouter la question de l'utilisateur
            conversation_manager.add_message(
                conversation_id=conversation_id,
                role="user",
                content=request.question
            )
            
            # Construire le contexte de conversation
            conversation_context = conversation_manager.build_context_from_history(
                conversation_id=conversation_id,
                max_messages=10
            )
            
            # Créer le LLM
            llm = self.get_llm(request.model_type, request.model_name)
            
            # Créer un prompt personnalisé avec le contexte de conversation
            custom_prompt = PromptTemplate(
                TEXT_QR_TEMPLATE_STR.format(
                    conversation_context=conversation_context + "\n\n" if conversation_context else "",
                    context_str="{context_str}",
                    query_str="{query_str}"
                )
            )
            
            # Créer le query engine
            query_engine = self.index.as_query_engine(
                llm=llm,
                text_qa_template=custom_prompt,
                similarity_top_k=request.top_k,
                response_mode="compact"
            )
            
            print(f"❓ Question: {request.question}")
            print(f"🤖 Modèle: {request.model_type}/{request.model_name}")
            
            # Exécuter la requête
            response = query_engine.query(request.question)
            
            # Extraire les sources
            sources = []
            if hasattr(response, 'source_nodes'):
                for i, node in enumerate(response.source_nodes):
                    metadata = node.node.metadata if hasattr(node.node, 'metadata') else {}
                    
                    sources.append({
                        "index": i,
                        "score": float(node.score) if hasattr(node, 'score') else None,
                        "text": node.text[:300] + "..." if len(node.text) > 300 else node.text,
                        "document_name": metadata.get("file_name", "Inconnu"),
                        "page_number": metadata.get("page_number", None)
                    })
            
            answer = str(response)
            
            # Ajouter la réponse de l'assistant
            conversation_manager.add_message(
                conversation_id=conversation_id,
                role="assistant",
                content=answer,
                sources=sources
            )
            
            # Récupérer l'historique complet
            history = conversation_manager.get_conversation_history(conversation_id)
            
            print(f"✅ Réponse générée avec {len(sources)} source(s)")
            
            return ConversationResponse(
                conversation_id=conversation_id,
                question=request.question,
                answer=answer,
                model_used=f"{request.model_type}/{request.model_name}",
                sources=sources,
                conversation_history=[
                    {
                        "role": msg["role"],
                        "content": msg["content"],
                        "timestamp": msg["timestamp"]
                    }
                    for msg in history
                ]
            )
        
        except Exception as e:
            print(f"❌ Erreur: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur interne: {str(e)}"
            )
    
    async def query_documents(self, request: QueryRequest) -> QueryResponse:
        """Traite une requête simple sans contexte de conversation (legacy)."""
        
        if self.index is None:
            raise HTTPException(
                status_code=503,
                detail="Le moteur de requête n'est pas initialisé."
            )
        
        if not request.question.strip():
            raise HTTPException(
                status_code=400,
                detail="La question ne peut pas être vide."
            )
        
        try:
            # Créer le LLM selon le choix de l'utilisateur
            llm = self.get_llm(request.model_type, request.model_name)
            
            # Créer le query engine avec le LLM et le prompt personnalisé
            query_engine = self.index.as_query_engine(
                llm=llm,
                text_qa_template=TEXT_QR_TEMPLATE,
                similarity_top_k=request.top_k,
                response_mode="compact"
            )
            
            print(f"❓ Question reçue: {request.question}")
            print(f"🤖 Utilisation du modèle {request.model_type}/{request.model_name}")
            
            # Exécuter la requête
            response = query_engine.query(request.question)
            
            # Extraire les sources avec métadonnées
            sources = []
            if hasattr(response, 'source_nodes'):
                for i, node in enumerate(response.source_nodes):
                    metadata = node.node.metadata if hasattr(node.node, 'metadata') else {}
                    
                    file_name = metadata.get("file_name", "Inconnu")
                    page_number = metadata.get("page_number", None)
                    score = float(node.score) if hasattr(node, 'score') else None
                    text = node.text[:300] + "..." if len(node.text) > 300 else node.text
                    
                    sources.append(SourceInfo(
                        index=i,
                        score=score,
                        text=text,
                        document_name=file_name,
                        page_number=page_number
                    ))
            
            print(f"✅ Réponse générée avec {len(sources)} source(s) utilisée(s).")
            
            return QueryResponse(
                question=request.question,
                answer=str(response),
                model_used=f"{request.model_type}/{request.model_name}",
                sources=sources
            )
        
        except Exception as e:
            print(f"❌ Erreur lors du traitement de la requête: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Erreur interne du serveur: {str(e)}"
            )
    
    async def reindex_documents(self):
        """Réindexe les documents dans le dossier ./data."""
        try:
            print("🔄 Réindexation des documents en cours...")
            
            # Supprimer l'ancien index
            if os.path.exists(PERSIST_DIR):
                shutil.rmtree(PERSIST_DIR)
                print("🗑️ Ancien index supprimé")
            
            # Recharger les documents
            documents = SimpleDirectoryReader(
                DATA_DIR,
                filename_as_id=True
            ).load_data()
            
            if len(documents) == 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Aucun document trouvé dans {DATA_DIR}"
                )
            
            # Créer un nouvel index
            embedding_model = self.get_embedding_model("openai")
            self.index = VectorStoreIndex.from_documents(
                documents,
                embed_model=embedding_model,
                show_progress=True
            )
            
            self.index.storage_context.persist(persist_dir=PERSIST_DIR)
            print("✅ Réindexation terminée avec succès.")
            
            return {
                "message": "Réindexation terminée avec succès.",
                "count": len(documents)
            }
        
        except Exception as e:
            print(f"❌ Erreur lors de la réindexation: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def get_health_status(self):
        """Retourne le statut de santé du service."""
        return {
            "status": "OK",
            "index_loaded": self.index is not None
        }
    
    def get_supported_models(self):
        """Retourne la liste des modèles supportés."""
        return {
            "openai": {
                "models": ["gpt-3.5-turbo", "gpt-4o-mini", "gpt-4o"],
                "requires": "OPENAI_API_KEY environment variable",
                "embeddings": "text-embedding-3-small"
            },
            "ollama": {
                "models": ["llama2", "llama3.2", "mistral"],
                "requires": "Ollama installé localement (ollama.ai)",
                "installation": "curl -fsSL https://ollama.ai/install.sh | sh",
                "pull_models": "ollama pull llama3.2",
                "embeddings": "BAAI/bge-small-en-v1.5 (HuggingFace)"
            }
        }


# Instance globale du contrôleur
rag_controller = RAGController()
