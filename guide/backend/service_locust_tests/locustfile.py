"""
Configuration principale Locust pour TalentLink
Point d'entrée pour tous les tests de charge
"""
from locust import HttpUser, task, between, TaskSet
import sys
import os

# Ajouter le répertoire parent au path pour les imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tests.test_auth import AuthLoadTest, AuthStressTest
from tests.test_rag import RAGLoadTest, RAGStressTest
from tests.test_offers import OffersLoadTest, OffersStressTest
from scenarios.user_journey import UserJourneySimulation


class TalentLinkUser(HttpUser):
    """
    Utilisateur mixte qui teste tous les services
    Utilisé par défaut si aucun test spécifique n'est lancé
    """
    
    wait_time = between(1, 5)
    
    @task(3)
    def test_auth_service(self):
        """Test du service d'authentification"""
        with self.client.get("http://localhost:8001/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Auth service health check failed: {response.status_code}")
    
    @task(2)
    def test_profile_service(self):
        """Test du service de profil"""
        with self.client.get("http://localhost:8002/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Profile service health check failed: {response.status_code}")
    
    @task(2)
    def test_offers_service(self):
        """Test du service des offres"""
        with self.client.get("http://localhost:8003/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Offers service health check failed: {response.status_code}")
    
    @task(1)
    def test_rag_service(self):
        """Test du service RAG"""
        with self.client.get("http://localhost:8008/rag/health", catch_response=True) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"RAG service health check failed: {response.status_code}")


# Export des classes de test pour utilisation avec --class
__all__ = [
    'TalentLinkUser',
    'AuthLoadTest',
    'AuthStressTest',
    'RAGLoadTest',
    'RAGStressTest',
    'OffersLoadTest',
    'OffersStressTest',
    'UserJourneySimulation'
]
