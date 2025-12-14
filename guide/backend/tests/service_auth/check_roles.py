import sqlite3
import os

# Chemin vers la base de données
current_dir = os.path.dirname(os.path.abspath(__file__))
database_path = os.path.join(current_dir, "database", "database.db")

conn = sqlite3.connect(database_path)
cursor = conn.cursor()

# Vérifier le rôle de user1@gmail.com
cursor.execute('SELECT id, email, role FROM users WHERE email = ?', ("user1@gmail.com",))
user = cursor.fetchone()

if user:
    print(f"Utilisateur trouvé: ID={user[0]}, Email={user[1]}, Role='{user[2]}' (type: {type(user[2])})")
else:
    print("Utilisateur non trouvé")

# Voir tous les rôles
cursor.execute('SELECT DISTINCT role FROM users')
roles = cursor.fetchall()
print(f"Rôles dans la base: {[r[0] for r in roles]}")

conn.close()