import { useState } from "react";

const DepartmentsPage = () => {
  const [selectedDept, setSelectedDept] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  const departments = [
    {
      name: "Health Department",
      manager: "Dr. Amit Patil",
      solved: 30,
      pending: 12,
      complaints: [
        {
          id: "HD-101",
          type: "Garbage not collected",
          location: "Ward 12",
          priority: "High",
          createdHoursAgo: 36,
          image: "https://via.placeholder.com/400x250?text=Garbage+Issue",
          timeline: [
            { time: "Day 1 - 9:00 AM", action: "Complaint registered" },
            { time: "Day 2 - 10:00 AM", action: "Assigned to Health Officer" },
          ],
        },
      ],
    },
    {
      name: "Sanitation Department",
      manager: "Mr. Rahul Shinde",
      solved: 40,
      pending: 15,
      complaints: [
        {
          id: "SD-201",
          type: "Overflowing drainage",
          location: "Ward 4",
          priority: "High",
          createdHoursAgo: 50,
          image: "https://via.placeholder.com/400x250?text=Drainage",
          timeline: [
            { time: "Day 1 - 8:30 AM", action: "Complaint registered" },
            { time: "Day 2 - 12:00 PM", action: "Escalated to Commissioner" },
          ],
        },
      ],
    },
  ];

  const getSLAHours = (priority) => {
    if (priority === "High") return 24;
    if (priority === "Medium") return 48;
    return 72;
  };

  const isSLABreached = (c) =>
    c.createdHoursAgo > getSLAHours(c.priority);

  /* ================= DETAILS VIEW ================= */

  if (selectedDept) {
    const total = selectedDept.solved + selectedDept.pending;
    const solvedPercent = Math.round(
      (selectedDept.solved / total) * 100
    );

    return (
      <div style={styles.container}>
        <div style={styles.headerBar}>
          <h2 style={styles.headerTitle}>
            Municipal Corporation Kolhapur Division
          </h2>
          <span style={styles.divisionTag}>Department Division</span>
        </div>

        <button style={styles.backBtn} onClick={() => setSelectedDept(null)}>
          ← Back to Departments
        </button>

        <h1 style={styles.pageTitle}>{selectedDept.name}</h1>
        <p style={styles.managerText}>
          <b>Department Manager:</b> {selectedDept.manager}
        </p>

        <div style={styles.performanceCard}>
          <div style={styles.performanceHeader}>
            <span>Performance Overview</span>
            <span>{solvedPercent}% Resolved</span>
          </div>

          <div style={styles.barBg}>
            <div
              style={{ ...styles.barFill, width: `${solvedPercent}%` }}
            />
          </div>
        </div>

        <h3 style={{ marginTop: 30 }}>Department Complaints</h3>

        {selectedDept.complaints.map((c) => {
          const breached = isSLABreached(c);

          return (
            <div
              key={c.id}
              style={{
                ...styles.complaintCard,
                borderLeft: breached
                  ? "6px solid #dc2626"
                  : "6px solid #10b981",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={styles.complaintHeader}>
                  <strong>{c.id}</strong>
                  <span style={styles.priorityBadge}>{c.priority}</span>
                </div>

                <div style={styles.smallText}>
                  📍 {c.location}
                </div>

                {breached && (
                  <div style={styles.escalation}>
                    ⚠ SLA BREACHED — Escalated to Commissioner
                  </div>
                )}

                <div style={styles.timelineBox}>
                  <b>Activity Timeline</b>
                  {c.timeline.map((t, i) => (
                    <div key={i} style={styles.timelineItem}>
                      <div style={styles.timelineDot}></div>
                      <div>
                        <div style={styles.timelineTime}>{t.time}</div>
                        <div>{t.action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                style={styles.viewBtn}
                onClick={() => setViewImage(c.image)}
              >
                View Image
              </button>
            </div>
          );
        })}

        {viewImage && (
          <div style={styles.imageOverlay} onClick={() => setViewImage(null)}>
            <img src={viewImage} alt="Complaint" style={styles.image} />
          </div>
        )}
      </div>
    );
  }

  /* ================= MAIN LIST ================= */

  return (
    <div style={styles.container}>
      <div style={styles.headerBar}>
        <h2 style={styles.headerTitle}>
          Municipal Corporation Kolhapur Division
        </h2>
        <span style={styles.divisionTag}>Administrative Departments</span>
      </div>

      <h1 style={styles.pageTitle}>Municipal Departments</h1>

      <div style={styles.grid}>
        {departments.map((dept, i) => (
          <div
            key={i}
            style={styles.card}
            onClick={() => setSelectedDept(dept)}
          >
            <h3>{dept.name}</h3>
            <p style={styles.managerText}>👤 {dept.manager}</p>

            <div style={styles.statsRow}>
              <span style={styles.solved}>Resolved: {dept.solved}</span>
              <span style={styles.pending}>Pending: {dept.pending}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ================= UPDATED PROFESSIONAL STYLES ================= */

const styles = {
  container: {
    padding: 30,
    background: "#f5f7fa",
    minHeight: "100vh",
  },

  headerBar: {
    background: "#ffffff",
    color: "#111827",
    padding: 18,
    borderRadius: 12,
    marginBottom: 25,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
    border: "1px solid #e5e7eb",
  },

  headerTitle: {
    fontWeight: 700,
    fontSize: 18,
  },

  divisionTag: {
    background: "#f3f4f6",
    padding: "6px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
  },

  pageTitle: {
    fontSize: 26,
    marginBottom: 10,
    color: "#111827",
  },

  managerText: {
    fontSize: 14,
    color: "#4b5563",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
    gap: 20,
  },

  card: {
    background: "#fff",
    padding: 22,
    borderRadius: 14,
    cursor: "pointer",
    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    transition: "0.2s",
  },

  statsRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 10,
  },

  solved: { color: "#16a34a", fontWeight: 600 },
  pending: { color: "#dc2626", fontWeight: 600 },

  backBtn: {
    marginBottom: 20,
    padding: "6px 14px",
    borderRadius: 6,
    border: "1px solid #e5e7eb",
    background: "#fff",
    cursor: "pointer",
  },

  performanceCard: {
    background: "#fff",
    padding: 20,
    borderRadius: 12,
    marginTop: 15,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  performanceHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
    fontWeight: 600,
  },

  barBg: {
    height: 10,
    background: "#e5e7eb",
    borderRadius: 6,
  },

  barFill: {
    height: 10,
    background: "#374151",
    borderRadius: 6,
  },

  complaintCard: {
    background: "#fff",
    padding: 18,
    marginTop: 15,
    display: "flex",
    justifyContent: "space-between",
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  },

  complaintHeader: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  priorityBadge: {
    background: "#fef3c7",
    color: "#92400e",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
  },

  smallText: { fontSize: 13, color: "#6b7280" },

  escalation: {
    marginTop: 6,
    fontSize: 12,
    color: "#dc2626",
    fontWeight: 600,
  },

  timelineBox: {
    marginTop: 12,
    paddingLeft: 10,
  },

  timelineItem: {
    display: "flex",
    gap: 10,
    marginTop: 8,
  },

  timelineDot: {
    width: 8,
    height: 8,
    background: "#374151",
    borderRadius: "50%",
    marginTop: 5,
  },

  timelineTime: {
    fontSize: 12,
    fontWeight: 600,
    color: "#111827",
  },

  viewBtn: {
    padding: "6px 14px",
    background: "#374151",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    cursor: "pointer",
  },

  imageOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  image: {
    maxWidth: "90%",
    maxHeight: "90%",
    borderRadius: 10,
  },
};

export default DepartmentsPage;
