import React, { useState, useEffect } from "react";
import AddOfficer from "../shared/AddOfficer";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const OfficersManagerPage = ({ department }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [assigningOfficer, setAssigningOfficer] = useState(null);
  const [editingOfficer, setEditingOfficer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeNow, setTimeNow] = useState(new Date());
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentOfficers, setRecentOfficers] = useState([]);

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= DEPARTMENT PREFIX ================= */
  const getDepartmentPrefix = () => {
    switch (department) {
      case "Water Supply": return "W";
      case "Electricity": return "E";
      case "Health": return "H";
      case "Sanitation": return "S";
      default: return "D";
    }
  };

  /* ================= OFFICERS ================= */
  const [officers, setOfficers] = useState([
    {
      empId: `EMP-${getDepartmentPrefix()}-101`,
      fullName: "Rahul Patil",
      phone: "9876500001",
      ward: "Ward 3",
      isBusy: false,
      currentComplaint: null,
    },
    {
      empId: `EMP-${getDepartmentPrefix()}-102`,
      fullName: "Amit Kulkarni",
      phone: "9876500002",
      ward: "Ward 5",
      isBusy: false,
      currentComplaint: null,
    },
  ]);

  /* ================= SAMPLE COMPLAINTS ================= */
  const complaints = [
    { id: "CMP-3001", priority: "Escalated", createdAt: new Date().toISOString() },
    { id: "CMP-3002", priority: "Urgent", createdAt: new Date().toISOString() },
    { id: "CMP-3003", priority: "Normal", createdAt: new Date().toISOString() },
  ];

  const SLA_RULES = { Escalated: 6, Urgent: 12, Normal: 48 };

  const getRemainingTime = (complaint) => {
    const hours = SLA_RULES[complaint.priority];
    const created = new Date(complaint.createdAt);
    const deadline = new Date(created.getTime() + hours * 60 * 60 * 1000);
    const diff = deadline - timeNow;

    if (diff <= 0) return "Overdue";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  /* ================= ADD ================= */
  const handleAddOfficer = (newOfficer) => {
    const officerWithStatus = {
      ...newOfficer,
      isBusy: false,
      currentComplaint: null,
    };

    setOfficers(prev => [...prev, officerWithStatus]);
    setRecentOfficers(prev => [officerWithStatus, ...prev.slice(0, 4)]);
  };

  /* ================= UPDATE ================= */
  const handleUpdateOfficer = (updatedOfficer) => {
    setOfficers(prev =>
      prev.map(o =>
        o.empId === updatedOfficer.empId ? updatedOfficer : o
      )
    );
  };

  /* ================= DELETE ================= */
  const handleDelete = (empId) => {
    if (window.confirm("Delete this officer?")) {
      setOfficers(prev => prev.filter(o => o.empId !== empId));
    }
  };

  /* ================= ASSIGN ================= */
  const assignComplaint = (complaint) => {
    setOfficers(prev =>
      prev.map(o =>
        o.empId === assigningOfficer.empId
          ? { ...o, isBusy: true, currentComplaint: complaint }
          : o
      )
    );
    setAssigningOfficer(null);
  };

  const markComplete = (empId) => {
    setOfficers(prev =>
      prev.map(o =>
        o.empId === empId
          ? { ...o, isBusy: false, currentComplaint: null }
          : o
      )
    );
  };

  const freeOfficers = officers.filter(o => !o.isBusy);

  const priorityOrder = { Escalated: 1, Urgent: 2, Normal: 3 };
  const sortedComplaints = [...complaints].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return (
    <div style={styles.wrapper}>
      {!showAdd ? (
        <>
          {/* ================= HEADER ================= */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>{department}</h2>
              <p style={styles.subtitle}>
                Smart Administrative Dispatch Control
              </p>
            </div>

            <div style={styles.headerRight}>
              {/* 🔔 Notification Bell */}
              <div style={styles.notificationWrapper}>
                <div
                  style={styles.bell}
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  🔔
                  <span style={styles.notificationBadge}>
                    {freeOfficers.length +
                      complaints.length +
                      recentOfficers.length}
                  </span>
                </div>

                {showNotifications && (
                  <div style={styles.notificationPanel}>
                    <h4>🟢 Free Officers</h4>
                    {freeOfficers.length === 0 && <p>No free officers</p>}
                    {freeOfficers.map(o => (
                      <p key={o.empId}>{o.fullName}</p>
                    ))}

                    <h4 style={{ marginTop: 15 }}>📌 New Complaints</h4>
                    {complaints.map(c => (
                      <p key={c.id}>
                        {c.id} ({c.priority})
                      </p>
                    ))}

                    <h4 style={{ marginTop: 15 }}>👤 Recently Added</h4>
                    {recentOfficers.length === 0 && <p>No new officers</p>}
                    {recentOfficers.map(o => (
                      <p key={o.empId}>{o.fullName}</p>
                    ))}
                  </div>
                )}
              </div>

              <button
                style={styles.primaryBtn}
                onClick={() => {
                  setIsEditMode(false);
                  setEditingOfficer(null);
                  setShowAdd(true);
                }}
              >
                + Add Officer
              </button>
            </div>
          </div>

          {/* ================= OFFICER CARDS ================= */}
          <div style={styles.cardGrid}>
            {officers.map((officer) => (
              <div key={officer.empId} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.name}>{officer.fullName}</h3>
                    <span style={styles.id}>{officer.empId}</span>
                  </div>

                  <div style={styles.statusContainer}>
                    <div
                      style={{
                        ...styles.statusSquare,
                        backgroundColor: officer.isBusy
                          ? "#dc2626"
                          : "#16a34a",
                      }}
                    />
                    <span style={styles.statusText}>
                      {officer.isBusy ? "Working" : "Available"}
                    </span>
                  </div>
                </div>

                <div style={styles.infoRow}>
                  <span>📞 {officer.phone}</span>
                  <span>📍 {officer.ward}</span>
                </div>

                {/* ACTIVE COMPLAINT */}
                {officer.currentComplaint && (
                  <div style={styles.workBox}>
                    <div style={styles.workHeader}>
                      <strong>{officer.currentComplaint.id}</strong>
                      <span
                        style={{
                          ...styles.slaBadge,
                          backgroundColor:
                            getRemainingTime(officer.currentComplaint) ===
                            "Overdue"
                              ? "#dc2626"
                              : "#2563eb",
                        }}
                      >
                        {getRemainingTime(officer.currentComplaint)}
                      </span>
                    </div>

                    <div style={styles.workButtons}>
                      <button
                        style={styles.viewBtn}
                        onClick={() =>
                          alert(
                            `Complaint ID: ${officer.currentComplaint.id}\nPriority: ${officer.currentComplaint.priority}`
                          )
                        }
                      >
                        View Complaint
                      </button>

                      <button
                        style={styles.completeBtn}
                        onClick={() => markComplete(officer.empId)}
                      >
                        Mark Complete
                      </button>
                    </div>
                  </div>
                )}

                {/* FREE OFFICER BUTTONS */}
                {!officer.currentComplaint && (
                  <div style={styles.buttonRow}>
                    <button
                      style={styles.assignBtn}
                      onClick={() => setAssigningOfficer(officer)}
                    >
                      Assign
                    </button>

                    <button
                      style={styles.editBtn}
                      onClick={() => {
                        setEditingOfficer(officer);
                        setIsEditMode(true);
                        setShowAdd(true);
                      }}
                    >
                      Edit
                    </button>

                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(officer.empId)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ================= ASSIGN MODAL ================= */}
          {assigningOfficer && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                <h3>
                  Assign Complaint — {assigningOfficer.fullName}
                </h3>

                {sortedComplaints.map((complaint) => (
                  <div key={complaint.id} style={styles.complaintCard}>
                    <div>
                      <strong>{complaint.id}</strong>
                      <div>Priority: {complaint.priority}</div>
                      <div>SLA: {getRemainingTime(complaint)}</div>
                    </div>

                    <button
                      style={styles.assignBtn}
                      onClick={() => assignComplaint(complaint)}
                    >
                      Assign
                    </button>
                  </div>
                ))}

                <button
                  style={styles.closeBtn}
                  onClick={() => setAssigningOfficer(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <AddOfficer
          department={department}
          editingOfficer={editingOfficer}
          isEditMode={isEditMode}
          onAddOfficer={handleAddOfficer}
          onUpdateOfficer={handleUpdateOfficer}
          onBack={() => {
            setShowAdd(false);
            setIsEditMode(false);
            setEditingOfficer(null);
          }}
        />
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    padding: "50px 80px",
    background: "linear-gradient(135deg, #eef2ff, #f8fafc)",
    minHeight: "100vh",
    fontFamily: "Inter, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 50,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 25,
  },
  notificationWrapper: { position: "relative" },
  bell: { fontSize: 22, cursor: "pointer", position: "relative" },
  notificationBadge: {
    position: "absolute",
    top: -6,
    right: -8,
    background: "#dc2626",
    color: "#fff",
    borderRadius: "50%",
    fontSize: 10,
    padding: "3px 6px",
    fontWeight: 600,
  },
  notificationPanel: {
    position: "absolute",
    right: 0,
    top: 35,
    width: 280,
    background: "#fff",
    padding: 15,
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
    zIndex: 1000,
  },
  title: { fontSize: 28, fontWeight: 700 },
  subtitle: { fontSize: 14, color: "#64748b" },
  primaryBtn: {
    background: "linear-gradient(135deg,#1e3a8a,#2563eb)",
    color: "#fff",
    padding: "12px 22px",
    borderRadius: 12,
    border: "none",
    cursor: "pointer",
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
    gap: 35,
  },
  card: {
    background: "#fff",
    padding: 30,
    borderRadius: 20,
    boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  name: { fontSize: 18, fontWeight: 600 },
  id: { fontSize: 12, color: "#64748b" },
  statusContainer: { display: "flex", alignItems: "center", gap: 8 },
  statusSquare: { width: 12, height: 12, borderRadius: 3 },
  statusText: { fontSize: 13, fontWeight: 600 },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  workBox: {
    background: "#f1f5f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  workHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  slaBadge: {
    color: "#fff",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 12,
  },
  workButtons: { display: "flex", gap: 10 },
  viewBtn: {
    background: "#1e293b",
    color: "#fff",
    padding: "8px 16px",
    borderRadius: 8,
    border: "none",
  },
  buttonRow: { display: "flex", gap: 12 },
  assignBtn: {
    background: "#2563eb",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
  },
  completeBtn: {
    background: "#059669",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
  },
  editBtn: {
    background: "#f59e0b",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
  },
  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    padding: "8px 18px",
    borderRadius: 10,
    border: "none",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.55)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    background: "#fff",
    padding: 35,
    width: 520,
    borderRadius: 20,
  },
  complaintCard: {
    display: "flex",
    justifyContent: "space-between",
    padding: 15,
    marginBottom: 15,
    background: "#f8fafc",
    borderRadius: 14,
  },
  closeBtn: {
    marginTop: 20,
    background: "#1e3a8a",
    color: "#fff",
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
  },
};

export default OfficersManagerPage;