"""
Tests de charge pour le service RAG (TalentBot)
"""
from locust import HttpUser, task, between
import random


class RAGLoadTest(HttpUser):
    """Tests de charge pour le chatbot RAG"""
    
    wait_time = between(2, 5)  # Temps d'attente réaliste entre les messages
    host = "http://localhost:8008"
    
    def on_start(self):
        """Initialisation"""
        self.conversation_id = None
        self.user_id = str(random.randint(1, 100))
        
        # Questions types pour le test
        self.questions = [
            "Qu'est-ce que TalentLink ?",
            "Comment créer mon profil candidat ?",
            "Quelles sont les fonctionnalités pour les recruteurs ?",
            "Comment postuler à une offre ?",
            "Comment puis-je modifier mon CV ?",
            "Quels sont les types de contrats disponibles ?",
            "Comment contacter un recruteur ?",
            "Puis-je avoir plusieurs profils ?",
            "Comment fonctionne la recherche d'offres ?",
            "Quelles informations dois-je fournir ?"
        ]
    
    @task(5)
    def health_check(self):
        """Test du endpoint health check"""
        self.client.get("/rag/health")
    
    @task(10)
    def chat_new_conversation(self):
        """Démarrer une nouvelle conversation"""
        question = random.choice(self.questions)
        
        with self.client.post(
            "/rag/chat",
            json={
                "question": question,
                "user_id": self.user_id,
                "model_type": "openai",
                "model_name": "gpt-4o-mini",
                "top_k": 3
            },
            catch_response=True,
            timeout=60  # RAG peut prendre du temps
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.conversation_id = data.get("conversation_id")
                response.success()
            else:
                response.failure(f"Chat failed: {response.status_code}")
    
    @task(8)
    def chat_continue_conversation(self):
        """Continuer une conversation existante"""
        if not self.conversation_id:
            self.chat_new_conversation()
            return
        
        question = random.choice(self.questions)
        
        with self.client.post(
            "/rag/chat",
            json={
                "question": question,
                "conversation_id": self.conversation_id,
                "user_id": self.user_id,
                "model_type": "openai",
                "model_name": "gpt-4o-mini",
                "top_k": 3
            },
            catch_response=True,
            timeout=60
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Chat continuation failed: {response.status_code}")
    
    @task(2)
    def get_user_conversations(self):
        """Récupérer la liste des conversations de l'utilisateur"""
        self.client.get(f"/rag/conversations/{self.user_id}")
    
    @task(1)
    def get_conversation_details(self):
        """Récupérer les détails d'une conversation"""
        if self.conversation_id:
            self.client.get(f"/rag/conversations/{self.user_id}/{self.conversation_id}")
    
    @task(1)
    def query_simple(self):
        """Test du endpoint simple query (sans conversation)"""
        question = random.choice(self.questions)
        
        self.client.post(
            "/rag/query",
            json={
                "question": question,
                "model_type": "openai",
                "model_name": "gpt-4o-mini",
                "top_k": 3
            },
            timeout=60
        )


class RAGStressTest(HttpUser):
    """Tests de stress pour le RAG (charges élevées)"""
    
    wait_time = between(0.5, 1)  # Requêtes rapides
    host = "http://localhost:8008"
    
    def on_start(self):
        self.user_id = str(random.randint(1, 1000))
        self.questions = [
            "Qu'est-ce que TalentLink ?",
            "Comment créer un profil ?",
            "Aide-moi"
        ]
    
    @task
    def rapid_queries(self):
        """Requêtes rapides et multiples"""
        question = random.choice(self.questions)
        
        self.client.post(
            "/rag/chat",
            json={
                "question": question,
                "user_id": self.user_id,
                "model_type": "openai",
                "model_name": "gpt-4o-mini"
            },
            timeout=60,
            name="/rag/chat (stress)"
        )
