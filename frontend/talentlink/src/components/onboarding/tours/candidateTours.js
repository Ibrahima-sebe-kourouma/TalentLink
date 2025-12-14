/**
 * Configuration du tour pour le dashboard candidat
 */

export const candidateDashboardTour = [
  {
    target: '.sidebar',
    content: '👋 Bienvenue sur TalentLink ! Voici votre menu de navigation. Vous pouvez accéder à toutes les fonctionnalités depuis ici.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[href="/candidate/profile"]',
    content: '📝 Complétez votre profil : expériences, formations, compétences, CV... Un profil complet augmente vos chances !',
    placement: 'right',
  },
  {
    target: '[href="/candidate/offers"]',
    content: '💼 Explorez les offres d\'emploi disponibles et postulez en un clic.',
    placement: 'right',
  },
  {
    target: '[href="/candidate/applications"]',
    content: '📊 Suivez l\'état de toutes vos candidatures en temps réel.',
    placement: 'right',
  },
  {
    target: '[href="/candidate/messaging"]',
    content: '💬 Échangez avec les recruteurs via la messagerie intégrée.',
    placement: 'right',
  },
  {
    target: '[href="/candidate/appointments"]',
    content: '📅 Gérez vos rendez-vous d\'entretien avec les recruteurs.',
    placement: 'right',
  },
  {
    target: '[href="/candidate/talentbot"]',
    content: '🤖 TalentBot est votre assistant IA ! Posez des questions sur les offres, obtenez des conseils carrière...',
    placement: 'right',
  },
  {
    target: '.user-profile, .account-settings',
    content: '⚙️ Accédez à vos paramètres de compte et déconnexion ici.',
    placement: 'bottom',
  },
];

export const candidateProfileTour = [
  {
    target: '.stepper, .profile-stepper',
    content: '📋 Suivez votre progression ! Complétez chaque étape pour un profil à 100%.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.step-infos-perso, button[type="submit"]',
    content: '✏️ Remplissez vos informations personnelles puis cliquez sur "Suivant" pour passer à l\'étape suivante.',
    placement: 'top',
  },
  {
    target: '.save-button, .next-button',
    content: '💾 N\'oubliez pas de sauvegarder régulièrement vos modifications !',
    placement: 'top',
  },
];

export const candidateOffersTour = [
  {
    target: '.search-bar, input[type="search"]',
    content: '🔍 Utilisez la barre de recherche pour trouver des offres par mot-clé, ville, entreprise...',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.filters, .filter-section',
    content: '🎯 Affinez votre recherche avec les filtres : type de contrat, secteur, expérience...',
    placement: 'right',
  },
  {
    target: '.offer-card:first-child, .job-card:first-child',
    content: '📄 Cliquez sur une offre pour voir tous les détails et postuler.',
    placement: 'top',
  },
  {
    target: '.apply-button, button:contains("Postuler")',
    content: '✨ Cliquez sur "Postuler" pour envoyer votre candidature en un clic !',
    placement: 'left',
  },
];

export const candidateApplicationsTour = [
  {
    target: '.applications-list, .my-applications',
    content: '📊 Voici toutes vos candidatures avec leur statut actuel.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.status-badge, .application-status',
    content: '🏷️ Le statut de chaque candidature : En cours, Acceptée, Rejetée, Entretien...',
    placement: 'bottom',
  },
  {
    target: '.application-actions, .view-details',
    content: '👁️ Cliquez ici pour voir les détails ou contacter le recruteur.',
    placement: 'left',
  },
];

export const candidateMessagingTour = [
  {
    target: '.conversations-list, .chat-list',
    content: '💬 Toutes vos conversations avec les recruteurs apparaissent ici.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.conversation-item:first-child',
    content: '👤 Cliquez sur une conversation pour voir les messages et répondre.',
    placement: 'right',
  },
  {
    target: '.message-input, textarea',
    content: '✍️ Écrivez votre message ici et appuyez sur Entrée pour envoyer.',
    placement: 'top',
  },
];

export const candidateTalentBotTour = [
  {
    target: '.talentbot-chat, .chat-container',
    content: '🤖 TalentBot est votre assistant IA personnel !',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.conversation-history, .conversations-sidebar',
    content: '📚 Toutes vos conversations précédentes sont sauvegardées ici.',
    placement: 'right',
  },
  {
    target: '.chat-input, .message-input',
    content: '💡 Posez des questions comme : "Quelles offres en développement ?", "Comment améliorer mon CV ?"...',
    placement: 'top',
  },
  {
    target: '.new-conversation, .start-chat',
    content: '➕ Démarrez une nouvelle conversation à tout moment !',
    placement: 'bottom',
  },
];
