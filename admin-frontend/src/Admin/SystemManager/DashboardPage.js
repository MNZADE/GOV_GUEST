import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle
} from "lucide-react";

/* ================= PRIORITY ================= */
const getPriority = (issue = "", description = "") => {
  const text = (issue + " " + description).toLowerCase();

  if (
    text.includes("emergency") ||
    text.includes("danger") ||
    text.includes("fire") ||
    text.includes("accident")
  ) return "urgent";

  if (
    text.includes("water") ||
    text.includes("garbage") ||
    text.includes("drain") ||
    text.includes("road")
  ) return "medium";

  return "normal";
};

const DashboardPage = () => {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [complaints, setComplaints] = useState([]);

  const [stats, setStats] = useState({
    totalDepartments: 7,
    managers: 1,
    totalComplaints: 0,
    urgentComplaints: 0,
    pendingComplaints: 0,
    resolvedComplaints: 0,
  });

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const token = localStorage.getItem("kmc_token");

        const res = await fetch(
          "http://localhost:5000/api/complaints/system/all",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();

        const updated = (data.complaints || []).map((c) => ({
          ...c,
          priority: getPriority(c.issue, c.description),

          // ✅ FIXED department
          departments: c.department
            ? [c.department]
            : Array.isArray(c.departments)
            ? c.departments
            : [],
        }));

        setComplaints(updated);

        const pending = updated.filter(c => c.status === "Pending").length;
        const resolved = updated.filter(c => c.status === "Resolved").length;
        const urgent = updated.filter(c => c.priority === "urgent").length;

        setStats({
          totalDepartments: 7,
          managers: 1,
          totalComplaints: updated.length,
          urgentComplaints: urgent,
          pendingComplaints: pending,
          resolvedComplaints: resolved,
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchComplaints();
  }, []);

  const filteredComplaints = useMemo(() => {
    return departmentFilter === "All"
      ? complaints
      : complaints.filter(c =>
          c.departments.includes(departmentFilter)
        );
  }, [departmentFilter, complaints]);

  const departments = [
    "All",
    ...new Set(complaints.flatMap(c => c.departments)),
  ];

  return (
    <div style={{ padding: 25, background: "#f1f5f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Administrative Overview</h1>

        <select
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          style={styles.filter}
        >
          {departments.map((dept) => (
            <option key={dept}>{dept}</option>
          ))}
        </select>
      </div>

      {/* KPI */}
      <div style={styles.kpiGrid}>
        <KPI icon={<Building2 />} title="Departments" value={stats.totalDepartments} />
        <KPI icon={<Users />} title="Managers" value={stats.managers} />
        <KPI icon={<FileText />} title="Total Complaints" value={stats.totalComplaints} />
        <KPI icon={<AlertTriangle />} title="Urgent" value={stats.urgentComplaints} color="#ef4444" />
        <KPI icon={<Clock />} title="Pending" value={stats.pendingComplaints} color="#f59e0b" />
        <KPI icon={<CheckCircle />} title="Resolved" value={stats.resolvedComplaints} color="#22c55e" />
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
              <th style={styles.th}>Date & Time</th>
              <th style={styles.th}>Priority</th>
              <th style={styles.thCenter}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c._id} style={styles.tr}>
                <td style={styles.td}>{c.complaintId}</td>
                <td style={styles.td}>{c.issue}</td>

                <td style={styles.td}>
                  {c.department || c.departments.join(", ")}
                </td>

                <td style={styles.td}>{c.address}</td>

                <td style={styles.td}>
                  {c.date || "N/A"} <br />
                  <small>{c.time || ""}</small>
                </td>

                <td style={styles.td}>
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
      </div>

      {/* MODAL */}
      {selectedComplaint && (
        <div style={styles.overlay}>
          <div style={styles.modal}>

            <div style={styles.modalHeader}>
              <div>
                <h2 style={styles.modalTitle}>{selectedComplaint.issue}</h2>
                <p style={styles.modalId}>ID: {selectedComplaint.complaintId}</p>
              </div>

              <span style={{ ...styles.badge, ...priorityBadge[selectedComplaint.priority] }}>
                {selectedComplaint.priority.toUpperCase()}
              </span>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.detailSection}>
                <InfoRow label="Department" value={selectedComplaint.department || selectedComplaint.departments?.join(", ")} />
                <InfoRow label="Location" value={selectedComplaint.address} />
                <InfoRow label="Description" value={selectedComplaint.description} />
                <InfoRow label="Date" value={selectedComplaint.date} />
                <InfoRow label="Time" value={selectedComplaint.time} />

                <div style={styles.timelineBox}>
                  <h4>Complaint Progress</h4>
                  <ul>
                    <li>✔ Complaint Registered</li>
                    <li>⏳ Forwarded to Department</li>
                    <li>⌛ In Progress</li>
                  </ul>
                </div>
              </div>

              <div style={styles.imageSection}>
                <img
                  src={
                    selectedComplaint?.images?.length > 0
                      ? `http://localhost:5000/uploads/${selectedComplaint.images[0]}`
                      : "https://via.placeholder.com/400?text=No+Image"
                  }
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400?text=Image+Error";
                  }}
                  alt="Complaint"
                  style={styles.image}
                />
                <p style={styles.imageLabel}>Complaint Image</p>
              </div>
            </div>

            <button
              style={styles.closeBtn}
              onClick={() => setSelectedComplaint(null)}
            >
              Close
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */
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
  title: { fontSize: 26, fontWeight: 700 },
  filter: { padding: 10, borderRadius: 6 },

  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 20 },

  kpiCard: { background: "#fff", padding: 18, borderRadius: 12, display: "flex", gap: 10 },
  kpiIcon: { width: 45, height: 45, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" },

  kpiLabel: { fontSize: 13 },
  kpiValue: { fontSize: 22, fontWeight: 700 },

  tableCard: { background: "#fff", padding: 20, borderRadius: 12, marginTop: 20 },
  table: { width: "100%" },

  th: { textAlign: "left", padding: 12, background: "#f1f5f9" },
  thCenter: { textAlign: "center", padding: 12, background: "#f1f5f9" },

  tr: { borderBottom: "1px solid #eee" },
  td: { padding: 10 },
  tdCenter: { textAlign: "center" },

  badge: { padding: "5px 10px", borderRadius: 20, fontSize: 12 },

  viewBtn: { padding: "6px 12px", background: "#0b2c48", color: "#fff", borderRadius: 6 },

  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center" },

  modal: { background: "#fff", padding: 25, width: 850, borderRadius: 14 },

  modalHeader: { display: "flex", justifyContent: "space-between", marginBottom: 20 },

  modalContent: { display: "flex", gap: 20 },

  detailSection: { flex: 1, display: "flex", flexDirection: "column", gap: 10 },

  imageSection: { width: 320 },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    objectFit: "cover",
    border: "1px solid #e5e7eb",
  },

  imageLabel: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },

  infoRow: { background: "#f8fafc", padding: 10, borderRadius: 8 },

  timelineBox: { marginTop: 10, padding: 10, background: "#eef2ff", borderRadius: 8 },

  closeBtn: { width: "100%", marginTop: 15, padding: 10, background: "red", color: "#fff" },
};

const priorityBadge = {
  urgent: { background: "#fee2e2", color: "#b91c1c" },
  medium: { background: "#fef3c7", color: "#b45309" },
  normal: { background: "#dcfce7", color: "#15803d" },
};

export default DashboardPage;