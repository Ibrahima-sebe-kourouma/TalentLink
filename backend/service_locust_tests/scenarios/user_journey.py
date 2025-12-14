"""
Scénarios complets simulant des parcours utilisateur réalistes
"""
from locust import HttpUser, task, between, SequentialTaskSet
from faker import Faker
import random

fake = Faker('fr_FR')


class CandidateJourney(SequentialTaskSet):
    """Parcours complet d'un candidat"""
    
    @task
    def register(self):
        """1. Inscription"""
        self.email = fake.email()
        self.password = "TestPassword123!"
        nom = fake.last_name()
        prenom = fake.first_name()
        
        response = self.client.post(
            "http://localhost:8001/auth/register",
            json={
                "email": self.email,
                "password": self.password,
                "name": f"{prenom} {nom}",
                "nom": nom,
                "prenom": prenom,
                "role": "candidat"
            }
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            self.user_id = data.get("id")
            self.token = data.get("access_token")
    
    @task
    def complete_profile(self):
        """2. Compléter le profil"""
        if not hasattr(self, 'token'):
            return
        
        self.client.post(
            "http://localhost:8002/candidates",
            json={
                "user_id": self.user_id,
                "telephone": fake.phone_number(),
                "adresse": fake.address(),
                "date_naissance": "1990-01-01",
                "competences": ["Python", "JavaScript", "SQL"],
                "experiences": ["Développeur"],
                "formations": ["Master Informatique"]
            },
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task
    def browse_offers(self):
        """3. Parcourir les offres"""
        self.client.get("http://localhost:8003/offers")
    
    @task
    def search_offers(self):
        """4. Rechercher des offres spécifiques"""
        self.client.get(
            "http://localhost:8003/offers/search",
            params={
                "type_contrat": "CDI",
                "localisation": "Paris"
            }
        )
    
    @task
    def chat_with_bot(self):
        """5. Discuter avec le bot"""
        response = self.client.post(
            "http://localhost:8008/rag/chat",
            json={
                "question": "Comment postuler à une offre ?",
                "user_id": str(self.user_id) if hasattr(self, 'user_id') else "1",
                "model_type": "openai",
                "model_name": "gpt-4o-mini"
            },
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            self.conversation_id = data.get("conversation_id")
    
    @task
    def continue_chat(self):
        """6. Continuer la discussion"""
        if not hasattr(self, 'conversation_id'):
            return
        
        self.client.post(
            "http://localhost:8008/rag/chat",
            json={
                "question": "Merci pour l'information !",
                "conversation_id": self.conversation_id,
                "user_id": str(self.user_id) if hasattr(self, 'user_id') else "1",
                "model_type": "openai",
                "model_name": "gpt-4o-mini"
            },
            timeout=60
        )
    
    @task
    def logout(self):
        """7. Déconnexion"""
        if hasattr(self, 'token'):
            self.client.post(
                "http://localhost:8001/auth/logout",
                headers={"Authorization": f"Bearer {self.token}"}
            )


class RecruiterJourney(SequentialTaskSet):
    """Parcours complet d'un recruteur"""
    
    @task
    def login(self):
        """1. Connexion"""
        response = self.client.post(
            "http://localhost:8001/auth/login",
            json={
                "email": "test_recruiter@talenlink.com",
                "password": "TestPassword123!"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            self.token = data.get("access_token")
            self.user_id = data.get("user", {}).get("id")
    
    @task
    def view_offers(self):
        """2. Voir les offres"""
        if not hasattr(self, 'token'):
            return
        
        self.client.get(
            "http://localhost:8003/offers",
            headers={"Authorization": f"Bearer {self.token}"}
        )
    
    @task
    def chat_with_bot(self):
        """3. Utiliser l'assistant IA"""
        if not hasattr(self, 'user_id'):
            return
        
        self.client.post(
            "http://localhost:8008/rag/chat",
            json={
                "question": "Comment créer une offre d'emploi attractive ?",
                "user_id": str(self.user_id),
                "model_type": "openai",
                "model_name": "gpt-4o-mini"
            },
            timeout=60
        )
    
    @task
    def logout(self):
        """4. Déconnexion"""
        if hasattr(self, 'token'):
            self.client.post(
                "http://localhost:8001/auth/logout",
                headers={"Authorization": f"Bearer {self.token}"}
            )


class UserJourneySimulation(HttpUser):
    """Simulation de parcours utilisateurs réalistes"""
    
    wait_time = between(3, 8)  # Temps réaliste entre les actions
    
    tasks = {
        CandidateJourney: 7,  # 70% candidats
        RecruiterJourney: 3   # 30% recruteurs
    }
