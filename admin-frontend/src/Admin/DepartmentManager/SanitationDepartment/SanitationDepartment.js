import React, { useState, useEffect, useRef } from "react";
import { Bell, UserCircle, Plus, LogOut } from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const SanitationDepartment = ({ setUser }) => {
  const [page, setPage] = useState("Dashboard");
  const [time, setTime] = useState(new Date());
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const complaintsCount = 12;
  const menuItems = ["Dashboard", "Complaints", "Audit Logs", "Officers"];

  /* ================= LIVE CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= AUTO CLOSE DROPDOWNS ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(e.target)
      ) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SESSION TIMEOUT ================= */
  useEffect(() => {
    let timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        setShowLogoutModal(true);
      }, 5 * 60 * 1000);
    };
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    resetTimer();
    return () => {
      clearTimeout(timeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
    };
  }, []);

  const handleLogout = () => {
    setShowLogoutModal(false);
    setUser(null);
  };

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <DashboardPage />;
      case "Complaints":
        return <ComplaintsPage />;
      case "Audit Logs":
        return <AuditLogsPage />;
      case "Officers":
        return <OfficersPage department="Sanitation Department" />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        fontFamily: "'Inter','Segoe UI', sans-serif",
      }}
    >
      {/* ================= NAVBAR ================= */}
      <header
        style={{
          background:
            "linear-gradient(135deg,#064e3b,#047857,#059669)",
          color: "#fff",
          padding: "18px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* LEFT */}
        <div>
          <h2 style={{ margin: 0 }}>
            Kolhapur Municipal Corporation
          </h2>
          <p style={{ margin: 0, fontSize: 13 }}>
            Sanitation Department Dashboard
          </p>

          <nav style={{ display: "flex", gap: 30, marginTop: 10 }}>
            {menuItems.map((item) => (
              <div
                key={item}
                onClick={() => setPage(item)}
                style={{
                  cursor: "pointer",
                  position: "relative",
                  paddingBottom: 4,
                  fontWeight: page === item ? 600 : 400,
                }}
              >
                {item}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: 2,
                    width: page === item ? "100%" : "0%",
                    background: "#fff",
                    transition: "0.3s",
                  }}
                />
              </div>
            ))}
          </nav>
        </div>

        {/* RIGHT */}
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ textAlign: "right" }}>
            <div>{time.toLocaleDateString("en-IN")}</div>
            <div style={{ fontSize: 13 }}>
              {time.toLocaleTimeString("en-IN")} IST
            </div>
          </div>

          {/* 🔔 NOTIFICATION */}
          <div ref={notificationRef} style={{ position: "relative" }}>
            <Bell
              size={22}
              style={{ cursor: "pointer" }}
              onClick={() =>
                setShowNotifications(!showNotifications)
              }
            />

            {complaintsCount > 0 && (
              <span style={badgeStyle}>{complaintsCount}</span>
            )}

            {/* Modern Notification Dropdown */}
            <div style={notificationDropdown(showNotifications)}>
              <div style={notificationHeader}>
                🔔 Official Notifications
              </div>

              <div style={{ padding: 16 }}>
                <div style={alertCard("#dc2626")}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      Transformer Failure
                    </div>
                    <div style={alertMeta}>
                      Urgent • Ward 5 • 5 min ago
                    </div>
                  </div>
                </div>

                <div style={alertCard("#f97316")}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      Garbage Overflow
                    </div>
                    <div style={alertMeta}>
                      Escalated • Zone B • 20 min ago
                    </div>
                  </div>
                </div>

                <div style={alertCard("#2563eb")}>
                  <div>
                    <div style={{ fontWeight: 600 }}>
                      New Complaint Registered
                    </div>
                    <div style={alertMeta}>
                      Normal • Ward 2 • 1 hour ago
                    </div>
                  </div>
                </div>
              </div>

              <div style={notificationFooter}>
                View All Notifications
              </div>
            </div>
          </div>

          {/* PROFILE */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <UserCircle
              size={28}
              style={{ cursor: "pointer" }}
              onClick={() => setShowProfile(!showProfile)}
            />

            <div style={profileDropdown(showProfile)}>
              <div style={profileHeader}>
                <div style={avatar}>AD</div>
                <div style={{ fontWeight: 600 }}>
                  Ajay Deshmukh
                </div>
                <div style={{ fontSize: 12 }}>
                  Municipal Officer
                </div>
              </div>

              <div style={{ padding: 16 }}>
                <div style={menuItem}>View Profile</div>
                <div style={menuItem}>Settings</div>
                <div
                  onClick={() => setShowLogoutModal(true)}
                  style={{ ...menuItem, color: "#dc2626" }}
                >
                  Secure Logout
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ padding: 30 }}>{renderPage()}</div>

      {/* ================= MODERN LOGOUT MODAL ================= */}
      {showLogoutModal && (
        <div style={logoutOverlay}>
          <div style={logoutCard}>
            <div style={logoutIcon}>
              <LogOut size={28} />
            </div>
            <h3>Secure Logout</h3>
            <p style={{ fontSize: 14, color: "#64748b" }}>
              Are you sure you want to logout from the
              system?
            </p>

            <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
              <button
                style={cancelBtn}
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button
                style={logoutBtn}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ================= STYLES ================= */

const badgeStyle = {
  position: "absolute",
  top: -6,
  right: -8,
  background: "#dc2626",
  color: "#fff",
  fontSize: 10,
  padding: "3px 7px",
  borderRadius: "50%",
  fontWeight: 600,
};

const notificationDropdown = (show) => ({
  position: "absolute",
  right: 0,
  top: 60,
  width: 360,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
  overflow: "hidden",
  transform: show ? "translateY(0)" : "translateY(-10px)",
  opacity: show ? 1 : 0,
  pointerEvents: show ? "auto" : "none",
  transition: "all 0.3s ease",
});

const notificationHeader = {
  padding: 18,
  background: "linear-gradient(135deg,#047857,#10b981)",
  color: "#fff",
  fontWeight: 600,
};

const notificationFooter = {
  padding: 14,
  textAlign: "center",
  fontSize: 13,
  fontWeight: 600,
  color: "#047857",
  borderTop: "1px solid #f1f5f9",
};

const alertCard = (color) => ({
  padding: "14px 16px",
  marginBottom: 12,
  borderRadius: 14,
  background: "#f8fafc",
  borderLeft: `5px solid ${color}`,
  boxShadow: "0 6px 18px rgba(0,0,0,0.05)",
});

const alertMeta = {
  fontSize: 12,
  color: "#64748b",
  marginTop: 4,
};

const profileDropdown = (show) => ({
  position: "absolute",
  right: 0,
  top: 60,
  width: 280,
  background: "#fff",
  borderRadius: 18,
  boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
  overflow: "hidden",
  transform: show ? "translateY(0)" : "translateY(-10px)",
  opacity: show ? 1 : 0,
  pointerEvents: show ? "auto" : "none",
  transition: "all 0.3s ease",
});

const profileHeader = {
  padding: 22,
  background: "linear-gradient(135deg,#047857,#10b981)",
  color: "#fff",
  textAlign: "center",
};

const avatar = {
  width: 70,
  height: 70,
  borderRadius: "50%",
  background: "#ffffff30",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 10px",
  fontSize: 24,
  fontWeight: 600,
};

const menuItem = {
  padding: "12px 10px",
  borderRadius: 10,
  cursor: "pointer",
};

const logoutOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const logoutCard = {
  background: "#fff",
  padding: 30,
  borderRadius: 16,
  width: 380,
  textAlign: "center",
  boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
};

const logoutIcon = {
  width: 60,
  height: 60,
  borderRadius: "50%",
  background: "#fee2e2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 15px",
  color: "#dc2626",
};

const cancelBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: 8,
  border: "1px solid #e5e7eb",
  background: "#f8fafc",
  cursor: "pointer",
};

const logoutBtn = {
  flex: 1,
  padding: "10px",
  borderRadius: 8,
  border: "none",
  background: "#dc2626",
  color: "#fff",
  cursor: "pointer",
};

export default SanitationDepartment;