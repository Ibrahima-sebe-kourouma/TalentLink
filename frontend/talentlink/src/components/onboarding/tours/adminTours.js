/**
 * Configuration du tour pour le dashboard admin
 */

export const adminDashboardTour = [
  {
    target: '.sidebar, .admin-sidebar',
    content: '👋 Bienvenue dans l\'interface d\'administration ! Vous avez un contrôle total sur la plateforme.',
    placement: 'right',
    disableBeacon: true,
  },
  {
    target: '[href="/admin/dashboard"], [href="/admin"]',
    content: '📊 Tableau de bord : statistiques globales et activité de la plateforme.',
    placement: 'right',
  },
  {
    target: '[href="/admin/users"]',
    content: '👥 Gérez tous les utilisateurs : suspension, bannissement, changement de rôle...',
    placement: 'right',
  },
  {
    target: '[href="/admin/reports"], [href="/admin/signalements"]',
    content: '🚩 Modérez les signalements : offres inappropriées, profils, messages...',
    placement: 'right',
  },
  {
    target: '[href="/admin/audit"]',
    content: '📝 Consultez l\'historique de toutes les actions administratives.',
    placement: 'right',
  },
];

export const adminUsersTour = [
  {
    target: '.users-stats, .statistics-cards',
    content: '📈 Vue d\'ensemble : nombre total d\'utilisateurs, actifs, suspendus...',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.search-users, input[type="search"]',
    content: '🔍 Recherchez un utilisateur par nom, email ou ID.',
    placement: 'bottom',
  },
  {
    target: '.users-filters, .filter-section',
    content: '🎯 Filtrez par rôle (Candidat, Recruteur, Admin) ou statut (Actif, Suspendu, Banni).',
    placement: 'right',
  },
  {
    target: '.user-row:first-child, .user-card:first-child',
    content: '👤 Informations de l\'utilisateur : email, rôle, statut, date d\'inscription...',
    placement: 'top',
  },
  {
    target: '.user-actions, .action-buttons',
    content: '⚡ Actions rapides : Suspendre, Bannir, Changer de rôle, Voir le profil...',
    placement: 'left',
  },
  {
    target: '.suspend-button',
    content: '⏸️ Suspension temporaire : bloquez l\'accès pendant une période définie.',
    placement: 'bottom',
  },
  {
    target: '.ban-button',
    content: '🚫 Bannissement permanent : utilisez avec précaution !',
    placement: 'bottom',
  },
];

export const adminReportsTour = [
  {
    target: '.reports-overview, .stats-section',
    content: '📊 Vue d\'ensemble des signalements : en attente, traités, rejetés...',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.reports-filters, .filter-tabs',
    content: '🗂️ Filtrez par type : Offres, Profils, Messages, ou par statut.',
    placement: 'right',
  },
  {
    target: '.report-card:first-child',
    content: '🚩 Détails du signalement : type, raison, description, auteur...',
    placement: 'top',
  },
  {
    target: '.severity-badge',
    content: '⚠️ Niveau de gravité : Faible, Moyen, Élevé, Critique.',
    placement: 'bottom',
  },
  {
    target: '.report-actions, .action-buttons',
    content: '✅ Validez (appliquer une sanction) ou rejetez le signalement.',
    placement: 'left',
  },
  {
    target: '.view-content, .preview-button',
    content: '👁️ Consultez le contenu signalé avant de prendre une décision.',
    placement: 'bottom',
  },
];

export const adminStatisticsTour = [
  {
    target: '.metrics-cards, .kpi-section',
    content: '📊 Indicateurs clés : utilisateurs actifs, offres publiées, candidatures...',
    placement: 'bottom',
    disableBeacon: true,
  },
  {
    target: '.chart-section, .analytics-graph',
    content: '📈 Graphiques d\'évolution : inscriptions, activité, croissance...',
    placement: 'top',
  },
  {
    target: '.date-filter, .time-range',
    content: '📅 Filtrez les statistiques par période : 7 jours, 30 jours, année...',
    placement: 'left',
  },
  {
    target: '.export-button, .download-report',
    content: '📥 Exportez les rapports au format PDF ou Excel.',
    placement: 'bottom',
  },
];

export const adminAuditTour = [
  {
    target: '.audit-logs, .activity-log',
    content: '📝 Historique complet de toutes les actions administratives.',
    placement: 'top',
    disableBeacon: true,
  },
  {
    target: '.log-entry:first-child',
    content: '🕐 Chaque entrée : qui, quoi, quand, sur qui, pourquoi...',
    placement: 'top',
  },
  {
    target: '.filter-logs, .search-bar',
    content: '🔍 Recherchez par admin, action, utilisateur cible ou date.',
    placement: 'bottom',
  },
  {
    target: '.action-type-badge',
    content: '🏷️ Type d\'action : Suspension, Bannissement, Changement de rôle, Modération...',
    placement: 'bottom',
  },
];
