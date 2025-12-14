/**
 * Tour spécifique pour la page dashboard candidat
 * Se concentre sur les éléments présents dans le dashboard
 */

export const candidateDashboardPageTour = [
  {
    target: '.dashboard-title',
    content: '👋 Bienvenue sur votre tableau de bord ! Nous allons vous faire découvrir les principales fonctionnalités.',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.dashboard-kpis',
    content: '📊 Ces indicateurs vous donnent un aperçu rapide de vos statistiques : vues de profil, candidatures en cours, entretiens, etc.',
    placement: 'bottom',
  },
  {
    target: '.kpi-card.primary',
    content: '👀 Suivez combien de recruteurs ont consulté votre profil. Plus ce nombre est élevé, plus vous êtes visible !',
    placement: 'bottom',
  },
  {
    target: '.dashboard-charts',
    content: '📈 Ces graphiques visualisent l\'évolution de vos candidatures sur les 6 derniers mois et leur répartition par statut.',
    placement: 'top',
  },
  {
    target: '.recent-applications',
    content: '📋 Retrouvez ici vos candidatures les plus récentes avec leur statut actuel.',
    placement: 'top',
  },
  {
    target: '.quick-actions',
    content: '⚡ Accès rapide pour compléter votre profil ou parcourir les nouvelles offres d\'emploi.',
    placement: 'top',
  },
  {
    target: 'a[href*="tab=update"]',
    content: '✏️ Conseil : Un profil complet augmente vos chances d\'être contacté par les recruteurs !',
    placement: 'top',
  },
  {
    target: 'body',
    content: '✅ Vous pouvez relancer ce tutoriel à tout moment en cliquant sur le bouton d\'aide (?) en bas à droite !',
    placement: 'center',
  },
];
