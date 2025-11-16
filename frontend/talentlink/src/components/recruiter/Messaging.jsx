import React from "react";

export default function MessagingPlaceholder({ scope = "Recruteur" }) {
  return (
    <section style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Messagerie ({scope})</h3>
      <div style={{
        padding: 12,
        borderRadius: 8,
        background: "#fef3c7",
        color: "#92400e",
        border: "1px solid #fcd34d",
        maxWidth: 800
      }}>
        Le service de messagerie n'est pas encore prêt. Cette interface sera disponible prochainement.
      </div>
      <p style={{ color: "#6b7280", marginTop: 10 }}>
        En attendant, vous pouvez gérer vos offres et candidatures normalement.
      </p>
    </section>
  );
}
