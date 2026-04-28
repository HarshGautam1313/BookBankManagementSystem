import { useNavigate, useLocation } from "react-router-dom";

const adminLinks = [
  { path: "/admin", label: "Dashboard", icon: "⊞" },
  { path: "/admin/transactions", label: "Transactions", icon: "↺" }, // Kept
  { path: "/admin/analytics", label: "Analytics", icon: "◎" },
];

const studentLinks = [
  { path: "/student", label: "Browse Books", icon: "⊞" },
  { path: "/student/history", label: "My Borrows", icon: "↺" },
  { path: "/student/recommendations", label: "For You", icon: "✦" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const raw = localStorage.getItem("user");
  const user = raw && raw !== "undefined" ? JSON.parse(raw) : {};
  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : studentLinks;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  }

  return (
    <aside style={{
      width: 220,
      minHeight: "100vh",
      background: "#0d1117",
      borderRight: "1px solid #1e2a38",
      display: "flex",
      flexDirection: "column",
      padding: "1.8rem 1.2rem",
      gap: 0,
      flexShrink: 0,
    }}>

      {/* Brand */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "2.5rem" }}>
        <div style={{ width: 32, height: 32, background: "#d4a853", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <rect x="2" y="4" width="3" height="12" rx="1" fill="#0d0a04"/>
            <rect x="6.5" y="3" width="3" height="14" rx="1" fill="#0d0a04"/>
            <rect x="11" y="5" width="3" height="11" rx="1" fill="#0d0a04"/>
            <rect x="15" y="4" width="3" height="12" rx="1" fill="#0d0a04"/>
          </svg>
        </div>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "1.05rem", color: "#f0e6d0" }}>
          S-<span style={{ color: "#d4a853" }}>BBMS</span>
        </span>
      </div>

      {/* Role badge */}
      <div style={{ fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d4a853", marginBottom: "0.8rem", paddingLeft: 4 }}>
        {isAdmin ? "Admin Panel" : "Student Portal"}
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: 4, flex: 1 }}>
        {links.map(link => {
    // LOGIC: 
    // 1. If it's the main dashboard (/admin), it must be an EXACT match.
    // 2. For any other page, we use .startsWith() so sub-pages keep the link active.
    const active = link.path === "/admin" 
        ? location.pathname === "/admin" 
        : location.pathname.startsWith(link.path);

    return (
        <button key={link.path} onClick={() => navigate(link.path)} style={{
            display: "flex", alignItems: "center", gap: 10,
            padding: "9px 12px",
            borderRadius: 8,
            border: "none",
            background: active ? "#1a2540" : "transparent",
            color: active ? "#d4a853" : "#556070",
            fontSize: "0.88rem",
            fontFamily: "'DM Sans', sans-serif",
            fontWeight: active ? 500 : 400,
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s",
            borderLeft: active ? "2px solid #d4a853" : "2px solid transparent",
        }}>
            <span style={{ fontSize: 14 }}>{link.icon}</span>
            {link.label}
        </button>
    );
})}
      </nav>

      {/* User info + logout */}
      <div style={{ borderTop: "1px solid #1e2a38", paddingTop: "1rem" }}>
        <div style={{ fontSize: "0.8rem", color: "#8a9ab5", marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.full_name || "User"}
        </div>
        <div style={{ fontSize: "0.72rem", color: "#2e3d52", marginBottom: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user?.email || ""}
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: "8px", borderRadius: 8,
          border: "1px solid #1e2a38", background: "transparent",
          color: "#556070", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif",
          cursor: "pointer", transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.target.style.borderColor = "#a32d2d"; e.target.style.color = "#f09595"; }}
          onMouseLeave={e => { e.target.style.borderColor = "#1e2a38"; e.target.style.color = "#556070"; }}
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}