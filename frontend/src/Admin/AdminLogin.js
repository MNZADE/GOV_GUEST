import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const initialComplaints = [
  { id: 101, citizen: "Rahul Patil", issue: "Water Leakage", dept: "Water Supply", status: "Pending", date: "2025-10-28" },
  { id: 102, citizen: "Meera Kulkarni", issue: "Garbage Not Collected", dept: "Sanitation", status: "In Progress", date: "2025-10-30" },
  { id: 103, citizen: "Sunil More", issue: "Street Light Not Working", dept: "Street Light", status: "Pending", date: "2025-11-01" },
  { id: 104, citizen: "Asha Deshmukh", issue: "Pothole on Road", dept: "Road & Transport", status: "Resolved", date: "2025-10-20" },
  { id: 105, citizen: "Vikas Shinde", issue: "Mosquito Issue", dept: "Health Department", status: "Pending", date: "2025-11-02" }
];

const DEPARTMENTS = [
  "Water Supply",
  "Sanitation",
  "Street Light",
  "Road & Transport",
  "Health Department"
];

const STATUS_FLOW = ["Pending", "In Progress", "Resolved"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState(initialComplaints);
  const [query, setQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const analytics = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter(c => c.status === "Pending").length,
    inProgress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length
  }), [complaints]);

  const filtered = complaints.filter(c =>
    (query === "" ||
      c.id.toString().includes(query) ||
      c.citizen.toLowerCase().includes(query.toLowerCase()) ||
      c.issue.toLowerCase().includes(query.toLowerCase())) &&
    (filterDept === "" || c.dept === filterDept) &&
    (filterStatus === "" || c.status === filterStatus)
  );

  const advanceStatus = (id) => {
    setComplaints(prev =>
      prev.map(c =>
        c.id === id
          ? { ...c, status: STATUS_FLOW[Math.min(STATUS_FLOW.indexOf(c.status) + 1, 2)] }
          : c
      )
    );
  };

  return (
    <div style={styles.dashboard}>

      {/* ✅ Sidebar */}
      <aside style={styles.sidebar}>
        <h2 style={styles.logo}>KMC Admin</h2>
        <ul style={styles.menu}>
          <li style={{ ...styles.menuItem, ...styles.active }}>📊 Dashboard</li>
          <li style={styles.menuItem}>👨‍💼 Officers</li>
          <li style={styles.menuItem}>📁 Complaints</li>
          <li style={styles.menuItem}>📈 Analytics</li>
          <li style={styles.menuItem}>📢 Notices</li>
        </ul>

        <button style={styles.logoutBtn} onClick={() => navigate("/")}>
          🚪 Logout
        </button>
      </aside>

      {/* ✅ Main Content */}
      <main style={styles.main}>

        <h2 style={styles.heading}>Welcome Admin 👋</h2>
        <p style={styles.subtext}>Manage city services & complaints efficiently.</p>

        {/* ✅ Analytics Summary Cards */}
        <div style={styles.cardContainer}>
          <Stat label="Total Complaints" value={analytics.total} color="#002855" />
          <Stat label="Pending" value={analytics.pending} color="#ff9800" />
          <Stat label="In Progress" value={analytics.inProgress} color="#e65100" />
          <Stat label="Resolved" value={analytics.resolved} color="#1e8e3e" />
        </div>

        {/* ✅ Filtering */}
        <div style={styles.filterRow}>
          <input
            style={styles.input}
            placeholder="Search by issue / citizen"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <select
            style={styles.input}
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
          </select>

          <select
            style={styles.input}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_FLOW.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* ✅ Table */}
        <div style={styles.tableSection}>
          <h3 style={styles.tableTitle}>Complaint Records</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Citizen</th>
                <th>Issue</th>
                <th>Status</th>
                <th>Date</th>
                <th>Next</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.citizen}</td>
                  <td>{c.issue}</td>
                  <td style={{ color: statusColor(c.status), fontWeight: "bold" }}>
                    {c.status}
                  </td>
                  <td>{c.date}</td>
                  <td>
                    <button
                      style={styles.actionBtn}
                      onClick={() => advanceStatus(c.id)}
                    >
                      Advance
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </main>
    </div>
  );
};

/* ✅ Smaller Card Component */
function Stat({ label, value, color }) {
  return (
    <div style={styles.card}>
      <h3 style={{ marginBottom: "6px" }}>{label}</h3>
      <p style={{ fontSize: "24px", color }}>{value}</p>
    </div>
  );
}

/* ✅ Status Color */
const statusColor = status => {
  if (status === "Resolved") return "#1e8e3e";
  if (status === "In Progress") return "#e65100";
  return "#ff9800"; // Pending
};

/* ✅ Inline Styles */
const styles = {
  dashboard: {
    display: "flex",
    height: "100vh",
    background: "#eef4ff"
  },
  sidebar: {
    width: "250px",
    background: "#002855",
    color: "#fff",
    padding: "25px",
    borderRadius: "0 10px 10px 0"
  },
  logo: { marginBottom: "25px", textAlign: "center" },
  menu: { listStyle: "none", padding: 0 },
  menuItem: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "6px",
    cursor: "pointer",
    transition: "0.3s"
  },
  active: { background: "#0066cc" },
  logoutBtn: {
    marginTop: "auto",
    padding: "12px",
    width: "100%",
    background: "crimson",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    color: "#fff"
  },
  main: {
    width: "100%",
    padding: "30px",
    overflow: "auto"
  },
  heading: { marginBottom: "6px" },
  subtext: { marginBottom: "15px", color: "#444" },
  cardContainer: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px"
  },
  card: {
    flex: 1,
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 4px 10px rgba(0,0,0,0.08)"
  },
  filterRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #aaa",
    flex: 1
  },
  tableSection: {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
  },
  tableTitle: { marginBottom: "15px" },
  table: {
    width: "100%",
    borderCollapse: "collapse"
  },
  actionBtn: {
    background: "#0059b3",
    border: "none",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer"
  }
};

export default AdminDashboard;
