import { STATUSES } from "../constants/status";

export default function StatusSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      style={{
        padding: "8px 10px",
        borderRadius: 10,
        background: "#141414",
        color: "white",
        border: "1px solid #333",
      }}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
