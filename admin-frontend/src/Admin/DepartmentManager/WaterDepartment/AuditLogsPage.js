import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const statusColors = {
  Pending: "#f59e0b",
  "In Progress": "#1e3a8a",
  Resolved: "#16a34a",
  Escalated: "#dc2626",
};

const AuditLogsPage = ({ departmentName = "Water Department" }) => {
  const [complaints, setComplaints] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("complaintUpdated", (data) => {
      setComplaints((prev) =>
        prev.map((c) =>
          c.complaintId === data.complaintId ? data : c
        )
      );
    });

    socket.on("newComplaint", (data) => {
      setComplaints((prev) => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetch("http://localhost:5000/api/complaints/audit")
      .then((res) => res.json())
      .then((data) => setComplaints(data))
      .catch(() => {
        setComplaints([
          {
            complaintId: "CMP-1001",
            contactNumber: "9876543210",
            location: "Ganesh Temple, Ward 5",
            ward: "Ward 5",
            issue: "Transformer Failure",
            status: "Resolved",
            assignedOfficer: "Er. Suresh Jadhav",
            latitude: 16.705,
            longitude: 74.243,
            image: "complaint1.jpg",
            resolvedAt: true,
          },
        ]);
      });
  }, []);

  /* ================= FILTER ================= */
  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.complaintId?.toLowerCase().includes(search.toLowerCase()) ||
      c.ward?.toLowerCase().includes(search.toLowerCase()) ||
      c.issue?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  /* ================= TIMELINE ================= */
  const getTimelineWidth = (c) => {
    if (c.status === "Resolved") return "100%";
    if (c.status === "In Progress") return "60%";
    if (c.status === "Escalated") return "80%";
    return "30%";
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.title}>
        {departmentName} – Audit Logs
      </h2>

      {/* SEARCH + FILTER */}
      <div style={styles.filterRow}>
        <input
          type="text"
          placeholder="Search by ID / Ward / Issue"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.input}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={styles.input}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Resolved">Resolved</option>
          <option value="Escalated">Escalated</option>
        </select>
      </div>

      {/* TABLE */}
      <div style={styles.card}>
        <table style={styles.table}>
          <thead style={styles.tableHead}>
            <tr>
              <th>ID</th>
              <th>Ward</th>
              <th>Issue</th>
              <th>Officer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c.complaintId} style={styles.row}>
                <td>{c.complaintId}</td>
                <td>{c.ward}</td>
                <td>{c.issue}</td>
                <td>{c.assignedOfficer}</td>
                <td>
                  <span
                    style={{
                      background: statusColors[c.status],
                      color: "#fff",
                      padding: "5px 12px",
                      borderRadius: 20,
                      fontSize: 12,
                    }}
                  >
                    {c.status}
                  </span>
                </td>
                <td>
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
            <h3>{selectedComplaint.complaintId} Details</h3>

            <p><strong>Contact:</strong> {selectedComplaint.contactNumber}</p>
            <p><strong>Location:</strong> {selectedComplaint.location}</p>
            <p><strong>Issue:</strong> {selectedComplaint.issue}</p>
            <p><strong>Officer:</strong> {selectedComplaint.assignedOfficer}</p>

            {selectedComplaint.image && (
              <img
                src={`http://localhost:5000/uploads/${selectedComplaint.image}`}
                alt="Complaint"
                style={styles.image}
              />
            )}

            {selectedComplaint.latitude && (
              <iframe
                title="map"
                width="100%"
                height="250"
                style={{ border: 0, marginTop: 15, borderRadius: 8 }}
                src={`https://www.google.com/maps?q=${selectedComplaint.latitude},${selectedComplaint.longitude}&z=15&output=embed`}
              />
            )}

            {/* Timeline */}
            <div style={{ marginTop: 20 }}>
              <div style={styles.timelineContainer}>
                <div
                  style={{
                    ...styles.timelineProgress,
                    width: getTimelineWidth(selectedComplaint),
                  }}
                />
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

/* ================= NAVY IAS STYLES ================= */

const styles = {
  page: {
    padding: 30,
    background: "#f4f7fb",
    minHeight: "100vh",
  },
  title: {
    marginBottom: 20,
  },
  filterRow: {
    display: "flex",
    gap: 15,
    marginBottom: 20,
  },
  input: {
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
  },
  card: {
    background: "#ffffff",
    borderRadius: 12,
    padding: 20,
    boxShadow: "0 6px 25px rgba(0,0,0,0.05)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHead: {
    background: "#e2e8f0",
  },
  row: {
    borderBottom: "1px solid #e5e7eb",
  },
  viewBtn: {
    background: "#0b1f3a",
    color: "#fff",
    border: "none",
    padding: "6px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    width: 650,
    padding: 30,
    borderRadius: 14,
  },
  image: {
    width: "100%",
    marginTop: 15,
    borderRadius: 8,
  },
  timelineContainer: {
    height: 8,
    background: "#e5e7eb",
    borderRadius: 6,
  },
  timelineProgress: {
    height: "100%",
    background: "#0b1f3a",
    borderRadius: 6,
  },
  closeBtn: {
    marginTop: 20,
    padding: "8px 15px",
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default AuditLogsPage;