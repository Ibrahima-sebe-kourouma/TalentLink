# Documentation UML - Sprint 1 Talentlink

## 📋 Contenu

Ce dossier contient les diagrammes UML du Sprint 1 de la plateforme Talentlink :

1. **diagramme_sequence_sprint1.puml** - Diagramme de séquence
2. **diagramme_classes_sprint1.puml** - Diagramme de classes

## 🔧 Visualisation des diagrammes

Ces fichiers sont au format PlantUML. Pour les visualiser :

### Option 1 : En ligne (le plus simple)
1. Copiez le contenu du fichier `.puml`
2. Allez sur http://www.plantuml.com/plantuml/uml/
3. Collez le code dans l'éditeur
4. Le diagramme s'affiche automatiquement

### Option 2 : VS Code
1. Installez l'extension "PlantUML" dans VS Code
2. Ouvrez le fichier `.puml`
3. Appuyez sur `Alt+D` pour prévisualiser

### Option 3 : Ligne de commande
```bash
# Installer PlantUML
npm install -g node-plantuml

# Générer une image PNG
puml generate diagramme_sequence_sprint1.puml
puml generate diagramme_classes_sprint1.puml
```

## 📊 Description des diagrammes

### Diagramme de Séquence
Illustre les 15 cas d'utilisation du Sprint 1 :
- UC1-UC4 : Authentification (inscription, confirmation, connexion, reset password)
- UC5-UC9 : Gestion du profil candidat (création, modification, suppression, portfolio)
- UC10-UC15 : Gestion des offres et candidatures (recherche, postulation, suivi)

**Acteurs principaux :** Candidat, 4 microservices (Auth, Mail, Profile, Offers)

### Diagramme de Classes
Architecture complète des 4 microservices :
- **Service Auth** : User, UserRole (CANDIDATE/RECRUITER/ADMIN)
- **Service Profile** : Candidat + objets de valeur (Experience, Formation, Competence, etc.)
- **Service Offers** : Offer, Application + enums (ContractType, OfferStatus, ApplicationStatus)
- **Service Mail** : EmailRequest, EmailService
- **Frontend** : Contextes React et composants principaux

**Relations clés :**
- User (1) ↔ Candidat (0..1)
- Candidat (1) ↔ Applications (0..*)
- Offer (1) ↔ Applications (0..*)

## 🎯 Fonctionnalités couvertes (Sprint 1)

✅ Inscription et confirmation email  
✅ Connexion et récupération mot de passe  
✅ Gestion complète du profil candidat (8 étapes)  
✅ Upload CV et lettre de motivation  
✅ Portfolio (projets, liens GitHub/Behance)  
✅ Recherche d'offres avec filtres multiples  
✅ Tri des résultats  
✅ Consultation détaillée des offres  
✅ Postulation en ligne  
✅ Suivi des candidatures avec statuts  
✅ Notifications email automatiques  

## 🏗️ Architecture Microservices

| Service | Port | Base de données | Responsabilité |
|---------|------|-----------------|----------------|
| Auth | 8001 | SQLite/PostgreSQL | Authentification, utilisateurs |
| Profile | 8002 | SQLite/PostgreSQL | Profils candidats/recruteurs |
| Offers | 8003 | SQLite/PostgreSQL | Offres et candidatures |
| Mail | 8004 | - | Envoi d'emails (SMTP) |
| Frontend | 3000 | - | Interface React |

## 📝 Notes techniques

- **Authentification** : JWT tokens stockés en localStorage
- **Upload fichiers** : Stockage local dans `backend/uploads/`
- **Validation** : PDF/DOC/DOCX, max 5MB
- **Statuts candidatures** : SUBMITTED → IN_REVIEW → INTERVIEW → OFFERED/REJECTED
- **Contrainte unicité** : Un candidat ne peut postuler qu'une fois par offre
- **Notifications** : Emails automatiques via Service Mail

## 🔄 Flux principaux

1. **Inscription complète** : Register → Email confirmation → Login → Profile completion (8 steps)
2. **Recherche et postulation** : Search offers → Filter/Sort → View detail → Apply → Track status
3. **Gestion profil** : Update info → Upload CV → Add portfolio → View/Download documents

---

*Généré le : 2 novembre 2025*  
*Projet : Talentlink - Plateforme de recrutement*  
*Sprint : 1 (Fonctionnalités candidat)*
