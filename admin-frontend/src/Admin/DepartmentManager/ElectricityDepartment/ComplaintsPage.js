import React, { useState, useEffect } from "react";
import axios from "axios";

const ComplaintsPage = ({ departmentName = "Water Supply" }) => {

  const SLA_RULES = {
    Normal: 48,
    Urgent: 12,
    Escalated: 6,
  };

  const API_URL = "http://localhost:5000/api/complaints";

  const [complaints, setComplaints] = useState([
    {
      id: "CMP-1001",
      title: "Water Leakage",
      ward: "Ward 3",
      address: "Main Pipeline Road, Sector 4",
      lat: 18.5204,
      lng: 73.8567,
      status: "Pending",
      priority: "Urgent",
      createdAt: new Date().toISOString(),
      description: "Major leakage reported near main pipeline.",
      image:
        "https://via.placeholder.com/600x300.png?text=Water+Leakage",
    },
  ]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeNow, setTimeNow] = useState(new Date());
  const [searchId, setSearchId] = useState("");

  /* ================= LIVE TIMER ================= */
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  /* ================= AUTO ESCALATION ================= */
  useEffect(() => {
    setComplaints((prev) =>
      prev.map((c) => {
        const remaining = getRemainingMilliseconds(c);
        if (
          remaining <= 0 &&
          c.status !== "Escalated" &&
          c.status !== "Resolved"
        ) {
          return { ...c, status: "Escalated", priority: "Escalated" };
        }
        return c;
      })
    );
  }, [timeNow]);

  const getRemainingMilliseconds = (complaint) => {
    const hours = SLA_RULES[complaint.priority] || 24;
    const created = new Date(complaint.createdAt);
    const deadline = new Date(
      created.getTime() + hours * 60 * 60 * 1000
    );
    return deadline - timeNow;
  };

  const getRemainingTime = (complaint) => {
    const diff = getRemainingMilliseconds(complaint);
    if (diff <= 0) return "Overdue";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  const updateStatus = (id, newStatus) => {
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: newStatus } : c
      )
    );
  };

  const updateComplaint = async (complaint) => {
    try {
      await axios.put(`${API_URL}/${complaint.id}`, {
        status: complaint.status,
      });
      alert("Complaint updated successfully!");
    } catch (error) {
      alert("Backend not connected yet");
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setComplaints((prev) => prev.filter((c) => c.id !== id));
      setSelectedComplaint(null);
      alert("Complaint deleted successfully!");
    } catch (error) {
      alert("Backend delete failed");
    }
  };

  const getPriorityColor = (priority) => {
    if (priority === "Normal") return "#16a34a";
    if (priority === "Urgent") return "#f97316";
    if (priority === "Escalated") return "#dc2626";
    return "#64748b";
  };

  const filteredComplaints = complaints.filter((c) =>
    c.id.toLowerCase().includes(searchId.toLowerCase())
  );

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>{departmentName} Department</h2>
          <p style={styles.subTitle}>
            Smart Complaint Monitoring & SLA Control Room
          </p>
        </div>

        <input
          type="text"
          placeholder="🔍 Search Complaint ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={styles.search}
        />
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th style={styles.thLeft}>ID</th>
              <th style={styles.thLeft}>Title</th>
              <th style={styles.thCenter}>Ward</th>
              <th style={styles.thCenter}>Priority</th>
              <th style={styles.thCenter}>Status</th>
              <th style={styles.thCenter}>SLA</th>
              <th style={styles.thCenter}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => {
              const remaining = getRemainingTime(c);
              const isOverdue = remaining === "Overdue";

              return (
                <tr key={c.id} style={styles.row}>
                  <td style={styles.tdLeft}>{c.id}</td>
                  <td style={styles.tdLeft}>{c.title}</td>
                  <td style={styles.tdCenter}>{c.ward}</td>

                  <td style={styles.tdCenter}>
                    <span
                      style={{
                        ...styles.priorityBadge,
                        background: getPriorityColor(c.priority),
                      }}
                    >
                      {c.priority}
                    </span>
                  </td>

                  <td style={styles.tdCenter}>
                    <select
                      value={c.status}
                      onChange={(e) =>
                        updateStatus(c.id, e.target.value)
                      }
                      style={styles.select}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Resolved</option>
                      <option>Escalated</option>
                    </select>
                  </td>

                  <td
                    style={{
                      ...styles.tdCenter,
                      color: isOverdue ? "#dc2626" : "#0f766e",
                      fontWeight: 600,
                    }}
                  >
                    {remaining}
                  </td>

                  <td style={styles.tdCenter}>
                    <button
                      style={styles.viewBtn}
                      onClick={() => setSelectedComplaint(c)}
                    >
                      View
                    </button>

                    <button
                      style={styles.updateBtn}
                      onClick={() => updateComplaint(c)}
                    >
                      Update
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
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3>Complaint Details</h3>
              <button
                style={styles.closeBtn}
                onClick={() => setSelectedComplaint(null)}
              >
                ✕
              </button>
            </div>

            <img
              src={selectedComplaint.image}
              alt="complaint"
              style={styles.modalImage}
            />

            <div style={styles.detailsGrid}>
              <Detail label="Complaint ID" value={selectedComplaint.id} />
              <Detail label="Ward" value={selectedComplaint.ward} />
              <Detail label="Priority" value={selectedComplaint.priority} />
              <Detail label="Status" value={selectedComplaint.status} />
              <Detail
                label="SLA Remaining"
                value={getRemainingTime(selectedComplaint)}
              />
            </div>

            <p style={{ marginTop: 20 }}>
              <strong>Address:</strong> {selectedComplaint.address}
            </p>

            <iframe
              title="map"
              width="100%"
              height="250"
              style={{ border: 0, marginTop: 15, borderRadius: 8 }}
              loading="lazy"
              allowFullScreen
              src={`https://www.google.com/maps?q=${selectedComplaint.lat},${selectedComplaint.lng}&z=15&output=embed`}
            ></iframe>

            <div style={{ marginTop: 20, textAlign: "right" }}>
              <button
                style={styles.deleteBtn}
                onClick={() => deleteComplaint(selectedComplaint.id)}
              >
                Delete Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* SMALL DETAIL */
const Detail = ({ label, value }) => (
  <div>
    <strong>{label}</strong>
    <p style={{ margin: "4px 0" }}>{value}</p>
  </div>
);

/* ================= IMPROVED STYLES ================= */

const styles = {
  page: {
    padding: "40px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  },
  title: { margin: 0 },
  subTitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  search: {
    width: "260px",
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    outline: "none",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    padding: 25,
    boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHead: {
    background: "#f1f5f9",
  },
  thLeft: { padding: "14px", textAlign: "left" },
  thCenter: { padding: "14px", textAlign: "center" },
  tdLeft: { padding: "14px", textAlign: "left" },
  tdCenter: { padding: "14px", textAlign: "center" },
  row: { borderBottom: "1px solid #e5e7eb" },
  select: { padding: "6px 8px", borderRadius: 6 },
  viewBtn: {
    background: "#1e3a8a",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    marginRight: 6,
    cursor: "pointer",
  },
  updateBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    padding: "8px 18px",
    borderRadius: 6,
    cursor: "pointer",
  },
  priorityBadge: {
    color: "#fff",
    padding: "5px 12px",
    borderRadius: 20,
    fontSize: 12,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    width: 750,
    borderRadius: 12,
    padding: 30,
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  modalImage: {
    width: "100%",
    borderRadius: 8,
    marginTop: 15,
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,1fr)",
    gap: 20,
    marginTop: 20,
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: 18,
    cursor: "pointer",
  },
};

export default ComplaintsPage;