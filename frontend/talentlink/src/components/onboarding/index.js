// Export tous les composants et tours
export { default as ProductTour } from './ProductTour';
export { default as TourHelpButton } from './TourHelpButton';
export { useProductTour } from './useProductTour';

// Tours Candidat
export {
  candidateDashboardTour,
  candidateProfileTour,
  candidateOffersTour,
  candidateApplicationsTour,
  candidateMessagingTour,
  candidateTalentBotTour,
} from './tours/candidateTours';

// Tour Dashboard Candidat (page spécifique)
export { candidateDashboardPageTour } from './tours/candidateDashboardPageTour';

// Tours Recruteur
export {
  recruiterDashboardTour,
  recruiterOffersTour,
  recruiterApplicationsTour,
  recruiterAppointmentsTour,
  recruiterMessagingTour,
} from './tours/recruiterTours';

// Tours Admin
export {
  adminDashboardTour,
  adminUsersTour,
  adminReportsTour,
  adminStatisticsTour,
  adminAuditTour,
} from './tours/adminTours';

// Tours spécifiques par page
export { offersPageTour } from './tours/offersPageTour';
export { applicationsPageTour } from './tours/applicationsPageTour';
export { messagingCandidatePageTour } from './tours/messagingCandidatePageTour';
export { talentBotPageTour } from './tours/talentBotPageTour';
export { offersManagerPageTour } from './tours/offersManagerPageTour';
export { applicationsRecruiterPageTour } from './tours/applicationsRecruiterPageTour';
export { messagingRecruiterPageTour } from './tours/messagingRecruiterPageTour';
export { userManagementPageTour } from './tours/userManagementPageTour';

