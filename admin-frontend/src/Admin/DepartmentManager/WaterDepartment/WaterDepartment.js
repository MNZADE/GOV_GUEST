import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Bell,
  UserCircle,
  LogOut,
  Menu,
  X,
  Settings,
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const WaterDepartment = () => {
  const [page, setPage] = useState("Dashboard");
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const notifications = [
    "Water supply issue reported",
    "Pipeline inspection completed",
    "Valve repair assigned",
  ];

  /* CLOCK */
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  /* CLOSE DROPDOWN ON OUTSIDE CLICK */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/";
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
        return <OfficersPage department="Water Department" />;
      default:
        return <DashboardPage />;
    }
  };

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "Complaints", icon: <FileText size={18} /> },
    { name: "Audit Logs", icon: <ClipboardList size={18} /> },
    { name: "Officers", icon: <Users size={18} /> },
  ];

  return (
    <div style={styles.container}>
      {/* ================= SIDEBAR ================= */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? 240 : 80,
        }}
      >
        <div style={styles.logoSection}>
          {sidebarOpen ? (
            <h2 style={styles.logo}>KMC Water Dept</h2>
          ) : (
            <h2 style={styles.logoSmall}>W</h2>
          )}
        </div>

        <div style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setPage(item.name)}
              style={{
                ...styles.menuItem,
                background:
                  page === item.name
                    ? "rgba(59,130,246,0.15)"
                    : "transparent",
                color:
                  page === item.name
                    ? "#3b82f6"
                    : "#cbd5e1",
                justifyContent: sidebarOpen
                  ? "flex-start"
                  : "center",
              }}
            >
              {page === item.name && (
                <span style={styles.activeIndicator} />
              )}
              {item.icon}
              {sidebarOpen && (
                <span style={styles.menuText}>
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <div
          onClick={() => setShowLogoutConfirm(true)}
          style={{
            ...styles.menuItem,
            color: "#f87171",
            justifyContent: sidebarOpen
              ? "flex-start"
              : "center",
            marginTop: "auto",
          }}
        >
          <LogOut size={18} />
          {sidebarOpen && (
            <span style={styles.menuText}>Logout</span>
          )}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div style={styles.main}>
        <header style={styles.navbar}>
          <div style={styles.navLeft}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={styles.iconBtn}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div>
              <h3 style={{ margin: 0, color: "#ffffff" }}>
                Kolhapur Municipal Corporation
              </h3>
              <p style={styles.subtitle}>
                Water Department
              </p>
            </div>
          </div>

          <div style={styles.navRight}>
            <div style={styles.clock}>
              {time.toLocaleTimeString("en-IN")}
            </div>

            {/* ================= NOTIFICATION ================= */}
            <div
              style={styles.notificationWrapper}
              ref={notificationRef}
            >
              <Bell
                size={20}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              />
              <span style={styles.badge}>
                {notifications.length}
              </span>

              {showNotifications && (
                <div style={styles.dropdown}>
                  <h4 style={styles.dropdownTitle}>
                    Notifications
                  </h4>
                  {notifications.map((note, index) => (
                    <div
                      key={index}
                      style={styles.notificationItem}
                    >
                      {note}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ================= PROFILE ================= */}
            <div
              style={styles.profileWrapper}
              ref={profileRef}
            >
              <UserCircle
                size={26}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  setShowProfile(!showProfile)
                }
              />

              {showProfile && (
                <div style={styles.dropdown}>
                  <div style={styles.profileInfo}>
                    <strong>Water Admin</strong>
                    <p style={{ fontSize: 12, margin: 0 }}>
                      admin@kmc.gov
                    </p>
                  </div>

                  <div style={styles.dropdownItem}>
                    <Settings size={16} /> Settings
                  </div>

                  <div
                    style={{
                      ...styles.dropdownItem,
                      color: "#ef4444",
                    }}
                    onClick={() =>
                      setShowLogoutConfirm(true)
                    }
                  >
                    <LogOut size={16} /> Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={styles.content}>{renderPage()}</div>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmModal}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div style={styles.confirmButtons}>
              <button
                style={styles.cancelBtn}
                onClick={() =>
                  setShowLogoutConfirm(false)
                }
              >
                Cancel
              </button>
              <button
                style={styles.confirmBtn}
                onClick={confirmLogout}
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

/* ================= MODERN BLUE WATER THEME ================= */

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f1f5f9",
    fontFamily: "Segoe UI, sans-serif",
  },

  sidebar: {
    background: "linear-gradient(180deg,#0f172a,#1e3a8a)",
    color: "#ffffff",
    padding: "20px 12px",
    display: "flex",
    flexDirection: "column",
    transition: "width 0.35s ease",
  },

  logoSection: { marginBottom: 35, textAlign: "center" },

  logo: {
    margin: 0,
    fontSize: 16,
    fontWeight: 700,
    color: "#3b82f6",
  },

  logoSmall: {
    margin: 0,
    fontSize: 28,
    fontWeight: 800,
    color: "#3b82f6",
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "12px 16px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 8,
    position: "relative",
    transition: "all 0.25s ease",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    background: "#3b82f6",
    borderRadius: 4,
  },

  menuText: { fontSize: 14, fontWeight: 500 },

  main: { flex: 1, display: "flex", flexDirection: "column" },

  navbar: {
    background:
      "linear-gradient(90deg,#1e3a8a,#2563eb)",
    padding: "16px 30px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
  },

  navLeft: { display: "flex", alignItems: "center", gap: 18 },
  navRight: { display: "flex", alignItems: "center", gap: 25 },

  subtitle: { margin: 0, fontSize: 13, color: "#e0f2fe" },
  clock: { fontWeight: 600, color: "#93c5fd" },

  iconBtn: {
    background: "rgba(255,255,255,0.15)",
    border: "none",
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
    color: "#ffffff",
  },

  content: { padding: 30, overflowY: "auto", flex: 1 },

  notificationWrapper: { position: "relative" },
  profileWrapper: { position: "relative" },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#ef4444",
    color: "#ffffff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: "50%",
    fontWeight: "bold",
  },

  dropdown: {
    position: "absolute",
    right: 0,
    top: 35,
    background: "#ffffff",
    color: "#1e293b",
    borderRadius: 10,
    boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
    width: 250,
    zIndex: 999,
    padding: 15,
  },

  dropdownTitle: {
    margin: "0 0 10px 0",
    fontSize: 14,
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 8,
  },

  notificationItem: {
    padding: "8px 0",
    borderBottom: "1px solid #f1f5f9",
    fontSize: 13,
  },

  profileInfo: {
    borderBottom: "1px solid #e2e8f0",
    paddingBottom: 10,
    marginBottom: 10,
  },

  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 0",
    cursor: "pointer",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  confirmModal: {
    background: "#ffffff",
    padding: 30,
    borderRadius: 12,
    width: 350,
    textAlign: "center",
  },

  confirmButtons: {
    marginTop: 20,
    display: "flex",
    justifyContent: "space-between",
  },

  cancelBtn: {
    padding: "8px 16px",
    background: "#e2e8f0",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },

  confirmBtn: {
    padding: "8px 16px",
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default WaterDepartment;