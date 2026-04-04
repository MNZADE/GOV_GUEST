import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import logo from "D:/govguest/users-frontend/src/assets/logo.png";
import { useNavigate } from "react-router-dom";
import { generateComplaintPDF } from "D:/govguest/users-frontend/src/utils/generateComplaintPDF";

import { useTranslation } from "react-i18next";
import i18n from "i18next";

const API_BASE = "http://localhost:5000/api";

const TrackComplaints = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [search, setSearch] = useState("");
  const [view, setView] = useState("table");
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const citizen = JSON.parse(localStorage.getItem("citizenData"));

  // ✅ FIXED AADHAAR (IMPORTANT)
  const userAadhaar = String(
    citizen?.aadhaar || citizen?.aadhaarNumber || ""
  );

  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const isMobile = screenWidth <= 600;
  const isTablet = screenWidth > 600 && screenWidth <= 900;

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================= LOAD + AUTO REFRESH ================= */
  useEffect(() => {
    if (!citizen) {
      alert("Session expired. Please login again.");
      navigate("/");
      return;
    }

    const savedLang = localStorage.getItem("lang") || "en";
    i18n.changeLanguage(savedLang);

    fetchComplaints();

    // ✅ AUTO REFRESH AFTER 1 SECOND
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 1000);

    return () => clearTimeout(timer);

  }, []);

  /* ================= FETCH ================= */
  const fetchComplaints = async () => {
    try {
      setLoading(true);

      console.log("📡 Fetching Aadhaar:", userAadhaar);

      const res = await fetch(`${API_BASE}/complaints/user/${userAadhaar}`);

      if (!res.ok) {
        console.log("❌ API Error:", res.status);
        return;
      }

      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.log("❌ Invalid JSON:", text);
        return;
      }

      console.log("📦 API Response:", data);

      if (data.success) {
        setComplaints(data.complaints);
      }
    } catch (err) {
      console.log("❌ Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */
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
        fetchComplaints(); // refresh
      } else {
        alert(t("messages.deleteFail"));
      }
    } catch (err) {
      alert(t("messages.serverError"));
      console.log("❌ Delete Error:", err);
    }
  };

  /* ================= HELPERS ================= */
  const getDepartments = (c) => {
    if (Array.isArray(c.departments)) return c.departments;
    if (c.department) return [c.department];
    return ["N/A"];
  };

  const getSubcategories = (c) => {
    if (Array.isArray(c.subcategories)) return c.subcategories;
    if (c.subcategory) return [c.subcategory];
    return ["N/A"];
  };

  const filteredComplaints = complaints.filter((c) => {
    const deptText = getDepartments(c).join(" ").toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      c.complaintId?.toLowerCase().includes(searchLower) ||
      deptText.includes(searchLower)
    );
  });

  const statusColor = {
    Resolved: "#4caf50",
    "In Progress": "#ff9800",
    Pending: "#f44336",
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={{ ...styles.navbar, ...(isMobile ? styles.navbarMobile : {}) }}>
        <div style={styles.navLeft}>
          <img src={logo} alt="logo" style={styles.logo} />
          {!isMobile && (
            <h2 style={styles.navTitle}>
              Kolhapur Municipal Corporation
            </h2>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            style={styles.backButton}
            onClick={() => navigate("/citizen-dashboard")}
          >
            {t("common.back")}
          </button>
        </div>
      </div>

      {/* MAIN */}
      <motion.div
        style={{
          ...styles.container,
          ...(isMobile
            ? styles.containerMobile
            : isTablet
            ? styles.containerTablet
            : {}),
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 style={styles.title}>{t("track.title")}</h1>
        <p style={styles.subtitle}>{t("track.subtitle")}</p>

        <input
          style={{ ...styles.search, ...(isMobile ? styles.searchMobile : {}) }}
          placeholder={t("track.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* VIEW BUTTONS */}
        <div style={{ ...styles.viewBar, ...(isMobile ? styles.viewBarMobile : {}) }}>
          <button style={view === "table" ? styles.activeView : styles.viewBtn} onClick={() => setView("table")}>
            📁 {t("track.table")}
          </button>
          <button style={view === "cards" ? styles.activeView : styles.viewBtn} onClick={() => setView("cards")}>
            🗂 {t("track.cards")}
          </button>
          <button style={view === "timeline" ? styles.activeView : styles.viewBtn} onClick={() => setView("timeline")}>
            🕒 {t("track.timeline")}
          </button>
          <button style={view === "stats" ? styles.activeView : styles.viewBtn} onClick={() => setView("stats")}>
            📊 {t("track.dashboard")}
          </button>
        </div>

        {/* LOADING */}
        {loading && <p style={{ textAlign: "center" }}>⏳ Loading...</p>}

        {/* TABLE */}
        {!loading && view === "table" && (
          <motion.div style={styles.tableWrapper}>
            <table style={{ ...styles.table, ...(isMobile ? styles.tableMobile : {}) }}>
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
                    <tr key={c.complaintId} style={styles.tableRow}>
                      <td style={styles.tableCell}>#{c.complaintId}</td>
                      <td style={styles.tableCell}>{getDepartments(c).join(", ")}</td>
                      <td style={styles.tableCell}>{getSubcategories(c).join(", ")}</td>
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
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
};

export default TrackComplaints;
