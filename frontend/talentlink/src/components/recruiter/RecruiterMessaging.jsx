import React from "react";
import CandidateMessaging from "../candidate/Messaging";
import { ProductTour, TourHelpButton, useProductTour, messagingRecruiterPageTour } from "../onboarding";
import { isFirstVisit } from "../../utils/tourHelpers";

export default function RecruiterMessaging({ user }) {
  // Tour guidé
  const { isReady, run, tourSteps, startTour, handleTourComplete } = useProductTour(
    'messaging_recruiter_page',
    messagingRecruiterPageTour,
    user?.id,
    true
  );

  // Même composant que le candidat, fonctionne pour les deux rôles
  return (
    <>
      {isReady && (
        <>
          <ProductTour steps={tourSteps} tourKey="messaging_recruiter_page" userId={user?.id} onComplete={handleTourComplete} run={run} />
          <TourHelpButton onClick={startTour} isFirstVisit={isFirstVisit(user?.id)} />
        </>
      )}
      <CandidateMessaging user={user} />
    </>
  );
}
