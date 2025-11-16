"""Migration helper: add reset_token and reset_token_expiry columns to users table.

Usage:
  python ensure_reset_columns.py

This script is idempotent: it checks existing columns and only adds missing ones.
It is written for the project's SQLite DB used in `service_auth/database/database.db`.
"""
import os
import sqlite3
import sys


def get_db_path():
    this_dir = os.path.dirname(os.path.abspath(__file__))
    # project layout: service_auth/migrations/ --> ../database/database.db
    db_path = os.path.join(this_dir, '..', 'database', 'database.db')
    db_path = os.path.abspath(db_path)
    return db_path


def column_exists(conn, table, column_name):
    cur = conn.execute(f"PRAGMA table_info('{table}')")
    cols = [row[1] for row in cur.fetchall()]
    return column_name in cols


def add_column(conn, table, column_def):
    sql = f"ALTER TABLE {table} ADD COLUMN {column_def};"
    conn.execute(sql)


def main():
    db_path = get_db_path()
    if not os.path.exists(db_path):
        print(f"ERROR: database file not found at {db_path}")
        sys.exit(1)

    print(f"Using database: {db_path}")
    conn = sqlite3.connect(db_path)
    try:
        table = 'users'
        # desired columns
        cols = [
            ("reset_token", "TEXT"),
            ("reset_token_expiry", "TEXT")
        ]

        for name, col_type in cols:
            if column_exists(conn, table, name):
                print(f"Column '{name}' already exists, skipping.")
            else:
                print(f"Adding column '{name}' ({col_type}) to {table}...")
                add_column(conn, table, f"{name} {col_type}")
                print(f"Added '{name}'.")

        conn.commit()
        print("Migration completed successfully.")
    finally:
        conn.close()


if __name__ == '__main__':
    main()
