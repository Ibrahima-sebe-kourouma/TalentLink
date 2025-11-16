import React from "react";
import { Routes, Route } from "react-router-dom";
import ProfilePage from "../../pages/ProfilePage";

// For now, reuse the existing ProfilePage which already contains
// the candidate sidebar, dashboard, offers, applications, and account tabs.
export default function CandidateApp({ user, onLogout }) {
  return (
    <Routes>
      <Route index element={<ProfilePage user={user} onLogout={onLogout} />} />
    </Routes>
  );
}
