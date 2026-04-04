import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Search,
  Eye,
  X,
} from "lucide-react";

const DashboardPage = ({ departmentName = "Water Department" }) => {

  const initialComplaints = [
    {
      id: 101,
      title: "Pipeline leakage in Ward 5",
      description: "Major underground pipeline leakage causing water loss.",
      priority: "Urgent",
      status: "Pending",
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
    },
    {
      id: 102,
      title: "Low water pressure",
      description: "Residents facing low pressure during morning hours.",
      priority: "Normal",
      status: "Resolved",
      createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000),
    },
    {
      id: 103,
      title: "Valve malfunction",
      description: "Main distribution valve not operating properly.",
      priority: "Escalated",
      status: "In Progress",
      createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000),
    },
  ];

  const [complaints] = useState(initialComplaints);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [, setTick] = useState(0);

  /* SLA Auto Refresh */
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  /* Filter Logic */
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.id.toString().includes(search);

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    const matchesPriority =
      priorityFilter === "All" || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  /* SLA Calculation */
  const getSLA = (createdAt, status) => {
    const hours =
      (Date.now() - new Date(createdAt)) / (1000 * 60 * 60);

    if (status === "Resolved")
      return { label: "Resolved", color: "#16a34a" };

    if (hours > 48)
      return { label: "Escalated", color: "#dc2626" };

    if (hours > 24)
      return { label: "Warning", color: "#f59e0b" };

    return { label: "Normal", color: "#1e3a8a" };
  };

  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h2>{departmentName} – Command Dashboard</h2>
        <p style={styles.subtitle}>
          Real-time monitoring & SLA governance control
        </p>
      </div>

      {/* STATISTICS */}
      <div style={styles.grid}>
        <StatCard icon={<TrendingUp size={24} />} label="Total" value="120" />
        <StatCard icon={<Clock size={24} />} label="Pending" value="35" />
        <StatCard icon={<AlertTriangle size={24} />} label="Escalated" value="10" />
        <StatCard icon={<CheckCircle size={24} />} label="Resolved Today" value="25" />
      </div>

      {/* FILTERS */}
      <div style={styles.filterSection}>
        <div style={styles.searchBox}>
          <Search size={18} />
          <input
            placeholder="Search complaints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.input}
          />
        </div>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={styles.select}>
          <option>All</option>
          <option>Pending</option>
          <option>In Progress</option>
          <option>Resolved</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} style={styles.select}>
          <option>All</option>
          <option>Normal</option>
          <option>Urgent</option>
          <option>Escalated</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.tableSection}>
        <h3 style={styles.sectionTitle}>Complaint List</h3>

        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Complaint</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>SLA</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => {
              const sla = getSLA(c.createdAt, c.status);

              return (
                <tr key={c.id} style={styles.tableRow}>
                  <td style={styles.td}>{c.id}</td>
                  <td style={styles.td}>{c.title}</td>
                  <td style={styles.td}><Badge text={c.priority} /></td>
                  <td style={styles.td}><Badge text={c.status} /></td>
                  <td style={styles.td}>
                    <span style={{
                      background: `${sla.color}20`,
                      color: sla.color,
                      padding: "6px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                      fontWeight: 600,
                    }}>
                      {sla.label}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {selectedComplaint && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Complaint Details</h3>
              <X size={20} style={{ cursor: "pointer" }} onClick={() => setSelectedComplaint(null)} />
            </div>
            <p><strong>ID:</strong> {selectedComplaint.id}</p>
            <p><strong>Title:</strong> {selectedComplaint.title}</p>
            <p><strong>Description:</strong> {selectedComplaint.description}</p>
            <p><strong>Priority:</strong> {selectedComplaint.priority}</p>
            <p><strong>Status:</strong> {selectedComplaint.status}</p>
          </div>
        </div>
      )}
    </div>
  );
};

/* COMPONENTS */

const StatCard = ({ icon, label, value }) => (
  <div style={styles.card}>
    <div style={styles.iconBox}>{icon}</div>
    <div>
      <p>{label}</p>
      <h2>{value}</h2>
    </div>
  </div>
);

const Badge = ({ text }) => {
  const colors = {
    Urgent: "#dc2626",
    Escalated: "#f97316",
    Resolved: "#16a34a",
    Pending: "#f59e0b",
    "In Progress": "#1e3a8a",
    Normal: "#475569",
  };

  const color = colors[text] || "#475569";

  return (
    <span style={{
      background: `${color}20`,
      color,
      padding: "6px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
    }}>
      {text}
    </span>
  );
};

/* STYLES */

const styles = {
  header: { marginBottom: 30 },
  subtitle: { color: "#64748b" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
    marginBottom: 30,
  },

  card: {
    background: "#ffffff",
    padding: 20,
    borderRadius: 14,
    display: "flex",
    gap: 15,
    alignItems: "center",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
  },

  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    background: "#0b1f3a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  filterSection: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },

  searchBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    padding: "8px 12px",
    borderRadius: 8,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  input: { border: "none", outline: "none" },

  select: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
  },

  tableSection: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    boxShadow: "0 8px 25px rgba(0,0,0,0.04)",
  },

  sectionTitle: { marginBottom: 15 },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14,
  },

  tableHeaderRow: {
    background: "#f1f5f9",
  },

  th: {
    padding: "14px 16px",
    fontWeight: 600,
    color: "#475569",
    borderBottom: "2px solid #e2e8f0",
  },

  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f1f5f9",
  },

  tableRow: {
    transition: "0.2s",
  },

  viewBtn: {
    background: "#0b1f3a",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
  },

  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 12,
    width: 400,
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
};

export default DashboardPage;