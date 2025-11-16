# Tests et Utilitaires TalentLink

Ce dossier contient tous les fichiers de test, migrations et utilitaires de développement pour le projet TalentLink.

## Structure

### service_auth/
- `test_*.py` : Scripts de test pour le service d'authentification
- `check_roles.py` : Utilitaire de vérification des rôles
- `fix_roles.py` : Script de correction des rôles en base
- `promote_admin.py` : Script de promotion d'utilisateur en admin
- `recreate_db.py` : Script de recréation de la base de données
- `migrate_create_admin.py` : Migration pour créer les tables admin

### service_auth_migrations/
- Scripts de migration pour le service d'authentification

### service_offers/
- `test_*.py` : Scripts de test pour le service des offres
- `migrate_*.py` : Scripts de migration pour le service des offres

## Usage

Pour exécuter les tests ou utilitaires :

```bash
# Tests service auth
cd backend/tests/service_auth
python test_admin_api.py

# Migration admin
cd backend/tests/service_auth
python migrate_create_admin.py

# Tests service offers
cd backend/tests/service_offers
python test_offers_api.py
```

## Notes

Ces fichiers ont été déplacés pour nettoyer la structure principale des services en production.
Les services principaux ne contiennent maintenant que le code nécessaire au fonctionnement.