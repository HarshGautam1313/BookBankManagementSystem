import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function Transactions() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);

    useEffect(() => { fetchLogs(); }, []);

    async function fetchLogs() {
        try {
            const res = await api.get('/transactions/all');
            setLogs(res.data);
        } catch (e) { showToast("Failed to load logs", true); }
    }

    function showToast(msg, isError = false) {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 3500);
    }

    async function handleReturn(transId) {
        if (!window.confirm("Mark this book as returned?")) return;
        setLoading(true);
        try {
            await api.put(`/transactions/return/${transId}`);
            showToast("Book returned successfully!");
            fetchLogs();
        } catch (err) { showToast(err.response?.data?.message || "Return failed", true); }
        finally { setLoading(false); }
    }

    const activeLoans = logs.filter(l => l.status === 'active');

    return (
        <div style={{ padding: "2rem 2.5rem", color: "#e2e8f0" }}>
            <div style={{ marginBottom: "2rem" }}>
                <p style={{ fontSize: ".75rem", fontWeight: 600, color: "#d4a853", textTransform: "uppercase" }}>Administration</p>
                <h1 style={{ fontFamily: "'DM Serif Display',serif", fontSize: "1.9rem", color: "#f0e6d0" }}>Transaction Management</h1>
            </div>

            {/* Section 1: Active Loans (The "Return" Area) */}
            <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, marginBottom: "3rem", overflow: "hidden" }}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e2a38", display: "flex", justifyContent: "space-between" }}>
                    <h2 style={{ fontSize: "1.1rem", color: "#f0e6d0" }}>Currently Issued Books</h2>
                    <span style={{ background: "#d4a853", color: "#000", fontSize: ".7rem", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                        {activeLoans.length} Active
                    </span>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
                    <thead>
                        <tr style={{ background: "#0d1117", color: "#556070", textAlign: "left" }}>
                            <th style={thStyle}>Book</th>
                            <th style={thStyle}>Student</th>
                            <th style={thStyle}>Issue Date</th>
                            <th style={thStyle}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeLoans.length === 0 ? (
                            <tr><td colSpan={4} style={{ padding: "2rem", textAlign: "center", color: "#556070" }}>No active loans found.</td></tr>
                        ) : activeLoans.map(log => (
                            <tr key={log.trans_id} style={{ borderBottom: "1px solid #1a2130" }}>
                                <td style={tdStyle}>{log.book_title}</td>
                                <td style={tdStyle}>{log.student_name}</td>
                                <td style={tdStyle}>{log.issue_date}</td>
                                <td style={tdStyle}>
                                    <button onClick={() => handleReturn(log.trans_id)} disabled={loading} style={returnBtnStyle}>
                                        {loading ? "..." : "Mark Returned"}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Section 2: Full History (The Audit Log) */}
            <div style={{ background: "#111820", border: "1px solid #1e2a38", borderRadius: 12, overflow: "hidden" }}>
                <div style={{ padding: "1.2rem 1.5rem", borderBottom: "1px solid #1e2a38" }}>
                    <h2 style={{ fontSize: "1.1rem", color: "#f0e6d0" }}>Complete Transaction History</h2>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: ".85rem" }}>
                    <thead>
                        <tr style={{ background: "#0d1117", color: "#556070", textAlign: "left" }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Book</th>
                            <th style={thStyle}>Student</th>
                            <th style={thStyle}>Issued</th>
                            <th style={thStyle}>Returned</th>
                            <th style={thStyle}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.trans_id} style={{ borderBottom: "1px solid #1a2130" }}>
                                <td style={tdStyle}>{log.trans_id}</td>
                                <td style={tdStyle}>{log.book_title}</td>
                                <td style={tdStyle}>{log.student_name}</td>
                                <td style={tdStyle}>{log.issue_date}</td>
                                <td style={tdStyle}>{log.return_date || "—"}</td>
                                <td style={tdStyle}>
                                    <span style={{ 
                                        fontSize: ".7rem", padding: "2px 8px", borderRadius: 10, 
                                        background: log.status === 'active' ? '#1f0d0d' : '#0d1f14',
                                        color: log.status === 'active' ? '#f09595' : '#4caf8a'
                                    }}>{log.status}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {toast && <div style={toastStyle(toast.isError)}>{toast.msg}</div>}
        </div>
    );
}

const thStyle = { padding: "12px 16px", color: "#556070", fontSize: ".75rem", textTransform: "uppercase", fontWeight: 500 };
const tdStyle = { padding: "12px 16px", color: "#8a9ab5" };
const returnBtnStyle = { background: "#d4a853", border: "none", padding: "5px 12px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: ".75rem" };
const toastStyle = (isError) => ({ position: "fixed", bottom: "1.5rem", right: "1.5rem", padding: "12px 18px", borderRadius: 10, background: isError ? "#1a0d0d" : "#1a2540", color: isError ? "#f09595" : "#d4a853", border: "1px solid", borderColor: isError ? "#a32d2d" : "#2a3a5a", zIndex: 1000 });
