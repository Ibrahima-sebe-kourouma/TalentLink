/**
 * Tour pour la page Candidatures Reçues (Recruteur)
 */

export const applicationsRecruiterPageTour = [
  {
    target: 'h3',
    content: '📥 Bienvenue dans la gestion des candidatures ! Consultez et gérez toutes les candidatures reçues.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'select',
    content: '🏢 Sélectionnez une offre pour voir les candidatures associées.',
    placement: 'bottom',
  },
  {
    target: 'input[type="text"]',
    content: '🔍 Filtrez les candidatures par nom, statut ou utilisez le tri pour mieux organiser.',
    placement: 'bottom',
  },
  {
    target: 'body',
    content: '👤 Cliquez sur une candidature pour consulter le profil du candidat et ses documents.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✏️ Vous pouvez changer le statut des candidatures (En revue, Entretien, Offre, Rejeté).',
    placement: 'center',
  },
  {
    target: 'body',
    content: '💬 Contactez les candidats directement via la messagerie intégrée.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ Astuce : Répondez rapidement aux candidats pour améliorer l\'expérience et votre réputation !',
    placement: 'center',
  },
];
