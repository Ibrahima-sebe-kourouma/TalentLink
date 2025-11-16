import React from "react";
import CandidateMessaging from "../candidate/Messaging";

export default function RecruiterMessaging({ user }) {
  // Même composant que le candidat, fonctionne pour les deux rôles
  return <CandidateMessaging user={user} />;
}
