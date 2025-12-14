/**
 * Tour spécifique pour la page OffersBrowser (Parcourir les offres)
 */

export const offersPageTour = [
  {
    target: '.offers-browser',
    content: '💼 Parcourez toutes les offres d\'emploi disponibles. Utilisez les filtres pour affiner votre recherche.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.offers-filters',
    content: '🔍 Filtrez les offres par domaine, localisation, mots-clés, type de contrat, etc.',
    placement: 'bottom',
  },
  {
    target: '.offers-list',
    content: '📋 Liste des offres correspondant à vos critères. Cliquez sur une offre pour voir les détails complets.',
    placement: 'right',
  },
  {
    target: 'body',
    content: '✅ Utilisez le bouton d\'aide (?) en bas à droite pour relancer ce tutoriel à tout moment !',
    placement: 'center',
  },
];
