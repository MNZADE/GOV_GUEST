import React, { useState, useRef } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { useTranslation } from "react-i18next";
import { auth } from "../firebase";

import logo from "D:/govguest/frontend/src/assets/logo.png";
import bg from "D:/govguest/frontend/src/assets/bg.jpg";

const CitizenLogin = () => {
  const { t } = useTranslation();

  const [aadhaar, setAadhaar] = useState(Array(12).fill(""));
  const [visible, setVisible] = useState(Array(12).fill("")); // 👁️ display control
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);
  const timers = useRef({}); // ⏱️ per-digit timers

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newAadhaar = [...aadhaar];
    const newVisible = [...visible];

    newAadhaar[index] = value;
    newVisible[index] = value; // show digit first

    setAadhaar(newAadhaar);
    setVisible(newVisible);

    // clear old timer if exists
    if (timers.current[index]) {
      clearTimeout(timers.current[index]);
    }

    // after 2 seconds → mask
    if (value) {
      timers.current[index] = setTimeout(() => {
        setVisible((prev) => {
          const masked = [...prev];
          masked[index] = "•";
          return masked;
        });
      }, 2000);
    }

    if (value && index < 11) {
      inputRefs.current[index + 1].focus();
    }
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

  /* --------------------------------------------------
     🔥 SEND OTP (UNCHANGED)
  -------------------------------------------------- */
  const handleSendOtp = async () => {
    const aadhaarNumber = aadhaar.join("");

    if (aadhaarNumber.length !== 12) {
      alert("⚠️ " + t("aadhaarAlert"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/validate-aadhaar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarNumber }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "Aadhaar not found");
        setLoading(false);
        return;
      }

      let phoneNumber = data.phone;
      if (!phoneNumber.startsWith("+")) phoneNumber = "+91" + phoneNumber;

      window.recaptchaVerifier = null;
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

      localStorage.setItem("aadhaarNumber", aadhaarNumber);
      localStorage.setItem("phoneNumber", phoneNumber);

      alert(t("otpSent"));
      window.location.href = "/otp-verification";
    } catch (err) {
      console.error(err);
      alert(t("otpFailed"));
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
      <div id="recaptcha-container"></div>

      {/* NAVBAR */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="Logo" style={styles.logo} />
          <h1 style={styles.navTitle}>Kolhapur Municipal Corporation</h1>
        </div>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <h2 style={styles.title}>{t("Citizen Aadhaar Login")}</h2>
        <p style={styles.subtitle}>
          {t("Access civic services using your Aadhaar number")}
        </p>

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
            t("Send OTP")
          )}
        </button>

        <p style={styles.footerText}>
          🔒 {t("Your Aadhaar number is used only for the secure verification")}
        </p>
      </div>
    </div>
  );
};

/* 🎨 STYLES — UNCHANGED */
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
  logo: { width: "55px", height: "55px", background: "#fff", borderRadius: "50%" },
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
  },
  button: {
    width: "100%",
    padding: "14px",
    background: "#ffcc00",
    borderRadius: "10px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  buttonLoading: { opacity: 0.5 },
  footerText: { fontSize: "13px", marginTop: "15px" },
};

export default CitizenLogin;
