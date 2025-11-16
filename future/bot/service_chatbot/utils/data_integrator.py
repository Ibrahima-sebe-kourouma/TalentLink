"""
Intégrateur de données TalentLink pour la base de connaissances du chatbot.
Ce module permet d'extraire et synchroniser les données de tous les services.
"""

import sqlite3
import os
import json
from datetime import datetime
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from database.database import SessionLocal
from models.chatbot import ChatbotKnowledgeDB

class TalentLinkDataIntegrator:
    """Intégrateur de données pour enrichir la base de connaissances du chatbot"""
    
    def __init__(self):
        self.backend_path = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        self.knowledge_sources = {
            "users": self._get_auth_db_path(),
            "candidats": self._get_profile_db_path(),
            "recruteurs": self._get_profile_db_path(),
            "offers": self._get_offers_db_path(),
            "applications": self._get_offers_db_path(),
            "conversations": self._get_messaging_db_path(),
            "messages": self._get_messaging_db_path()
        }
    
    def _get_auth_db_path(self) -> str:
        """Chemin vers la BD du service auth"""
        return os.path.join(self.backend_path, "service_auth", "talent_link_auth.db")
    
    def _get_profile_db_path(self) -> str:
        """Chemin vers la BD du service profile"""
        return os.path.join(self.backend_path, "service_profile", "talent_link_profile.db")
    
    def _get_offers_db_path(self) -> str:
        """Chemin vers la BD du service offers"""
        return os.path.join(self.backend_path, "service_offers", "talent_link_offers.db")
    
    def _get_messaging_db_path(self) -> str:
        """Chemin vers la BD du service messaging"""
        return os.path.join(self.backend_path, "service_messaging", "talent_link_messaging.db")
    
    def _connect_to_db(self, db_path: str) -> Optional[sqlite3.Connection]:
        """Connexion à une base de données SQLite"""
        if not os.path.exists(db_path):
            print(f"⚠️  Base de données non trouvée: {db_path}")
            return None
        
        try:
            conn = sqlite3.connect(db_path)
            conn.row_factory = sqlite3.Row  # Pour accéder aux colonnes par nom
            return conn
        except Exception as e:
            print(f"❌ Erreur connexion à {db_path}: {e}")
            return None
    
    def extract_users_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des utilisateurs du service auth"""
        db_path = self._get_auth_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            cursor = conn.execute("""
                SELECT id, name, prenom, email, role, est_actif, date_creation 
                FROM users 
                WHERE est_actif = 1
            """)
            
            users = []
            for row in cursor.fetchall():
                user_data = {
                    "user_id": row["id"],
                    "name": row["name"],
                    "prenom": row["prenom"],
                    "email": row["email"],
                    "role": row["role"],
                    "date_creation": row["date_creation"],
                    "type": "user_profile"
                }
                users.append(user_data)
            
            return users
            
        except Exception as e:
            print(f"❌ Erreur extraction users: {e}")
            return []
        finally:
            conn.close()
    
    def extract_candidates_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des candidats du service profile"""
        db_path = self._get_profile_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            cursor = conn.execute("""
                SELECT * FROM candidats
            """)
            
            candidates = []
            for row in cursor.fetchall():
                # Analyse des compétences et expériences JSON
                competences = json.loads(row["competences"] or "[]")
                experience = json.loads(row["experience"] or "[]")
                formations = json.loads(row["formation"] or "[]")
                langues = json.loads(row["langues"] or "[]")
                
                candidate_data = {
                    "candidat_id": row["id"],
                    "auth_user_id": row["auth_user_id"],
                    "name": row["name"],
                    "prenom": row["prenom"],
                    "ville": row["ville"],
                    "pays": row["pays"],
                    "resume_professionnel": row["resume_professionnel"],
                    "competences": [comp.get("name", "") for comp in competences if isinstance(comp, dict)],
                    "experience_summary": [exp.get("title", "") + " chez " + exp.get("company", "") 
                                         for exp in experience if isinstance(exp, dict)],
                    "formations": formations,
                    "langues": [lang.get("langue", "") for lang in langues if isinstance(lang, dict)],
                    "progression": row["progression"],
                    "type": "candidate_profile"
                }
                candidates.append(candidate_data)
            
            return candidates
            
        except Exception as e:
            print(f"❌ Erreur extraction candidates: {e}")
            return []
        finally:
            conn.close()
    
    def extract_recruiters_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des recruteurs du service profile"""
        db_path = self._get_profile_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            cursor = conn.execute("""
                SELECT * FROM recruteurs
            """)
            
            recruiters = []
            for row in cursor.fetchall():
                recruiter_data = {
                    "recruteur_id": row["id"],
                    "auth_user_id": row["auth_user_id"],
                    "name": row["name"],
                    "prenom": row["prenom"],
                    "entreprise": row["entreprise"],
                    "role": row["role"],
                    "description_entreprise": row["description_entreprise"],
                    "ville": row["ville"],
                    "pays": row["pays"],
                    "site_web": row["site_web"],
                    "type": "recruiter_profile"
                }
                recruiters.append(recruiter_data)
            
            return recruiters
            
        except Exception as e:
            print(f"❌ Erreur extraction recruiters: {e}")
            return []
        finally:
            conn.close()
    
    def extract_offers_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des offres d'emploi"""
        db_path = self._get_offers_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            cursor = conn.execute("""
                SELECT * FROM offers 
                WHERE statut IN ('published', 'draft')
            """)
            
            offers = []
            for row in cursor.fetchall():
                offer_data = {
                    "offer_id": row["id"],
                    "recruiter_user_id": row["recruiter_user_id"],
                    "titre": row["titre"],
                    "description": row["description"],
                    "type_contrat": row["type_contrat"],
                    "entreprise": row["entreprise"],
                    "localisation": row["localisation"],
                    "domaine": row["domaine"],
                    "mots_cles": row["mots_cles"],
                    "remote": row["remote"],
                    "salaire_min": row["salaire_min"],
                    "salaire_max": row["salaire_max"],
                    "experience_requise": row["experience_requise"],
                    "education_requise": row["education_requise"],
                    "statut": row["statut"],
                    "date_publication": row["date_publication"],
                    "type": "job_offer"
                }
                offers.append(offer_data)
            
            return offers
            
        except Exception as e:
            print(f"❌ Erreur extraction offers: {e}")
            return []
        finally:
            conn.close()
    
    def extract_applications_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des candidatures"""
        db_path = self._get_offers_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            cursor = conn.execute("""
                SELECT * FROM applications
            """)
            
            applications = []
            for row in cursor.fetchall():
                application_data = {
                    "application_id": row["id"],
                    "offre_id": row["offre_id"],
                    "auth_user_id": row["auth_user_id"],
                    "candidat_id": row["candidat_id"],
                    "statut": row["statut"],
                    "date_candidature": row["date_candidature"],
                    "message_motivation": row["message_motivation"],
                    "type": "job_application"
                }
                applications.append(application_data)
            
            return applications
            
        except Exception as e:
            print(f"❌ Erreur extraction applications: {e}")
            return []
        finally:
            conn.close()
    
    def extract_conversations_data(self) -> List[Dict[str, Any]]:
        """Extrait les données des conversations"""
        db_path = self._get_messaging_db_path()
        conn = self._connect_to_db(db_path)
        if not conn:
            return []
        
        try:
            # Récupérer les conversations avec le nombre de messages
            cursor = conn.execute("""
                SELECT c.*, 
                       COUNT(m.id) as message_count,
                       MAX(m.created_at) as last_message_date
                FROM conversations c
                LEFT JOIN messages m ON c.id = m.conversation_id
                GROUP BY c.id
            """)
            
            conversations = []
            for row in cursor.fetchall():
                conversation_data = {
                    "conversation_id": row["id"],
                    "candidate_user_id": row["candidate_user_id"],
                    "recruiter_user_id": row["recruiter_user_id"],
                    "application_id": row["application_id"],
                    "offer_id": row["offer_id"],
                    "message_count": row["message_count"],
                    "last_message_date": row["last_message_date"],
                    "is_archived": row["is_archived"],
                    "type": "conversation"
                }
                conversations.append(conversation_data)
            
            return conversations
            
        except Exception as e:
            print(f"❌ Erreur extraction conversations: {e}")
            return []
        finally:
            conn.close()
    
    def create_knowledge_entries(self, db: Session):
        """Crée les entrées de connaissances dans la base du chatbot"""
        print("🔄 Extraction des données des services TalentLink...")
        
        # Supprimer les anciennes entrées
        db.query(ChatbotKnowledgeDB).delete()
        db.commit()
        
        knowledge_entries = []
        
        # 1. Utilisateurs
        users = self.extract_users_data()
        for user in users:
            content = f"Utilisateur {user['name']} {user['prenom']} ({user['email']}) - Rôle: {user['role']}"
            knowledge_entries.append({
                "category": "users",
                "title": f"Profil utilisateur {user['name']} {user['prenom']}",
                "content": content,
                "keywords": [user['role'], "utilisateur", user.get('ville', '')],
                "source": "service_auth",
                "meta_data": json.dumps(user)
            })
        
        # 2. Candidats
        candidates = self.extract_candidates_data()
        for candidate in candidates:
            competences_str = ", ".join(candidate.get('competences', []))
            exp_str = "; ".join(candidate.get('experience_summary', []))
            content = f"""
            Candidat {candidate['name']} {candidate['prenom']} de {candidate.get('ville', '')}:
            - Compétences: {competences_str}
            - Expériences: {exp_str}
            - Résumé: {candidate.get('resume_professionnel', '')}
            """
            
            knowledge_entries.append({
                "category": "candidates", 
                "title": f"Profil candidat {candidate['name']} {candidate['prenom']}",
                "content": content.strip(),
                "keywords": candidate.get('competences', []) + [candidate.get('ville', ''), "candidat"],
                "source": "service_profile",
                "meta_data": json.dumps(candidate)
            })
        
        # 3. Recruteurs
        recruiters = self.extract_recruiters_data()
        for recruiter in recruiters:
            content = f"""
            Recruteur {recruiter['name']} {recruiter['prenom']} - {recruiter.get('role', '')}
            Entreprise: {recruiter.get('entreprise', '')}
            Description: {recruiter.get('description_entreprise', '')}
            Localisation: {recruiter.get('ville', '')}, {recruiter.get('pays', '')}
            """
            
            knowledge_entries.append({
                "category": "recruiters",
                "title": f"Profil recruteur {recruiter['name']} {recruiter['prenom']}",
                "content": content.strip(),
                "keywords": [recruiter.get('entreprise', ''), recruiter.get('ville', ''), "recruteur"],
                "source": "service_profile", 
                "meta_data": json.dumps(recruiter)
            })
        
        # 4. Offres d'emploi
        offers = self.extract_offers_data()
        for offer in offers:
            salary_info = ""
            if offer.get('salaire_min') and offer.get('salaire_max'):
                salary_info = f" - Salaire: {offer['salaire_min']}-{offer['salaire_max']}€"
            
            content = f"""
            Offre: {offer['titre']} chez {offer.get('entreprise', '')}
            Type: {offer.get('type_contrat', '')} - {offer.get('localisation', '')}
            Domaine: {offer.get('domaine', '')}
            Remote: {'Oui' if offer.get('remote') else 'Non'}{salary_info}
            Expérience requise: {offer.get('experience_requise', '')}
            Description: {offer.get('description', '')[:200]}...
            Mots-clés: {offer.get('mots_cles', '')}
            """
            
            keywords = [offer.get('type_contrat', ''), offer.get('domaine', ''), 
                   offer.get('entreprise', ''), offer.get('localisation', '')]
            if offer.get('mots_cles'):
                keywords.extend(offer['mots_cles'].split(','))
            
            knowledge_entries.append({
                "category": "offers",
                "title": f"Offre {offer['titre']} - {offer.get('entreprise', '')}",
                "content": content.strip(),
                "keywords": [tag.strip() for tag in keywords if tag and tag.strip()],
                "source": "service_offers",
                "meta_data": json.dumps(offer)
            })
        
        # 5. Candidatures 
        applications = self.extract_applications_data()
        app_stats = {}
        for app in applications:
            # Statistiques par statut
            status = app['statut']
            if status not in app_stats:
                app_stats[status] = 0
            app_stats[status] += 1
        
        # Créer une entrée de statistiques
        stats_content = f"""
        Statistiques des candidatures TalentLink:
        Total candidatures: {len(applications)}
        """ + "\n".join([f"- {status}: {count}" for status, count in app_stats.items()])
        
        knowledge_entries.append({
            "category": "statistics",
            "title": "Statistiques des candidatures",
            "content": stats_content,
            "keywords": ["statistiques", "candidatures", "données"],
            "source": "service_offers", 
            "meta_data": json.dumps(app_stats)
        })
        
        # 6. Conversations
        conversations = self.extract_conversations_data()
        if conversations:
            conv_content = f"""
            Activité de communication sur TalentLink:
            - {len(conversations)} conversations actives
            - Communication entre candidats et recruteurs
            """
            knowledge_entries.append({
                "category": "communications",
                "title": "Activité de communication",
                "content": conv_content,
                "keywords": ["communication", "conversations", "activité"],
                "source": "service_messaging",
                "meta_data": json.dumps({"total_conversations": len(conversations)})
            })
        
        # Sauvegarder toutes les entrées
        for entry in knowledge_entries:
            knowledge_obj = ChatbotKnowledgeDB(
                category=entry["category"],
                title=entry["title"], 
                content=entry["content"],
                keywords=json.dumps(entry["keywords"]),  # JSON string des mots-clés
                source=entry["source"],
                meta_data=entry["meta_data"],  # JSON string des métadonnées
                created_by=1,  # ID utilisateur système pour l'intégration automatique
                updated_at=datetime.utcnow()
            )
            db.add(knowledge_obj)
        
        db.commit()
        
        print(f"✅ {len(knowledge_entries)} entrées de connaissances créées")
        print(f"   - {len(users)} utilisateurs")
        print(f"   - {len(candidates)} candidats")
        print(f"   - {len(recruiters)} recruteurs")
        print(f"   - {len(offers)} offres")
        print(f"   - Statistiques et données de communication")
        
        return len(knowledge_entries)

def sync_all_data():
    """Fonction utilitaire pour synchroniser toutes les données"""
    integrator = TalentLinkDataIntegrator()
    db = SessionLocal()
    try:
        return integrator.create_knowledge_entries(db)
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Synchronisation de la base de connaissances TalentLink...")
    count = sync_all_data()
    print(f"✅ Synchronisation terminée: {count} entrées créées")