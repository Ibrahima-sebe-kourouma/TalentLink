/**
 * Tour pour la page Mes Candidatures (Candidat)
 */

export const applicationsPageTour = [
  {
    target: 'h2',
    content: '📋 Bienvenue sur la page de vos candidatures ! Suivez l\'état de toutes vos candidatures ici.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'select',
    content: '🔍 Filtrez vos candidatures par statut (Soumise, En revue, Entretien, etc.).',
    placement: 'bottom',
  },
  {
    target: 'button',
    content: '🔄 Actualisez la liste pour voir les dernières mises à jour de vos candidatures.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: '💡 Astuce : Vous pouvez retirer une candidature si nécessaire. Les recruteurs seront notifiés de votre décision.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ N\'oubliez pas de consulter régulièrement cette page pour suivre vos opportunités !',
    placement: 'center',
  },
];
