import React, { useEffect, useState } from "react";
import logo from "../assets/logo.png";

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/notices/all");
      const data = await res.json();

      if (data.success) {
        setNotices(data.notices);
      } else {
        console.log("❌ Failed to fetch notices");
      }
    } catch (err) {
      console.error("🔥 Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <img src={logo} alt="logo" style={styles.logo} />
        <h2>Notices & Announcements</h2>
      </div>

      {/* CONTENT */}
      <div style={styles.container}>
        {loading ? (
          <p>Loading notices...</p>
        ) : notices.length === 0 ? (
          <p>No notices available</p>
        ) : (
          notices.map((n) => (
            <div key={n._id} style={styles.card}>
              <h3 style={styles.title}>{n.title}</h3>
              <p style={styles.message}>{n.message}</p>
              <small style={styles.date}>
                {new Date(n.createdAt).toLocaleString()}
              </small>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

/* ================= STYLES ================= */
const styles = {
  page: {
    background: "linear-gradient(135deg, #003366, #004c99)",
    minHeight: "100vh",
    color: "#fff",
    fontFamily: "Poppins, sans-serif",
  },

  navbar: {
    padding: "15px 25px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "rgba(0,0,0,0.3)",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },

  logo: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
  },

  container: {
    padding: "25px",
  },

  card: {
    background: "rgba(255,255,255,0.1)",
    padding: "20px",
    marginBottom: "15px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },

  title: {
    marginBottom: "8px",
    color: "#ffcc00",
  },

  message: {
    marginBottom: "10px",
  },

  date: {
    color: "#ddd",
    fontSize: "12px",
  },
};

export default Notices;