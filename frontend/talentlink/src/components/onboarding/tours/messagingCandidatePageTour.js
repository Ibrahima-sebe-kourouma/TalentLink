/**
 * Tour pour la page Messagerie Candidat
 */

export const messagingCandidatePageTour = [
  {
    target: '.messaging-container',
    content: '💬 Bienvenue dans votre messagerie ! Communiquez directement avec les recruteurs ici.',
    placement: 'center',
    disableBeacon: true,
  },
  {
    target: '.conversations-sidebar',
    content: '📬 La liste de vos conversations s\'affiche ici. Cliquez sur une conversation pour voir les messages.',
    placement: 'right',
  },
  {
    target: '.conversations-list',
    content: '👥 Chaque conversation montre le nom du recruteur et un aperçu du dernier message.',
    placement: 'right',
  },
  {
    target: 'body',
    content: '✉️ Astuce : Soyez professionnel et réactif dans vos échanges pour maximiser vos chances.',
    placement: 'center',
  },
  {
    target: 'body',
    content: '✅ Vous pouvez signaler un message ou supprimer une conversation si nécessaire.',
    placement: 'center',
  },
];
