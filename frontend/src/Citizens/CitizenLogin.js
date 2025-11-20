import React, { useState, useRef, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import logo from "D:/govguest/frontend/src/assets/logo.png";
import bg from "D:/govguest/frontend/src/assets/bg.jpg";

// 🌐 Simple Translation Data (only for this page)
const translations = {
  English: {
    title: "Citizen Aadhaar Login",
    subtitle: "Access civic services using your Aadhaar number",
    sendOtp: "Send OTP",
    footer: "Your Aadhaar number is used only for secure verification.",
    aadhaarAlert: "Please enter all 12 Aadhaar digits!",
  },
  हिंदी: {
    title: "नागरिक आधार लॉगिन",
    subtitle: "अपने आधार नंबर से नागरिक सेवाओं का उपयोग करें",
    sendOtp: "ओटीपी भेजें",
    footer: "आपका आधार नंबर केवल सुरक्षित सत्यापन के लिए उपयोग किया जाता है।",
    aadhaarAlert: "कृपया सभी 12 आधार अंक दर्ज करें!",
  },
  मराठी: {
    title: "नागरिक आधार लॉगिन",
    subtitle: "आपल्या आधार क्रमांकाद्वारे नागरी सेवा वापरा",
    sendOtp: "ओटीपी पाठवा",
    footer: "आपला आधार क्रमांक फक्त सुरक्षित पडताळणीसाठी वापरला जातो.",
    aadhaarAlert: "कृपया सर्व 12 आधार अंक प्रविष्ट करा!",
  },
  ಕನ್ನಡ: {
    title: "ನಾಗರಿಕ ಆಧಾರ್ ಲಾಗಿನ್",
    subtitle: "ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆಯಿಂದ ನಾಗರಿಕ ಸೇವೆಗಳಿಗೆ ಪ್ರವೇಶಿಸಿರಿ",
    sendOtp: "ಒಟಿಪಿ ಕಳುಹಿಸಿ",
    footer: "ನಿಮ್ಮ ಆಧಾರ್ ಸಂಖ್ಯೆ ಭದ್ರ ಪರಿಶೀಲನೆಗಾಗಿ ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.",
    aadhaarAlert: "ದಯವಿಟ್ಟು ಎಲ್ಲಾ 12 ಆಧಾರ್ ಅಂಕೆಗಳನ್ನು ನಮೂದಿಸಿ!",
  },
};

const CitizenLogin = () => {
  const [language, setLanguage] = useState("English");
  const [aadhaar, setAadhaar] = useState(Array(12).fill(""));
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage") || "English";
    setLanguage(savedLang);
  }, []);

  const t = translations[language];

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...aadhaar];
    updated[index] = value;
    setAadhaar(updated);

    if (value && index < 11) inputRefs.current[index + 1].focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !aadhaar[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  // ⭐ SEND OTP
  const handleSendOtp = async () => {
    const aadhaarNumber = aadhaar.join("");

    if (aadhaarNumber.length !== 12) {
      alert("⚠️ " + t.aadhaarAlert);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aadhaar: aadhaarNumber }),
      });

      const data = await res.json();

      if (data.success) {
        alert("OTP Sent Successfully!");
        localStorage.setItem("aadhaarNumber", aadhaarNumber);
        window.location.href = `/otp-verification?aadhar=${aadhaarNumber}`;
      } else {
        alert(data.message);
      }
    } catch {
      alert("Server error. Try again.");
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
          <img src={logo} alt="KMC Logo" style={styles.logo} className="logo" />
          <h1 style={styles.navTitle} className="navTitle">
            Kolhapur Municipal Corporation
          </h1>
        </div>
      </div>

      {/* Background Glows */}
      <div style={{ ...styles.glow, top: "-100px", left: "-100px" }}></div>
      <div
        style={{
          ...styles.glow,
          bottom: "-120px",
          right: "-120px",
          background:
            "radial-gradient(circle, rgba(0,150,255,0.25), transparent)",
        }}
      ></div>

      {/* CARD */}
      <div style={styles.card} className="card">
        <h2 style={styles.title} className="title">{t.title}</h2>
        <p style={styles.subtitle} className="subtitle">{t.subtitle}</p>

        {/* Aadhaar Boxes */}
        <div style={styles.boxContainer} className="boxContainer">
          {aadhaar.map((digit, i) => (
            <input
              key={i}
              maxLength={1}
              ref={(el) => (inputRefs.current[i] = el)}
              value={digit}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="box"
              style={{
                ...styles.box,
                borderColor: digit ? "#ffcc00" : "rgba(255,255,255,0.2)",
                background: digit
                  ? "rgba(255,255,255,0.15)"
                  : "rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </div>

        <button
          onClick={handleSendOtp}
          disabled={loading}
          className="button"
          style={{
            ...styles.button,
            ...(loading ? styles.buttonLoading : {}),
          }}
        >
          {loading ? (
            <CircularProgress size={22} style={{ color: "#000" }} />
          ) : (
            t.sendOtp
          )}
        </button>

        <p style={styles.footerText} className="footerText">
          🔒 {t.footer}
        </p>
      </div>

      {/* RESPONSIVE CSS */}
      <style>
        {`
        @media (max-width: 900px) {
          .card { width: 90% !important; padding: 32px !important; }
        }

        @media (max-width: 600px) {
          .navTitle { font-size: 16px !important; }
          .logo { width: 45px !important; height: 45px !important; }
          .card { width: 92% !important; padding: 25px !important; }
          .title { font-size: 22px !important; }
          .subtitle { font-size: 13px !important; }
          .boxContainer { grid-template-columns: repeat(6, 1fr) !important; gap: 10px !important; }
          .box { width: 38px !important; height: 42px !important; font-size: 18px !important; }
        }

        @media (max-width: 400px) {
          .boxContainer { grid-template-columns: repeat(4, 1fr) !important; gap: 10px !important; }
          .box { width: 34px !important; height: 40px !important; font-size: 16px !important; }
          .title { font-size: 20px !important; }
        }
      `}
      </style>
    </div>
  );
};

const styles = {
  page: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Poppins', sans-serif",
  },

  navbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: "70px",
    background: "rgba(0, 0, 0, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backdropFilter: "blur(10px)",
    zIndex: 5,
  },

  navLeft: { display: "flex", alignItems: "center", gap: "12px" },

  logo: {
    width: "55px",
    height: "55px",
    objectFit: "contain",
    borderRadius: "50%",
    background: "#fff",
    padding: "5px",
  },

  navTitle: {
    color: "#fff",
    fontSize: "22px",
    fontWeight: "600",
  },

  glow: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(255,255,255,0.1), transparent)",
    filter: "blur(100px)",
  },

  // ⭐ UPDATED CARD UI — Perfectly matches your background
  card: {
    width: "520px",
    padding: "40px",
    textAlign: "center",
    borderRadius: "22px",

    background: "rgba(255, 255, 255, 0.18)",
    backdropFilter: "blur(22px) saturate(180%)",
    WebkitBackdropFilter: "blur(22px) saturate(180%)",

    border: "1px solid rgba(255, 255, 255, 0.45)",
    boxShadow: "0 10px 38px rgba(0, 90, 160, 0.45)",

    color: "#ffffff",
    transition: "0.25s ease-in-out",
  },

  title: { fontSize: "26px", fontWeight: "bold", color: "#ffcc00" },

  subtitle: { fontSize: "15px", marginBottom: "20px" },

  boxContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)",
    gap: "8px",
    justifyContent: "center",
    alignItems: "center",
    margin: "0 auto 25px auto",
    width: "100%",
    maxWidth: "420px",
    justifyItems: "center",
  },

  box: {
    width: "30px",
    height: "45px",
    textAlign: "center",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "20px",
  },

  button: {
    width: "100%",
    padding: "14px",
    background: "#ffcc00",
    borderRadius: "10px",
    fontSize: "18px",
    color: "#003366",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "15px",
  },

  buttonLoading: { opacity: 0.5, cursor: "not-allowed" },

  footerText: { fontSize: "13px", marginTop: "15px", opacity: 0.8 },
};

export default CitizenLogin;
