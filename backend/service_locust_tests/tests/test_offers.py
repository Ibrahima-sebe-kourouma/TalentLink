"""
Tests de charge pour le service des offres d'emploi
"""
from locust import HttpUser, task, between
import random


class OffersLoadTest(HttpUser):
    """Tests de charge pour les offres d'emploi"""
    
    wait_time = between(1, 3)
    host = "http://localhost:8003"
    
    def on_start(self):
        """Initialisation"""
        self.offer_ids = []
    
    @task(5)
    def health_check(self):
        """Test du endpoint health check"""
        self.client.get("/health")
    
    @task(10)
    def get_all_offers(self):
        """Récupérer toutes les offres"""
        with self.client.get("/offers", catch_response=True) as response:
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    # Sauvegarder quelques IDs d'offres pour les tests suivants
                    self.offer_ids = [offer.get("id") for offer in data[:5] if offer.get("id")]
                response.success()
            else:
                response.failure(f"Get offers failed: {response.status_code}")
    
    @task(8)
    def get_offer_by_id(self):
        """Récupérer une offre spécifique par ID"""
        if not self.offer_ids:
            self.get_all_offers()
            return
        
        offer_id = random.choice(self.offer_ids)
        self.client.get(f"/offers/{offer_id}")
    
    @task(3)
    def search_offers(self):
        """Rechercher des offres avec filtres"""
        params = {
            "type_contrat": random.choice(["CDI", "CDD", "Stage", "Alternance"]),
            "localisation": random.choice(["Paris", "Lyon", "Marseille", "Toulouse"]),
            "skip": 0,
            "limit": 20
        }
        self.client.get("/offers/search", params=params)
    
    @task(2)
    def get_offers_by_type(self):
        """Récupérer les offres par type de contrat"""
        contract_type = random.choice(["CDI", "CDD", "Stage", "Alternance"])
        self.client.get(f"/offers/type/{contract_type}")


class OffersStressTest(HttpUser):
    """Tests de stress pour les offres"""
    
    wait_time = between(0.1, 0.5)
    host = "http://localhost:8003"
    
    @task(10)
    def rapid_offer_browsing(self):
        """Navigation rapide dans les offres"""
        self.client.get("/offers")
    
    @task(5)
    def rapid_search(self):
        """Recherches rapides"""
        self.client.get("/offers/search", params={"limit": 10})
