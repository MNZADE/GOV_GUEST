import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../firebase";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useTranslation } from "react-i18next";

import logo from "D:/govguest/frontend/src/assets/logo.png";
import bg from "D:/govguest/frontend/src/assets/bg.jpg";

const OTPVerification = () => {
  const { t } = useTranslation(); // 🌍 i18next
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

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  /* --------------------------------------------------
     🔥 VERIFY OTP + BACKEND LOGIN
  -------------------------------------------------- */
  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert(t("otp.invalid"));
      return;
    }

    if (!window.confirmationResult) {
      alert(t("otp.sessionExpired"));
      window.location.href = "/";
      return;
    }

    setLoading(true);

    try {
      const result = await window.confirmationResult.confirm(enteredOtp);

      const token = await result.user.getIdToken();
      localStorage.setItem("firebaseToken", token);

      const aadhaar = localStorage.getItem("aadhaarNumber");
      if (!aadhaar) {
        alert(t("otp.sessionExpired"));
        window.location.href = "/";
        return;
      }

      const loginRes = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ aadhaar }),
      });

      const loginData = await loginRes.json();

      if (!loginData.success) {
        alert(loginData.message || t("otp.loginFailed"));
        setLoading(false);
        return;
      }

      localStorage.setItem(
        "citizenData",
        JSON.stringify(loginData.citizen)
      );

      localStorage.removeItem("aadhaarNumber");
      localStorage.removeItem("phoneNumber");

      alert(t("otp.verified"));
      window.location.href = "/citizen-dashboard";
    } catch (err) {
      console.error(err);
      alert(t("otp.invalid"));
    }

    setLoading(false);
  };

  /* --------------------------------------------------
     🔁 RESEND OTP
  -------------------------------------------------- */
  const handleResend = async () => {
    const phoneNumber = localStorage.getItem("phoneNumber");

    if (!phoneNumber) {
      alert(t("otp.sessionExpired"));
      window.location.href = "/";
      return;
    }

    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    setResendEnabled(false);

    try {
      window.recaptchaVerifier = new RecaptchaVerifier(
        "recaptcha-container",
        { size: "invisible" },
        auth
      );

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        window.recaptchaVerifier
      );

      window.confirmationResult = confirmationResult;
      alert(t("otp.resent"));
    } catch (err) {
      console.error(err);
      alert(t("otp.resendFailed"));
    }
  };

  return (
    <div style={styles.page}>
      <div id="recaptcha-container"></div>
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

/* 🎨 STYLES — ABSOLUTELY UNCHANGED */
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
