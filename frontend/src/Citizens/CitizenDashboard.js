// SAME FILE – ONLY login fetch + localStorage support added

import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "D:/govguest/frontend/src/assets/logo.png";

// 🌐 Translations
const translations = {
  English: {
    welcome: "Welcome",
    subtitle: "Manage your complaints, view notices & stay updated.",
    citizenDetails: "Citizen Details",
    aadhaar: "Aadhaar",
    address: "Address",
    raiseComplaint: "Raise Complaint",
    raiseText: "Report civic issues to your local department.",
    addComplaint: "Add Complaint",
    trackComplaint: "Track Complaints",
    trackText: "Check your complaint progress & department response.",
    myComplaints: "My Complaints",
    notices: "Notices / Bills",
    noticesText: "View latest dues, fines, and announcements.",
    viewNotices: "View Notices",
    complaintHistory: "Complaint History",
    complaintId: "Complaint ID",
    issue: "Issue",
    department: "Department",
    status: "Status",
    date: "Date",
    logout: "Logout",
    footer: "© 2025 Kolhapur Municipal Corporation | Smart Citizen Portal",
  },

  // ...your hindi, marathi, kannada translations (unchanged)
  हिंदी: { /* SAME AS BEFORE */ },
  मराठी: { /* SAME AS BEFORE */ },
  ಕನ್ನಡ: { /* SAME AS BEFORE */ },
};

const CitizenDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [language, setLanguage] = useState("English");
  const [citizen, setCitizen] = useState(null);

  // ⭐ FETCH Language + Citizen Details
  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") || "English";
    setLanguage(savedLang);

    // 1️⃣ Try to load citizen details from localStorage (from OTP verification)
    const savedCitizen = localStorage.getItem("citizenData");

    if (savedCitizen) {
      setCitizen(JSON.parse(savedCitizen));
      return;
    }

    // 2️⃣ Otherwise get from navigation (rare case)
    if (location.state?.citizen) {
      setCitizen(location.state.citizen);
      localStorage.setItem("citizenData", JSON.stringify(location.state.citizen));
    }

  }, []);

  const t = translations[language];

  // If citizen is NOT loaded yet → show loading UI
  if (!citizen) {
    return (
      <div style={{ color: "#fff", fontSize: 20, textAlign: "center", marginTop: 50 }}>
        Loading citizen details...
      </div>
    );
  }

  // Static mock complaint history
  const complaints = [
    { id: 101, issue: "Street Light Not Working", department: "Street Light", status: "Resolved", date: "2025-10-22" },
    { id: 102, issue: "Garbage Not Collected", department: "Sanitation", status: "In Progress", date: "2025-10-28" },
    { id: 103, issue: "Water Leakage Near My Home", department: "Water Supply", status: "Pending", date: "2025-11-02" },
  ];

  // ⭐ Logout
  const handleLogout = () => {
    localStorage.removeItem("citizenData");
    navigate("/");
  };

  return (
    <div style={styles.page}>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="KMC Logo" style={styles.logo} />
          <h1 style={styles.navTitle}>Kolhapur Municipal Corporation</h1>
        </div>

        <button style={styles.logoutNav} onClick={handleLogout}>
          🚪 {t.logout}
        </button>
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          {t.welcome}, {citizen.name}! 👋
        </h2>
        <p style={styles.subtitle}>{t.subtitle}</p>
      </div>

      {/* DASHBOARD CARDS */}
      <div style={styles.cardsWrapper}>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t.citizenDetails}</h4>
          <p><strong>{t.aadhaar}:</strong> {citizen.aadhaar}</p>
          <p><strong>{t.address}:</strong> {citizen.address}</p>
        </div>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t.raiseComplaint}</h4>
          <p>{t.raiseText}</p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/add-complaint", { state: { citizen } })}
          >
            ➕ {t.addComplaint}
          </button>
        </div>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t.trackComplaint}</h4>
          <p>{t.trackText}</p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/track-complaints", { state: { citizen } })}
          >
            📋 {t.myComplaints}
          </button>
        </div>

        <div style={{ ...styles.card, background: "#fffbe6", color: "#4a3900" }}>
          <h4 style={styles.cardTitle}>{t.notices}</h4>
          <p>{t.noticesText}</p>
          <button
            style={{ ...styles.primaryButton, background: "#ff9800" }}
            onClick={() => navigate("/notices", { state: { citizen } })}
          >
            🔔 {t.viewNotices}
          </button>
        </div>

      </div>

      {/* COMPLAINT HISTORY */}
      <div style={styles.tableSection}>
        <h3 style={styles.tableTitle}>{t.complaintHistory}</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t.complaintId}</th>
              <th style={styles.th}>{t.issue}</th>
              <th style={styles.th}>{t.department}</th>
              <th style={styles.th}>{t.status}</th>
              <th style={styles.th}>{t.date}</th>
            </tr>
          </thead>

          <tbody>
            {complaints.map((c) => (
              <tr key={c.id} style={styles.row}>
                <td style={styles.td}>#{c.id}</td>
                <td style={styles.td}>{c.issue}</td>
                <td style={styles.td}>{c.department}</td>
                <td
                  style={{
                    ...styles.td,
                    color:
                      c.status === "Resolved"
                        ? "#4caf50"
                        : c.status === "In Progress"
                        ? "#ff9800"
                        : "#f44336",
                    fontWeight: "bold",
                  }}
                >
                  {c.status}
                </td>
                <td style={styles.td}>{c.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p>{t.footer}</p>
      </div>
    </div>
  );
};

/* === STYLE OBJECTS (UNCHANGED) === */
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #003366 0%, #0055a5 50%, #001933 100%)",
    fontFamily: "'Poppins', sans-serif",
    paddingTop: "90px",
    paddingBottom: "60px",
    color: "#fff",
  },
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    height: "70px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0.25px",
    background: "rgba(0,0,0,0.3)",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    backdropFilter: "blur(10px)",
    zIndex: 10,
  },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  logo: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    background: "#fff",
    padding: "4px",
    objectFit: "contain",
  },
  navTitle: { color: "#fff", fontSize: "20px", fontWeight: "600" },

  logoutNav: {
    background: "#ff3b3b",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    padding: "10px 16px",
    marginRight: "40px",
    cursor: "pointer",
    fontWeight: "500",
  },

  header: { textAlign: "center", marginBottom: "30px" },
  title: { color: "#ffcc00", fontSize: "28px", fontWeight: "bold" },
  subtitle: { color: "#e0e0e0", fontSize: "16px", marginTop: "8px" },

  cardsWrapper: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "25px",
    padding: "0 60px",
  },
  card: {
    background: "rgba(255,255,255,0.1)",
    borderRadius: "15px",
    padding: "25px",
    textAlign: "center",
    transition: "0.2s",
    boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
  },
  cardTitle: { fontSize: "20px", marginBottom: "12px", color: "#ffcc00" },
  primaryButton: {
    marginTop: "10px",
    padding: "12px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    background: "#0066cc",
    color: "#fff",
    fontWeight: "500",
    fontSize: "16px",
    cursor: "pointer",
  },

  tableSection: {
    marginTop: "60px",
    padding: "20px 60px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "15px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.25)",
  },
  tableTitle: {
    color: "#ffcc00",
    fontSize: "22px",
    textAlign: "center",
    marginBottom: "20px",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    textAlign: "left",
    padding: "12px",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    borderBottom: "2px solid rgba(255,255,255,0.2)",
  },
  td: {
    padding: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    color: "#fff",
  },

  footer: {
    textAlign: "center",
    marginTop: "40px",
    color: "#ccc",
    fontSize: "14px",
  },
};

export default CitizenDashboard;
