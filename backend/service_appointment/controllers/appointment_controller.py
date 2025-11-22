from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from models.appointment import Appointment, AppointmentSlot, AppointmentCandidate, AppointmentStatus, AppointmentMode
from datetime import datetime
from typing import List, Dict, Optional
import requests
import json

class AppointmentController:
    """Contrôleur principal pour la gestion des rendez-vous"""

    def __init__(self, db: Session):
        self.db = db
        # URLs des autres services
        self.mail_service_url = "http://localhost:8005"
        self.messaging_service_url = "http://localhost:8004"

    # ============ GESTION DES CANDIDATS ÉLIGIBLES ============

    def add_candidate_to_appointments(self, recruiter_id: int, candidate_data: Dict) -> bool:
        """Ajoute un candidat à la liste des rendez-vous possibles"""
        try:
            # Vérifier si le candidat n'est pas déjà dans la liste pour cette offre
            existing = self.db.query(AppointmentCandidate).filter(
                and_(
                    AppointmentCandidate.recruiter_id == recruiter_id,
                    AppointmentCandidate.candidate_id == candidate_data['candidate_id'],
                    AppointmentCandidate.offer_id == candidate_data['offer_id']
                )
            ).first()

            if existing:
                return True  # Déjà ajouté

            # Créer un nouveau candidat éligible
            new_candidate = AppointmentCandidate(
                recruiter_id=recruiter_id,
                candidate_id=candidate_data['candidate_id'],
                offer_id=candidate_data['offer_id'],
                candidate_name=candidate_data['candidate_name'],
                candidate_email=candidate_data['candidate_email'],
                position_title=candidate_data['position_title'],
                company_name=candidate_data['company_name'],
                application_status=candidate_data['application_status']
            )

            self.db.add(new_candidate)
            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de l'ajout du candidat: {str(e)}")
            return False

    def get_eligible_candidates(self, recruiter_id: int) -> List[Dict]:
        """Récupère la liste des candidats éligibles pour les rendez-vous"""
        try:
            candidates = self.db.query(AppointmentCandidate).filter(
                AppointmentCandidate.recruiter_id == recruiter_id
            ).order_by(desc(AppointmentCandidate.added_at)).all()

            return [{
                'id': candidate.id,
                'candidate_id': candidate.candidate_id,
                'candidate_name': candidate.candidate_name,
                'candidate_email': candidate.candidate_email,
                'position_title': candidate.position_title,
                'company_name': candidate.company_name,
                'application_status': candidate.application_status,
                'added_at': candidate.added_at.isoformat(),
                'has_appointment': candidate.has_appointment,
                'offer_id': candidate.offer_id
            } for candidate in candidates]

        except Exception as e:
            print(f"Erreur lors de la récupération des candidats: {str(e)}")
            return []

    # ============ CRÉATION DE RENDEZ-VOUS PAR LE RECRUTEUR ============

    def create_appointment_proposal(self, recruiter_id: int, appointment_data: Dict) -> Optional[Dict]:
        """Crée une proposition de rendez-vous avec 3 créneaux"""
        try:
            # Vérifier que le candidat est éligible
            eligible_candidate = self.db.query(AppointmentCandidate).filter(
                and_(
                    AppointmentCandidate.recruiter_id == recruiter_id,
                    AppointmentCandidate.candidate_id == appointment_data['candidate_id'],
                    AppointmentCandidate.offer_id == appointment_data['offer_id']
                )
            ).first()

            if not eligible_candidate:
                raise Exception("Candidat non éligible pour un rendez-vous")

            # Créer le rendez-vous principal
            new_appointment = Appointment(
                recruiter_id=recruiter_id,
                candidate_id=appointment_data['candidate_id'],
                offer_id=appointment_data['offer_id'],
                position_title=eligible_candidate.position_title,
                company_name=eligible_candidate.company_name,
                status=AppointmentStatus.PENDING
            )

            self.db.add(new_appointment)
            self.db.flush()  # Pour obtenir l'ID

            # Ajouter les 3 créneaux proposés
            slots_data = appointment_data['proposed_slots']  # Liste de 3 datetime
            for slot_datetime in slots_data:
                slot = AppointmentSlot(
                    appointment_id=new_appointment.id,
                    proposed_datetime=datetime.fromisoformat(slot_datetime)
                )
                self.db.add(slot)

            # Marquer le candidat comme ayant un rendez-vous en cours
            eligible_candidate.has_appointment = True

            self.db.commit()

            # Envoyer un email au candidat
            self._send_appointment_proposal_email(new_appointment)

            return {
                'appointment_id': new_appointment.id,
                'status': 'success',
                'message': 'Proposition de rendez-vous créée et envoyée au candidat'
            }

        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de la création du rendez-vous: {str(e)}")
            return None

    def get_recruiter_appointments(self, recruiter_id: int) -> List[Dict]:
        """Récupère tous les rendez-vous d'un recruteur"""
        try:
            appointments = self.db.query(Appointment).filter(
                Appointment.recruiter_id == recruiter_id
            ).order_by(desc(Appointment.created_at)).all()

            result = []
            for appointment in appointments:
                # Récupérer les créneaux
                slots = [{
                    'id': slot.id,
                    'proposed_datetime': slot.proposed_datetime.isoformat(),
                    'is_chosen': slot.is_chosen
                } for slot in appointment.proposed_slots]

                result.append({
                    'id': appointment.id,
                    'candidate_id': appointment.candidate_id,
                    'position_title': appointment.position_title,
                    'company_name': appointment.company_name,
                    'status': appointment.status.value,
                    'created_at': appointment.created_at.isoformat(),
                    'chosen_datetime': appointment.chosen_datetime.isoformat() if appointment.chosen_datetime else None,
                    'mode': appointment.mode.value if appointment.mode else None,
                    'location_details': appointment.location_details,
                    'additional_notes': appointment.additional_notes,
                    'proposed_slots': slots
                })

            return result

        except Exception as e:
            print(f"Erreur lors de la récupération des rendez-vous: {str(e)}")
            return []

    # ============ GESTION CÔTÉ CANDIDAT ============

    def get_candidate_appointments(self, candidate_id: int) -> List[Dict]:
        """Récupère tous les rendez-vous d'un candidat"""
        try:
            appointments = self.db.query(Appointment).filter(
                Appointment.candidate_id == candidate_id
            ).order_by(desc(Appointment.created_at)).all()

            result = []
            for appointment in appointments:
                slots = [{
                    'id': slot.id,
                    'proposed_datetime': slot.proposed_datetime.isoformat(),
                    'is_chosen': slot.is_chosen
                } for slot in appointment.proposed_slots]

                result.append({
                    'id': appointment.id,
                    'position_title': appointment.position_title,
                    'company_name': appointment.company_name,
                    'status': appointment.status.value,
                    'created_at': appointment.created_at.isoformat(),
                    'chosen_datetime': appointment.chosen_datetime.isoformat() if appointment.chosen_datetime else None,
                    'mode': appointment.mode.value if appointment.mode else None,
                    'location_details': appointment.location_details,
                    'additional_notes': appointment.additional_notes,
                    'proposed_slots': slots
                })

            return result

        except Exception as e:
            print(f"Erreur lors de la récupération des rendez-vous candidat: {str(e)}")
            return []

    def candidate_choose_slot(self, candidate_id: int, appointment_id: int, slot_id: int) -> bool:
        """Le candidat choisit un créneau"""
        try:
            # Vérifier l'appartenance
            appointment = self.db.query(Appointment).filter(
                and_(
                    Appointment.id == appointment_id,
                    Appointment.candidate_id == candidate_id,
                    Appointment.status == AppointmentStatus.PENDING
                )
            ).first()

            if not appointment:
                return False

            # Trouver le créneau choisi
            chosen_slot = None
            for slot in appointment.proposed_slots:
                if slot.id == slot_id:
                    slot.is_chosen = True
                    chosen_slot = slot
                else:
                    slot.is_chosen = False

            if not chosen_slot:
                return False

            # Mettre à jour le rendez-vous
            appointment.status = AppointmentStatus.CONFIRMED
            appointment.chosen_datetime = chosen_slot.proposed_datetime

            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors du choix du créneau: {str(e)}")
            return False

    def candidate_refuse_all_slots(self, candidate_id: int, appointment_id: int) -> bool:
        """Le candidat refuse tous les créneaux et veut créer une conversation"""
        try:
            appointment = self.db.query(Appointment).filter(
                and_(
                    Appointment.id == appointment_id,
                    Appointment.candidate_id == candidate_id,
                    Appointment.status == AppointmentStatus.PENDING
                )
            ).first()

            if not appointment:
                return False

            # Marquer comme refusé
            appointment.status = AppointmentStatus.REFUSED
            self.db.commit()

            # Créer automatiquement une conversation
            self._create_automatic_conversation(appointment)

            return True

        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors du refus des créneaux: {str(e)}")
            return False

    # ============ FINALISATION PAR LE RECRUTEUR ============

    def complete_appointment_details(self, recruiter_id: int, appointment_id: int, details: Dict) -> bool:
        """Le recruteur ajoute les détails finaux du rendez-vous"""
        try:
            appointment = self.db.query(Appointment).filter(
                and_(
                    Appointment.id == appointment_id,
                    Appointment.recruiter_id == recruiter_id,
                    Appointment.status == AppointmentStatus.CONFIRMED
                )
            ).first()

            if not appointment:
                return False

            # Ajouter les détails
            appointment.mode = AppointmentMode(details['mode'])
            appointment.location_details = details['location_details']
            appointment.additional_notes = details.get('additional_notes', '')
            appointment.status = AppointmentStatus.COMPLETED

            self.db.commit()
            return True

        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de la finalisation: {str(e)}")
            return False

    def send_final_appointment_email(self, recruiter_id: int, appointment_id: int) -> bool:
        """Envoie l'email final avec tous les détails au candidat"""
        try:
            appointment = self.db.query(Appointment).filter(
                and_(
                    Appointment.id == appointment_id,
                    Appointment.recruiter_id == recruiter_id,
                    Appointment.status == AppointmentStatus.COMPLETED
                )
            ).first()

            if not appointment:
                return False

            self._send_final_appointment_email(appointment)
            return True

        except Exception as e:
            print(f"Erreur lors de l'envoi de l'email final: {str(e)}")
            return False

    # ============ MÉTHODES PRIVÉES POUR LES INTÉGRATIONS ============

    def _send_appointment_proposal_email(self, appointment: Appointment):
        """Envoie un email de proposition de rendez-vous"""
        try:
            # Récupérer l'email du candidat
            candidate = self.db.query(AppointmentCandidate).filter(
                and_(
                    AppointmentCandidate.candidate_id == appointment.candidate_id,
                    AppointmentCandidate.offer_id == appointment.offer_id
                )
            ).first()

            if not candidate:
                return

            # Préparer les créneaux pour l'email
            slots_text = chr(10).join([
                f"- {slot.proposed_datetime.strftime('%d/%m/%Y à %H:%M')}"
                for slot in appointment.proposed_slots
            ])

            email_data = {
                "to_email": candidate.candidate_email,
                "subject": f"Proposition de rendez-vous - {appointment.position_title}",
                "body": f"Bonjour,{chr(10)}{chr(10)}{appointment.company_name} souhaite vous proposer un entretien pour le poste de {appointment.position_title}.{chr(10)}{chr(10)}Voici les créneaux proposés :{chr(10)}{slots_text}{chr(10)}{chr(10)}Veuillez vous connecter à votre espace candidat pour choisir le créneau qui vous convient le mieux.{chr(10)}{chr(10)}Cordialement,{chr(10)}L'équipe TalentLink"
            }

            # Appel au service de mail
            response = requests.post(
                f"{self.mail_service_url}/mail/appointment",
                json=email_data,
                timeout=5
            )

        except Exception as e:
            print(f"Erreur envoi email proposition: {str(e)}")

    def _send_final_appointment_email(self, appointment: Appointment):
        """Envoie l'email final avec tous les détails"""
        try:
            candidate = self.db.query(AppointmentCandidate).filter(
                and_(
                    AppointmentCandidate.candidate_id == appointment.candidate_id,
                    AppointmentCandidate.offer_id == appointment.offer_id
                )
            ).first()

            if not candidate:
                return

            # Préparer les détails
            mode_text = {
                'online': 'En ligne',
                'physical': 'En présentiel', 
                'phone': 'Par téléphone'
            }.get(appointment.mode.value, 'Non spécifié')

            email_data = {
                "to_email": candidate.candidate_email,
                "subject": f"Confirmation de rendez-vous - {appointment.position_title}",
                "body": f"Bonjour,{chr(10)}{chr(10)}Votre rendez-vous pour le poste de {appointment.position_title} chez {appointment.company_name} est confirmé.{chr(10)}{chr(10)}Détails du rendez-vous :{chr(10)}- Date et heure : {appointment.chosen_datetime.strftime('%d/%m/%Y à %H:%M')}{chr(10)}- Mode : {mode_text}{chr(10)}- Lieu/Lien : {appointment.location_details}{chr(10)}{chr(10)}Notes supplémentaires :{chr(10)}{appointment.additional_notes or 'Aucune note supplémentaire'}{chr(10)}{chr(10)}Nous vous souhaitons bonne chance pour cet entretien !{chr(10)}{chr(10)}Cordialement,{chr(10)}L'équipe TalentLink"
            }

            response = requests.post(
                f"{self.mail_service_url}/mail/appointment",
                json=email_data,
                timeout=5
            )

        except Exception as e:
            print(f"Erreur envoi email final: {str(e)}")

    def _create_automatic_conversation(self, appointment: Appointment):
        """Crée automatiquement une conversation quand le candidat refuse tous les créneaux"""
        try:
            conversation_data = {
                "candidate_user_id": appointment.candidate_id,
                "recruiter_user_id": appointment.recruiter_id,
                "offer_id": appointment.offer_id
            }

            # Créer la conversation
            print(f"[appointment] Création conversation automatique: {conversation_data}")
            conv_response = requests.post(
                f"{self.messaging_service_url}/conversations/",
                json=conversation_data,
                timeout=5
            )

            if conv_response.status_code == 200:
                conversation_result = conv_response.json()
                conversation_id = conversation_result.get('id')
                print(f"[appointment] Conversation créée avec ID: {conversation_id}")
                
                # Envoyer le message automatique
                message_data = {
                    "conversation_id": conversation_id,
                    "sender_user_id": appointment.candidate_id,
                    "content": f"Bonjour, je voudrais un autre créneau horaire pour le poste de {appointment.position_title}. Les créneaux proposés ne me conviennent pas. Pourriez-vous me proposer d'autres dates ? Merci."
                }

                msg_response = requests.post(
                    f"{self.messaging_service_url}/messages/",
                    json=message_data,
                    timeout=5
                )
                
                if msg_response.status_code == 200:
                    print(f"[appointment] Message automatique envoyé avec succès")
                else:
                    print(f"[appointment] Erreur envoi message automatique: {msg_response.status_code} - {msg_response.text}")
            else:
                print(f"[appointment] Erreur création conversation: {conv_response.status_code} - {conv_response.text}")

        except Exception as e:
            print(f"Erreur création conversation automatique: {str(e)}")