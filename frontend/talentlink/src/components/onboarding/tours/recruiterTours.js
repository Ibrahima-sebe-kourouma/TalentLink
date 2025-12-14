/**
 * Configuration du tour pour le dashboard recruteur
 */

export const recruiterDashboardTour = [
  {
    target: '.sidebar-recruiter, .sidebar',
    content: '👋 Bienvenue sur votre espace recruteur ! Gérez vos offres et candidatures depuis ce menu.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[href="/recruiter/offers"]',
    content: '💼 Créez et gérez vos offres d\'emploi ici.',
    placement: 'right',
  },
  {
    target: '[href="/recruiter/applications"]',
    content: '📝 Consultez toutes les candidatures reçues et gérez-les facilement.',
    placement: 'right',
  },
  {
    target: '[href="/recruiter/messaging"]',
    content: '💬 Communiquez directement avec les candidats.',
    placement: 'right',
  },
  {
    target: '[href="/recruiter/appointments"]',
    content: '📅 Planifiez et gérez vos entretiens avec les candidats.',
    placement: 'right',
  },
  {
    target: '[href="/recruiter/talentbot"]',
    content: '🤖 TalentBot peut vous aider à rédiger des offres, analyser des profils...',
    placement: 'right',
  },
];

export const recruiterOffersTour = [
  {
    target: '.create-offer-button, button:contains("Créer")',
    content: '➕ Cliquez ici pour créer une nouvelle offre d\'emploi.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.offers-list, .my-offers',
    content: '📋 Voici toutes vos offres publiées avec leur statut et le nombre de candidatures.',
    placement: 'top',
  },
  {
    target: '.offer-stats, .applications-count',
    content: '📊 Suivez les statistiques : nombre de vues, candidatures reçues...',
    placement: 'left',
  },
  {
    target: '.edit-offer, .manage-offer',
    content: '✏️ Modifiez ou désactivez une offre à tout moment.',
    placement: 'left',
  },
];

export const recruiterApplicationsTour = [
  {
    target: '.applications-filters, .filter-bar',
    content: '🎯 Filtrez les candidatures par offre, statut, date...',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.application-card:first-child',
    content: '📄 Cliquez sur une candidature pour voir le profil complet du candidat.',
    placement: 'top',
  },
  {
    target: '.application-actions, .status-buttons',
    content: '✅ Acceptez, refusez ou proposez un entretien directement.',
    placement: 'left',
  },
  {
    target: '.download-cv, .view-cv',
    content: '📥 Téléchargez le CV du candidat pour une consultation hors ligne.',
    placement: 'bottom',
  },
];

export const recruiterAppointmentsTour = [
  {
    target: '.create-appointment, .schedule-button',
    content: '📅 Proposez plusieurs créneaux d\'entretien au candidat.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.appointments-list, .calendar-view',
    content: '🗓️ Visualisez tous vos rendez-vous programmés.',
    placement: 'top',
  },
  {
    target: '.appointment-status',
    content: '⏳ Suivez le statut : En attente de confirmation, Confirmé, Terminé...',
    placement: 'left',
  },
  {
    target: '.send-reminder, .notification-button',
    content: '🔔 Envoyez des rappels automatiques aux candidats.',
    placement: 'left',
  },
];

export const recruiterMessagingTour = [
  {
    target: '.conversations-filter, .search-conversations',
    content: '🔍 Recherchez une conversation ou filtrez par candidature.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '.conversation-item:first-child',
    content: '👤 Sélectionnez un candidat pour voir votre historique de messages.',
    placement: 'right',
  },
  {
    target: '.candidate-info, .profile-preview',
    content: 'ℹ️ Consultez les infos du candidat : offre concernée, statut de candidature...',
    placement: 'left',
  },
  {
    target: '.message-input, textarea',
    content: '✍️ Répondez rapidement aux questions des candidats.',
    placement: 'top',
  },
];
