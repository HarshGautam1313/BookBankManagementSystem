import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api/axios";

export default function StudentPortal() {
  const raw  = localStorage.getItem("user");
  const user = raw && raw !== "undefined" ? JSON.parse(raw) : {};

  const [tab, setTab]             = useState("browse");
  const [books, setBooks]         = useState([]);
  const [history, setHistory]     = useState([]);
  const [recs, setRecs]           = useState([]);
  const [search, setSearch]       = useState("");
  const [toast, setToast]         = useState(null);
  const [recsLoading, setRL]      = useState(false);

  useEffect(() => { fetchBooks(); }, []);
  useEffect(() => { if (tab === "history") fetchHistory(); }, [tab]);
  useEffect(() => { if (tab === "recommendations") fetchRecs(); }, [tab]);

  async function fetchBooks() {
    try { const { data } = await api.get("/books"); setBooks(data); }
    catch { showToast("Could not load books.", true); }
  }

  async function fetchHistory() {
    try { const { data } = await api.get(`/transactions/user/${user.user_id}`); setHistory(data); }
    catch { showToast("Could not load history.", true); }
  }

  async function fetchRecs() {
    setRL(true);
    try {
      const endpoint = user.user_id
        ? `/smart/recommend/${user.user_id}`
        : `/smart/recommend/me`;
      const { data } = await api.get(endpoint);
      setRecs(Array.isArray(data.books) ? data.books : []);
    } catch (err) {
      setRecs([]);
      showToast("Could not load recommendations.", true);
    } finally { setRL(false); }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: "browse", label: "Browse Books" },
    { key: "history", label: "My Borrows" },
    { key: "recommendations", label: "For You ✦" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#d4a853", marginBottom: 6 }}>Student Portal</p>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", color: "#f0e6d0" }}>
            Hello, {user.full_name?.split(" ")[0] || "Student"} 👋
          </h1>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#111820", border: "1px solid #1e2a38", borderRadius: 10, padding: 4, marginBottom: "2rem", width: "fit-content" }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              padding: "8px 18px", border: "none", borderRadius: 7,
              background: tab === t.key ? "#1a2540" : "transparent",
              color: tab === t.key ? "#d4a853" : "#556070",
              fontFamily: "'DM Sans',sans-serif", fontSize: ".88rem", fontWeight: tab === t.key ? 500 : 400,
              cursor: "pointer", transition: "all .2s",
              borderLeft: tab === t.key ? "none" : "none",
              outline: "none",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* BROWSE TAB */}
        {tab === "browse" && (
          <>
            <input
              placeholder="Search by title, author, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: "100%", maxWidth: 460, padding: "10px 16px", background: "#111820", border: "1px solid #1e2a38", borderRadius: 9, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", outline: "none", marginBottom: "1.5rem" }}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
              {filtered.length === 0
                ? <p style={{ color: "#2e3d52", fontSize: ".85rem" }}>No books found.</p>
                : filtered.map(book => <BookCard key={book.book_id} book={book} />)
              }
            </div>
          </>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, overflow: "hidden" }}>
            <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e2a38" }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#f0e6d0", fontSize: "1.1rem" }}>Borrowing History</h2>
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "2.5rem", textAlign: "center", color: "#2e3d52", fontSize: ".85rem" }}>You haven't borrowed any books yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e2a38" }}>
                    {["Book","Category","Issued On","Returned On","Status"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#556070", fontWeight: 500, fontSize: ".72rem", letterSpacing: ".06em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {history.map(tx => (
                    <tr key={tx.trans_id} style={{ borderBottom: "1px solid #1a2130" }}>
                      <td style={td()}><span style={{ color: "#e2e8f0", fontWeight: 500 }}>{tx.title}</span><br /><span style={{ fontSize: ".75rem", color: "#556070" }}>{tx.author}</span></td>
                      <td style={td()}>{tx.category}</td>
                      <td style={td()}>{tx.issue_date?.slice(0,10)}</td>
                      <td style={td()}>{tx.return_date ? tx.return_date.slice(0,10) : "—"}</td>
                      <td style={td()}>
                        <span style={{ background: tx.status === "active" ? "#1f180d" : "#0d1f14", color: tx.status === "active" ? "#d4a853" : "#4caf8a", fontSize: ".72rem", padding: "3px 10px", borderRadius: 20 }}>
                          {tx.status === "active" ? "Active" : "Returned"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* RECOMMENDATIONS TAB */}
        {tab === "recommendations" && (
          <>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: "'DM Serif Display',serif", color: "#f0e6d0", fontSize: "1.2rem", marginBottom: 4 }}>Recommended for You</h2>
              <p style={{ fontSize: ".83rem", color: "#556070" }}>AI picks based on your borrowing history using cosine similarity.</p>
            </div>
            {recsLoading ? (
              <div style={{ color: "#556070", fontSize: ".85rem" }}>Running recommendation engine…</div>
            ) : recs.length === 0 ? (
              <div style={{ padding: "2rem", textAlign: "center", color: "#2e3d52", fontSize: ".85rem", border: "1px dashed #1e2a38", borderRadius: 10 }}>
                Borrow a few books first — the AI will then learn your taste.
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                {recs.map((book, i) => (
                  <div key={i} style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem" }}>
                    <div style={{ fontSize: ".68rem", fontWeight: 600, color: "#d4a853", letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 6 }}>✦ AI Pick #{i+1}</div>
                    <div style={{ color: "#f0e6d0", fontWeight: 500, fontSize: ".95rem", marginBottom: 4 }}>{book.title}</div>
                    <div style={{ fontSize: ".8rem", color: "#556070", marginBottom: 8 }}>{book.author}</div>
                    <span style={{ background: "#1a2540", color: "#8ab4f8", fontSize: ".72rem", padding: "3px 10px", borderRadius: 20 }}>{book.category}</span>
                    {book.similarity_score !== undefined && (
                      <div style={{ marginTop: 10, fontSize: ".75rem", color: "#556070" }}>
                        Match score: <strong style={{ color: "#d4a853" }}>{(book.similarity_score * 100).toFixed(0)}%</strong>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      {toast && <div style={toastStyle(toast.isError)}>{toast.msg}</div>}
    </div>
  );
}

function BookCard({ book }) {
  return (
    <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem", display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ background: "#1a2540", color: "#8ab4f8", fontSize: ".68rem", padding: "3px 8px", borderRadius: 20 }}>{book.category}</span>
        <span style={{ background: book.status === "available" ? "#0d1f14" : "#1f0d0d", color: book.status === "available" ? "#4caf8a" : "#f09595", fontSize: ".68rem", padding: "3px 8px", borderRadius: 20 }}>
          {book.status}
        </span>
      </div>
      <div style={{ color: "#f0e6d0", fontWeight: 500, fontSize: ".95rem", lineHeight: 1.3 }}>{book.title}</div>
      <div style={{ fontSize: ".8rem", color: "#556070" }}>{book.author}</div>
      {book.isbn && <div style={{ fontSize: ".72rem", color: "#2e3d52" }}>ISBN: {book.isbn}</div>}
      {book.status === "issued" && book.borrower_name && (
        <div style={{ fontSize: ".75rem", color: "#556070", borderTop: "1px solid #1a2130", paddingTop: 8, marginTop: 4 }}>
          Currently with: <span style={{ color: "#8a9ab5" }}>{book.borrower_name}</span>
        </div>
      )}
    </div>
  );
}

const td = () => ({ padding: "12px 16px", color: "#8a9ab5", verticalAlign: "middle" });
const toastStyle = (isError) => ({ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "12px 18px", borderRadius: 10, fontSize: ".85rem", zIndex: 999, fontFamily: "'DM Sans',sans-serif", border: "1px solid", background: isError ? "#1a0d0d" : "#1a2540", borderColor: isError ? "#a32d2d" : "#2a3a5a", color: isError ? "#f09595" : "#d4a853" });