import { NavLink } from "react-router-dom";

const linkStyle = ({ isActive }) => ({
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.08)",
  background: isActive ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.02)",
  color: "white",
  display: "inline-flex",
  gap: 8,
  alignItems: "center",
});

export default function Layout({ children }) {
  return (
    <div>
      <div className="container">
        <div
          className="card"
          style={{
            padding: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontWeight: 800, fontSize: 18 }}>Job Application Tracker</div>
            <div style={{ color: "rgba(231,234,240,0.65)", fontSize: 12 }}>
              Dashboard • Applications • Analytics
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <NavLink to="/" style={linkStyle} end>
              Dashboard
            </NavLink>
            <NavLink to="/applications" style={linkStyle}>
              Applications
            </NavLink>
          </div>
        </div>

        <div style={{ height: 16 }} />
        {children}
      </div>
    </div>
  );
}
