import React, {
  useState,
  useEffect,
  useRef,
} from "react";

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
  Waves,
} from "lucide-react";

import { io } from "socket.io-client";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const socket = io(
  "http://localhost:5000"
);

const DrainageWasteDepartment = () => {

  const [page, setPage] =
    useState("Dashboard");

  const [time, setTime] =
    useState(new Date());

  const [sidebarOpen,
    setSidebarOpen] =
    useState(true);

  const [
    showLogoutConfirm,
    setShowLogoutConfirm,
  ] = useState(false);

  const [
    showNotifications,
    setShowNotifications,
  ] = useState(false);

  const [
    showProfile,
    setShowProfile,
  ] = useState(false);

  const [profile, setProfile] =
    useState(null);

  const [
    notifications,
    setNotifications,
  ] = useState([]);

  const [
    unreadCount,
    setUnreadCount,
  ] = useState(0);

  const notificationRef =
    useRef(null);

  const profileRef =
    useRef(null);

  /* =====================================
     CLOCK
  ===================================== */

  useEffect(() => {

    const timer =
      setInterval(

        () =>
          setTime(new Date()),

        1000
      );

    return () =>
      clearInterval(timer);

  }, []);

  /* =====================================
     PROFILE
  ===================================== */

  useEffect(() => {

    const savedUser =
      localStorage.getItem(
        "kmc_user"
      );

    if (savedUser) {

      const user =
        JSON.parse(savedUser);

      setProfile({

        name:
          user.name ||
          "Manager",

        email:
          user.email ||
          "",

        role:
          user.role ||
          "",

        department:
          "Drainage, Sewage & Garbage Collection Department",

        isOnline: true,
      });
    }

  }, []);

  /* =====================================
     SOCKET NOTIFICATIONS
  ===================================== */

  useEffect(() => {

    socket.on(

      "newNotification",

      (notification) => {

        setNotifications(

          (prev) => [

            notification,

            ...prev,
          ]
        );

        setUnreadCount(

          (prev) =>
            prev + 1
        );
      }
    );

    return () => {

      socket.off(
        "newNotification"
      );
    };

  }, []);

  /* =====================================
     OUTSIDE CLICK
  ===================================== */

  useEffect(() => {

    const handleClickOutside =
      (event) => {

        if (

          notificationRef.current &&

          !notificationRef.current.contains(
            event.target
          )
        ) {

          setShowNotifications(
            false
          );
        }

        if (

          profileRef.current &&

          !profileRef.current.contains(
            event.target
          )
        ) {

          setShowProfile(false);
        }
      };

    document.addEventListener(

      "mousedown",

      handleClickOutside
    );

    return () =>

      document.removeEventListener(

        "mousedown",

        handleClickOutside
      );

  }, []);

  /* =====================================
     LOGOUT
  ===================================== */

  const confirmLogout = () => {

    localStorage.clear();

    window.location.href =
      "/";
  };

  /* =====================================
     MARK READ
  ===================================== */

  const markAsRead =
    (id) => {

      setNotifications(

        (prev) =>

          prev.map((n) =>

            n._id === id

              ? {
                  ...n,
                  isRead: true,
                }

              : n
          )
      );

      setUnreadCount(

        (prev) =>

          prev > 0
            ? prev - 1
            : 0
      );
    };

  /* =====================================
     RENDER PAGE
  ===================================== */

  const renderPage = () => {

    switch (page) {

      case "Dashboard":
        return <DashboardPage />;

      case "Complaints":
        return <ComplaintsPage />;

      case "Audit Logs":
        return <AuditLogsPage />;

      case "Officers":
        return (

          <OfficersPage
            department="Drainage, Sewage & Garbage Collection Department"
          />
        );

      default:
        return <DashboardPage />;
    }
  };

  /* =====================================
     MENU
  ===================================== */

  const menuItems = [

    {
      name: "Dashboard",
      icon:
        <LayoutDashboard size={18} />,
    },

    {
      name: "Complaints",
      icon:
        <FileText size={18} />,
    },

    {
      name: "Audit Logs",
      icon:
        <ClipboardList size={18} />,
    },

    {
      name: "Officers",
      icon:
        <Users size={18} />,
    },
  ];

  return (

    <div style={styles.container}>

      {/* SIDEBAR */}

      <aside style={{

        ...styles.sidebar,

        width:
          sidebarOpen
            ? 260
            : 85,
      }}>

        <div style={styles.logoSection}>

          {sidebarOpen ? (

            <div>

              <h2 style={styles.logo}>
                Drainage & Waste
              </h2>

              <p style={styles.logoSub}>
                Smart Monitoring
              </p>

            </div>

          ) : (

            <Waves
              size={32}
              color="#38bdf8"
            />
          )}

        </div>

        <div style={{ flex: 1 }}>

          {menuItems.map((item) => (

            <div

              key={item.name}

              onClick={() =>
                setPage(item.name)
              }

              style={{

                ...styles.menuItem,

                background:

                  page === item.name

                    ? "rgba(56,189,248,0.15)"

                    : "transparent",

                color:

                  page === item.name

                    ? "#38bdf8"

                    : "#cbd5e1",

                justifyContent:

                  sidebarOpen

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

          onClick={() =>
            setShowLogoutConfirm(true)
          }

          style={{

            ...styles.menuItem,

            color: "#f87171",

            justifyContent:

              sidebarOpen

                ? "flex-start"

                : "center",

            marginTop: "auto",
          }}
        >

          <LogOut size={18} />

          {sidebarOpen && (

            <span style={styles.menuText}>
              Logout
            </span>
          )}

        </div>

      </aside>

      {/* MAIN */}

      <div style={styles.main}>

        {/* NAVBAR */}

        <header style={styles.navbar}>

          <div style={styles.navLeft}>

            <button

              onClick={() =>
                setSidebarOpen(
                  !sidebarOpen
                )
              }

              style={styles.iconBtn}
            >

              {sidebarOpen

                ? <X size={20} />

                : <Menu size={20} />
              }

            </button>

            <div>

              <h3 style={{
                margin: 0,
                color: "#fff",
              }}>
                Kolhapur Municipal Corporation
              </h3>

              <p style={styles.subtitle}>
                Drainage, Sewage & Garbage Collection Department
              </p>

            </div>
          </div>

          {/* RIGHT */}

          <div style={styles.navRight}>

            <div style={styles.clock}>

              <div>

                {time.toLocaleDateString(
                  "en-IN",

                  {

                    weekday: "short",

                    day: "2-digit",

                    month: "short",

                    year: "numeric",
                  }
                )}

              </div>

              <div>

                {time.toLocaleTimeString(
                  "en-IN"
                )}

              </div>

            </div>

            {/* NOTIFICATION */}

            <div

              style={
                styles.notificationWrapper
              }

              ref={notificationRef}
            >

              <Bell

                size={20}

                onClick={() =>

                  setShowNotifications(
                    !showNotifications
                  )
                }
              />

              {unreadCount > 0 && (

                <span style={styles.badge}>
                  {unreadCount}
                </span>
              )}

              {showNotifications && (

                <div
                  style={
                    styles.notificationDropdown
                  }
                >

                  <div
                    style={
                      styles.dropdownHeader
                    }
                  >

                    <h4 style={{
                      margin: 0,
                    }}>
                      Notifications
                    </h4>

                  </div>

                  {notifications.length === 0 ? (

                    <div
                      style={
                        styles.emptyNotification
                      }
                    >
                      No Notifications
                    </div>

                  ) : (

                    notifications.map((n) => (

                      <div

                        key={n._id}

                        onClick={() =>
                          markAsRead(
                            n._id
                          )
                        }

                        style={{

                          ...styles.notificationItem,

                          background:

                            n.isRead

                              ? "#ffffff"

                              : "#ecfeff",
                        }}
                      >

                        <strong>
                          {n.title}
                        </strong>

                        <p style={{

                          margin:
                            "6px 0",

                          fontSize: 13,

                          color:
                            "#475569",
                        }}>

                          {n.message}

                        </p>

                      </div>
                    ))
                  )}

                </div>
              )}

            </div>

            {/* PROFILE */}

            <div
              style={styles.profileWrapper}
              ref={profileRef}
            >

              <UserCircle

                size={28}

                onClick={() =>
                  setShowProfile(
                    !showProfile
                  )
                }
              />

              {showProfile && (

                <div style={styles.dropdown}>

                  <div style={styles.profileInfo}>

                    <strong>
                      {profile?.name}
                    </strong>

                    <p style={{
                      fontSize: 12,
                      margin: 0,
                    }}>

                      {profile?.email}

                    </p>

                  </div>

                  <div style={styles.dropdownItem}>

                    <Settings size={16} />

                    Settings

                  </div>

                  <div

                    style={{
                      ...styles.dropdownItem,
                      color: "#ef4444",
                    }}

                    onClick={() =>
                      setShowLogoutConfirm(
                        true
                      )
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

        {/* CONTENT */}

        <div style={styles.content}>
          {renderPage()}
        </div>

      </div>

      {/* LOGOUT MODAL */}

      {showLogoutConfirm && (

        <div style={styles.modalOverlay}>

          <div style={styles.confirmModal}>

            <h3>
              Confirm Logout
            </h3>

            <p>
              Are you sure you want to logout?
            </p>

            <div style={styles.confirmButtons}>

              <button

                style={styles.cancelBtn}

                onClick={() =>
                  setShowLogoutConfirm(
                    false
                  )
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

/* =====================================
   MODERN DRAINAGE THEME
===================================== */
/* =====================================
   MODERN DRAINAGE THEME
===================================== */

const styles = {

  /* MAIN CONTAINER */

  container: {

    display: "flex",

    height: "100vh",

    background:
      "linear-gradient(135deg,#ecfeff,#eef2ff,#f8fafc,#e0f2fe)",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  /* SIDEBAR */

  sidebar: {

    background:
      "linear-gradient(180deg,#0f172a,#172554,#1e3a8a,#0f172a)",

    color: "#fff",

    padding: "20px 12px",

    display: "flex",

    flexDirection: "column",

    transition:
      "width 0.35s ease",

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.2)",
  },

  /* LOGO */

  logoSection: {

    marginBottom: 35,

    textAlign: "center",

    paddingBottom: 20,

    borderBottom:
      "1px solid rgba(255,255,255,0.08)",
  },

  logo: {

    margin: 0,

    fontSize: 22,

    fontWeight: 800,

    color: "#ffffff",

    letterSpacing: 0.5,
  },

  logoSub: {

    color: "#cbd5e1",

    fontSize: 12,

    marginTop: 6,

    letterSpacing: 1,
  },

  /* MENU */

  menuItem: {

    display: "flex",

    alignItems: "center",

    gap: 14,

    padding: "14px 16px",

    borderRadius: 14,

    cursor: "pointer",

    marginBottom: 12,

    position: "relative",

    transition:
      "all 0.3s ease",

    fontWeight: 600,
  },

  activeIndicator: {

    position: "absolute",

    left: 0,

    top: 8,

    bottom: 8,

    width: 4,

    background: "#ffffff",

    borderRadius: 4,
  },

  menuText: {

    fontSize: 14,

    fontWeight: 600,
  },

  /* MAIN */

  main: {

    flex: 1,

    display: "flex",

    flexDirection: "column",
  },

  /* NAVBAR */

  navbar: {

    background:
      "linear-gradient(90deg,#0f172a,#1d4ed8,#2563eb,#0f172a)",

    padding: "16px 30px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    color: "#fff",

    boxShadow:
      "0 4px 20px rgba(0,0,0,0.15)",

    backdropFilter:
      "blur(12px)",
  },

  navLeft: {

    display: "flex",

    alignItems: "center",

    gap: 18,
  },

  navRight: {

    display: "flex",

    alignItems: "center",

    gap: 25,
  },

  subtitle: {

    margin: 0,

    fontSize: 13,

    color: "#dbeafe",

    marginTop: 3,
  },

  /* CLOCK */

  clock: {

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 600,

    color: "#e0f2fe",

    fontSize: 13,

    background:
      "rgba(255,255,255,0.08)",

    padding: "10px 16px",

    borderRadius: 12,
  },

  /* ICON BUTTON */

  iconBtn: {

    background:
      "rgba(255,255,255,0.12)",

    border: "none",

    padding: 10,

    borderRadius: 12,

    cursor: "pointer",

    color: "#fff",

    transition: "0.3s ease",
  },

  /* CONTENT */

  content: {

    padding: 30,

    overflowY: "auto",

    flex: 1,

    background:
      "linear-gradient(135deg,#f8fafc,#eef2ff,#ecfeff)",

    borderTopLeftRadius: 24,
  },

  /* NOTIFICATIONS */

  notificationWrapper: {

    position: "relative",

    cursor: "pointer",

    background:
      "rgba(255,255,255,0.12)",

    padding: 10,

    borderRadius: 12,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    transition: "0.3s ease",
  },

  badge: {

    position: "absolute",

    top: -4,

    right: -4,

    background: "#ef4444",

    color: "#fff",

    fontSize: 10,

    padding: "2px 6px",

    borderRadius: "50%",

    fontWeight: "bold",
  },

  notificationDropdown: {

    position: "absolute",

    top: 48,

    right: 0,

    width: 360,

    maxHeight: 450,

    overflowY: "auto",

    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",

    borderRadius: 20,

    boxShadow:
      "0 20px 45px rgba(0,0,0,0.15)",

    zIndex: 9999,

    padding: 15,

    border:
      "1px solid rgba(226,232,240,0.8)",
  },

  dropdownHeader: {

    borderBottom:
      "1px solid #e2e8f0",

    paddingBottom: 10,

    marginBottom: 10,
  },

  notificationItem: {

    padding: 14,

    borderRadius: 14,

    marginBottom: 10,

    cursor: "pointer",

    transition: "0.3s",

    background:
      "rgba(239,246,255,0.8)",
  },

  emptyNotification: {

    textAlign: "center",

    padding: 30,

    color: "#64748b",
  },

  /* PROFILE */

  profileWrapper: {

    position: "relative",

    cursor: "pointer",

    background:
      "rgba(255,255,255,0.12)",

    padding: 10,

    borderRadius: 12,

    display: "flex",

    alignItems: "center",

    justifyContent: "center",
  },

  dropdown: {

    position: "absolute",

    right: 0,

    top: 48,

    background:
      "linear-gradient(135deg,#ffffff,#eef2ff)",

    color: "#1e293b",

    borderRadius: 16,

    boxShadow:
      "0 15px 35px rgba(0,0,0,0.2)",

    width: 250,

    zIndex: 999,

    padding: 15,

    border:
      "1px solid rgba(226,232,240,0.8)",
  },

  profileInfo: {

    borderBottom:
      "1px solid #e2e8f0",

    paddingBottom: 10,

    marginBottom: 10,
  },

  dropdownItem: {

    display: "flex",

    alignItems: "center",

    gap: 10,

    padding: "12px 8px",

    cursor: "pointer",

    borderRadius: 10,

    transition: "0.3s ease",
  },

  /* MODAL */

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(15,23,42,0.55)",

    display: "flex",

    justifyContent:
      "center",

    alignItems: "center",

    zIndex: 9999,

    backdropFilter:
      "blur(6px)",
  },

  confirmModal: {

    background:
      "linear-gradient(135deg,#ffffff,#f8fafc)",

    padding: 32,

    borderRadius: 20,

    width: 360,

    textAlign: "center",

    boxShadow:
      "0 20px 50px rgba(0,0,0,0.2)",
  },

  confirmButtons: {

    marginTop: 24,

    display: "flex",

    justifyContent:
      "space-between",

    gap: 12,
  },

  cancelBtn: {

    flex: 1,

    padding: "12px 18px",

    background: "#e2e8f0",

    border: "none",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,

    transition: "0.3s ease",
  },

  confirmBtn: {

    flex: 1,

    padding: "12px 18px",

    background:
      "linear-gradient(135deg,#2563eb,#1d4ed8)",

    color: "#fff",

    border: "none",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,

    transition: "0.3s ease",

    boxShadow:
      "0 8px 20px rgba(37,99,235,0.3)",
  },
};
export default DrainageWasteDepartment;