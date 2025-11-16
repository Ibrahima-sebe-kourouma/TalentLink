import React, { useState, useEffect } from "react";
import SidebarRecruiter from "../../components/recruiter/SidebarRecruiter";
import RecruiterDashboard from "./Dashboard";
import OffersManager from "../../components/recruiter/OffersManager";
import Applications from "../../components/recruiter/Applications";
import StepperRecruiter from "../../components/recruiter/StepperRecruiter";
import AccountSettings from "../../components/AccountSettings";
import RecruiterMessaging from "../../components/recruiter/RecruiterMessaging";
import TalentBot from "../../components/recruiter/TalentBot";

export default function RecruiterApp({ user, onLogout }) {
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    // default view when recruiter logs in
    setActive("dashboard");
  }, [user?.id]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <SidebarRecruiter user={user} active={active} setActive={setActive} onLogout={onLogout} />
      <main style={{ flex: 1, padding: 24, background: '#f4f7fb' }}>
        <h1 style={{ marginBottom: 12 }}>Espace Recruteur</h1>
        {active === 'dashboard' && <RecruiterDashboard user={user} />}
        {active === 'offers' && <OffersManager user={user} />}
        {active === 'applications' && <Applications user={user} />}
        {active === 'messages' && <RecruiterMessaging user={user} />}
        {active === 'profile' && <StepperRecruiter user={user} />}
        {active === 'account' && <AccountSettings user={user} onLogout={onLogout} />}
        {active === 'talentbot' && <TalentBot user={user} />}
      </main>
    </div>
  );
}
