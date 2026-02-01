const STYLE = {
  APPLIED: { bg: "rgba(148,163,184,0.12)", bd: "rgba(148,163,184,0.25)", tx: "#cbd5e1" },
  HR_INTERVIEW: { bg: "rgba(56,189,248,0.12)", bd: "rgba(56,189,248,0.25)", tx: "#7dd3fc" },
  TECH_INTERVIEW: { bg: "rgba(99,102,241,0.12)", bd: "rgba(99,102,241,0.28)", tx: "#a5b4fc" },
  CASE_STUDY: { bg: "rgba(244,114,182,0.12)", bd: "rgba(244,114,182,0.25)", tx: "#f9a8d4" },
  OFFER: { bg: "rgba(34,197,94,0.12)", bd: "rgba(34,197,94,0.25)", tx: "#86efac" },
  REJECTED: { bg: "rgba(239,68,68,0.12)", bd: "rgba(239,68,68,0.25)", tx: "#fca5a5" },
  WITHDRAWN: { bg: "rgba(245,158,11,0.12)", bd: "rgba(245,158,11,0.25)", tx: "#fcd34d" },
};

export default function StatusBadge({ status }) {
  const s = (status || "").replace("Status.", "");
  const theme = STYLE[s] || STYLE.APPLIED;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "6px 10px",
        borderRadius: 999,
        background: theme.bg,
        border: `1px solid ${theme.bd}`,
        color: theme.tx,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 0.02,
      }}
    >
      {s}
    </span>
  );
}
