export default function Toast({ open, text, type = "success" }) {
  if (!open) return null;

  const theme =
    type === "error"
      ? { bd: "rgba(255,80,80,0.35)", bg: "rgba(255,80,80,0.10)", tx: "#ffb4b4" }
      : { bd: "rgba(34,197,94,0.35)", bg: "rgba(34,197,94,0.10)", tx: "#86efac" };

  return (
    <div
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 10000,
        padding: "10px 12px",
        borderRadius: 14,
        border: `1px solid ${theme.bd}`,
        background: theme.bg,
        color: theme.tx,
        boxShadow: "0 16px 50px rgba(0,0,0,0.45)",
        fontWeight: 700,
        fontSize: 13,
        maxWidth: 380,
      }}
    >
      {text}
    </div>
  );
}
