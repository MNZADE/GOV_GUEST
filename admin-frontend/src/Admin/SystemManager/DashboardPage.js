import { useState, useMemo } from "react";
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";

const DashboardPage = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;

  const stats = {
    totalDepartments: 12,
    managers: 28,
    totalComplaints: 4562,
    urgentComplaints: 78,
    pendingComplaints: 312,
    resolvedComplaints: 4250,
  };

  const complaints = [
    {
      id: "CMP-1021",
      type: "Garbage not collected",
      department: "Health Department",
      location: "Ward 12 – Rajarampuri",
      priority: "urgent",
      description:
        "Garbage has not been collected for the last 4 days causing hygiene issues.",
      image: "https://via.placeholder.com/500x280",
    },
    {
      id: "CMP-1022",
      type: "Water leakage",
      department: "Water Supply Department",
      location: "Ward 8 – Shahupuri",
      priority: "medium",
      description: "Continuous water leakage near main road.",
      image: "https://via.placeholder.com/500x280",
    },
    {
      id: "CMP-1023",
      type: "Street light not working",
      department: "Electricity Department",
      location: "Ward 5 – Ujalaiwadi",
      priority: "normal",
      description: "Street light is not working since yesterday night.",
      image: "https://via.placeholder.com/500x280",
    },
  ];

  const filteredComplaints = useMemo(() => {
    return departmentFilter === "All"
      ? complaints
      : complaints.filter((c) => c.department === departmentFilter);
  }, [departmentFilter, complaints]);

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);

  const paginatedComplaints = filteredComplaints.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const departments = [
    "All",
    ...new Set(complaints.map((c) => c.department)),
  ];

  return (
    <div>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Administrative Overview</h1>

        <select
          value={departmentFilter}
          onChange={(e) => {
            setDepartmentFilter(e.target.value);
            setCurrentPage(1);
          }}
          style={styles.filter}
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* KPI CARDS */}
      <div style={styles.kpiGrid}>
        <KPI icon={<Building2 />} title="Departments" value={stats.totalDepartments} />
        <KPI icon={<Users />} title="Managers" value={stats.managers} />
        <KPI icon={<FileText />} title="Total Complaints" value={stats.totalComplaints} />
        <KPI icon={<AlertTriangle />} title="Urgent" value={stats.urgentComplaints} color="#b91c1c" />
        <KPI icon={<Clock />} title="Pending" value={stats.pendingComplaints} color="#d97706" />
        <KPI icon={<CheckCircle />} title="Resolved" value={stats.resolvedComplaints} color="#15803d" />
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Issue</th>
              <th style={styles.th}>Department</th>
              <th style={styles.th}>Location</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.thCenter}>Action</th>
            </tr>
          </thead>

          <tbody>
            {paginatedComplaints.map((c) => (
              <tr key={c.id} style={styles.tr}>
                <td>{c.id}</td>
                <td>{c.type}</td>
                <td>{c.department}</td>
                <td>{c.location}</td>
                <td>
                  <span style={{ ...styles.badge, ...priorityBadge[c.priority] }}>
                    {c.priority.toUpperCase()}
                  </span>
                </td>
                <td style={styles.tdCenter}>
                  <button
                    style={styles.viewBtn}
                    onClick={() => setSelectedComplaint(c)}
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div style={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Prev
          </button>

          <span>
            Page {currentPage} of {totalPages || 1}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* PROFESSIONAL MODAL */}
      {selectedComplaint && (
        <div style={styles.overlay}>
          <div style={styles.modal}>

            <div style={styles.modalTop}>
              <div>
                <h2>{selectedComplaint.type}</h2>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  Complaint ID: {selectedComplaint.id}
                </p>
              </div>

              <span
                style={{ ...styles.badge, ...priorityBadge[selectedComplaint.priority] }}
              >
                {selectedComplaint.priority.toUpperCase()}
              </span>
            </div>

            <div style={styles.modalContent}>

              <div style={styles.detailSection}>
                <InfoRow label="Department" value={selectedComplaint.department} />
                <InfoRow label="Location" value={selectedComplaint.location} />
                <InfoRow label="Description" value={selectedComplaint.description} />

                <div style={styles.timelineBox}>
                  <h4>Complaint Timeline</h4>
                  <ul>
                    <li>✔ Complaint Registered</li>
                    <li>⏳ Forwarded to Department</li>
                    <li>⌛ Awaiting Action</li>
                  </ul>
                </div>
              </div>

              <div style={styles.imageSection}>
                <img
                  src={selectedComplaint.image}
                  alt="Complaint"
                  style={styles.image}
                />
              </div>

            </div>

            <div style={styles.modalFooter}>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedComplaint(null)}
              >
                Close Complaint View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

/* KPI COMPONENT */
const KPI = ({ icon, title, value, color }) => (
  <div style={styles.kpiCard}>
    <div style={{ ...styles.kpiIcon, background: color || "#0b2c48" }}>
      {icon}
    </div>
    <div>
      <p style={styles.kpiLabel}>{title}</p>
      <h2 style={styles.kpiValue}>{value}</h2>
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <p style={styles.infoLabel}>{label}</p>
    <p style={styles.infoValue}>{value}</p>
  </div>
);

/* STYLES */
const styles = {
  header: { display: "flex", justifyContent: "space-between", marginBottom: 25 },
  title: { fontSize: 24, color: "#0b2c48" },
  filter: { padding: 8, borderRadius: 6, border: "1px solid #ddd" },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
    marginBottom: 30,
  },

  kpiCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    gap: 15,
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  },

  kpiIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  kpiLabel: { fontSize: 14, color: "#6b7280" },
  kpiValue: { fontSize: 24, fontWeight: 700 },

  tableCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 14,
    boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  },

  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: 12, background: "#f1f5f9" },
  thCenter: { textAlign: "center", padding: 12, background: "#f1f5f9" },
  tr: { borderBottom: "1px solid #eee" },
  tdCenter: { textAlign: "center" },

  badge: {
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
  },

  viewBtn: {
    padding: "6px 12px",
    background: "#0b2c48",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  pagination: {
    marginTop: 15,
    display: "flex",
    justifyContent: "space-between",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  modal: {
    background: "#fff",
    padding: 30,
    borderRadius: 16,
    width: 800,
  },

  modalTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  modalContent: {
    display: "flex",
    gap: 30,
  },

  detailSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },

  imageSection: { width: 300 },

  infoRow: {
    background: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },

  infoLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "#6b7280",
  },

  infoValue: {
    fontSize: 14,
    color: "#0b2c48",
  },

  timelineBox: {
    marginTop: 10,
    background: "#fff",
    padding: 15,
    borderRadius: 10,
    border: "1px solid #eee",
  },

  image: {
    width: "100%",
    borderRadius: 12,
  },

  modalFooter: {
    marginTop: 25,
  },

  closeBtn: {
    width: "100%",
    padding: 12,
    background: "#b91c1c",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },
};

const priorityBadge = {
  urgent: { background: "#fee2e2", color: "#b91c1c" },
  medium: { background: "#fef3c7", color: "#b45309" },
  normal: { background: "#dcfce7", color: "#15803d" },
};

export default DashboardPage;
