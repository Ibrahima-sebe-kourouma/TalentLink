import os
from pathlib import Path
import base64
from pdf2image import convert_from_path
import chromadb
from openai import OpenAI
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv()

# Initialisation du client OpenAI
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class TalenlinkRAG:
    def __init__(self, data_dir="./data", persist_dir="./chroma_db"):
        self.data_dir = Path(data_dir)
        self.persist_dir = Path(persist_dir)
        
        print("🔄 Initialisation du RAG TalentLink avec Vision.....")
        
        # Initialiser ChromaDB
        self.client_chroma = chromadb.PersistentClient(path=str(self.persist_dir))
        self.collection = self.client_chroma.get_or_create_collection(
            name="talenlink_docs",
            metadata={"description": "Documentation TalentLink avec images"}
        )
        
        print("✅ RAG initialisé\n")
    
    def encode_image(self, image_path):
        """Encoder une image en base64 pour l'API OpenAI"""
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')
    
    def extract_text_from_pdf_with_vision(self, pdf_path):
        """Extraire le texte ET analyser les images avec GPT-4 Vision"""
        print(f"   📄 Conversion du PDF en images...")
        
        # Convertir le PDF en images (une image par page)
        try:
            images = convert_from_path(pdf_path, dpi=200)
        except Exception as e:
            print(f"   ❌ Erreur conversion PDF: {e}")
            return []
        
        print(f"   → {len(images)} pages à analyser")
        
        all_page_texts = []
        
        for i, image in enumerate(images):
            print(f"   🔍 Analyse de la page {i+1}/{len(images)} avec GPT-4 Vision...")
            
            # Sauvegarder temporairement l'image
            temp_image_path = f"temp_page_{i}.png"
            image.save(temp_image_path, 'PNG')
            
            # Encoder l'image en base64
            base64_image = self.encode_image(temp_image_path)
            
            try:
                # Utiliser GPT-4 Vision pour extraire TOUT le contenu de la page
                response = client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text",
                                    "text": (
                                        "Analyse cette page de documentation technique et extrais TOUT le contenu:\n"
                                        "- Le texte écrit\n"
                                        "- Les diagrammes (décris-les en détail: cas d'utilisation, séquence, classes, etc.)\n"
                                        "- Les tableaux (reproduis leur structure)\n"
                                        "- Les schémas et graphiques (explique ce qu'ils représentent)\n"
                                        "- Les relations entre les éléments\n\n"
                                        "Sois très détaillé et exhaustif. C'est pour un système RAG."
                                    )
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{base64_image}"
                                    }
                                }
                            ]
                        }
                    ],
                    max_tokens=4096
                )
                
                page_content = response.choices[0].message.content
                all_page_texts.append({
                    'page': i + 1,
                    'content': page_content
                })
                
                print(f"   ✅ Page {i+1} analysée ({len(page_content)} caractères extraits)")
                
            except Exception as e:
                print(f"   ❌ Erreur analyse page {i+1}: {e}")
            
            # Supprimer l'image temporaire
            try:
                os.remove(temp_image_path)
            except:
                pass
        
        return all_page_texts
    
    def chunk_text(self, text, chunk_size=1000, overlap=100):
        """Découper le texte en chunks avec overlap"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = ' '.join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks
    
    def create_embedding(self, text):
        """Créer un embedding avec OpenAI"""
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def load_documents(self):
        """Charger tous les PDFs et créer la base vectorielle"""
        print("📚 Chargement des documents avec analyse Vision...\n")
        
        # Vérifier si la collection est déjà remplie
        if self.collection.count() > 0:
            print(f"✅ Base vectorielle déjà chargée avec {self.collection.count()} chunks\n")
            return
        
        pdf_files = list(self.data_dir.glob("*.pdf"))
        if not pdf_files:
            print("❌ Aucun fichier PDF trouvé dans ./data")
            return
        
        all_chunks = []
        all_metadatas = []
        all_ids = []
        all_embeddings = []
        
        for pdf_file in pdf_files:
            print(f"📄 Traitement: {pdf_file.name}")
            
            # Extraire le contenu avec Vision (inclut texte + analyse d'images)
            pages_content = self.extract_text_from_pdf_with_vision(pdf_file)
            
            if not pages_content:
                print(f"   ⚠️ Aucun contenu extrait")
                continue
            
            # Traiter chaque page
            for page_data in pages_content:
                page_num = page_data['page']
                content = page_data['content']
                
                # Découper en chunks si le contenu est trop long
                chunks = self.chunk_text(content, chunk_size=1000, overlap=100)
                
                print(f"   → Page {page_num}: {len(chunks)} chunk(s) créé(s)")
                
                # Créer les embeddings
                for i, chunk in enumerate(chunks):
                    embedding = self.create_embedding(chunk)
                    
                    all_chunks.append(chunk)
                    all_embeddings.append(embedding)
                    all_metadatas.append({
                        "source": pdf_file.name,
                        "page": page_num,
                        "chunk_id": i
                    })
                    all_ids.append(f"{pdf_file.stem}_page{page_num}_chunk{i}")
            
            print(f"   ✅ {pdf_file.name} traité\n")
        
        # Ajouter à ChromaDB
        if all_chunks:
            print(f"💾 Stockage de {len(all_chunks)} chunks dans ChromaDB...")
            self.collection.add(
                embeddings=all_embeddings,
                documents=all_chunks,
                metadatas=all_metadatas,
                ids=all_ids
            )
            print(f"✅ Base vectorielle créée avec {len(all_chunks)} chunks!\n")
        else:
            print("❌ Aucun chunk à stocker")
    
    def search_context(self, query, n_results=5):
        """Rechercher les chunks les plus pertinents"""
        # Créer l'embedding de la question
        query_embedding = self.create_embedding(query)
        
        # Rechercher dans ChromaDB
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Formater le contexte
        context = ""
        for i, (doc, metadata) in enumerate(zip(results['documents'][0], results['metadatas'][0])):
            context += f"\n--- Extrait {i+1} (Source: {metadata['source']}, Page {metadata['page']}) ---\n"
            context += doc + "\n"
        
        return context
    
    def ask_with_context(self, question):
        """Poser une question avec le contexte RAG"""
        print("🔍 Recherche dans la documentation...\n")
        
        # Récupérer le contexte pertinent
        context = self.search_context(question)
        
        # Créer le prompt avec contexte
        system_context = (
            "Tu es un assistant expert sur le projet TalentLink. "
            "Utilise UNIQUEMENT les informations fournies dans le contexte ci-dessous pour répondre. "
            "Si l'information n'est pas dans le contexte, dis-le clairement. "
            "Réponds en français de manière claire et concise.\n\n"
            f"CONTEXTE:\n{context}"
        )
        
        print("🤖 Génération de la réponse avec GPT-4o-mini...\n")
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_context},
                {"role": "user", "content": question}
            ]
        )
        
        return response.choices[0].message.content


def main():
    print("=" * 60)
    print("🚀 RAG TalentLink - Assistant Documentation (OpenAI)")
    print("=" * 60 + "\n")
    
    # Initialiser le RAG
    rag = TalenlinkRAG()
    
    # Charger les documents
    rag.load_documents()
    
    # Boucle interactive
    print("💬 Pose tes questions sur TalentLink (tape 'quit' pour quitter)\n")
    
    while True:
        question = input("\n❓ Ta question: ")
        
        if question.lower() in ['quit', 'exit', 'q']:
            print("\n👋 Au revoir!")
            break
        
        if not question.strip():
            continue
        
        print()
        try:
            response = rag.ask_with_context(question)
            print("📝 Réponse:")
            print("-" * 60)
            print(response)
            print("-" * 60)
        except Exception as e:
            print(f"❌ Erreur: {e}")


if __name__ == "__main__":
    main()
