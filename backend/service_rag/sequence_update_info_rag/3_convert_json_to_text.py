"""
Script de transformation des fichiers JSON en format texte pour le RAG
Convertit les données structurées en texte lisible et compréhensible
"""

import json
import os
from datetime import datetime

# Obtenir le répertoire du script et remonter au dossier BACKEND_RAG
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_RAG_DIR = os.path.dirname(SCRIPT_DIR)

# Dossiers
INPUT_DIR = os.path.join(BACKEND_RAG_DIR, 'data')
OUTPUT_DIR = os.path.join(BACKEND_RAG_DIR, 'data')

# Configuration des transformations par type de données
TRANSFORMATIONS = {
    'candidats': {
        'title': 'Profil Candidat',
        'fields': {
            'id': 'ID',
            'name': 'Nom',
            'prenom': 'Prénom',
            'email': 'Email',
            'telephone': 'Téléphone',
            'adresse': 'Adresse',
            'ville': 'Ville',
            'pays': 'Pays',
            'code_postal': 'Code postal',
            'resume_professionnel': 'Résumé professionnel',
            'experience': 'Expériences',
            'formation': 'Formation',
            'competences': 'Compétences',
            'langues': 'Langues',
            'certifications': 'Certifications',
            'projets': 'Projets',
            'lien': 'Portfolio',
            'cv': 'CV',
            'date_creation': 'Date de création',
            'progression': 'Progression du profil'
        }
    },
    'recruteurs': {
        'title': 'Profil Recruteur',
        'fields': {
            'id': 'ID',
            'auth_user_id': 'ID utilisateur',
            'nom_entreprise': 'Entreprise',
            'secteur_activite': 'Secteur d\'activité',
            'telephone': 'Téléphone',
            'adresse': 'Adresse',
            'ville': 'Ville',
            'pays': 'Pays',
            'code_postal': 'Code postal',
            'site_web': 'Site web',
            'description': 'Description',
            'date_creation': 'Date de création'
        }
    },
    'offers': {
        'title': 'Offre d\'emploi',
        'fields': {
            'id': 'ID',
            'title': 'Titre du poste',
            'company': 'Entreprise',
            'location': 'Localisation',
            'salary': 'Salaire',
            'contract_type': 'Type de contrat',
            'description': 'Description',
            'requirements': 'Exigences',
            'benefits': 'Avantages',
            'status': 'Statut',
            'created_at': 'Date de publication',
            'deadline': 'Date limite'
        }
    },
    'applications': {
        'title': 'Candidature',
        'fields': {
            'id': 'ID',
            'offer_id': 'ID offre',
            'candidate_id': 'ID candidat',
            'status': 'Statut',
            'cover_letter': 'Lettre de motivation',
            'applied_at': 'Date de candidature',
            'updated_at': 'Dernière modification'
        }
    },
    'appointments': {
        'title': 'Rendez-vous',
        'fields': {
            'id': 'ID',
            'recruiter_id': 'ID recruteur',
            'title': 'Titre',
            'description': 'Description',
            'date': 'Date',
            'duration': 'Durée',
            'location': 'Lieu',
            'status': 'Statut',
            'created_at': 'Créé le'
        }
    },
    'appointment_candidates': {
        'title': 'Participant au rendez-vous',
        'fields': {
            'id': 'ID',
            'appointment_id': 'ID rendez-vous',
            'candidate_id': 'ID candidat',
            'status': 'Statut',
            'confirmed_at': 'Confirmé le'
        }
    },
    'appointment_slots': {
        'title': 'Créneau de rendez-vous',
        'fields': {
            'id': 'ID',
            'appointment_id': 'ID rendez-vous',
            'start_time': 'Heure de début',
            'end_time': 'Heure de fin',
            'is_available': 'Disponible'
        }
    },
    'profile_views': {
        'title': 'Vue de profil',
        'fields': {
            'id': 'ID',
            'profile_id': 'ID profil',
            'viewer_id': 'ID visiteur',
            'viewed_at': 'Vu le'
        }
    }
}


def parse_json_field(value):
    """Parse les champs JSON stockés comme string"""
    if not value or value in ['null', 'None', '']:
        return None
    
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
            if parsed and parsed != 'null':
                return parsed
        except:
            return value
    
    return value


def format_value(key, value):
    """Formate une valeur selon son type"""
    if value is None or value == '' or value == 'null':
        return None
    
    # Listes (expériences, formations, etc.)
    if isinstance(value, list) and value:
        formatted_items = []
        for item in value:
            if isinstance(item, dict):
                # Filtrer les valeurs vides
                filtered = {k: v for k, v in item.items() if v and v != ''}
                if filtered:
                    formatted_items.append(str(filtered))
        return ', '.join(formatted_items) if formatted_items else None
    
    # Dictionnaires
    if isinstance(value, dict):
        filtered = {k: v for k, v in value.items() if v and v != ''}
        return str(filtered) if filtered else None
    
    return str(value)


def record_to_text(record, table_name):
    """Convertit un enregistrement en texte lisible"""
    config = TRANSFORMATIONS.get(table_name, {})
    title = config.get('title', table_name)
    fields_map = config.get('fields', {})
    
    lines = [f"=== {title} ===\n"]
    
    for key, value in record.items():
        # Parser les valeurs JSON
        parsed_value = parse_json_field(value)
        formatted_value = format_value(key, parsed_value)
        
        if formatted_value:
            field_label = fields_map.get(key, key)
            lines.append(f"{field_label}: {formatted_value}")
    
    lines.append("")  # Ligne vide entre les enregistrements
    return '\n'.join(lines)


def convert_json_to_text(input_file):
    """Convertit un fichier JSON en fichier texte"""
    print(f"\n📄 Traitement: {os.path.basename(input_file)}")
    
    try:
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        table_name = data.get('table_name', '')
        records = data.get('data', [])
        
        if not records:
            print(f"   ⚠️  Aucun enregistrement trouvé")
            return
        
        # Générer le texte
        text_content = []
        text_content.append(f"# BASE DE DONNÉES: {table_name.upper()}")
        text_content.append(f"# Extraction du: {data.get('extracted_at', 'N/A')}")
        text_content.append(f"# Nombre d'enregistrements: {len(records)}")
        text_content.append("\n" + "="*80 + "\n")
        
        for record in records:
            text_content.append(record_to_text(record, table_name))
        
        # Sauvegarder en fichier texte
        output_file = input_file.replace('.json', '.txt')
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(text_content))
        
        print(f"   ✅ {len(records)} enregistrement(s) convertis")
        print(f"   📝 Sauvegardé: {os.path.basename(output_file)}")
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")


def convert_all_service_files():
    """Convertit tous les fichiers service_*.json en texte"""
    print("="*80)
    print("🔄 CONVERSION DES FICHIERS JSON EN TEXTE POUR LE RAG")
    print("="*80)
    
    if not os.path.exists(INPUT_DIR):
        print(f"❌ Dossier {INPUT_DIR} introuvable")
        return
    
    # Trouver tous les fichiers service_*.json
    json_files = [
        f for f in os.listdir(INPUT_DIR)
        if f.startswith('service_') and f.endswith('.json')
    ]
    
    if not json_files:
        print("⚠️  Aucun fichier service_*.json trouvé")
        return
    
    print(f"\n📊 {len(json_files)} fichier(s) à convertir\n")
    
    for json_file in json_files:
        input_path = os.path.join(INPUT_DIR, json_file)
        convert_json_to_text(input_path)
    
    print("\n" + "="*80)
    print("✅ Conversion terminée!")
    print(f"📁 Fichiers texte créés dans: {OUTPUT_DIR}")
    print("="*80)
    
    print("\n💡 Prochaine étape:")
    print("   1. Supprimez les anciens fichiers .json du dossier data (optionnel)")
    print("   2. Relancez le serveur RAG pour réindexer avec les fichiers .txt")
    print("   3. Les fichiers .txt seront mieux compris par le modèle !")


if __name__ == "__main__":
    convert_all_service_files()
