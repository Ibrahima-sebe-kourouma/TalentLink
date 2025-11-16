"""
Script de test pour le service d'email.
Teste l'envoi des différents types d'emails.
"""
import sys
import os

# Ajouter le répertoire parent au PYTHONPATH
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from services.email_service import email_service

def test_password_reset():
    """Test de l'email de réinitialisation de mot de passe."""
    print("🔧 Test : Email de réinitialisation de mot de passe...")
    success = email_service.send_password_reset_email(
        to_email="talentlinkmontreal@gmail.com",  # Envoyer à nous-mêmes pour tester
        user_name="Jean Dupont",
        reset_token="test-token-123-456-789",
        expiry_minutes=60
    )
    if success:
        print("✅ Email de réinitialisation envoyé avec succès !")
    else:
        print("❌ Échec de l'envoi de l'email de réinitialisation")
    return success

def test_welcome_email():
    """Test de l'email de bienvenue."""
    print("\n👋 Test : Email de bienvenue...")
    success = email_service.send_welcome_email(
        to_email="talentlinkmontreal@gmail.com",
        user_name="Marie Martin"
    )
    if success:
        print("✅ Email de bienvenue envoyé avec succès !")
    else:
        print("❌ Échec de l'envoi de l'email de bienvenue")
    return success

def test_application_notification():
    """Test de l'email de notification de candidature."""
    print("\n📬 Test : Email de notification de candidature...")
    success = email_service.send_application_notification(
        to_email="talentlinkmontreal@gmail.com",
        user_name="Pierre Tremblay",
        offer_title="Développeur Full Stack",
        company_name="TechCorp",
        status="in_review"
    )
    if success:
        print("✅ Email de notification envoyé avec succès !")
    else:
        print("❌ Échec de l'envoi de l'email de notification")
    return success

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TEST DU SERVICE D'EMAIL TALENTLINK")
    print("=" * 60)
    
    results = []
    
    # Test 1: Password reset
    results.append(("Réinitialisation", test_password_reset()))
    
    # Test 2: Welcome email
    results.append(("Bienvenue", test_welcome_email()))
    
    # Test 3: Application notification
    results.append(("Notification", test_application_notification()))
    
    # Résumé
    print("\n" + "=" * 60)
    print("📊 RÉSUMÉ DES TESTS")
    print("=" * 60)
    for test_name, success in results:
        status = "✅ SUCCÈS" if success else "❌ ÉCHEC"
        print(f"{test_name}: {status}")
    
    total_success = sum(1 for _, success in results if success)
    print(f"\nTotal : {total_success}/{len(results)} tests réussis")
    
    if total_success == len(results):
        print("\n🎉 Tous les tests ont réussi ! Le service email fonctionne parfaitement.")
    else:
        print(f"\n⚠️ {len(results) - total_success} test(s) ont échoué.")
    
    sys.exit(0 if total_success == len(results) else 1)
