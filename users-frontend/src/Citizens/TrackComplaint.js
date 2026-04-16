import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "D:/govguest/users-frontend/src/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { generateComplaintPDF } from "D:/govguest/users-frontend/src/utils/generateComplaintPDF";

import { useTranslation } from "react-i18next";
import i18n from "i18next";

const DEPARTMENT_SUBCATEGORY_MAP = {
  water: ["waterLeak", "lowPressure", "noWater", "pipeDamage"],
  roads: ["roadDamage", "potholes", "footpath", "speedBreaker"],
  sanitation: ["garbage", "overflowBins", "deadAnimal", "streetCleaning"],
  streetLight: ["lightNotWorking", "flickering", "poleDamage", "newLight"],
  drainage: ["drainBlocked", "sewerOverflow", "manhole", "badSmell"],
  health: ["mosquito", "garbageBurning", "toiletIssue", "healthHazard"],
  other: ["other", "general"],
};

const API_BASE = "http://localhost:5000/api";

const TrackComplaints = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Popup state
  const [showMessageCard, setShowMessageCard] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState("");

  const citizen = JSON.parse(localStorage.getItem("citizenData"));
  const userAadhaar = String(
    citizen?.aadhaar || citizen?.aadhaarNumber || ""
  );

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 600;
  const isTablet = screenWidth > 600 && screenWidth <= 900;

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!citizen) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    const savedLang = localStorage.getItem("lang") || "en";
    i18n.changeLanguage(savedLang);

    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/complaints/user/${userAadhaar}`);
      if (!res.ok) return;

      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch (err) {
      console.log("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (complaintId) => {
    if (!window.confirm(t("messages.deleteConfirm"))) return;

    try {
      const res = await fetch(
        `${API_BASE}/complaints/user/${userAadhaar}/${complaintId}`,
        { method: "DELETE" }
      );

      const data = await res.json();

      if (data.success) {
        alert(t("messages.deleteSuccess"));
        fetchComplaints();
      } else {
        alert(t("messages.deleteFail"));
      }
    } catch {
      alert(t("messages.serverError"));
    }
  };

  // ✅ Edit
  const handleEdit = (complaint) => {
    localStorage.setItem("editComplaint", JSON.stringify(complaint));
    navigate("/complaint-form");
  };

  // ✅ Popup message
  const showRejectionReason = (reason) => {
    setSelectedMessage(reason || "No reason provided");
    setShowMessageCard(true);
  };

  const getDepartments = (c) => {
    if (c.department) return [c.department];
    if (Array.isArray(c.departments)) return c.departments;
    return ["N/A"];
  };

  const getSubcategories = (c) => {
    let subs = [];

    if (Array.isArray(c.subcategories)) subs = c.subcategories;
    else if (c.subcategory) subs = [c.subcategory];

    const dept = c.department;

    if (dept && DEPARTMENT_SUBCATEGORY_MAP[dept]) {
      const filtered = subs.filter((s) =>
        DEPARTMENT_SUBCATEGORY_MAP[dept].includes(s)
      );
      return filtered.length ? filtered : ["N/A"];
    }

    return subs.length ? subs : ["N/A"];
  };

  const filteredComplaints = complaints.filter((c) => {
    const deptText = getDepartments(c).join(" ").toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      (c.complaintId || "").toLowerCase().includes(searchLower) ||
      deptText.includes(searchLower)
    );
  });

  const statusColor = {
    Resolved: "#4caf50",
    "In Progress": "#ff9800",
    Pending: "#f44336",
    Rejected: "#ff0000",
  };

  return (
    <div style={styles.page}>
      <div style={{ ...styles.navbar, ...(isMobile ? styles.navbarMobile : {}) }}>
        <div style={styles.navLeft}>
          <img src={logo} alt="logo" style={styles.logo} />
          {!isMobile && (
            <h2 style={styles.navTitle}>
              Kolhapur Municipal Corporation
            </h2>
          )}
        </div>

        <button
          style={styles.backButton}
          onClick={() => navigate("/citizen-dashboard")}
        >
          {t("common.back")}
        </button>
      </div>

      <motion.div style={styles.container}>
        <h1 style={styles.title}>{t("track.title")}</h1>
        <p style={styles.subtitle}>{t("track.subtitle")}</p>

        <input
          style={styles.search}
          placeholder={t("track.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {loading && <p style={{ textAlign: "center" }}>⏳ Loading...</p>}

        {!loading && (
          <motion.div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.tableHeader}>{t("track.complaintId")}</th>
                  <th style={styles.tableHeader}>{t("track.department")}</th>
                  <th style={styles.tableHeader}>{t("track.subcategory")}</th>
                  <th style={styles.tableHeader}>{t("track.status")}</th>
                  <th style={styles.tableHeader}>{t("track.dateTime")}</th>
                  <th style={styles.tableHeader}>{t("track.actions")}</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={styles.noResults}>
                      {t("track.noComplaints")}
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((c) => (
                    <tr key={c._id || c.complaintId} style={styles.tableRow}>
                      <td style={styles.tableCell}>#{c.complaintId}</td>

                      <td style={styles.tableCell}>
                        {getDepartments(c).map((d) => d.toUpperCase()).join(", ")}
                      </td>

                      <td style={styles.tableCell}>
                        {getSubcategories(c).join(", ")}
                      </td>

                      <td style={{ ...styles.tableCell, color: statusColor[c.status] }}>
                        {t(`status.${c.status}`)}
                      </td>

                      <td style={styles.tableCell}>
                        {c.date} <br />
                        <small>{c.time}</small>
                      </td>

                      <td style={styles.actionCell}>
                        <button onClick={() => generateComplaintPDF(c)} style={styles.pdfButton}>📄</button>
                        <button onClick={() => deleteComplaint(c.complaintId)} style={styles.deleteButton}>🗑</button>

                        {c.status === "Rejected" && (
                          <>
                            <button onClick={() => showRejectionReason(c.rejectionReason)} style={styles.pdfButton}>💬</button>
                            <button onClick={() => handleEdit(c)} style={styles.pdfButton}>✏️</button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* ✅ POPUP */}
        {showMessageCard && (
          <div style={styles.messageOverlay}>
            <div style={styles.messageCard}>
              <h3>❌ Rejection Reason</h3>
              <p>{selectedMessage}</p>
              <button style={styles.closeBtn} onClick={() => setShowMessageCard(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};



const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #002f5e, #004c99)",
    paddingTop: "110px",
    color: "white",
    fontFamily: "Poppins",
  },

  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    height: "75px",
    background: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(8px)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 25px",
    zIndex: 50,
  },

  navbarMobile: {
    flexDirection: "column",
    height: "auto",
    paddingBottom: "10px",
  },

  navLeft: { display: "flex", alignItems: "center", gap: "12px" },

  logo: {
    width: "50px",
    height: "50px",
    background: "#fff",
    borderRadius: "50%",
    padding: "4px",
  },

  navTitle: { fontSize: "21px", fontWeight: "600" },

  backButton: {
    background: "#ffcc00",
    color: "#003366",
    padding: "10px 20px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    marginRight: "80px",   // ← shifts button slightly left
    whiteSpace: "nowrap",  // ← prevents cutting of text
  },

  container: {
    width: "95%",
    maxWidth: "1100px",
    margin: "auto",
    background: "rgba(255,255,255,0.12)",
    padding: "35px",
    borderRadius: "15px",
  },

  containerTablet: {
    padding: "25px",
  },

  containerMobile: {
    padding: "20px",
  },

  title: {
    textAlign: "center",
    fontSize: "30px",
    color: "#ffcc00",
    fontWeight: "700",
  },

  subtitle: {
    textAlign: "center",
    marginBottom: "25px",
    fontSize: "16px",
    opacity: 0.9,
  },

  search: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.2)",
    border: "1px solid rgba(255,255,255,0.25)",
    color: "white",
    marginBottom: "25px",
    fontSize: "15px",
  },

  searchMobile: {
    padding: "10px",
    fontSize: "13px",
  },

  viewBar: {
    display: "flex",
    gap: "12px",
    marginBottom: "22px",
  },

  viewBarMobile: {
    flexDirection: "column",
  },

  viewBtn: {
    flex: 1,
    padding: "12px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    color: "white",
    fontSize: "15px",
  },

  activeView: {
    flex: 1,
    padding: "12px",
    background: "#ffcc00",
    color: "#003366",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },

  tableWrapper: {
    overflowX: "auto",
    paddingBottom: "10px",
  },

  table: {
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 10px",
    fontSize: "15px",
  },

  tableMobile: {
    fontSize: "12px",
  },

  tableHeader: {
    padding: "14px 20px",
    background: "rgba(255,255,255,0.25)",
    fontWeight: "600",
    textAlign: "left",
  },

  tableRow: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "8px",
  },

  tableCell: {
    padding: "14px 20px",
    textAlign: "left",
    verticalAlign: "middle",
  },

  actionCell: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  noResults: {
    textAlign: "center",
    padding: "15px",
    color: "#ccc",
    fontSize: "16px",
  },

  pdfButton: {
    padding: "8px 14px",
    background: "#ffcc00",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    color: "#003366",
    fontSize: "14px",
  },

  deleteButton: {
    padding: "8px 14px",
    background: "#ff4444",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    color: "white",
    fontSize: "14px",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
  },

  cardGridMobile: {
    gridTemplateColumns: "1fr",
  },

  card: {
    background: "rgba(255,255,255,0.12)",
    padding: "22px",
    borderRadius: "12px",
    fontSize: "15px",
    lineHeight: "1.6",
  },

  timeline: {
    borderLeft: "3px solid #ffcc00",
    paddingLeft: "25px",
    marginTop: "10px",
  },

  timelineItem: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
  },

  timelineDot: {
    width: "14px",
    height: "14px",
    background: "#ffcc00",
    borderRadius: "50%",
    marginTop: "6px",
  },

  statsBox: {
    padding: "25px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.12)",
    textAlign: "center",
    fontSize: "16px",
  },
  // ✅ NEW STYLES (NO UI BREAK)
  messageOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  messageCard: {
    background: "#fff",
    color: "#000",
    padding: "20px",
    borderRadius: "10px",
    width: "300px",
    textAlign: "center",
  },

  closeBtn: {
    padding: "8px 15px",
    background: "#ff4444",
    border: "none",
    color: "#fff",
    borderRadius: "6px",
    cursor: "pointer",
  },
};


export default TrackComplaints;
