/**
 * Tour pour la page Gestion des Offres (Recruteur)
 */

export const offersManagerPageTour = [
  {
    target: 'h3',
    content: '📢 Bienvenue sur la gestion de vos offres d\'emploi ! Créez et gérez toutes vos offres ici.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: 'section h4',
    content: '➕ Utilisez ce formulaire pour créer une nouvelle offre d\'emploi.',
    placement: 'bottom',
  },
  {
    target: 'input[type="text"]',
    content: '✍️ Remplissez les informations : titre, type de contrat, localisation, domaine, salaire, etc.',
    placement: 'bottom',
  },
  {
    target: 'button[type="button"]',
    content: '💾 Une fois le formulaire complété, cliquez sur "Créer" pour publier votre offre.',
    placement: 'top',
  },
  {
    target: 'body',
    content: '📋 Vos offres existantes s\'affichent en dessous. Vous pouvez les modifier, clôturer ou supprimer.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ Astuce : Des offres détaillées et bien rédigées attirent plus de candidats qualifiés !',
    placement: 'center',
  },
];
