import React, { useState } from "react";
import { Eye, Search, Calendar, BarChart2 } from "lucide-react";

const AuditLogsPage = ({ departmentName }) => {

  const [selectedLog, setSelectedLog] = useState(null);
  const [showChart, setShowChart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [officerFilter, setOfficerFilter] = useState("All");
  const [chartMode, setChartMode] = useState("monthly");

  /* ================= SAMPLE DATA ================= */

  const complaintsLogs = [
    {
      id: "SAN-1001",
      officer: "Junior Engineer - Ward 5",
      status: "Resolved",
      description: "Garbage issue resolved successfully.",
      createdDate: "2026-01-10",
      workStartDate: "2026-01-11",
      resolvedDate: "2026-01-15",
    },
    {
      id: "SAN-1002",
      officer: "System Manager",
      status: "Escalated",
      description: "Drainage issue escalated.",
      createdDate: "2026-02-18",
      workStartDate: "2026-02-19",
      resolvedDate: null,
    },
    {
      id: "SAN-1003",
      officer: "Ward Supervisor",
      status: "Resolved",
      description: "Cleaning completed.",
      createdDate: "2025-12-05",
      workStartDate: "2025-12-06",
      resolvedDate: "2025-12-08",
    },
  ];

  /* ================= FILTER ================= */

  const officers = ["All", ...new Set(complaintsLogs.map(l => l.officer))];

  const filteredLogs = complaintsLogs.filter(log => {
    const matchSearch = log.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchOfficer =
      officerFilter === "All" || log.officer === officerFilter;
    return matchSearch && matchOfficer;
  });

  /* ================= CHART DATA ================= */

  const chartData = {};
  complaintsLogs.forEach(log => {
    const date = new Date(log.createdDate);
    const key =
      chartMode === "monthly"
        ? `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
        : date.getFullYear();
    chartData[key] = (chartData[key] || 0) + 1;
  });

  /* ================= DURATION ================= */

  const calculateDuration = (start, end) => {
    if (!start || !end) return "In Progress";
    const s = new Date(start);
    const e = new Date(end);
    const days = Math.ceil((e - s) / (1000 * 60 * 60 * 24));
    return `${days} Days`;
  };

  return (
    <div style={pageContainer}>
      <h1 style={title}>{departmentName} – Audit Analytics Dashboard</h1>

      {/* ================= TOP BAR ================= */}

      <div style={topBar}>

        <button style={chartButton} onClick={() => setShowChart(true)}>
          <BarChart2 size={16}/> View Analytics
        </button>

        <div style={searchBox}>
          <Search size={14}/>
          <input
            type="text"
            placeholder="Search Complaint ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
        </div>

        <select
          value={officerFilter}
          onChange={(e) => setOfficerFilter(e.target.value)}
          style={dropdown}
        >
          {officers.map((off, i) => (
            <option key={i}>{off}</option>
          ))}
        </select>

      </div>

      {/* ================= TABLE ================= */}

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>Complaint ID</th>
              <th style={th}>Officer</th>
              <th style={th}>Status</th>
              <th style={th}>Created Date</th>
              <th style={th}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log, index) => (
              <tr key={index} style={rowStyle}>
                <td style={tdStrong}>{log.id}</td>
                <td style={td}>{log.officer}</td>
                <td style={td}>
                  <span style={statusBadge(log.status)}>
                    {log.status}
                  </span>
                </td>
                <td style={td}>{log.createdDate}</td>
                <td style={td}>
                  <button
                    style={viewButton}
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye size={14}/> View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= CHART MODAL ================= */}

      {showChart && (
        <div style={overlay} onClick={() => setShowChart(false)}>
          <div style={chartModal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h2>Analytics Overview</h2>
                <p style={modalSub}>
                  Complaint Data grouped by {chartMode === "monthly" ? "Month & Year" : "Year"}
                </p>
              </div>
              <button style={closeButton} onClick={() => setShowChart(false)}>✕</button>
            </div>

            <div style={toggleButtons}>
              <button
                style={chartMode === "monthly" ? activeToggle : toggleBtn}
                onClick={() => setChartMode("monthly")}
              >
                Monthly
              </button>
              <button
                style={chartMode === "yearly" ? activeToggle : toggleBtn}
                onClick={() => setChartMode("yearly")}
              >
                Yearly
              </button>
            </div>

            <div style={chartContainer}>
              {Object.keys(chartData).map((key, i) => (
                <div key={i} style={barWrapper}>
                  <div
                    style={{
                      ...bar,
                      height: `${chartData[key] * 40}px`,
                    }}
                  />
                  <span style={barLabel}>{key}</span>
                  <span style={barValue}>{chartData[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {selectedLog && (
        <div style={overlay} onClick={() => setSelectedLog(null)}>
          <div style={modal} onClick={(e) => e.stopPropagation()}>
            <div style={modalHeader}>
              <div>
                <h2>{selectedLog.id}</h2>
                <p style={modalSub}>Official Complaint Case Record</p>
              </div>
              <button style={closeButton} onClick={() => setSelectedLog(null)}>✕</button>
            </div>

            <div style={detailsGrid}>
              <div>
                <p><strong>Officer:</strong> {selectedLog.officer}</p>
                <p><strong>Status:</strong> {selectedLog.status}</p>
              </div>

              <div>
                <p><strong>Created:</strong> {selectedLog.createdDate}</p>
                <p><strong>Work Started:</strong> {selectedLog.workStartDate}</p>
                <p><strong>Resolved:</strong> {selectedLog.resolvedDate || "Pending"}</p>
                <p><strong>Duration:</strong> {calculateDuration(selectedLog.createdDate, selectedLog.resolvedDate)}</p>
              </div>
            </div>

            <div style={section}>
              <strong>Resolution Details</strong>
              <div style={descriptionBox}>
                {selectedLog.description}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/* ================= STYLES ================= */

const pageContainer = { padding: 40, background: "#f1f5f9", minHeight: "100vh" };
const title = { fontSize: 28, fontWeight: 700, marginBottom: 30 };

const topBar = { display: "flex", gap: 20, marginBottom: 30, alignItems: "center" };

const chartButton = {
  background: "#0f172a",
  color: "#fff",
  padding: "8px 16px",
  borderRadius: 30,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const searchBox = {
  display: "flex",
  alignItems: "center",
  gap: 6,
  background: "#fff",
  padding: "6px 12px",
  borderRadius: 30,
  border: "1px solid #d1d5db",
};

const searchInput = { border: "none", outline: "none" };
const dropdown = { padding: "6px 12px", borderRadius: 20 };

const tableContainer = { background: "#fff", padding: 25, borderRadius: 16 };
const table = { width: "100%", borderCollapse: "collapse" };
const headerRow = { background: "#f8fafc" };
const th = { padding: 14, textAlign: "left", fontWeight: 600 };
const td = { padding: 14 };
const tdStrong = { ...td, fontWeight: 600 };
const rowStyle = { borderBottom: "1px solid #e2e8f0" };

const statusBadge = (status) => ({
  padding: "6px 14px",
  borderRadius: 20,
  fontSize: 12,
  fontWeight: 600,
  background: status === "Resolved" ? "#dcfce7" : "#fee2e2",
});

const viewButton = {
  background: "#2563eb",
  color: "#fff",
  padding: "6px 14px",
  borderRadius: 20,
  border: "none",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.55)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  width: 800,
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 20,
  padding: 30,
};

const chartModal = { ...modal };

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: 20,
};

const modalSub = { fontSize: 13, color: "#64748b" };

const toggleButtons = { display: "flex", gap: 10, marginBottom: 20 };

const toggleBtn = {
  padding: "6px 16px",
  borderRadius: 20,
  border: "1px solid #d1d5db",
  cursor: "pointer",
  background: "#fff",
};

const activeToggle = { ...toggleBtn, background: "#2563eb", color: "#fff" };

const chartContainer = {
  display: "flex",
  alignItems: "flex-end",
  gap: 30,
  height: 220,
};

const barWrapper = { display: "flex", flexDirection: "column", alignItems: "center" };
const bar = { width: 50, background: "#2563eb", borderRadius: 8 };
const barLabel = { marginTop: 10, fontSize: 12 };
const barValue = { fontWeight: 600 };

const detailsGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 20,
  marginBottom: 20,
};

const section = { marginTop: 20 };
const descriptionBox = {
  marginTop: 10,
  background: "#f9fafb",
  padding: 15,
  borderRadius: 10,
};

const closeButton = {
  background: "#dc2626",
  color: "#fff",
  border: "none",
  padding: "6px 12px",
  borderRadius: 20,
  cursor: "pointer",
};

export default AuditLogsPage;