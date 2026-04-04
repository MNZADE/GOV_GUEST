import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { useTranslation } from "react-i18next";

import logo from "../assets/logo.png";
import bg from "../assets/bg.jpg";

const OTPVerification = () => {
  const { t } = useTranslation();

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);

  /* ⏱ TIMER */
  useEffect(() => {
    if (timer === 0) {
      setResendEnabled(true);
      return;
    }
    const i = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(i);
  }, [timer]);

  /* 🔢 OTP INPUT */
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /* ===================================================
     🔥 VERIFY OTP (TWILIO BACKEND)
  =================================================== */
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert(t("otp.invalid"));
      return;
    }

    const aadhaar = localStorage.getItem("aadhaar");
    const phone = localStorage.getItem("phone");

    if (!aadhaar || !phone) {
      alert(t("otp.sessionExpired"));
      window.location.href = "/";
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          aadhaar,
          phone,
          otp: enteredOtp,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || t("otp.invalid"));
        setLoading(false);
        return;
      }

      /* ✅ STORE USER */
      localStorage.setItem("citizenData", JSON.stringify(data.citizen));

      /* 🧹 CLEANUP */
      localStorage.removeItem("aadhaar");
      localStorage.removeItem("phone");

      alert(t("otp.verified"));

      window.location.href = "/citizen-dashboard";

    } catch (err) {
      console.error("VERIFY ERROR:", err);
      alert(t("otp.invalid"));
    }

    setLoading(false);
  };

  /* ===================================================
     🔁 RESEND OTP (TWILIO BACKEND)
  =================================================== */
  const handleResend = async () => {
    const aadhaar = localStorage.getItem("aadhaar");

    if (!aadhaar) {
      alert(t("otp.sessionExpired"));
      window.location.href = "/";
      return;
    }

    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    setResendEnabled(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ aadhaar }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        alert(data.message || t("otp.resendFailed"));
        return;
      }

      /* ✅ Update phone if returned */
      if (data.phone) {
        localStorage.setItem("phone", data.phone);
      }

      alert(t("otp.resent"));

    } catch (err) {
      console.error("RESEND ERROR:", err);
      alert(t("otp.resendFailed"));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h2 style={styles.navTitle}>Kolhapur Municipal Corporation</h2>
        </div>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>{t("otp.title")}</h2>
        <p style={styles.subtitle}>{t("otp.subtitle")}</p>

        <div style={styles.otpContainer}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              style={styles.otpInput}
            />
          ))}
        </div>

        <button style={styles.button} onClick={handleVerify} disabled={loading}>
          {loading ? (
            <CircularProgress size={22} style={{ color: "#003366" }} />
          ) : (
            t("otp.verifyBtn")
          )}
        </button>

        <p style={styles.timerText}>
          {resendEnabled ? (
            <span style={styles.resendLink} onClick={handleResend}>
              {t("otp.resend")}
            </span>
          ) : (
            <>
              {t("otp.resendIn")} <strong>{timer}s</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

/* 🎨 STYLES (UNCHANGED) */
const styles = {
  page: {
    minHeight: "100vh",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
  },
  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    height: "60px",
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  navLeft: { display: "flex", alignItems: "center", gap: "10px" },
  logo: { width: "45px", height: "45px", background: "#fff", borderRadius: "50%" },
  navTitle: { color: "#fff", fontSize: "1.1rem" },
  card: {
    zIndex: 2,
    width: "90%",
    maxWidth: "380px",
    padding: "30px",
    background: "rgba(255,255,255,0.2)",
    backdropFilter: "blur(18px)",
    borderRadius: "16px",
    textAlign: "center",
  },
  title: { fontSize: "1.6rem", color: "#ffcc00" },
  subtitle: { fontSize: "0.9rem", color: "#e0e0e0", marginBottom: "20px" },
  otpContainer: { display: "flex", gap: "8px", justifyContent: "center" },
  otpInput: {
    width: "48px",
    height: "55px",
    fontSize: "22px",
    textAlign: "center",
    borderRadius: "10px",
    background: "rgba(255,255,255,0.25)",
    border: "2px solid rgba(255,255,255,0.3)",
    color: "#fff",
  },
  button: {
    marginTop: "20px",
    width: "100%",
    padding: "14px",
    borderRadius: "10px",
    background: "linear-gradient(45deg,#ffcc00,#ffd633)",
    fontWeight: "700",
    cursor: "pointer",
  },
  timerText: { marginTop: "15px", color: "#ddd" },
  resendLink: {
    color: "#ffcc00",
    cursor: "pointer",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default OTPVerification;