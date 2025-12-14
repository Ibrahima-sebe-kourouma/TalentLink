"""
Tests de charge pour le service d'authentification
"""
from locust import HttpUser, task, between
from faker import Faker
import random

fake = Faker('fr_FR')


class AuthLoadTest(HttpUser):
    """Tests de charge pour les endpoints d'authentification"""
    
    wait_time = between(1, 3)  # Temps d'attente entre les requêtes
    host = "http://localhost:8001"
    
    def on_start(self):
        """Exécuté au démarrage de chaque utilisateur virtuel"""
        self.token = None
        self.user_id = None
    
    @task(3)
    def health_check(self):
        """Test du endpoint health check"""
        self.client.get("/health")
    
    @task(5)
    def login_existing_user(self):
        """Test de connexion avec un utilisateur existant"""
        with self.client.post(
            "/auth/login",
            json={
                "email": "test_candidate@talenlink.com",
                "password": "TestPassword123!"
            },
            catch_response=True
        ) as response:
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.user_id = data.get("user", {}).get("id")
                response.success()
            else:
                response.failure(f"Login failed: {response.status_code}")
    
    @task(2)
    def register_new_user(self):
        """Test d'inscription d'un nouvel utilisateur"""
        email = fake.email()
        password = "TestPassword123!"
        nom = fake.last_name()
        prenom = fake.first_name()
        
        with self.client.post(
            "/auth/register",
            json={
                "email": email,
                "password": password,
                "name": f"{prenom} {nom}",
                "nom": nom,
                "prenom": prenom,
                "role": random.choice(["candidat", "recruteur"])
            },
            catch_response=True
        ) as response:
            if response.status_code in [200, 201]:
                response.success()
            elif response.status_code == 400 and "existe déjà" in response.text:
                # Email déjà utilisé, c'est acceptable
                response.success()
            else:
                response.failure(f"Registration failed: {response.status_code}")
    
    @task(1)
    def get_current_user(self):
        """Test de récupération du profil utilisateur (nécessite token)"""
        if not self.token:
            # Se connecter d'abord
            self.login_existing_user()
        
        if self.token:
            self.client.get(
                "/auth/me",
                headers={"Authorization": f"Bearer {self.token}"}
            )
    
    @task(1)
    def logout(self):
        """Test de déconnexion"""
        if not self.token:
            return
        
        self.client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {self.token}"}
        )
        self.token = None


class AuthStressTest(HttpUser):
    """Tests de stress intensifs pour l'authentification"""
    
    wait_time = between(0.1, 0.5)  # Requêtes très rapides
    host = "http://localhost:8001"
    
    @task(10)
    def rapid_login_attempts(self):
        """Tentatives de connexion rapides"""
        self.client.post(
            "/auth/login",
            json={
                "email": "test_candidate@talenlink.com",
                "password": "TestPassword123!"
            }
        )
    
    @task(1)
    def invalid_login(self):
        """Tentatives de connexion avec des identifiants invalides"""
        self.client.post(
            "/auth/login",
            json={
                "email": fake.email(),
                "password": fake.password()
            },
            name="/auth/login (invalid)"
        )
