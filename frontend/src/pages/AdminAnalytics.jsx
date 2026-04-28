import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Sidebar from "../components/Sidebar";
import KpiCard from "../components/Kpicard";
import api from "../api/axios";

const GOLD   = "#d4a853";
const COLORS = ["#d4a853","#4caf8a","#8ab4f8","#f09595","#c792ea"];

export default function AdminAnalytics() {
  const [stats, setStats]       = useState(null);
  const [prediction, setPred]   = useState(null);
  const [predLoading, setPL]    = useState(false);
  const [toast, setToast]       = useState(null);

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    try {
      const { data } = await api.get("/analytics/stats");
      setStats(data);
    } catch { showToast("Failed to load analytics.", true); }
  }

  async function runPrediction() {
    setPL(true); setPred(null);
    try {
      const [predRes, booksRes] = await Promise.all([
        api.get("/smart/predict"),
        api.get("/books"),
      ]);
      const booksMap = {};
      booksRes.data.forEach(b => { booksMap[b.book_id] = b; });
      const enriched = (predRes.data.predictions || []).map(p => ({
        ...p,
        title:    booksMap[p.book_id]?.title    || `Book #${p.book_id}`,
        category: booksMap[p.book_id]?.category || "—",
        author:   booksMap[p.book_id]?.author   || "—",
        predicted_demand: p.demand_score,
      }));
      setPred(enriched);
    } catch { showToast("Prediction failed. Is the Python ML service running?", true); }
    finally { setPL(false); }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  }

  const topBooks = stats?.topBooks || [];
  const topCats  = stats?.topCategories || [];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: GOLD, marginBottom: 6 }}>Admin</p>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", color: "#f0e6d0" }}>Analytics</h1>
        </div>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 14, marginBottom: "2.5rem" }}>
          <KpiCard label="Total Books"   value={stats?.summary?.totalBooks ?? "—"} />
          <KpiCard label="Issued"        value={stats?.summary?.issuedBooks ?? "—"} accent={GOLD} />
          <KpiCard label="Available"     value={stats?.summary?.availableBooks ?? "—"} accent="#4caf8a" />
          <KpiCard label="Utilization"   value={stats?.summary?.utilizationRate ?? "—"} />
        </div>

        {/* Charts row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: "2rem" }}>

          {/* Top Books Bar Chart */}
          <div style={card}>
            <h2 style={cardTitle}>Top 5 Most Borrowed Books</h2>
            {topBooks.length === 0 ? <Empty /> : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topBooks} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="title" tick={{ fill: "#556070", fontSize: 11 }} tickFormatter={v => v.length > 14 ? v.slice(0,14)+"…" : v} />
                  <YAxis tick={{ fill: "#556070", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 8, color: "#e2e8f0", fontSize: 13 }} cursor={{ fill: "#1a2130" }} />
                  <Bar dataKey="borrow_count" fill={GOLD} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top Categories Pie */}
          <div style={card}>
            <h2 style={cardTitle}>Borrows by Category</h2>
            {topCats.length === 0 ? <Empty /> : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={topCats} dataKey="borrow_count" nameKey="category" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                      {topCats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 8, color: "#e2e8f0", fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", marginTop: 8 }}>
                  {topCats.map((c, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: ".75rem", color: "#8a9ab5" }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "inline-block" }} />
                      {c.category}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ML Demand Prediction */}
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
            <div>
              <h2 style={cardTitle}>ML Demand Prediction</h2>
              <p style={{ fontSize: ".82rem", color: "#556070", marginTop: 3 }}>Uses frequency analysis to forecast which books will be most needed next semester.</p>
            </div>
            <button onClick={runPrediction} disabled={predLoading} style={{ padding: "10px 20px", background: GOLD, border: "none", borderRadius: 9, color: "#0d0a04", fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", fontWeight: 600, cursor: "pointer", opacity: predLoading ? .6 : 1, whiteSpace: "nowrap" }}>
              {predLoading ? "Running ML…" : "▶ Run Prediction"}
            </button>
          </div>

          {!prediction && !predLoading && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#2e3d52", fontSize: ".85rem", border: "1px dashed #1e2a38", borderRadius: 10 }}>
              Click "Run Prediction" to analyze borrowing patterns and forecast demand.
            </div>
          )}

          {predLoading && (
            <div style={{ padding: "2rem", textAlign: "center", color: "#556070", fontSize: ".85rem" }}>
              Running Python ML model…
            </div>
          )}

          {prediction && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {prediction.map((item, i) => (
                <div key={i} style={{ background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 10, padding: "1rem 1.2rem" }}>
                  <div style={{ fontSize: ".72rem", color: GOLD, fontWeight: 600, letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 4 }}>#{i+1} predicted</div>
                  <div style={{ color: "#f0e6d0", fontWeight: 500, fontSize: ".9rem", marginBottom: 2 }}>{item.title}</div>
                  <div style={{ fontSize: ".78rem", color: "#556070" }}>{item.category}</div>
                  <div style={{ marginTop: 8, fontSize: ".78rem", color: "#8a9ab5" }}>Predicted borrows: <strong style={{ color: GOLD }}>{item.predicted_demand}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      {toast && <div style={toastStyle(toast.isError)}>{toast.msg}</div>}
    </div>
  );
}

const card      = { background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.4rem 1.5rem", marginBottom: 0 };
const cardTitle = { fontFamily: "'DM Serif Display',serif", fontSize: "1.05rem", color: "#f0e6d0", marginBottom: "1rem" };
const Empty     = () => <div style={{ color: "#2e3d52", fontSize: ".85rem", padding: "1rem 0" }}>No data yet. Issue some books first.</div>;
const toastStyle = (isError) => ({ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "12px 18px", borderRadius: 10, fontSize: ".85rem", zIndex: 999, fontFamily: "'DM Sans',sans-serif", border: "1px solid", background: isError ? "#1a0d0d" : "#1a2540", borderColor: isError ? "#a32d2d" : "#2a3a5a", color: isError ? "#f09595" : GOLD });