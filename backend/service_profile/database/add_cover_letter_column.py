"""
Migration pour ajouter la colonne lettre_motivation à la table candidats.
"""
import sqlite3
import os

def add_lettre_motivation_column():
    """Ajoute la colonne lettre_motivation si elle n'existe pas déjà."""
    # Chemin vers la base de données
    db_path = os.path.join(os.path.dirname(__file__), "database.db")
    
    if not os.path.exists(db_path):
        print(f"Base de données non trouvée: {db_path}")
        print("Elle sera créée automatiquement au premier démarrage du service.")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Vérifier si la colonne existe déjà
        cursor.execute("PRAGMA table_info(candidats)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "lettre_motivation" not in columns:
            print("Ajout de la colonne 'lettre_motivation' à la table candidats...")
            cursor.execute("""
                ALTER TABLE candidats 
                ADD COLUMN lettre_motivation TEXT
            """)
            conn.commit()
            print("✓ Colonne 'lettre_motivation' ajoutée avec succès!")
        else:
            print("La colonne 'lettre_motivation' existe déjà.")
        
        conn.close()
        
    except sqlite3.Error as e:
        print(f"Erreur lors de la migration: {e}")


if __name__ == "__main__":
    add_lettre_motivation_column()
