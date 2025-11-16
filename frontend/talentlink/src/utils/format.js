export const statusLabelMap = {
  submitted: "Soumise",
  in_review: "En revue",
  interview: "Entretien",
  offered: "Offre",
  rejected: "Refusée",
  withdrawn: "Retirée",
};

export function formatStatus(s) {
  if (!s) return "—";
  return statusLabelMap[s] || s;
}

export function statusStyle(s) {
  const base = { padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, display: "inline-block" };
  switch (s) {
    case "submitted":
      return { ...base, background: "#eef2ff", color: "#3730a3", border: "1px solid #c7d2fe" }; // indigo
    case "in_review":
      return { ...base, background: "#e0f2fe", color: "#075985", border: "1px solid #bae6fd" }; // sky
    case "interview":
      return { ...base, background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" }; // amber
    case "offered":
      return { ...base, background: "#dcfce7", color: "#065f46", border: "1px solid #bbf7d0" }; // green
    case "rejected":
      return { ...base, background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" }; // red
    case "withdrawn":
      return { ...base, background: "#e5e7eb", color: "#374151", border: "1px solid #d1d5db" }; // gray
    default:
      return { ...base, background: "#f3f4f6", color: "#111827", border: "1px solid #e5e7eb" };
  }
}

export function formatDate(d) {
  if (!d) return "—";
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (e) {
    return String(d);
  }
}
