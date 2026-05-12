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
} from "lucide-react";

import { io } from "socket.io-client";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const socket = io(
  "http://localhost:5000"
);

const WaterDepartment = () => {

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

  /* =====================================
     NOTIFICATIONS
  ===================================== */

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
     LOAD PROFILE
  ===================================== */

  useEffect(() => {

    const loadProfile =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "kmc_token"
            );

          const savedUser =
            localStorage.getItem(
              "kmc_user"
            );

          if (
            !token ||
            !savedUser
          ) {

            setProfile(null);

            return;
          }

          const user =
            JSON.parse(savedUser);

          setProfile({

            _id:
              user._id,

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
              user.department ||
              "",

            isOnline: true,
          });

        } catch (err) {

          console.log(err);
        }
      };

    loadProfile();

  }, []);

  /* =====================================
     LOAD NOTIFICATIONS
  ===================================== */

  useEffect(() => {

    const loadNotifications =
      async () => {

        try {

          const token =
            localStorage.getItem(
              "kmc_token"
            );

          const res =
            await fetch(

              "http://localhost:5000/api/notifications",

              {

                headers: {

                  Authorization:
                    `Bearer ${token}`,
                },
              }
            );

          const data =
            await res.json();

          if (data.success) {

            setNotifications(
              data.notifications
            );

            setUnreadCount(
              data.unreadCount
            );
          }

        } catch (err) {

          console.log(err);
        }
      };

    loadNotifications();

  }, []);

  /* =====================================
     SOCKET.IO REALTIME
  ===================================== */

  useEffect(() => {

    const user =
      JSON.parse(

        localStorage.getItem(
          "kmc_user"
        )
      );

    if (user?._id) {

      socket.emit(

        "joinUserRoom",

        user._id
      );
    }

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
     CLOSE DROPDOWN
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
     MARK AS READ
  ===================================== */

  const markAsRead =
    async (id) => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        await fetch(

          `http://localhost:5000/api/notifications/${id}/read`,

          {

            method: "PUT",

            headers: {

              Authorization:
                `Bearer ${token}`,
            },
          }
        );

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

      } catch (err) {

        console.log(err);
      }
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
            department="Water Department"
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

      {/* =====================================
         SIDEBAR
      ===================================== */}

      <aside style={{
        ...styles.sidebar,
        width:
          sidebarOpen
            ? 240
            : 80,
      }}>

        <div style={styles.logoSection}>

          {sidebarOpen ? (

            <h2 style={styles.logo}>
              KMC Water Dept
            </h2>

          ) : (

            <h2 style={styles.logoSmall}>
              W
            </h2>
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

                    ? "rgba(59,130,246,0.15)"

                    : "transparent",

                color:

                  page === item.name

                    ? "#3b82f6"

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

      {/* =====================================
         MAIN
      ===================================== */}

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
                Water Department
              </p>

            </div>
          </div>

          {/* RIGHT */}

          <div style={styles.navRight}>

            {/* CLOCK */}

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

            {/* NOTIFICATIONS */}

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

              {/* DROPDOWN */}

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

                              : "#eff6ff",
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

                        <small style={{
                          color:
                            "#94a3b8",
                        }}>

                          {new Date(
                            n.createdAt
                          ).toLocaleString()}

                        </small>

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

                size={26}

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
                      {profile?.name ||
                        "Manager"}
                    </strong>

                    <p style={{
                      fontSize: 12,
                      margin: 0,
                    }}>

                      {profile?.email ||
                        "manager@kmc.gov"}

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

        {/* PAGE */}

        <div style={styles.content}>
          {renderPage()}
        </div>

      </div>

      {/* =====================================
         LOGOUT MODAL
      ===================================== */}

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
   MODERN WATER THEME
===================================== */

const styles = {

  container: {

    display: "flex",

    height: "100vh",

    background: "#f1f5f9",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  sidebar: {

    background:
      "linear-gradient(180deg,#0f172a,#1e3a8a)",

    color: "#fff",

    padding: "20px 12px",

    display: "flex",

    flexDirection: "column",

    transition:
      "width 0.35s ease",
  },

  logoSection: {

    marginBottom: 35,

    textAlign: "center",
  },

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

    transition:
      "all 0.25s ease",
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

  menuText: {

    fontSize: 14,

    fontWeight: 500,
  },

  main: {

    flex: 1,

    display: "flex",

    flexDirection: "column",
  },

  navbar: {

    background:
      "linear-gradient(90deg,#1e3a8a,#2563eb)",

    padding: "16px 30px",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    color: "#fff",
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

    color: "#e0f2fe",
  },

  clock: {

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 600,

    color: "#93c5fd",

    fontSize: 13,
  },

  iconBtn: {

    background:
      "rgba(255,255,255,0.15)",

    border: "none",

    padding: 8,

    borderRadius: 6,

    cursor: "pointer",

    color: "#fff",
  },

  content: {

    padding: 30,

    overflowY: "auto",

    flex: 1,
  },

  notificationWrapper: {

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

    fontWeight: "bold",
  },

  notificationDropdown: {

    position: "absolute",

    top: 40,

    right: 0,

    width: 360,

    maxHeight: 450,

    overflowY: "auto",

    background: "#fff",

    borderRadius: 18,

    boxShadow:
      "0 20px 45px rgba(0,0,0,0.15)",

    zIndex: 9999,

    padding: 15,
  },

  dropdownHeader: {

    borderBottom:
      "1px solid #e2e8f0",

    paddingBottom: 10,

    marginBottom: 10,
  },

  notificationItem: {

    padding: 14,

    borderRadius: 12,

    marginBottom: 10,

    cursor: "pointer",

    transition: "0.3s",
  },

  emptyNotification: {

    textAlign: "center",

    padding: 30,

    color: "#64748b",
  },

  profileWrapper: {

    position: "relative",

    cursor: "pointer",
  },

  dropdown: {

    position: "absolute",

    right: 0,

    top: 35,

    background: "#fff",

    color: "#1e293b",

    borderRadius: 10,

    boxShadow:
      "0 15px 35px rgba(0,0,0,0.2)",

    width: 250,

    zIndex: 999,

    padding: 15,
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

    gap: 8,

    padding: "8px 0",

    cursor: "pointer",
  },

  modalOverlay: {

    position: "fixed",

    inset: 0,

    background:
      "rgba(0,0,0,0.5)",

    display: "flex",

    justifyContent:
      "center",

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

    justifyContent:
      "space-between",
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

    color: "#fff",

    border: "none",

    borderRadius: 6,

    cursor: "pointer",
  },
};

export default WaterDepartment;