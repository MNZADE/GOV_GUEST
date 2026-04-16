import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/logo.png";

const CitizenDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [citizen, setCitizen] = useState(null);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") || "mr";
    i18n.changeLanguage(savedLang);

    const savedCitizen = localStorage.getItem("citizenData");

    if (savedCitizen) {
      const user = JSON.parse(savedCitizen);
      setCitizen(user);

      fetch(`http://localhost:5000/api/complaints/user/${user.aadhaar}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setComplaints(data.complaints);
          }
        })
        .catch((err) => console.log("Fetch error:", err));

      return;
    }

    if (location.state?.citizen) {
      setCitizen(location.state.citizen);
      localStorage.setItem(
        "citizenData",
        JSON.stringify(location.state.citizen)
      );
    }
  }, []);

  const maskAadhaar = (aadhaar) => {
    if (!aadhaar) return "";
    return "XXXX XXXX " + aadhaar.slice(-4);
  };

  const handleLogout = () => {
    localStorage.removeItem("citizenData");
    navigate("/");
  };

  if (!citizen) {
    return (
      <div style={{ color: "#fff", fontSize: 20, textAlign: "center", marginTop: 50 }}>
        Loading citizen details...
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="KMC Logo" style={styles.logo} />
          <h1 style={styles.navTitle}>{t("app.name")}</h1>
        </div>

        <button style={styles.logoutNav} onClick={handleLogout}>
          🚪 {t("dashboard.logout")}
        </button>
      </div>

      {/* HEADER */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          {t("dashboard.welcome", { name: citizen.name })} 👋
        </h2>
        <p style={styles.subtitle}>{t("dashboard.subtitle")}</p>
      </div>

      {/* CARDS */}
      <div style={styles.cardsWrapper}>
        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t("dashboard.citizenDetails")}</h4>
          <p>
            <strong>{t("dashboard.aadhaar")}:</strong>{" "}
            {maskAadhaar(citizen.aadhaar)}
          </p>
          <p>
            <strong>{t("dashboard.address")}:</strong> {citizen.address}
          </p>
        </div>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t("dashboard.raiseComplaint")}</h4>
          <p>{t("dashboard.raiseDesc")}</p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/add-complaint", { state: { citizen } })}
          >
            ➕ {t("dashboard.addComplaint")}
          </button>
        </div>

        <div style={styles.card}>
          <h4 style={styles.cardTitle}>{t("dashboard.trackComplaint")}</h4>
          <p>{t("dashboard.trackDesc")}</p>
          <button
            style={styles.primaryButton}
            onClick={() => navigate("/track-complaints", { state: { citizen } })}
          >
            📋 {t("dashboard.myComplaints")}
          </button>
        </div>

        <div style={{ ...styles.card, background: "#fffbe6", color: "#4a3900" }}>
          <h4 style={styles.cardTitle}>{t("dashboard.notices")}</h4>
          <p>{t("dashboard.noticesDesc")}</p>
          <button
            style={{ ...styles.primaryButton, background: "#ff9800" }}
            onClick={() => navigate("/notices", { state: { citizen } })}
          >
            🔔 {t("dashboard.viewNotices")}
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div style={styles.tableSection}>
        <h3 style={styles.tableTitle}>{t("dashboard.complaintHistory")}</h3>

        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>{t("dashboard.complaintId")}</th>
              <th style={styles.th}>{t("dashboard.issue")}</th>
              <th style={styles.th}>{t("dashboard.department")}</th>
              <th style={styles.th}>{t("dashboard.status")}</th>
              <th style={styles.th}>{t("dashboard.date")}</th>
            </tr>
          </thead>

          <tbody>
            {complaints.length === 0 ? (
              <tr>
                <td colSpan="5" style={styles.td}>
                  No complaints found
                </td>
              </tr>
            ) : (
              complaints.map((c) => (
                <tr key={c._id || c.complaintId}>
                  <td style={styles.td}>#{c.complaintId}</td>
                  <td style={styles.td}>{c.issue}</td>

                  {/* ✅ UPDATED LOGIC ONLY */}
                  <td style={styles.td}>
                    {c.department
                      ? c.department.toUpperCase()
                      : Array.isArray(c.departments)
                      ? c.departments.join(", ").toUpperCase()
                      : "N/A"}
                  </td>

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
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER */}
      <div style={styles.footer}>
        <p>{t("footer.copyright")}</p>
      </div>
    </div>
  );
};

/* === STYLES UNCHANGED === */
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