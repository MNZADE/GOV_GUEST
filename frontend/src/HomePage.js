import React, { useState, useEffect } from "react";
import homeBg from "./assets/homebg.webp";
import logo from "./assets/logo.png";

// 🌐 FULL TRANSLATIONS
const translations = {
  English: {
    features: "Features",
    about: "About",
    citizenLogin: "Citizen Aadhaar Login",
    heroTitle: "Citizen Complaint Management Portal",
    heroText:
      "Raise civic issues related to sanitation, roads, street lights, drainage, water supply & more — directly to your city officials.",
    services: "Our Services",
    serviceList: [
      "🚮 Waste Management",
      "💡 Street Lights",
      "🛣️ Road Complaints",
      "🚰 Water Supply",
      "🌳 Cleanliness",
    ],
    aboutText:
      "Kolhapur Municipal Corporation is dedicated to offering efficient and transparent services to every citizen through this digital grievance redressal system.",
    footer: "© 2025 Kolhapur Municipal Corporation | All Rights Reserved",
  },
  हिंदी: {
    features: "विशेषताएँ",
    about: "हमारे बारे में",
    citizenLogin: "नागरिक आधार लॉगिन",
    heroTitle: "नागरिक शिकायत प्रबंधन पोर्टल",
    heroText:
      "स्वच्छता, सड़कें, स्ट्रीट लाइट, जल निकासी, जल आपूर्ति और अन्य नागरिक मुद्दों की शिकायत सीधे नगर निगम अधिकारियों तक पहुँचाएं।",
    services: "हमारी सेवाएँ",
    serviceList: [
      "🚮 कचरा प्रबंधन",
      "💡 स्ट्रीट लाइट",
      "🛣️ सड़क शिकायतें",
      "🚰 जल आपूर्ति",
      "🌳 स्वच्छता",
    ],
    aboutText:
      "कोल्हापुर नगर निगम हर नागरिक को पारदर्शी और प्रभावी सेवाएँ प्रदान करने के लिए प्रतिबद्ध है।",
    footer: "© 2025 कोल्हापुर नगर निगम | सर्वाधिकार सुरक्षित",
  },
  मराठी: {
    features: "वैशिष्ट्ये",
    about: "आमच्याबद्दल",
    citizenLogin: "नागरिक आधार लॉगिन",
    heroTitle: "नागरिक तक्रार व्यवस्थापन पोर्टल",
    heroText:
      "स्वच्छता, रस्ते, स्ट्रीಟ್ लाइट, निचरा, पाणीपुरवठा आणि इतर नागरी समस्यांबद्दल थेट तुमच्या नगरपालिकेला कळवा.",
    services: "आमच्या सेवा",
    serviceList: [
      "🚮 कचरा व्यवस्थापन",
      "💡 स्ट्रीट लाइट",
      "🛣️ रस्ता तक्रारी",
      "🚰 पाणीपुरवठा",
      "🌳 स्वच्छता",
    ],
    aboutText:
      "कोल्हापूर महानगरपालिका प्रत्येक नागरिकाला पारदर्शक आणि कार्यक्षम सेवा देण्यास कटिबद्ध आहे.",
    footer: "© 2025 कोल्हापूर महानगरपालिका | सर्व हक्क राखीव",
  },
  ಕನ್ನಡ: {
    features: "ವೈಶಿಷ್ಟ್ಯಗಳು",
    about: "ನಮ್ಮ ಬಗ್ಗೆ",
    citizenLogin: "ನಾಗರಿಕ ಆಧಾರ್ ಲಾಗಿನ್",
    heroTitle: "ನಾಗರಿಕ ದೂರು ನಿರ್ವಹಣಾ ಪೋರ್ಟಲ್",
    heroText:
      "ಸ್ವಚ್ಛತೆ, ರಸ್ತೆಗಳು, ಬೀದಿ ದೀಪಗಳು, ನೀರು ಮತ್ತು ಇತರ ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳನ್ನು ನೇರವಾಗಿ ಮಹಾನಗರ ಪಾಲಿಕೆಗೆ ವರದಿ ಮಾಡಿ.",
    services: "ನಮ್ಮ സേവೆಗಳು",
    serviceList: [
      "🚮 ಕಸ ನಿರ್ವಹಣೆ",
      "💡 ಬೀದಿ ದೀಪಗಳು",
      "🛣️ ರಸ್ತೆ ದೂರುಗಳು",
      "🚰 ನೀರು ಸರಬರಾಜು",
      "🌳 ಸ್ವಚ್ಛತೆ",
    ],
    aboutText:
      "ಕೊಲ್ಹಾಪುರ ಮಹಾನಗರ ಪಾಲಿಕೆ ಪಾರದರ್ಶಕ ಮತ್ತು ಪರಿಣಾಮಕಾರಿ ಸೇವೆಗಳನ್ನು ಒದಗಿಸಲು ಬದ್ಧವಾಗಿದೆ.",
    footer: "© 2025 ಕೊಲ್ಹಾಪುರ ಮಹಾನಗರ ಪಾಲಿಕೆ | ಎಲ್ಲಾ ಹಕ್ಕುಗಳು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ",
  },
};

const HomePage = () => {
  const [language, setLanguage] = useState("English");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("preferredLanguage");
    if (savedLang && translations[savedLang]) {
      setLanguage(savedLang);
    }
  }, []);

  const selectLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem("preferredLanguage", lang);
    setDropdownOpen(false);
  };

  const t = translations[language];

  return (
    <div className="page">

      {/* NAVBAR */}
      <nav className="navbar fade-down">
        <div className="logo-container">
          <img src={logo} alt="KMC Logo" className="logo-img" />
          <h3 className="logo-text">Kolhapur Municipal Corporation</h3>
        </div>

        <ul className={`nav-links ${mobileMenu ? "open" : ""}`}>
          <li><a href="#features">{t.features}</a></li>
          <li><a href="#about">{t.about}</a></li>

          {/* LANGUAGE DROPDOWN */}
          <li className="language-selector">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              🌐 {language} ▾
            </button>

            {dropdownOpen && (
              <div className="dropdown fade-in">
                {Object.keys(translations).map((lang) => (
                  <div
                    key={lang}
                    className="dropdown-item"
                    onClick={() => selectLanguage(lang)}
                  >
                    {lang}
                  </div>
                ))}
              </div>
            )}
          </li>
        </ul>

        <button
          className="hamburger"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>
      </nav>

      {/* HERO */}
      <section
        className="hero fade-in-scale"
        style={{ backgroundImage: `url(${homeBg})` }}
      >
        <div className="hero-content">
          <h1 className="fade-up">{t.heroTitle}</h1>
          <p className="fade-up-delayed">{t.heroText}</p>
          <a className="citizen-login fade-up-delayed-2" href="/citizen-login">
            {t.citizenLogin}
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section fade-up">
        <h2>{t.services}</h2>

        <div className="feature-grid">
          {t.serviceList.map((s, i) => (
            <div key={i} className="feature-card pop">
              {s}
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about fade-up">
        <h2>{t.about}</h2>
        <p>{t.aboutText}</p>
      </section>

      {/* FOOTER */}
      <footer className="footer fade-in">
        <p>{t.footer}</p>
      </footer>

      {/* CSS with Animations */}
      <style>{`
/* Basic resets */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeScale {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.fade-down { animation: fadeDown 0.8s ease-out; }
.fade-in { animation: fadeIn 1s ease-out; }
.fade-in-scale { animation: fadeScale 1s ease-out; }
.fade-up { animation: fadeUp 1s ease-out; }
.fade-up-delayed { animation: fadeUp 1.2s ease-out; }
.fade-up-delayed-2 { animation: fadeUp 1.4s ease-out; }
.pop { animation: fadeScale 0.6s ease-out; }

/* NAVBAR */
.navbar {
  background: linear-gradient(90deg, #00264d, #003d80);
  color: #fff;
  padding: 12px 25px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 3px 12px rgba(0,0,0,0.25);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 3px;
  background: white;
  box-shadow: 0 0 8px rgba(255,255,255,0.7);
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 25px;
  list-style: none;
}

.nav-links a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: 0.3s ease;
}

.nav-links a:hover {
  color: #ffcc00;
}

/* LANGUAGE DROPDOWN */
.language-selector button {
  background: #004a99;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: 0.3s;
}

.language-selector button:hover {
  background: #0059cc;
}

.dropdown {
  position: absolute;
  background: white;
  color: #003366;
  right: 20px;
  margin-top: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.25);
}

.dropdown-item {
  padding: 12px 18px;
  cursor: pointer;
  font-weight: 500;
  transition: 0.3s;
}

.dropdown-item:hover {
  background: #ffcc00;
}

/* HERO SECTION */
.hero {
  height: 75vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 25px;
  position: relative;
}

.hero::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.45);
}

.hero-content {
  position: relative;
  z-index: 10;
  background: rgba(0,0,0,0.55);
  padding: 35px;
  border-radius: 16px;
  text-align: center;
  color: white;
  max-width: 90%;
  box-shadow: 0 8px 20px rgba(0,0,0,0.4);
}

.hero-content h1 {
  font-size: 32px;
}

.citizen-login {
  background: #ffcc00;
  padding: 12px 28px;
  display: inline-block;
  margin-top: 18px;
  font-weight: bold;
  color: #003366;
  border-radius: 10px;
  font-size: 17px;
  transition: 0.3s ease;
}

.citizen-login:hover {
  background: #ffdd44;
  transform: scale(1.05);
}

/* FEATURES */
.section {
  padding: 50px 20px;
  text-align: center;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
  margin-top: 25px;
}

.feature-card {
  background: linear-gradient(180deg, white, #f9f9f9);
  padding: 25px;
  border-radius: 12px;
  font-weight: bold;
  font-size: 17px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  transition: 0.3s ease-in-out;
}

.feature-card:hover {
  transform: translateY(-6px) scale(1.03);
  box-shadow: 0 8px 20px rgba(0,0,0,0.25);
}

/* ABOUT */
.about {
  background: #f7f7f7;
  padding: 45px 20px;
  text-align: center;
  font-size: 18px;
}

/* FOOTER */
.footer {
  background: #00264d;
  color: white;
  padding: 18px;
  text-align: center;
  font-size: 15px;
  box-shadow: 0 -3px 12px rgba(0,0,0,0.2);
}

/* MOBILE MENU */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .nav-links {
    position: absolute;
    top: 60px;
    right: 0;
    background: #003366;
    width: 100%;
    flex-direction: column;
    padding: 20px;
    gap: 18px;
    display: none;
  }

  .nav-links.open {
    display: flex;
  }

  .hamburger {
    display: block;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 85vh;
  }

  .hero-content h1 {
    font-size: 24px;
  }

  .hero-content p {
    font-size: 14px;
  }

  .feature-card {
    font-size: 14px;
    padding: 18px;
  }
}
      `}</style>

    </div>
  );
};

export default HomePage;
