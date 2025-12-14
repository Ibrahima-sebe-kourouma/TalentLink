/**
 * Tour pour la page Gestion des Utilisateurs (Admin)
 */

export const userManagementPageTour = [
  {
    target: 'h1',
    content: '👥 Bienvenue dans la gestion des utilisateurs ! Administrez tous les comptes de la plateforme.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'input[type="text"]',
    content: '🔍 Recherchez un utilisateur par nom, email ou filtrez par rôle (Candidat, Recruteur, Admin).',
    placement: 'bottom',
  },
  {
    target: 'select',
    content: '🎭 Filtrez par rôle ou statut pour affiner votre recherche.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: '📋 La liste des utilisateurs s\'affiche avec leurs informations principales : nom, email, rôle, statut.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '⚙️ Cliquez sur les actions pour suspendre, activer, changer le rôle ou supprimer un utilisateur.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '⚠️ Important : Les actions administratives sont irréversibles. Utilisez-les avec précaution.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ Vous avez le contrôle total sur les comptes pour assurer la sécurité de la plateforme.',
    placement: 'center',
  },
];
