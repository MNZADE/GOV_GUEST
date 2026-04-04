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
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const ElectricityDepartment = () => {
  const [page, setPage] = useState("Dashboard");
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  const notifications = [
    "New complaint registered",
    "Officer assigned successfully",
    "System audit completed",
  ];

  const confirmLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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

  const renderPage = () => {
    switch (page) {
      case "Dashboard":
        return <DashboardPage />;
      case "Complaints":
        return <ComplaintsPage />;
      case "Audit Logs":
        return <AuditLogsPage />;
      case "Officers":
        return <OfficersPage department="Electricity Department" />;
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
      {/* SIDEBAR */}
      <aside
        style={{
          ...styles.sidebar,
          width: sidebarOpen ? 240 : 80,
        }}
      >
        <div style={styles.logoSection}>
          <h2 style={styles.logo}>
            {sidebarOpen ? "KMC Electricity Department Officer" : "K"}
          </h2>
        </div>

        <div style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setPage(item.name)}
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                ...styles.menuItem,
                background:
                  page === item.name
                    ? "#f1f5ff"
                    : hoveredItem === item.name
                    ? "#e2e8f0"
                    : "transparent",
                color:
                  page === item.name ? "#2563eb" : "#334155",
                justifyContent: sidebarOpen
                  ? "flex-start"
                  : "center",
                boxShadow:
                  hoveredItem === item.name &&
                  page !== item.name
                    ? "0 0 12px rgba(37,99,235,0.25)"
                    : "none",
                transform:
                  hoveredItem === item.name
                    ? "translateX(4px)"
                    : "translateX(0px)",
              }}
            >
              {page === item.name && (
                <span style={styles.activeIndicator} />
              )}
              {item.icon}
              {sidebarOpen && <span>{item.name}</span>}
            </div>
          ))}
        </div>

        {/* STICKY LOGOUT */}
        <div
          onClick={() => setShowLogoutConfirm(true)}
          onMouseEnter={() => setHoveredItem("logout")}
          onMouseLeave={() => setHoveredItem(null)}
          style={{
            ...styles.menuItem,
            color: "#dc2626",
            justifyContent: sidebarOpen
              ? "flex-start"
              : "center",
            background:
              hoveredItem === "logout"
                ? "#fee2e2"
                : "transparent",
            boxShadow:
              hoveredItem === "logout"
                ? "0 0 14px rgba(220,38,38,0.35)"
                : "none",
            transform:
              hoveredItem === "logout"
                ? "translateX(4px)"
                : "translateX(0px)",
            marginTop: "auto",
          }}
        >
          <LogOut size={18} />
          {sidebarOpen && <span>Logout</span>}
        </div>
      </aside>

      {/* MAIN */}
      <div style={styles.main}>
        <header style={styles.navbar}>
          <div style={styles.navLeft}>
            <button
              onClick={() =>
                setSidebarOpen(!sidebarOpen)
              }
              style={styles.iconBtn}
            >
              {sidebarOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>

            <div>
              <h3 style={{ margin: 0 }}>
                Kolhapur Municipal Corporation
              </h3>
              <p style={styles.subtitle}>
                Electricity Department
              </p>
            </div>
          </div>

          <div style={styles.navRight}>
            {/* ✅ ONLY THIS PART UPDATED */}
            <div style={styles.clock}>
              <div>
                {time.toLocaleTimeString("en-IN")}
              </div>
              <div style={styles.date}>
                {time.toLocaleDateString("en-IN", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>

            {/* Notifications */}
            <div
              ref={notificationRef}
              style={{ position: "relative" }}
            >
              <div
                style={styles.notificationIcon}
                onClick={() =>
                  setShowNotifications(!showNotifications)
                }
              >
                <Bell size={20} />
                {notifications.length > 0 && (
                  <span style={styles.badge}>
                    {notifications.length}
                  </span>
                )}
              </div>

              {showNotifications && (
                <div style={styles.dropdown}>
                  <h4>Notifications</h4>
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

            {/* Profile */}
            <div
              ref={profileRef}
              style={{ position: "relative" }}
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
                  <div style={styles.profileHeader}>
                    <UserCircle size={40} />
                    <div>
                      <strong>Admin User</strong>
                      <p style={styles.smallText}>
                        System Manager
                      </p>
                    </div>
                  </div>

                  <hr />

                  <div style={styles.dropdownItem}>
                    View Profile
                  </div>
                  <div style={styles.dropdownItem}>
                    Settings
                  </div>
                  <div
                    style={{
                      ...styles.dropdownItem,
                      color: "#dc2626",
                    }}
                    onClick={() =>
                      setShowLogoutConfirm(true)
                    }
                  >
                    <LogOut size={16} />
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div style={styles.content}>{renderPage()}</div>
      </div>

      {/* CONFIRM MODAL */}
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

/* STYLES */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#f1f5f9",
    fontFamily: "Segoe UI, sans-serif",
  },

  sidebar: {
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    padding: 20,
    transition: "0.3s",
    display: "flex",
    flexDirection: "column",
  },

  logoSection: {
    marginBottom: 40,
  },

  logo: {
    margin: 0,
    color: "#2563eb",
    fontWeight: 700,
  },

  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 12px 12px 20px",
    borderRadius: 8,
    cursor: "pointer",
    marginBottom: 8,
    transition: "all 0.25s ease-in-out",
    position: "relative",
  },

  activeIndicator: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    background: "#2563eb",
    borderRadius: 4,
    transition: "all 0.3s ease",
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },

  navbar: {
    background: "#ffffff",
    padding: "15px 30px",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 20,
  },

  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 25,
  },

  subtitle: {
    margin: 0,
    fontSize: 13,
    color: "#64748b",
  },

  /* ✅ UPDATED CLOCK STYLE */
  clock: {
    fontWeight: 600,
    color: "#2563eb",
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
  },

  date: {
    fontSize: 12,
    fontWeight: 400,
    color: "#64748b",
  },

  iconBtn: {
    background: "#f1f5f9",
    border: "none",
    padding: 8,
    borderRadius: 6,
    cursor: "pointer",
  },

  content: {
    padding: 30,
    overflowY: "auto",
    flex: 1,
  },

  dropdown: {
    position: "absolute",
    top: 40,
    right: 0,
    background: "#ffffff",
    padding: 15,
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
    width: 250,
    zIndex: 9999,
  },

  dropdownItem: {
    padding: "8px 0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },

  smallText: {
    margin: 0,
    fontSize: 12,
    color: "#64748b",
  },

  notificationIcon: {
    position: "relative",
    cursor: "pointer",
  },

  badge: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#ef4444",
    color: "#fff",
    fontSize: 10,
    padding: "2px 6px",
    borderRadius: "50%",
  },

  notificationItem: {
    padding: "6px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },

  confirmModal: {
    background: "#fff",
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
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
  },
};

export default ElectricityDepartment;