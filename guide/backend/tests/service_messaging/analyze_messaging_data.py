import sqlite3
import json
import os
from datetime import datetime

def analyze_sqlite_messaging_data():
    """Analyser les données existantes dans la base SQLite de messaging."""
    
    # Construire le chemin vers la base SQLite
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(backend_dir, 'service_messaging', 'database', 'messaging.db')
    
    print(f"🔍 Analyse de la base de données: {db_path}")
    
    if not os.path.exists(db_path):
        print("❌ Base de données SQLite non trouvée!")
        print("📍 Vérifiez que le service messaging a été lancé au moins une fois")
        return None
    
    # Connexion à SQLite
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    analysis = {
        "database_path": db_path,
        "timestamp": datetime.now().isoformat(),
        "tables": {},
        "data_sample": {}
    }
    
    try:
        # Lister toutes les tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print(f"📊 Tables trouvées: {len(tables)}")
        
        for table_name in tables:
            table = table_name[0]
            print(f"\n📋 Analyse de la table: {table}")
            
            # Structure de la table
            cursor.execute(f"PRAGMA table_info({table});")
            columns = cursor.fetchall()
            
            # Compter les lignes
            cursor.execute(f"SELECT COUNT(*) FROM {table};")
            row_count = cursor.fetchone()[0]
            
            analysis["tables"][table] = {
                "columns": [{"name": col[1], "type": col[2], "nullable": not col[3]} for col in columns],
                "row_count": row_count
            }
            
            print(f"   📈 Lignes: {row_count}")
            print(f"   🏗️  Colonnes: {[col[1] for col in columns]}")
            
            # Échantillon de données (5 premières lignes)
            if row_count > 0:
                cursor.execute(f"SELECT * FROM {table} LIMIT 5;")
                sample_data = cursor.fetchall()
                
                analysis["data_sample"][table] = [
                    dict(zip([col[1] for col in columns], row)) 
                    for row in sample_data
                ]
                
                print(f"   💾 Échantillon:")
                for i, row in enumerate(sample_data, 1):
                    print(f"      {i}. {row}")
        
        # Sauvegarder l'analyse
        analysis_file = os.path.join(backend_dir, 'messaging_data_analysis.json')
        with open(analysis_file, 'w', encoding='utf-8') as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"\n✅ Analyse sauvegardée dans: {analysis_file}")
        return analysis
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse: {e}")
        return None
        
    finally:
        conn.close()

if __name__ == "__main__":
    print("🚀 Démarrage de l'analyse des données SQLite Messaging")
    print("=" * 60)
    
    result = analyze_sqlite_messaging_data()
    
    if result:
        print("\n" + "=" * 60)
        print("📋 RÉSUMÉ DE L'ANALYSE:")
        print(f"   📁 Base de données: {result['database_path']}")
        for table, info in result['tables'].items():
            print(f"   📊 {table}: {info['row_count']} lignes")
        print("✅ Migration MongoDB possible!")
    else:
        print("\n❌ Analyse échouée - vérifiez la base SQLite")