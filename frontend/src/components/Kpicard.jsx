export default function KpiCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: "#111820",
      border: "1px solid #1e2a38",
      borderRadius: 12,
      padding: "1.2rem 1.4rem",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    }}>
      <span style={{ fontSize: "0.75rem", color: "#556070", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: "2rem", color: accent || "#f0e6d0", lineHeight: 1 }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: "0.78rem", color: "#556070" }}>{sub}</span>
      )}
    </div>
  );
}