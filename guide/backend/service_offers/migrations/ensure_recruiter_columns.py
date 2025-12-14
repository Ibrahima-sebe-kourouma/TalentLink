import sqlite3
import os

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(os.path.dirname(CURRENT_DIR), 'database', 'database.db')


def ensure_recruiter_columns():
    """Ensure the offers table has recruiter_user_id column (SQLite only)."""
    try:
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        # Check columns
        cur.execute("PRAGMA table_info(offers)")
        cols = {row[1] for row in cur.fetchall()}  # name is at index 1
        if 'recruiter_user_id' not in cols:
            cur.execute("ALTER TABLE offers ADD COLUMN recruiter_user_id INTEGER")
            conn.commit()
    except Exception:
        # We silently ignore migration issues to not block startup in dev
        pass
    finally:
        try:
            conn.close()
        except Exception:
            pass
