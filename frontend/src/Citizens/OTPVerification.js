import React, { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import logo from "D:/govguest/frontend/src/assets/logo.png";
import bg from "D:/govguest/frontend/src/assets/bg.jpg";

// 🌐 Translations
const translations = {
  English: {
    title: "🔐 OTP Verification",
    subtitle: "Enter the 6-digit OTP sent to your registered Aadhaar number",
    verifyBtn: "Verify & Login",
    resend: "Resend OTP",
    resendIn: "Resend OTP in",
    verified: "✅ OTP Verified Successfully!",
    invalid: "⚠️ Invalid or expired OTP. Please try again!",
    resent: "📩 New OTP sent successfully!",
  },
  हिंदी: {
    title: "🔐 ओटीपी सत्यापन",
    subtitle: "अपने पंजीकृत आधार नंबर पर भेजा गया 6 अंकों का ओटीपी दर्ज करें",
    verifyBtn: "सत्यापित करें और लॉगिन करें",
    resend: "🔁 ओटीपी पुनः भेजें",
    resendIn: "ओटीपी पुनः भेजें",
    verified: "✅ ओटीपी सफलतापूर्वक सत्यापित हुआ!",
    invalid: "⚠️ अमान्य या समाप्त ओटीपी!",
    resent: "📩 नया ओटीपी सफलतापूर्वक भेजा गया!",
  },
  मराठी: {
    title: "🔐 ओटीपी पडताळणी",
    subtitle: "नोंदणीकृत आधार क्रमांकावर पाठवलेला 6 अंकी ओटीपी प्रविष्ट करा",
    verifyBtn: "सत्यापित करा आणि लॉगिन करा",
    resend: "🔁 ओटीपी पुन्हा पाठवा",
    resendIn: "ओटीपी पुन्हा पाठवा",
    verified: "✅ ओटीपी यशस्वीरित्या पडताळला गेला!",
    invalid: "⚠️ अमान्य किंवा कालबाह्य ओटीपी!",
    resent: "📩 नवीन ओटीपी यशस्वीरित्या पाठवला गेला!",
  },
  ಕನ್ನಡ: {
    title: "🔐 ಒಟಿಪಿ ಪರಿಶೀಲನೆ",
    subtitle: "ನೋಂದಾಯಿತ ಆಧಾರ್ ಸಂಖ್ಯೆಗೆ ಕಳುಹಿಸಲಾದ 6 ಅಂಕೆಯ ಒಟಿಪಿ ನಮೂದಿಸಿ",
    verifyBtn: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಲಾಗಿನ್ ಮಾಡಿ",
    resend: "🔁 ಒಟಿಪಿ ಮರು ಕಳುಹಿಸಿ",
    resendIn: "ಒಟಿಪಿ ಮರು ಕಳುಹಿಸಿ",
    verified: "✅ ಒಟಿಪಿ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ!",
    invalid: "⚠️ ಅಮಾನ್ಯ ಅಥವಾ ಅವಧಿ ಮೀರಿದ ಒಟಿಪಿ!",
    resent: "📩 ಹೊಸ ಒಟಿಪಿ ಯಶಸ್ವಿಯಾಗಿ ಕಳುಹಿಸಲಾಗಿದೆ!",
  },
};

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") || "English";
    setLanguage(savedLang);
  }, []);

  const t = translations[language];

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setTimeout(() => setTimer(timer - 1), 1000);
    } else {
      setResendEnabled(true);
    }
    return () => clearTimeout(interval);
  }, [timer]);

  const handleChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`).focus();
      }
    }
  };

  const handleVerify = async () => {
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 6) {
      alert(t.invalid);
      return;
    }

    const aadhaar = localStorage.getItem("aadhaarNumber");
    if (!aadhaar) {
      alert("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    setLoading(true);

    try {
      const phoneRes = await fetch("http://localhost:5000/api/get-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar }),
      });

      const phoneData = await phoneRes.json();
      const phoneNumber = phoneData?.phone;

      if (!phoneNumber) {
        alert("Aadhaar not linked to any phone number.");
        setLoading(false);
        return;
      }

      const otpRes = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, otp: enteredOtp }),
      });

      const verifyData = await otpRes.json();

      if (!verifyData.success) {
        alert(t.invalid);
        setLoading(false);
        return;
      }

      alert(t.verified);

      const citizenRes = await fetch("http://localhost:5000/api/get-citizen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar }),
      });

      const citizenData = await citizenRes.json();

      if (citizenData.success) {
        localStorage.setItem("citizenData", JSON.stringify(citizenData.citizen));
      }

      localStorage.removeItem("aadhaarNumber");
      window.location.href = "/citizen-dashboard";
    } catch {
      alert("Server error. Please try again.");
    }

    setLoading(false);
  };

  const handleResend = async () => {
    const aadhaar = localStorage.getItem("aadhaarNumber");
    if (!aadhaar) {
      alert("Session expired. Please login again.");
      window.location.href = "/";
      return;
    }

    setTimer(30);
    setOtp(["", "", "", "", "", ""]);
    setResendEnabled(false);

    try {
      await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar }),
      });
      alert(t.resent);
    } catch {
      alert("Failed to resend OTP.");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.overlay}></div>

      {/* Navbar */}
      <div style={styles.navbar}>
        <div style={styles.navLeft}>
          <img src={logo} alt="KMC Logo" style={styles.logo} />
          <h2 style={styles.navTitle}>Kolhapur Municipal Corporation</h2>
        </div>
      </div>

      {/* Card */}
      <div style={styles.card}>
        <h2 style={styles.title}>{t.title}</h2>
        <p style={styles.subtitle}>{t.subtitle}</p>

        <div style={styles.otpContainer}>
          {otp.map((digit, i) => (
            <input
              key={i}
              id={`otp-${i}`}
              type="text"
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
            t.verifyBtn
          )}
        </button>

        <p style={styles.timerText}>
          {resendEnabled ? (
            <span style={styles.resendLink} onClick={handleResend}>
              {t.resend}
            </span>
          ) : (
            <>
              {t.resendIn} <strong>{timer}s</strong>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

// 🔥 ONLY "page:" UPDATED — nothing else changed
const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    backgroundImage: `url(${bg})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    margin: 0,
    padding: 0,
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },

  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    background: "rgba(0,0,0,0.5)",
    zIndex: 1,
  },

  navbar: {
    position: "fixed",
    top: 0,
    width: "100%",
    padding: "10px 20px",
    height: "60px",
    background: "rgba(0,0,0,0.45)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
    zIndex: 10,
    display: "flex",
    justifyContent: "center",
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },

  logo: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    backgroundColor: "#fff",
    padding: "3px",
  },

  navTitle: {
    color: "white",
    fontSize: "1.1rem",
    fontWeight: "600",
  },

  card: {
    width: "90%",
    maxWidth: "380px",
    padding: "30px",
    background: "rgba(255,255,255,0.2)",
    borderRadius: "16px",
    backdropFilter: "blur(18px)",
    textAlign: "center",
    zIndex: 3,
  },

  title: {
    fontSize: "1.6rem",
    color: "#ffcc00",
  },

  subtitle: {
    fontSize: "0.9rem",
    marginBottom: "20px",
    color: "#e0e0e0",
  },

  otpContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "8px",
    flexWrap: "wrap",
  },

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
    fontSize: "1rem",
    borderRadius: "10px",
    background: "linear-gradient(45deg, #ffcc00, #ffd633)",
    border: "none",
    color: "#003366",
    fontWeight: "700",
    cursor: "pointer",
  },

  timerText: { marginTop: "15px", color: "#ddd", fontSize: "0.9rem" },

  resendLink: {
    color: "#ffcc00",
    fontWeight: "600",
    cursor: "pointer",
    textDecoration: "underline",
  },

  "@media (max-width: 480px)": {
    otpInput: {
      width: "40px",
      height: "50px",
      fontSize: "18px",
    },
    title: {
      fontSize: "1.3rem",
    },
  },
};

export default OTPVerification;
