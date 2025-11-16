"""
Script de test rapide pour vérifier le service offers
"""
import requests

API_URL = "http://localhost:8003"

print("=" * 60)
print("TEST DU SERVICE OFFERS")
print("=" * 60)

# Test 1: Root endpoint
print("\n1. Test du endpoint racine...")
try:
    res = requests.get(f"{API_URL}/")
    print(f"   Status: {res.status_code}")
    print(f"   Réponse: {res.json()}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 2: Liste toutes les offres (sans filtre)
print("\n2. Test GET /offers (toutes les offres)...")
try:
    res = requests.get(f"{API_URL}/offers")
    print(f"   Status: {res.status_code}")
    if res.ok:
        data = res.json()
        print(f"   ✅ Nombre d'offres trouvées: {len(data)}")
        if len(data) > 0:
            print(f"   Exemple (première offre):")
            print(f"      - ID: {data[0].get('id')}")
            print(f"      - Titre: {data[0].get('titre')}")
            print(f"      - Statut: {data[0].get('statut')}")
        else:
            print("   ⚠️ Aucune offre dans la base de données")
    else:
        print(f"   ❌ Erreur: {res.text}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 3: Liste des offres publiées uniquement
print("\n3. Test GET /offers?statut=published...")
try:
    res = requests.get(f"{API_URL}/offers", params={"statut": "published"})
    print(f"   Status: {res.status_code}")
    if res.ok:
        data = res.json()
        print(f"   ✅ Nombre d'offres publiées: {len(data)}")
        if len(data) > 0:
            for i, offer in enumerate(data[:3], 1):  # Afficher max 3
                print(f"   {i}. {offer.get('titre')} - {offer.get('entreprise')} ({offer.get('localisation')})")
    else:
        print(f"   ❌ Erreur: {res.text}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

# Test 4: Recherche avec query
print("\n4. Test GET /offers?q=développeur...")
try:
    res = requests.get(f"{API_URL}/offers", params={"q": "développeur"})
    print(f"   Status: {res.status_code}")
    if res.ok:
        data = res.json()
        print(f"   ✅ Résultats trouvés: {len(data)}")
    else:
        print(f"   ❌ Erreur: {res.text}")
except Exception as e:
    print(f"   ❌ Erreur: {e}")

print("\n" + "=" * 60)
print("FIN DES TESTS")
print("=" * 60)
