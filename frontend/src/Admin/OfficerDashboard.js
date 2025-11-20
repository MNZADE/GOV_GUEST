import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * OfficerDashboard.js — Final Clean Version ✅
 */

const SAMPLE_COMPLAINTS = [
  { id: 201, citizen: "Rahul Patil", issue: "Water Leakage", dept: "Water Supply", status: "Pending", date: "2025-10-28" },
  { id: 202, citizen: "Meera Kulkarni", issue: "Garbage Not Collected", dept: "Sanitation", status: "In Progress", date: "2025-10-30" },
  { id: 203, citizen: "Sunil More", issue: "Street Light Not Working", dept: "Street Light", status: "Pending", date: "2025-11-01" },
  { id: 204, citizen: "Asha Deshmukh", issue: "Pothole on Road", dept: "Road & Transport", status: "Resolved", date: "2025-10-20" },
  { id: 205, citizen: "Vikas Shinde", issue: "Mosquito Issue in locality", dept: "Health Department", status: "Pending", date: "2025-11-02" },
  { id: 206, citizen: "Suresh Patil", issue: "Clogged Drain", dept: "Sanitation", status: "Pending", date: "2025-11-03" },
];

const STATUS_FLOW = ["Pending", "In Progress", "Resolved"];

export default function OfficerDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const department = location.state?.department || "Unknown Department";

  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNotices, setShowNotices] = useState(false);

  const [notices] = useState([
    { id: 1, title: "Sanitation Drive", text: "City-wide sanitation drive on 20 Nov.", date: "2025-11-10", targetDept: "Sanitation" },
    { id: 2, title: "Water Supply Maintenance", text: "Scheduled maintenance on 15 Nov.", date: "2025-11-12", targetDept: "Water Supply" },
  ]);

  useEffect(() => {
    setComplaints(SAMPLE_COMPLAINTS.filter(c => c.dept === department));
  }, [department]);

  const analytics = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length,
  }), [complaints]);

  const filtered = complaints.filter(c =>
    (!query ||
      c.citizen.toLowerCase().includes(query.toLowerCase()) ||
      c.issue.toLowerCase().includes(query.toLowerCase()) ||
      String(c.id).includes(query)) &&
    (!filterStatus || c.status === filterStatus)
  );

  const advanceStatus = (id) =>
    setComplaints(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(c.status) + 1, 2)] }
        : c
    ));

  // ✅ Keep only this version — Fixed duplications!
  const markResolved = (id) =>
    setComplaints(prev => prev.map(c => (c.id === id ? { ...c, status: "Resolved" } : c)));

  const statusBg = (status) =>
    status === "Resolved" ? "#e6f7ec"
      : status === "In Progress" ? "#fff4e5"
        : "#fff7e6";

  // ✅ Keep ONLY this one version of viewDetails()
  const viewDetails = (c) => {
    alert(`Complaint ID: ${c.id}
Citizen: ${c.citizen}
Issue: ${c.issue}
Status: ${c.status}
Date: ${c.date}`);
  };

  return (
    <div style={S.styles.app}>
      {/* Sidebar */}
      <aside style={S.styles.sidebar}>
        <div style={S.styles.sideHeader}>
          <div style={S.styles.sideLogo}>KMC Officer</div>
          <div style={S.styles.sideDept}>{department}</div>
        </div>

        <nav style={S.styles.sideNav}>
          <div style={S.styles.navItemActive}>📋 My Complaints</div>
          <div style={S.styles.navItem} onClick={() => setShowNotices(false)}>🛠 Work Orders</div>
          <div style={S.styles.navItem} onClick={() => setShowNotices(true)}>🔔 Notices</div>
          <div style={S.styles.navItem} onClick={() => navigate("/")}>🚪 Logout</div>
        </nav>

        <div style={S.styles.sideFooter}>
          <small style={{ color: "#bcd" }}>Logged in as:</small>
          <strong>Officer - {department}</strong>
        </div>
      </aside>

      {/* Main */}
      <main style={S.styles.main}>
        <header style={S.styles.header}>
          <div>
            <h1 style={S.styles.title}>Officer Dashboard</h1>
            <div style={S.styles.subtitle}>Department: {department}</div>
          </div>

          <div style={S.styles.headerRight}>
            <div style={S.styles.searchWrap}>
              <input
                style={S.styles.searchInput}
                placeholder="Search citizen / issue..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button style={S.styles.iconBtn} onClick={() => setQuery("")}>✖</button>
            </div>
          </div>
        </header>

        {/* Analytics counters */}
        <section style={S.styles.analytics}>
          {Object.entries(analytics).map(([k, v]) => (
            <div key={k} style={S.styles.card}>
              <div style={S.styles.cardTitle}>{k}</div>
              <div style={S.styles.cardValue}>{v}</div>
            </div>
          ))}
        </section>

        {/* Notices Section */}
        {showNotices ? (
          <section style={S.styles.contentSection}>
            <h3 style={S.styles.sectionTitle}>Notices for {department}</h3>
            {notices.map(n => (
              <div key={n.id} style={S.styles.noticeItem}>
                <strong>{n.title}</strong>
                <p>{n.text}</p>
                <small>{n.date}</small>
              </div>
            ))}
          </section>
        ) : (
          /* Complaints Table */
          <section style={S.styles.contentSection}>
            <h3 style={S.styles.sectionTitle}>Complaints</h3>
            <div style={S.styles.tableWrap}>
              <table style={S.styles.table}>
                <thead>
                  <tr>
                    <th>ID</th><th>Citizen</th><th>Issue</th><th>Status</th><th>Date</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id}>
                      <td>#{c.id}</td>
                      <td>{c.citizen}</td>
                      <td>{c.issue}</td>
                      <td>
                        <span style={{ ...S.styles.statusPill, background: statusBg(c.status) }}>
                          {c.status}
                        </span>
                      </td>
                      <td>{c.date}</td>
                      <td>
                        <button style={S.styles.smallBtn} onClick={() => viewDetails(c)}>View</button>
                        <button style={S.styles.smallBtnPrimary} onClick={() => advanceStatus(c.id)}>Next</button>
                        <button style={S.styles.smallBtnSuccess} onClick={() => markResolved(c.id)}>Resolve</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

/* ✅ Inline styles (unchanged UI design) */
const S = {
  styles: {
    app: { display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif" },
    sidebar: { width: 250, background: "#032b50", color: "#fff", padding: 20, display: "flex", flexDirection: "column" },
    sideHeader: { marginBottom: 20 },
    sideLogo: { fontSize: 20, fontWeight: 800 },
    sideDept: { fontSize: 12, color: "#b8d3f0" },
    sideNav: { display: "flex", flexDirection: "column", gap: 8 },
    navItem: { cursor: "pointer", padding: "8px 10px", borderRadius: 6, color: "#cfe6ff" },
    navItemActive: { background: "#aee1ff", color: "#032b50", padding: "8px 10px", borderRadius: 6 },
    sideFooter: { marginTop: "auto" },

    main: { flex: 1, padding: 20 },
    header: { display: "flex", justifyContent: "space-between" },
    title: { margin: 0 },
    subtitle: { color: "#456" },

    searchWrap: { display: "flex", background: "#fff", padding: "6px 10px", borderRadius: 6 },
    searchInput: { border: "none", outline: "none", width: 200 },
    iconBtn: { border: "none", background: "none", cursor: "pointer" },

    analytics: { display: "flex", gap: 10, marginTop: 20 },
    card: { background: "#fff", padding: 12, borderRadius: 8 },
    cardTitle: { fontSize: 14, color: "#555" },
    cardValue: { fontSize: 22, fontWeight: "bold" },

    contentSection: { marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 700 },

    noticeItem: { background: "#fff", padding: 12, borderRadius: 8, marginTop: 10 },

    tableWrap: { marginTop: 10 },
    table: { width: "100%", borderCollapse: "collapse" },
    statusPill: { padding: "4px 12px", borderRadius: 20, fontSize: 12 },

    smallBtn: { marginRight: 4, padding: "6px 10px", background: "#eef", border: "none", borderRadius: 6 },
    smallBtnPrimary: { padding: "6px 10px", background: "#1976ff", color: "#fff", border: "none", borderRadius: 6 },
    smallBtnSuccess: { padding: "6px 10px", background: "#22a06b", color: "#fff", border: "none", borderRadius: 6 }
  }
};
