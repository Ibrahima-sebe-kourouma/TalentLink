"""
Script de migration pour ajouter le champ places_restantes aux offres existantes
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.database import get_db
from models.offer import OfferDB
from sqlalchemy import text

def migrate_add_places_restantes():
    """Ajoute le champ places_restantes et l'initialise à nb_postes pour les offres existantes"""
    db = next(get_db())
    
    try:
        # Vérifier si la colonne existe déjà
        result = db.execute(text("PRAGMA table_info(offers)"))
        columns = [row[1] for row in result.fetchall()]
        
        if 'places_restantes' not in columns:
            print("Ajout de la colonne places_restantes...")
            # Ajouter la colonne
            db.execute(text("ALTER TABLE offers ADD COLUMN places_restantes INTEGER DEFAULT 1"))
            
            # Initialiser places_restantes = nb_postes pour toutes les offres existantes
            print("Initialisation des places restantes...")
            db.execute(text("UPDATE offers SET places_restantes = nb_postes WHERE places_restantes IS NULL"))
            
            db.commit()
            print("Migration terminée avec succès!")
        else:
            print("La colonne places_restantes existe déjà. Migration non nécessaire.")
            
        # Afficher le statut des offres
        offers = db.query(OfferDB).all()
        print(f"\nStatut des {len(offers)} offres:")
        for offer in offers:
            print(f"- Offre {offer.id}: {offer.titre} - {offer.places_restantes}/{offer.nb_postes} places disponibles (statut: {offer.statut.value})")
            
    except Exception as e:
        print(f"Erreur lors de la migration: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate_add_places_restantes()