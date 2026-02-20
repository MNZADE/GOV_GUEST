import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import homeBg from "./assets/homebg.webp";
import logo from "./assets/logo.png";

const HomePage = () => {
  const { t, i18n } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  /* 🔤 CHANGE LANGUAGE */
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
    setDropdownOpen(false);
  };

  /* 🔽 SMOOTH SCROLL */
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenu(false);
  };

  return (
    <div className="page">

      {/* NAVBAR */}
      <nav className="navbar fade-down">
        <div className="logo-container">
          <img src={logo} alt="KMC Logo" className="logo-img" />
          <h3 className="logo-text">Kolhapur Municipal Corporation</h3>
        </div>

        <ul className={`nav-links ${mobileMenu ? "open" : ""}`}>
          <li>
            <button className="nav-btn" onClick={() => scrollToSection("features")}>
              {t("features")}
            </button>
          </li>

          <li>
            <button className="nav-btn" onClick={() => scrollToSection("about")}>
              {t("about")}
            </button>
          </li>

          {/* LANGUAGE DROPDOWN */}
          <li className="language-selector">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              🌐 Language ▾
            </button>

            {dropdownOpen && (
              <div className="dropdown fade-in">
                <div className="dropdown-item" onClick={() => changeLanguage("en")}>
                  English
                </div>
                <div className="dropdown-item" onClick={() => changeLanguage("hi")}>
                  हिंदी
                </div>
                <div className="dropdown-item" onClick={() => changeLanguage("mr")}>
                  मराठी
                </div>
                <div className="dropdown-item" onClick={() => changeLanguage("kn")}>
                  ಕನ್ನಡ
                </div>
              </div>
            )}
          </li>
        </ul>

        <button className="hamburger" onClick={() => setMobileMenu(!mobileMenu)}>
          ☰
        </button>
      </nav>

      {/* HERO */}
      <section
        className="hero fade-in-scale"
        style={{ backgroundImage: `url(${homeBg})` }}
      >
        <div className="hero-content">
          <h1 className="fade-up">{t("heroTitle")}</h1>
          <p className="fade-up-delayed">{t("heroText")}</p>
          <a className="citizen-login fade-up-delayed-2" href="/citizen-login">
            {t("citizenLogin")}
          </a>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="section fade-up">
        <h2>{t("services")}</h2>

        <div className="feature-grid">
          {t("serviceList", { returnObjects: true }).map((item, index) => (
            <div key={index} className="feature-card pop">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="about fade-up">
        <h2>{t("about")}</h2>
        <p>{t("aboutText")}</p>
      </section>

      {/* FOOTER */}
      <footer className="footer fade-in">
        <p>{t("footer")}</p>
      </footer>

      {/* ✅ CSS — SAME UI + SMALL FIXES */}
      <style>{`
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: Poppins, sans-serif;
}

/* SCROLL FIX */
#features,
#about {
  scroll-margin-top: 90px;
}

/* ANIMATIONS */
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes fadeDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

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

.logo-container { display: flex; align-items: center; gap: 12px; }
.logo-img {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: white;
  padding: 3px;
}
.logo-text { font-size: 18px; font-weight: 600; }

.nav-links {
  display: flex;
  align-items: center;
  gap: 25px;
  list-style: none;
}

.nav-btn {
  background: none;
  border: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
}

.nav-btn:hover {
  color: #ffcc00;
}

/* DROPDOWN */
.language-selector button {
  background: #004a99;
  padding: 8px 14px;
  border-radius: 8px;
  color: white;
  border: none;
  font-weight: 600;
  cursor: pointer;
}

.dropdown {
  position: absolute;
  background: white;
  color: #003366;
  right: 20px;
  margin-top: 10px;
  border-radius: 8px;
}

.dropdown-item {
  padding: 12px 18px;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #ffcc00;
}

/* HERO */
.hero {
  height: 75vh;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.citizen-login {
  background: #ffcc00;
  padding: 12px 28px;
  margin-top: 18px;
  display: inline-block;
  font-weight: bold;
  color: #003366;
  border-radius: 10px;
}

/* SECTIONS */
.section { padding: 50px 20px; text-align: center; }

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.feature-card {
  background: white;
  padding: 25px;
  border-radius: 12px;
  font-weight: bold;
}

.about {
  background: #f7f7f7;
  padding: 45px 20px;
}

.footer {
  background: #00264d;
  color: white;
  padding: 18px;
  text-align: center;
}

/* MOBILE */
.hamburger {
  display: none;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
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
    display: none;
  }

  .nav-links.open {
    display: flex;
  }

  .hamburger {
    display: block;
  }
}
      `}</style>
    </div>
  );
};

export default HomePage;
