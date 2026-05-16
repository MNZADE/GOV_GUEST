import { useState, useMemo, useEffect } from "react";
import {
  Building2,
  Users,
  FileText,
  AlertTriangle,
  Clock,
  CheckCircle,
  MapPin,
  CalendarDays,
  Phone,
  Mail,
} from "lucide-react";

/* ================= PRIORITY ================= */
const getPriority = (issue = "", description = "") => {
  const text = (issue + " " + description).toLowerCase();

  if (
    text.includes("emergency") ||
    text.includes("danger") ||
    text.includes("fire") ||
    text.includes("accident")
  ) {
    return "urgent";
  }

  if (
    text.includes("water") ||
    text.includes("garbage") ||
    text.includes("drain") ||
    text.includes("road")
  ) {
    return "medium";
  }

  return "normal";
};

const DashboardPage = () => {

  const [selectedComplaint,
    setSelectedComplaint] =
    useState(null);

  const [departmentFilter,
    setDepartmentFilter] =
    useState("All");

  const [complaints,
    setComplaints] =
    useState([]);

  const [departmentsData,
    setDepartmentsData] =
    useState([]);

  const [stats,
    setStats] =
    useState({
      totalDepartments: 0,
      managers: 0,
      totalComplaints: 0,
      urgentComplaints: 0,
      pendingComplaints: 0,
      resolvedComplaints: 0,
      inProgressComplaints: 0,
      rejectedComplaints: 0,
    });

  /* ================= FETCH ================= */
  useEffect(() => {

    const fetchDashboardData = async () => {

      try {

        const token =
          localStorage.getItem("kmc_token");

        if (!token) {
          console.error("No token found");
          return;
        }

        /* ===============================
           FETCH COMPLAINTS
        =============================== */
        const complaintRes = await fetch(
          "http://localhost:5000/api/complaints/system/all",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const complaintData =
          await complaintRes.json();

        console.log(
          "Complaints API:",
          complaintData
        );

        /* ===============================
           FETCH DEPARTMENTS
        =============================== */
        const deptRes = await fetch(
          "http://localhost:5000/api/departments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const deptData =
          await deptRes.json();

        setDepartmentsData(
          deptData.departments || []
        );

        /* ===============================
           FORMAT COMPLAINTS
        =============================== */
        const updated =
          (complaintData.complaints || []).map(
            (c) => ({
              ...c,

              priority: getPriority(
                c.issue,
                c.description
              ),

              departments:
                c.department
                  ? [c.department.toLowerCase()]
                  : Array.isArray(c.departments)
                  ? c.departments.map((d) =>
                      d.toLowerCase()
                    )
                  : [],
            })
          );

        setComplaints(updated);

        /* ===============================
           STATUS COUNTS
        =============================== */
        const pending =
          updated.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "pending"
          ).length;

        const resolved =
          updated.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "resolved"
          ).length;

        const inProgress =
          updated.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "in progress"
          ).length;

        const rejected =
          updated.filter(
            (c) =>
              c.status?.toLowerCase() ===
              "rejected"
          ).length;

        const urgent =
          updated.filter(
            (c) =>
              c.priority === "urgent" ||
              c.status?.toLowerCase() ===
                "escalated"
          ).length;

        setStats({
          totalDepartments:
            deptData.departments?.length || 0,

          managers:
            deptData.departments?.length || 0,

          totalComplaints:
            updated.length,

          urgentComplaints:
            urgent,

          pendingComplaints:
            pending,

          resolvedComplaints:
            resolved,

          inProgressComplaints:
            inProgress,

          rejectedComplaints:
            rejected,
        });

      } catch (err) {

        console.error(
          "Dashboard Error:",
          err
        );
      }
    };

    fetchDashboardData();

  }, []);

  /* ===============================
     FILTERED COMPLAINTS
  =============================== */
  const filteredComplaints = useMemo(() => {

    return departmentFilter === "All"

      ? complaints

      : complaints.filter((c) =>
          (c.departments || []).includes(
            departmentFilter.toLowerCase()
          )
        );

  }, [departmentFilter, complaints]);

  /* ===============================
     DEPARTMENTS DROPDOWN
  =============================== */
  const departments = [
    "All",
    ...departmentsData.map((d) =>
      d.name.toLowerCase()
    ),
  ];

  return (
    <div style={styles.container}>

      {/* HEADER */}
      <div style={styles.header}>

        <div>

          <h1 style={styles.title}>
            Administrative Dashboard
          </h1>

          <p style={styles.subtitle}>
            Complaint Monitoring & Analytics
          </p>

        </div>

        <select
          value={departmentFilter}
          onChange={(e) =>
            setDepartmentFilter(
              e.target.value
            )
          }
          style={styles.filter}
        >

          {departments.map((dept) => (
            <option key={dept}>
              {dept}
            </option>
          ))}

        </select>

      </div>

      {/* KPI */}
      <div style={styles.kpiGrid}>

  {/* DEPARTMENTS */}

  <KPI
    icon={<Building2 />}
    title="Departments"
    value={stats.totalDepartments}
    color="#0f172a"
  />

  {/* MANAGERS */}

  <KPI
    icon={<Users />}
    title="Managers"
    value={stats.managers}
    color="#7c3aed"
  />

  {/* TOTAL COMPLAINTS */}

  <KPI
    icon={<FileText />}
    title="Complaints"
    value={stats.totalComplaints}
    color="#2563eb"
  />

  {/* URGENT */}

  <KPI
    icon={<AlertTriangle />}
    title="Urgent"
    value={stats.urgentComplaints}
    color="#ef4444"
  />

  {/* PENDING */}

  <KPI
    icon={<Clock />}
    title="Pending"
    value={stats.pendingComplaints}
    color="#f59e0b"
  />

  {/* IN PROGRESS */}

  <KPI
    icon={<Clock />}
    title="In Progress"
    value={stats.inProgressComplaints}
    color="#3b82f6"
  />

  {/* RESOLVED */}

  <KPI
    icon={<CheckCircle />}
    title="Resolved"
    value={stats.resolvedComplaints}
    color="#22c55e"
  />

  {/* REJECTED */}

  <KPI
    icon={<AlertTriangle />}
    title="Rejected"
    value={stats.rejectedComplaints}
    color="#dc2626"
  />

</div>
      {/* TABLE */}
      <div style={styles.tableCard}>

        <table style={styles.table}>

          <thead>

            <tr>

              <th style={styles.th}>
                Complaint ID
              </th>

              <th style={styles.th}>
                Issue
              </th>

              <th style={styles.th}>
                Department
              </th>

              <th style={styles.th}>
                Location
              </th>

              <th style={styles.th}>
                Status
              </th>

              <th style={styles.th}>
                Priority
              </th>

              <th style={styles.thCenter}>
                Action
              </th>

            </tr>

          </thead>

          <tbody>

            {filteredComplaints.map((c) => (

              <tr
                key={c._id}
                style={styles.tr}
              >

                <td style={styles.td}>
                  {c.complaintId}
                </td>

                <td style={styles.td}>
                  {c.issue}
                </td>

                <td style={styles.td}>
                  {c.department ||
                    (c.departments || []).join(", ")}
                </td>

                <td style={styles.td}>
                  {c.address}
                </td>

                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background:
                      c.status === "Resolved"
                        ? "#dcfce7"
                        : "#fef3c7",
                    color:
                      c.status === "Resolved"
                        ? "#15803d"
                        : "#92400e",
                  }}>
                    {c.status || "Pending"}
                  </span>
                </td>

                <td style={styles.td}>

                  <span
                    style={{
                      ...styles.badge,
                      ...priorityBadge[
                        c.priority
                      ],
                    }}
                  >
                    {c.priority.toUpperCase()}
                  </span>

                </td>

                <td style={styles.tdCenter}>

                  <button
                    style={styles.viewBtn}
                    onClick={() =>
                      setSelectedComplaint(c)
                    }
                  >
                    View
                  </button>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* ================= MODAL ================= */}
      {selectedComplaint && (

        <div style={styles.overlay}>

          <div style={styles.modal}>

            {/* HEADER */}
            <div style={styles.modalHeader}>

              <div>

                <h2 style={styles.modalTitle}>
                  {selectedComplaint.issue}
                </h2>

                <p style={styles.modalId}>
                  Complaint ID:
                  {" "}
                  {selectedComplaint.complaintId}
                </p>

              </div>

              <span
                style={{
                  ...styles.priorityBadge,
                  ...priorityBadge[
                    selectedComplaint.priority
                  ],
                }}
              >
                {selectedComplaint.priority.toUpperCase()}
              </span>

            </div>

            {/* BODY */}
            <div style={styles.modalBody}>

              {/* LEFT */}
              <div style={styles.leftSection}>

                {/* USER DETAILS */}
                <div style={styles.sectionCard}>

                  <h3 style={styles.sectionTitle}>
                    User Details
                  </h3>

                  <InfoRow
                    icon={<Users size={16} />}
                    label="Name"
                    value={
                      selectedComplaint.userName ||
                      selectedComplaint.name ||
                      "N/A"
                    }
                  />

                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email"
                    value={
                      selectedComplaint.email ||
                      "N/A"
                    }
                  />

                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Phone"
                    value={
                      selectedComplaint.phone ||
                      "N/A"
                    }
                  />

                  <InfoRow
                    icon={<MapPin size={16} />}
                    label="Address"
                    value={
                      selectedComplaint.address ||
                      "N/A"
                    }
                  />

                </div>

                {/* COMPLAINT DETAILS */}
                <div style={styles.sectionCard}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Details
                  </h3>

                  <InfoRow
                    label="Department"
                    value={
                      selectedComplaint.department ||
                      (
                        selectedComplaint.departments ||
                        []
                      ).join(", ")
                    }
                  />

                  <InfoRow
                    label="Description"
                    value={
                      selectedComplaint.description
                    }
                  />

                  <InfoRow
                    label="Status"
                    value={
                      selectedComplaint.status ||
                      "Pending"
                    }
                  />

                  <InfoRow
                    label="Priority"
                    value={
                      selectedComplaint.priority
                    }
                  />

                  <InfoRow
                    icon={<CalendarDays size={16} />}
                    label="Created"
                    value={
                      `${selectedComplaint.date || "N/A"} ${selectedComplaint.time || ""}`
                    }
                  />

                </div>

                {/* TIMELINE */}
                <div style={styles.sectionCard}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Progress
                  </h3>

                  <div style={styles.timeline}>

                    <TimelineItem
                      color="#22c55e"
                      title="Complaint Registered"
                      time={`${selectedComplaint.date || ""} ${selectedComplaint.time || ""}`}
                    />

                    <TimelineItem
                      color="#f59e0b"
                      title="Assigned to Department"
                      time="Forwarded to Department"
                    />

                    <TimelineItem
                      color="#3b82f6"
                      title="Work In Progress"
                      time={
                        selectedComplaint.status ===
                        "In Progress"
                          ? "Currently Working"
                          : "Waiting"
                      }
                    />

                    <TimelineItem
                      color="#16a34a"
                      title="Complaint Resolved"
                      time={
                        selectedComplaint.status ===
                        "Resolved"
                          ? "Successfully Completed"
                          : "Pending"
                      }
                    />

                  </div>

                </div>

              </div>

              {/* RIGHT */}
              <div style={styles.rightSection}>

                <div style={styles.imageCard}>

                  <h3 style={styles.sectionTitle}>
                    Complaint Image
                  </h3>

                  <img
                    src={
                      selectedComplaint?.image
                        ? `http://localhost:5000/uploads/${selectedComplaint.image}`

                        : selectedComplaint?.images?.[0]

                        ? `http://localhost:5000/uploads/${selectedComplaint.images[0]
                            .replace(/\\/g, "/")
                            .replace("uploads/", "")}`

                        : "https://via.placeholder.com/400x300?text=No+Image"
                    }

                    alt="Complaint"

                    style={styles.complaintImage}

                    onError={(e) => {

                      console.log(
                        "Image Failed:",
                        selectedComplaint
                      );

                      e.target.src =
                        "https://via.placeholder.com/400x300?text=Image+Not+Found";
                    }}
                  />

                </div>

              </div>

            </div>

            {/* FOOTER */}
            <div style={styles.modalFooter}>

              <button
                style={styles.closeBtn}
                onClick={() =>
                  setSelectedComplaint(null)
                }
              >
                Close
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

/* ================= KPI ================= */
const KPI = ({
  icon,
  title,
  value,
  color,
}) => (
  <div style={styles.kpiCard}>

    <div
      style={{
        ...styles.kpiIcon,
        background:
          color || "#0f172a",
      }}
    >
      {icon}
    </div>

    <div>

      <p style={styles.kpiLabel}>
        {title}
      </p>

      <h2 style={styles.kpiValue}>
        {value}
      </h2>

    </div>

  </div>
);

/* ================= INFO ROW ================= */
const InfoRow = ({
  icon,
  label,
  value,
}) => (
  <div style={styles.infoRow}>

    <div style={styles.infoTop}>

      {icon}

      <p style={styles.infoLabel}>
        {label}
      </p>

    </div>

    <p style={styles.infoValue}>
      {value}
    </p>

  </div>
);

/* ================= TIMELINE ================= */
const TimelineItem = ({
  color,
  title,
  time,
}) => (
  <div style={styles.timelineItem}>

    <div
      style={{
        ...styles.timelineDot,
        background: color,
      }}
    />

    <div>

      <p style={styles.timelineTitle}>
        {title}
      </p>

      <small style={styles.timelineDate}>
        {time}
      </small>

    </div>

  </div>
);

/* ================= STYLES ================= */
const styles = {

  container: {
    padding: 25,
    background: "#f1f5f9",
    minHeight: "100vh",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },

  title: {
    fontSize: 30,
    fontWeight: 700,
    color: "#0f172a",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 5,
  },

  filter: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #cbd5e1",
  },

  kpiGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: 20,
  },

  kpiCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    display: "flex",
    gap: 15,
    alignItems: "center",
    boxShadow:
      "0 2px 10px rgba(0,0,0,0.05)",
  },

  kpiIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  kpiLabel: {
    color: "#64748b",
    fontSize: 14,
  },

  kpiValue: {
    fontSize: 26,
    fontWeight: 700,
  },

  tableCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 16,
    marginTop: 25,
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: 14,
    background: "#f8fafc",
    textAlign: "left",
  },

  thCenter: {
    padding: 14,
    background: "#f8fafc",
    textAlign: "center",
  },

  tr: {
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: 14,
  },

  tdCenter: {
    textAlign: "center",
  },

  badge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },

  statusBadge: {
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
  },

  viewBtn: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 8,
    cursor: "pointer",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  modal: {
    width: "95%",
    maxWidth: 1200,
    background: "#fff",
    borderRadius: 20,
    padding: 25,
    maxHeight: "95vh",
    overflowY: "auto",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 25,
  },

  modalTitle: {
    fontSize: 28,
    fontWeight: 700,
  },

  modalId: {
    color: "#64748b",
    marginTop: 5,
  },

  priorityBadge: {
    padding: "10px 18px",
    borderRadius: 30,
    fontWeight: 700,
    height: "fit-content",
  },

  modalBody: {
    display: "flex",
    gap: 20,
  },

  leftSection: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },

  rightSection: {
    width: 380,
  },

  sectionCard: {
    background: "#f8fafc",
    padding: 18,
    borderRadius: 16,
    border: "1px solid #e2e8f0",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 18,
  },

  infoRow: {
    marginBottom: 15,
  },

  infoTop: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  infoLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#475569",
  },

  infoValue: {
    marginTop: 5,
    color: "#0f172a",
  },

  timeline: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  timelineItem: {
    display: "flex",
    gap: 12,
  },

  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    marginTop: 5,
  },

  timelineTitle: {
    fontWeight: 700,
  },

  timelineDate: {
    color: "#64748b",
  },

  imageCard: {
    background: "#fff",
    borderRadius: 16,
    padding: 15,
    border: "1px solid #e2e8f0",
  },

  complaintImage: {
    width: "100%",
    height: 350,
    objectFit: "cover",
    borderRadius: 16,
  },

  modalFooter: {
    marginTop: 20,
  },

  closeBtn: {
    width: "100%",
    padding: 14,
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
  },

};

const priorityBadge = {

  urgent: {
    background: "#fee2e2",
    color: "#b91c1c",
  },

  medium: {
    background: "#fef3c7",
    color: "#92400e",
  },

  normal: {
    background: "#dcfce7",
    color: "#15803d",
  },

};

export default DashboardPage;