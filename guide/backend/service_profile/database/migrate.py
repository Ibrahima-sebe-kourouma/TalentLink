import sqlite3

db_path = "database.db"

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

try:
    cursor.execute("ALTER TABLE candidats ADD COLUMN progression INTEGER DEFAULT 1;")
    conn.commit()
    print("✅ Colonne 'progression' ajoutée avec succès !")
except sqlite3.OperationalError as e:
    print(f"⚠️ Erreur ou colonne déjà existante : {e}")

conn.close()
