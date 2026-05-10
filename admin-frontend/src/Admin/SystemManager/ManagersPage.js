import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useNavigate } from "react-router-dom";
import { User, Mail, Building2, ShieldCheck } from "lucide-react";

const socket = io("http://localhost:5000");

const ManagersPage = () => {
  const [selectedManager, setSelectedManager] = useState(null);
  const [managers, setManagers] = useState([]);

  const navigate = useNavigate();
  const token = localStorage.getItem("kmc_token");
  const user = JSON.parse(localStorage.getItem("kmc_user"));

  /* ================= VERIFY ACCESS ================= */
  const verifyAccess = () => {
    if (!token || !user) {
      navigate("/login");
      return false;
    }

    if (user.role !== "system_manager") {
      alert("Access denied. Only System Manager allowed");
      navigate("/login");
      return false;
    }

    return true;
  };

  /* ================= LOAD MANAGERS ================= */
  const loadManagers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/manager", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("📦 API Response:", data);

      if (res.ok && data.success) {
        setManagers(data.managers);
      } else {
        throw new Error(data.message || "Failed to load managers");
      }
    } catch (err) {
      console.error("❌ Failed to load managers:", err.message);
      setManagers([]);
    }
  };

  /* ================= INIT ================= */
  useEffect(() => {
    if (verifyAccess()) {
      loadManagers();
    }

    socket.on("managerStatusUpdate", loadManagers);
    return () => socket.off("managerStatusUpdate", loadManagers);
  }, []);

  /* ================= TOGGLE ================= */
  const toggleAccess = async (_id) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/manager/toggle/${_id}`, // ✅ FIXED HERE
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Toggle failed");
      }

      loadManagers();
    } catch (err) {
      console.error("❌ Toggle error:", err.message);
      alert("❌ " + err.message);
    }
  };

  /* ================= DELETE ================= */
  const deleteManager = async (_id) => {
    if (!window.confirm("Are you sure you want to delete this manager?"))
      return;

    try {
      const res = await fetch(
        `http://localhost:5000/api/manager/${_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      console.log("🗑 Delete Response:", data);

      if (!res.ok) {
        throw new Error(data.message || "Delete failed");
      }

      alert("✅ Manager deleted successfully");

      setManagers((prev) => prev.filter((m) => m._id !== _id));
    } catch (err) {
      console.error("❌ Delete error:", err.message);
      alert("❌ " + err.message);
    }
  };

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h1 style={styles.title}>Department Managers</h1>
        <p style={styles.subtitle}>
          Manage access control and monitor department managers
        </p>
      </div>

      {/* LIST */}
      <div style={styles.list}>
        {managers.map((m) => (
          <div key={m._id} style={styles.card}>
            <div style={styles.leftSection}>
              <div style={styles.avatar}>
                <User size={18} />
              </div>

              <div style={styles.info}>
                <div style={styles.nameRow}>
                  <span style={styles.name}>{m.name}</span>

                  <span
                    style={{
                      ...styles.statusBadge,
                      background: m.isOnline ? "#dcfce7" : "#f3f4f6",
                      color: m.isOnline ? "#15803d" : "#6b7280",
                    }}
                  >
                    {m.isOnline ? "Online" : "Offline"}
                  </span>
                </div>

                <div style={styles.meta}>
                  <span>
                    <Building2 size={13} /> {m.department}
                  </span>
                  <span>
                    <Mail size={13} /> {m.email}
                  </span>
                  <span>🆔 {m.enrollmentId}</span>
                </div>
              </div>
            </div>

            <div style={styles.actions}>
              <button
                style={{
                  ...styles.btn,
                  background: m.isActive ? "#15803d" : "#dc2626",
                }}
                onClick={() => toggleAccess(m._id)}
              >
                {m.isActive ? "Active" : "Disabled"}
              </button>

              <button
                style={styles.viewBtn}
                onClick={() => setSelectedManager(m)}
              >
                View
              </button>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteManager(m._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        style={styles.addBtn}
        onClick={() => navigate("/system-manager/add-manager")}
      >
        + Add Manager
      </button>

      {selectedManager && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalAvatar}>
                <ShieldCheck size={24} />
              </div>

              <div>
                <h2 style={styles.modalTitle}>
                  {selectedManager.name}
                </h2>
                <p style={styles.modalSub}>
                  {selectedManager.department}
                </p>
              </div>
            </div>

            <div style={styles.modalContent}>
              <InfoRow label="Email" value={selectedManager.email} />
              <InfoRow label="Enrollment ID" value={selectedManager.enrollmentId} />
              <InfoRow label="Status" value={selectedManager.isOnline ? "Online" : "Offline"} />
              <InfoRow label="Access" value={selectedManager.isActive ? "Enabled" : "Disabled"} />
            </div>

            <button style={styles.closeBtn} onClick={() => setSelectedManager(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagersPage;

const InfoRow = ({ label, value }) => (
  <div style={styles.infoRow}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);
/* ================= STYLES ================= */
const styles = {
  container: {
    padding: "20px",
    paddingBottom: "120px",
    fontFamily: "Segoe UI, sans-serif",
  },

  header: {
    marginBottom: "25px",
  },

  title: {
    fontSize: "26px",
    color: "#0b2c48",
    marginBottom: "5px",
  },

  subtitle: {
    fontSize: "14px",
    color: "#6b7280",
  },

  list: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },

  card: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px",
    borderRadius: "14px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
  },

  leftSection: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#0b3c5d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  info: {
    display: "flex",
    flexDirection: "column",
  },

  nameRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  name: {
    fontWeight: "600",
  },

  statusBadge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
  },

  meta: {
    marginTop: "5px",
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    color: "#4b5563",
    gap: "3px",
  },

  actions: {
    display: "flex",
    gap: "10px",
  },

  btn: {
    padding: "6px 14px",
    borderRadius: "20px",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },

  viewBtn: {
    padding: "6px 14px",
    background: "#0b3c5d",
    color: "#fff",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
  },

  deleteBtn: {
    padding: "6px 14px",
    background: "#dc2626",
    color: "#fff",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
  },

  addBtn: {
    position: "fixed",
    bottom: "30px",
    left: "320px",
    padding: "14px 26px",
    borderRadius: "999px",
    background: "#0b3c5d",
    color: "#fff",
    border: "none",
    fontWeight: "700",
    cursor: "pointer",
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
    padding: "25px",
    borderRadius: "16px",
    width: "420px",
  },

  modalHeader: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    marginBottom: "15px",
  },

  modalAvatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    background: "#ff7a00",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
  },

  modalTitle: {
    margin: 0,
  },

  modalSub: {
    fontSize: "13px",
    color: "#6b7280",
  },

  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px",
    background: "#f9fafb",
    borderRadius: "6px",
  },

  infoLabel: {
    color: "#6b7280",
    fontSize: "13px",
  },

  infoValue: {
    fontWeight: "600",
  },

  closeBtn: {
    marginTop: "15px",
    width: "100%",
    padding: "10px",
    background: "#b91c1c",
    color: "#fff",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
  },
};