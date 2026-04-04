import React, { useState, useEffect } from "react";
import AddOfficer from "../shared/AddOfficer";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

const OfficersManagerPage = () => {
  const WATER_DEPARTMENT = "Water Supply Department";

  const [showAdd, setShowAdd] = useState(false);
  const [assigningOfficer, setAssigningOfficer] = useState(null);
  const [timeNow, setTimeNow] = useState(new Date());

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= WATER COMPLAINT DATA ================= */
  const complaints = [
    {
      id: "WTR-4001",
      priority: "Escalated",
      address: "Ward 3 - Main Pipeline Leakage",
      lat: 18.5204,
      lng: 73.8567,
      image:
        "https://via.placeholder.com/400x200.png?text=Major+Pipeline+Leak",
      createdAt: new Date().toISOString(),
    },
    {
      id: "WTR-4002",
      priority: "Urgent",
      address: "Ward 5 - Pipe Burst",
      lat: 18.531,
      lng: 73.844,
      image:
        "https://via.placeholder.com/400x200.png?text=Pipe+Burst",
      createdAt: new Date().toISOString(),
    },
  ];

  const SLA_RULES = { Escalated: 6, Urgent: 12, Normal: 48 };

  const getRemainingTime = (complaint) => {
    const hours = SLA_RULES[complaint.priority];
    const created = new Date(complaint.createdAt);
    const deadline = new Date(
      created.getTime() + hours * 60 * 60 * 1000
    );
    const diff = deadline - timeNow;

    if (diff <= 0) return "Overdue";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);

    return `${h}h ${m}m ${s}s`;
  };

  const getProgressPercent = (complaint) => {
    const hours = SLA_RULES[complaint.priority];
    const created = new Date(complaint.createdAt);
    const deadline = new Date(
      created.getTime() + hours * 60 * 60 * 1000
    );

    const total = deadline - created;
    const remaining = deadline - timeNow;

    const progress = ((total - remaining) / total) * 100;

    if (progress <= 0) return 5;
    if (progress >= 100) return 100;

    return progress;
  };

  /* ================= OFFICERS ================= */
  const [officers, setOfficers] = useState([
    {
      empId: "EMP-W-201",
      fullName: "Sagar Patil",
      ward: "Ward 3",
      isBusy: false,
      currentComplaint: null,
    },
    {
      empId: "EMP-W-202",
      fullName: "Rohit Desai",
      ward: "Ward 5",
      isBusy: false,
      currentComplaint: null,
    },
  ]);

  const assignComplaint = (complaint) => {
    setOfficers((prev) =>
      prev.map((o) =>
        o.empId === assigningOfficer.empId
          ? { ...o, isBusy: true, currentComplaint: complaint }
          : o
      )
    );
    setAssigningOfficer(null);
  };

  const markComplete = (empId) => {
    setOfficers((prev) =>
      prev.map((o) =>
        o.empId === empId
          ? { ...o, isBusy: false, currentComplaint: null }
          : o
      )
    );
  };

  return (
    <div style={styles.wrapper}>
      {!showAdd ? (
        <>
          {/* ================= HEADER ================= */}
          <div style={styles.header}>
            <div>
              <h2 style={styles.title}>
                💧 Water Supply Smart Dispatch Panel
              </h2>
              <p style={styles.subtitle}>
                Live Leakage, Pipeline & Valve Monitoring
              </p>
            </div>

            <button
              style={styles.primaryBtn}
              onClick={() => setShowAdd(true)}
            >
              + Add Officer
            </button>
          </div>

          {/* ================= OFFICER GRID ================= */}
          <div style={styles.grid}>
            {officers.map((officer) => (
              <div key={officer.empId} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {officer.fullName}
                    </h3>
                    <p style={styles.wardText}>
                      {officer.ward}
                    </p>
                  </div>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background: officer.isBusy
                        ? "#dc2626"
                        : "#16a34a",
                    }}
                  >
                    {officer.isBusy
                      ? "On Field"
                      : "Available"}
                  </span>
                </div>

                {officer.currentComplaint && (
                  <div style={styles.workBox}>
                    <div style={styles.complaintTop}>
                      <strong>
                        {officer.currentComplaint.id}
                      </strong>
                      <span style={styles.priorityTag}>
                        {officer.currentComplaint.priority}
                      </span>
                    </div>

                    <div style={styles.slaRow}>
                      <span>
                        Remaining:{" "}
                        {getRemainingTime(
                          officer.currentComplaint
                        )}
                      </span>
                      <span>
                        {Math.floor(
                          getProgressPercent(
                            officer.currentComplaint
                          )
                        )}
                        %
                      </span>
                    </div>

                    <div style={styles.progressBarContainer}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: `${getProgressPercent(
                            officer.currentComplaint
                          )}%`,
                        }}
                      />
                    </div>

                    <img
                      src={officer.currentComplaint.image}
                      alt="complaint"
                      style={styles.image}
                    />

                    <a
                      href={`https://www.google.com/maps?q=${officer.currentComplaint.lat},${officer.currentComplaint.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={styles.mapLink}
                    >
                      View Location
                    </a>
                  </div>
                )}

                <div style={styles.buttonRow}>
                  {!officer.isBusy ? (
                    <button
                      style={styles.assignBtn}
                      onClick={() =>
                        setAssigningOfficer(officer)
                      }
                    >
                      Assign Complaint
                    </button>
                  ) : (
                    <button
                      style={styles.completeBtn}
                      onClick={() =>
                        markComplete(officer.empId)
                      }
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* ================= ASSIGN MODAL ================= */}
          {assigningOfficer && (
            <div style={styles.modalOverlay}>
              <div style={styles.modal}>
                <h3>Select Complaint</h3>

                {complaints.map((c) => (
                  <div key={c.id} style={styles.modalRow}>
                    <div>
                      <strong>{c.id}</strong>
                      <p style={{ margin: 0 }}>
                        SLA: {getRemainingTime(c)}
                      </p>
                    </div>

                    <button
                      style={styles.assignBtn}
                      onClick={() => assignComplaint(c)}
                    >
                      Assign
                    </button>
                  </div>
                ))}

                <button
                  style={styles.closeBtn}
                  onClick={() => setAssigningOfficer(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <AddOfficer
          department={WATER_DEPARTMENT}
          onBack={() => setShowAdd(false)}
        />
      )}
    </div>
  );
};

/* ================= PROFESSIONAL WATER UI ================= */

const styles = {
  wrapper: {
    padding: "50px 70px",
    background:
      "linear-gradient(to right,#f0f9ff,#e0f2fe)",
    minHeight: "100vh",
    fontFamily: "Segoe UI, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 50,
  },

  title: { margin: 0 },

  subtitle: {
    fontSize: 14,
    color: "#0369a1",
    marginTop: 6,
  },

  primaryBtn: {
    background:
      "linear-gradient(135deg,#0ea5e9,#0284c7)",
    color: "#fff",
    padding: "12px 22px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 600,
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(360px,1fr))",
    gap: 35,
  },

  card: {
    background: "#fff",
    padding: 28,
    borderRadius: 20,
    boxShadow:
      "0 12px 30px rgba(2,132,199,0.12)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  wardText: {
    fontSize: 13,
    color: "#64748b",
  },

  statusBadge: {
    padding: "6px 16px",
    borderRadius: 30,
    fontSize: 12,
    fontWeight: 700,
    color: "#fff",
  },

  workBox: {
    background: "#f0f9ff",
    padding: 16,
    borderRadius: 14,
  },

  complaintTop: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  priorityTag: {
    background: "#0284c7",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 11,
  },

  slaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 8,
  },

  progressBarContainer: {
    height: 8,
    background: "#bae6fd",
    borderRadius: 6,
    marginBottom: 12,
  },

  progressBar: {
    height: "100%",
    background:
      "linear-gradient(90deg,#0ea5e9,#0284c7)",
    borderRadius: 6,
    transition: "0.4s ease",
  },

  image: {
    width: "100%",
    borderRadius: 12,
    marginTop: 12,
  },

  mapLink: {
    display: "inline-block",
    marginTop: 10,
    fontWeight: 600,
    color: "#0284c7",
    textDecoration: "none",
  },

  buttonRow: {
    marginTop: 18,
  },

  assignBtn: {
    background: "#0284c7",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  completeBtn: {
    background: "#16a34a",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  modal: {
    background: "#fff",
    padding: 35,
    width: 480,
    borderRadius: 18,
  },

  modalRow: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: 15,
    padding: 12,
    borderRadius: 12,
    background: "#f0f9ff",
  },

  closeBtn: {
    marginTop: 15,
    padding: "10px 16px",
    background: "#0284c7",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
};

export default OfficersManagerPage;