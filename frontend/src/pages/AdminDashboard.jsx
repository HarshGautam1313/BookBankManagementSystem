import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import KpiCard from "../components/Kpicard";
import api from "../api/axios";

export default function AdminDashboard() {
  const [stats, setStats]       = useState(null);
  const [books, setBooks]       = useState([]);
  const [search, setSearch]     = useState("");
  const [modal, setModal]       = useState(null);   // "add" | "edit" | "issue"
  const [selected, setSelected] = useState(null);
  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(false);
  
  // --- User Search States ---
  const [users, setUsers]       = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const emptyBook = { title: "", author: "", isbn: "", category: "" };
  const [form, setForm] = useState(emptyBook);
  const [issueUserId, setIssueUserId] = useState("");

  useEffect(() => { 
    fetchAll(); 
    fetchUsers(); // Initial load of users
  }, []);

  // Fetch users with optional search query
  async function fetchUsers(query = "") {
    try {
      const res = await api.get(`/users?search=${query}`);
      setUsers(res.data);
    } catch (e) {
      console.error("Failed to fetch users");
    }
  }

  // Debounce user search to avoid hitting API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(userSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [userSearch]);

  async function fetchAll() {
    try {
      const [statsRes, booksRes] = await Promise.all([
        api.get("/analytics/stats"),
        api.get("/books"),
      ]);
      setStats(statsRes.data);
      setBooks(booksRes.data);
    } catch (e) { showToast("Failed to load data.", true); }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleAddBook(e) {
    e.preventDefault();
    if (!form.title || !form.author || !form.category) return showToast("Fill all required fields.", true);
    setLoading(true);
    try {
      await api.post("/books", form);
      showToast("Book added successfully!");
      setModal(null); setForm(emptyBook); fetchAll();
    } catch (err) { showToast(err.response?.data?.message || "Failed to add book.", true); }
    finally { setLoading(false); }
  }

  async function handleEditBook(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/books/${selected.book_id}`, form);
      showToast("Book updated!");
      setModal(null); setSelected(null); fetchAll();
    } catch (err) { showToast(err.response?.data?.message || "Failed to update.", true); }
    finally { setLoading(false); }
  }

  async function handleDeleteBook(bookId) {
    if (!window.confirm("Delete this book?")) return;
    try {
      await api.delete(`/books/${bookId}`);
      showToast("Book deleted.");
      fetchAll();
    } catch (err) { showToast("Failed to delete.", true); }
  }

  async function handleIssue(e) {
    e.preventDefault();
    if (!issueUserId) return showToast("Please select a student.", true);
    setLoading(true);
    try {
      await api.post("/transactions/issue", { book_id: selected.book_id, user_id: issueUserId });
      showToast("Book issued successfully!");
      setModal(null); setSelected(null); setIssueUserId(""); fetchAll();
    } catch (err) { showToast(err.response?.data?.message || "Failed to issue.", true); }
    finally { setLoading(false); }
  }

  async function handleReturn(transId) {
    try {
      await api.put(`/transactions/return/${transId}`);
      showToast("Book returned!"); fetchAll();
    } catch (err) { showToast("Failed to return.", true); }
  }

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase()) ||
    b.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0d1117" }}>
      <Sidebar />
      <main style={{ flex: 1, padding: "2rem 2.5rem", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <p style={{ fontSize: ".75rem", fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase", color: "#d4a853", marginBottom: 6 }}>Admin</p>
          <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", color: "#f0e6d0" }}>Dashboard</h1>
        </div>

        {/* KPI Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: "2.5rem" }}>
          <KpiCard label="Total Books"      value={stats?.summary?.totalBooks ?? "—"}      sub="in inventory" />
          <KpiCard label="Issued"           value={stats?.summary?.issuedBooks ?? "—"}      sub="currently out" accent="#d4a853" />
          <KpiCard label="Available"        value={stats?.summary?.availableBooks ?? "—"}  sub="ready to borrow" accent="#4caf8a" />
          <KpiCard label="Utilization"      value={stats?.summary?.utilizationRate ?? "—"} sub="of collection used" />
        </div>

        {/* Inventory Table */}
        <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, overflow: "hidden" }}>

          {/* Table Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e2a38" }}>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.1rem", color: "#f0e6d0" }}>Book Inventory</h2>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                placeholder="Search books..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: "8px 14px", background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 8, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", outline: "none", width: 200 }}
              />
              <button onClick={() => { setForm(emptyBook); setModal("add"); }} style={btnStyle("#d4a853","#0d0a04")}>
                + Add Book
              </button>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
              <thead>
  <tr style={{ borderBottom: "1px solid #1e2a38" }}>
    {["Title","Author","Category","ISBN","Available","Status","Borrower","Actions"].map(h => (
      <th key={h} style={{ padding: "10px 16px", textAlign: "left", color: "#556070", fontWeight: 500, fontSize: ".75rem", letterSpacing: ".06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
    ))}
  </tr>
</thead>
              <tbody>
                {filtered.map(book => (
  <tr key={book.book_id} style={{ borderBottom: "1px solid #1a2130" }}
    onMouseEnter={e => e.currentTarget.style.background = "#0f1620"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
    <td style={td()}><span style={{ color: "#e2e8f0", fontWeight: 500 }}>{book.title}</span></td>
    <td style={td()}>{book.author}</td>
    <td style={td()}>
      <span style={{ background: "#1a2540", color: "#8ab4f8", fontSize: ".72rem", padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>{book.category}</span>
    </td>
    <td style={td()}>{book.isbn || "—"}</td>
    
    {/* NEW COLUMN: Available Copies */}
    <td style={td()}>
      <span style={{ color: book.available_count > 0 ? "#4caf8a" : "#f09595", fontWeight: 600 }}>
        {book.available_count}
      </span>
    </td>

    <td style={td()}>
      <span style={{
        background: book.status === "available" ? "#0d1f14" : "#1f0d0d",
        color: book.status === "available" ? "#4caf8a" : "#f09595",
        fontSize: ".72rem", padding: "3px 10px", borderRadius: 20
      }}>{book.status}</span>
    </td>
    <td style={td()}>{book.current_borrower || "—"}</td>
    <td style={td()}>
      <div style={{ display: "flex", gap: 6, flexWrap: "nowrap" }}>
        {book.status === "available" && (
          <button onClick={() => { setSelected(book); setModal("issue"); }} style={smBtn("#1a2540","#d4a853")}>Issue</button>
        )}
        {book.status === "issued" && book.trans_id && (
          <button onClick={() => handleReturn(book.trans_id)} style={smBtn("#1a1408","#d4a853")}>Return</button>
        )}
        <button onClick={() => { setSelected(book); setForm({title:book.title,author:book.author,isbn:book.isbn||"",category:book.category}); setModal("edit"); }} style={smBtn("#1a2540","#8ab4f8")}>Edit</button>
        <button onClick={() => handleDeleteBook(book.book_id)} style={smBtn("#1a0d0d","#f09595")}>Del</button>
      </div>
    </td>
  </tr>
))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        {stats?.recentActivity?.length > 0 && (
          <div style={{ marginTop: "2rem", background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, padding: "1.2rem 1.5rem" }}>
            <h2 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.1rem", color: "#f0e6d0", marginBottom: "1rem" }}>Recent Activity</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {stats.recentActivity.map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: ".83rem", padding: "8px 0", borderBottom: "1px solid #1a2130" }}>
                  <span style={{ color: "#e2e8f0" }}>{a.book_title}</span>
                  <span style={{ color: a.status === "active" ? "#d4a853" : "#4caf8a", fontSize: ".75rem" }}>{a.status === "active" ? "Issued" : "Returned"} · {a.full_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* MODALS */}
      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add New Book" : "Edit Book"} onClose={() => setModal(null)}>
          <form onSubmit={modal === "add" ? handleAddBook : handleEditBook}>
            {[["Title *","title","text"],["Author *","author","text"],["Category *","category","text"],["ISBN","isbn","text,"]].map(([lbl,key,type]) => (
              <div key={key} style={{ marginBottom: "1rem" }}>
                <label style={labelStyle}>{lbl}</label>
                <input type={type} value={form[key]} onChange={e => setForm({...form,[key]:e.target.value})} style={inputStyle} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ ...btnStyle("#d4a853","#0d0a04"), width: "100%", marginTop: 8 }}>
              {loading ? "Saving..." : modal === "add" ? "Add Book" : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}

      {modal === "issue" && selected && (
        <Modal title={`Issue: ${selected.title}`} onClose={() => setModal(null)}>
          <form onSubmit={handleIssue}>
            <div style={{ marginBottom: "1.2rem" }}>
              <label style={labelStyle}>Find Student</label>
              <input 
                type="text" 
                placeholder="Search name or email..." 
                value={userSearch} 
                onChange={e => setUserSearch(e.target.value)} 
                style={{ ...inputStyle, marginBottom: "10px" }} 
              />
              <label style={labelStyle}>Select Student</label>
              <select 
                value={issueUserId} 
                onChange={e => setIssueUserId(e.target.value)} 
                style={inputStyle} 
                required
              >
                <option value="">-- Choose a Student --</option>
                {users.map(u => (
                  <option key={u.user_id} value={u.user_id}>
                    {u.full_name} ({u.email})
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" disabled={loading} style={{ ...btnStyle("#d4a853","#0d0a04"), width: "100%" }}>
              {loading ? "Issuing..." : "Confirm Issue"}
            </button>
          </form>
        </Modal>
      )}

      {toast && <div style={toastStyle(toast.isError)}>{toast.msg}</div>}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "1rem" }}>
      <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 14, padding: "1.8rem", width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h3 style={{ fontFamily: "'DM Serif Display',serif", color: "#f0e6d0", fontSize: "1.2rem" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#556070", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

const td    = () => ({ padding: "12px 16px", color: "#8a9ab5", verticalAlign: "middle" });
const btnStyle = (bg, color) => ({ padding: "9px 16px", background: bg, border: "none", borderRadius: 8, color, fontFamily: "'DM Sans',sans-serif", fontSize: ".85rem", fontWeight: 600, cursor: "pointer" });
const smBtn = (bg, color)    => ({ padding: "5px 10px", background: bg, border: "none", borderRadius: 6, color, fontFamily: "'DM Sans',sans-serif", fontSize: ".75rem", cursor: "pointer", whiteSpace: "nowrap" });
const labelStyle = { display: "block", fontSize: ".75rem", fontWeight: 500, color: "#8a9ab5", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: 7 };
const inputStyle = { width: "100%", padding: "10px 14px", background: "#0d1117", border: "1px solid #1e2a38", borderRadius: 9, color: "#e2e8f0", fontFamily: "'DM Sans',sans-serif", fontSize: ".9rem", outline: "none" };
const toastStyle = (isError) => ({ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "12px 18px", borderRadius: 10, fontSize: ".85rem", zIndex: 999, maxWidth: 280, fontFamily: "'DM Sans',sans-serif", border: "1px solid", background: isError ? "#1a0d0d" : "#1a2540", borderColor: isError ? "#a32d2d" : "#2a3a5a", color: isError ? "#f09595" : "#d4a853" });