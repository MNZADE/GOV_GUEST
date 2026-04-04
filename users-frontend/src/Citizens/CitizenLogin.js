import React, { useState, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";

import logo from "../assets/logo.png";
import bg from "../assets/bg.jpg";

const CitizenLogin = () => {
  const { t } = useTranslation();

  const [aadhaar, setAadhaar] = useState(Array(12).fill(""));
  const [visible, setVisible] = useState(Array(12).fill(""));
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const timers = useRef({});

  /* 🔢 INPUT HANDLING */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newAadhaar = [...aadhaar];
    const newVisible = [...visible];

    newAadhaar[index] = value;
    newVisible[index] = value;

    setAadhaar(newAadhaar);
    setVisible(newVisible);

    if (timers.current[index]) clearTimeout(timers.current[index]);

    if (value) {
      timers.current[index] = setTimeout(() => {
        setVisible((prev) => {
          const masked = [...prev];
          masked[index] = "•";
          return masked;
        });
      }, 1500);
    }

    if (value && index < 11) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      const newAadhaar = [...aadhaar];
      const newVisible = [...visible];

      if (aadhaar[index]) {
        newAadhaar[index] = "";
        newVisible[index] = "";
      } else if (index > 0) {
        newAadhaar[index - 1] = "";
        newVisible[index - 1] = "";
        inputRefs.current[index - 1].focus();
      }

      setAadhaar(newAadhaar);
      setVisible(newVisible);
    }
  };

  /* 🔥 SEND OTP (UPDATED FOR TWILIO BACKEND) */
  const handleSendOtp = async () => {
    const aadhaarNumber = aadhaar.join("");

    if (aadhaarNumber.length !== 12) {
      alert("⚠️ " + t("auth.aadhaar.alert"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaar: aadhaarNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || t("auth.otp.failed"));
        setLoading(false);
        return;
      }

      /* ✅ Store Aadhaar for OTP verification page */
      localStorage.setItem("aadhaar", aadhaarNumber);

      /* ✅ Store phone if backend sends it */
      if (data.phone) {
        localStorage.setItem("phone", data.phone);
      }

      /* ✅ Success */
      alert("✅ " + t("auth.otp.sent"));

      /* 🚀 Redirect */
      window.location.href = "/otp-verification";

    } catch (err) {
      console.error("OTP ERROR:", err);
      alert("❌ " + t("auth.otp.failed"));
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        ...styles.page,
        backgroundImage: `url(${bg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.navTitle}>{t("app.name")}</h1>
        </div>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>{t("auth.title")}</h2>
        <p style={styles.subtitle}>{t("auth.subtitle")}</p>

        <div style={styles.boxContainer}>
          {aadhaar.map((_, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              inputMode="numeric"
              maxLength={1}
              value={visible[i]}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              style={{
                ...styles.box,
                borderColor: aadhaar[i]
                  ? "#ffcc00"
                  : "rgba(255,255,255,0.2)",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleSendOtp}
          disabled={loading}
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
          }}
        >
          {loading ? (
            <CircularProgress size={22} style={{ color: "#000" }} />
          ) : (
            t("auth.aadhaar.sendOtp") || "Send OTP"
          )}
        </button>

        <p style={styles.footerText}>
          🔒 {t("auth.aadhaar.secure")}
        </p>
      </div>
    </div>
  );
};

/* 🎨 STYLES */
const styles = {
  page: {
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Poppins', sans-serif",
  },
  navbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "70px",
    background: "rgba(0,0,0,0.3)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  navLeft: { display: "flex", alignItems: "center", gap: "12px" },
  logo: {
    width: "55px",
    height: "55px",
    background: "#fff",
    borderRadius: "50%",
  },
  navTitle: { color: "#fff", fontSize: "22px", fontWeight: "600" },
  card: {
    width: "520px",
    padding: "40px",
    textAlign: "center",
    borderRadius: "22px",
    background: "rgba(255,255,255,0.18)",
    backdropFilter: "blur(22px)",
    border: "1px solid rgba(255,255,255,0.45)",
    color: "#fff",
  },
  title: { fontSize: "26px", fontWeight: "bold", color: "#ffcc00" },
  subtitle: { fontSize: "15px", marginBottom: "20px" },
  boxContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "8px",
    marginBottom: "25px",
  },
  box: {
    width: "30px",
    height: "45px",
    textAlign: "center",
    borderRadius: "10px",
    fontSize: "22px",
    background: "rgba(255,255,255,0.15)",
    color: "#fff",
    border: "1px solid rgba(255,255,255,0.2)",
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#ffcc00",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    border: "none",
  },
  buttonLoading: { opacity: 0.6 },
  footerText: { fontSize: "13px", marginTop: "15px" },
};

export default CitizenLogin;