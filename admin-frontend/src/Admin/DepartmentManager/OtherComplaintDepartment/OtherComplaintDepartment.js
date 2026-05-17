import React, {
  useState,
  useEffect,
} from "react";

import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersManagerPage from "./OfficersManagerPage";

const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:5000";

const GeneralComplaintDepartment = () => {

  const [page, setPage] =
    useState("Dashboard");

  const [
    showProfileDropdown,
    setShowProfileDropdown,
  ] = useState(false);

  const [
    showNotificationDropdown,
    setShowNotificationDropdown,
  ] = useState(false);

  const [notifications, setNotifications] =
    useState([]);

  /* =====================================================
     DATE & TIME
  ===================================================== */

  const [currentDateTime, setCurrentDateTime] =
    useState("");

  useEffect(() => {

    const updateDateTime = () => {

      const now = new Date();

      const formatted =
        now.toLocaleString("en-IN", {

          weekday: "short",

          day: "2-digit",

          month: "short",

          year: "numeric",

          hour: "2-digit",

          minute: "2-digit",

          second: "2-digit",
        });

      setCurrentDateTime(formatted);
    };

    updateDateTime();

    const interval =
      setInterval(updateDateTime, 1000);

    return () =>
      clearInterval(interval);

  }, []);

  /* =====================================================
     FETCH NOTIFICATIONS
  ===================================================== */

  useEffect(() => {

    fetchNotifications();

  }, []);

  const fetchNotifications =
    async () => {

      try {

        const res =
          await fetch(
            `${BACKEND}/api/officers/complaints/all`
          );

        const data =
          await res.json();

        if (data.success) {

          setNotifications(
            data.complaints.slice(0, 5)
          );
        }

      } catch (err) {

        console.error(err);
      }
    };

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {

    const confirmLogout =
      window.confirm(
        "Are you sure you want to logout?"
      );

    if (confirmLogout) {

      alert(
        "Logout Successfully"
      );

      localStorage.clear();

      window.location.href =
        "/";
    }
  };

  /* =====================================================
     MENU ITEMS
  ===================================================== */

  const menuItems = [

    {
      name: "Dashboard",

      icon:
        <LayoutDashboard size={20} />,
    },

    {
      name: "Complaints",

      icon:
        <FileText size={20} />,
    },

    {
      name: "Audit Logs",

      icon:
        <ClipboardList size={20} />,
    },

    {
      name: "Officers",

      icon:
        <Users size={20} />,
    },
  ];

  /* =====================================================
     RENDER PAGE
  ===================================================== */

  const renderPage = () => {

    switch (page) {

      case "Dashboard":
        return <DashboardPage />;

      case "Complaints":
        return <ComplaintsPage />;

      case "Audit Logs":
        return <AuditLogsPage />;

      case "Officers":
        return <OfficersManagerPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (

    <div style={styles.container}>

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside style={styles.sidebar}>

        <div>

          {/* LOGO */}

          <div style={styles.logoContainer}>

            <div>

              <h2 style={styles.logo}>
                Kolhapur Municipal Corporation
              </h2>

              <p style={styles.departmentText}>
                General Complaint Department
              </p>

            </div>

          </div>

          {/* MENU */}

          <div style={styles.menuWrapper}>

            {menuItems.map((item) => (

              <div

                key={item.name}

                style={{

                  ...styles.menuItem,

                  background:
                    page === item.name
                      ? "#2563eb"
                      : "transparent",
                }}

                onClick={() =>
                  setPage(item.name)
                }
              >

                {item.icon}

                <span>
                  {item.name}
                </span>

              </div>
            ))}

          </div>

        </div>

        {/* LOGOUT */}

        <div
          style={styles.logoutBtn}
          onClick={handleLogout}
        >

          <LogOut size={18} />

          <span>Logout</span>

        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main style={styles.main}>

        {/* =====================================================
            TOPBAR
        ===================================================== */}

        <div style={styles.topbar}>

          <div>

            <h1 style={styles.title}>
              General Complaint Department
            </h1>

            <p style={styles.subtitle}>
              Smart Municipal General Complaint Monitoring Dashboard
            </p>

          </div>

          {/* RIGHT */}

          <div style={styles.topbarRight}>

            {/* DATE & TIME */}

            <div style={styles.dateTimeBox}>

              <p style={styles.dateText}>
                {currentDateTime}
              </p>

            </div>

            {/* NOTIFICATION */}

            <div style={styles.notificationWrapper}>

              <div

                style={styles.notificationBtn}

                onClick={() => {

                  setShowNotificationDropdown(
                    !showNotificationDropdown
                  );

                  setShowProfileDropdown(
                    false
                  );
                }}
              >

                <Bell size={20} />

                {notifications.length >
                  0 && (

                  <div
                    style={
                      styles.notificationBadge
                    }
                  >
                    {
                      notifications.length
                    }
                  </div>
                )}

              </div>

              {showNotificationDropdown && (

                <div
                  style={
                    styles.notificationDropdown
                  }
                >

                  <h4
                    style={
                      styles.dropdownTitle
                    }
                  >
                    Notifications
                  </h4>

                  {notifications.length ===
                  0 ? (

                    <p
                      style={
                        styles.emptyText
                      }
                    >
                      No Notifications
                    </p>

                  ) : (

                    notifications.map(
                      (item) => (

                        <div

                          key={item._id}

                          style={
                            styles.notificationItem
                          }
                        >

                          <strong>
                            {
                              item.complaintId
                            }
                          </strong>

                          <p
                            style={{
                              marginTop: 6,
                            }}
                          >
                            {
                              item.issue
                            }
                          </p>

                        </div>
                      )
                    )
                  )}

                </div>
              )}

            </div>

            {/* PROFILE */}

            <div style={styles.profileWrapper}>

              <div

                style={styles.profileSection}

                onClick={() => {

                  setShowProfileDropdown(
                    !showProfileDropdown
                  );

                  setShowNotificationDropdown(
                    false
                  );
                }}
              >

                <img
                  src="https://i.pravatar.cc/100"
                  alt="profile"
                  style={
                    styles.profileImage
                  }
                />

                <div>

                  <h4
                    style={
                      styles.profileName
                    }
                  >
                    Manager
                  </h4>

                  <p
                    style={
                      styles.profileRole
                    }
                  >
                    General Department
                  </p>

                </div>

                <ChevronDown
                  size={18}
                />

              </div>

              {showProfileDropdown && (

                <div
                  style={
                    styles.profileDropdown
                  }
                >

                  {/* TOP */}

                  <div style={styles.profileTop}>

                    <img
                      src="https://i.pravatar.cc/100"
                      alt="profile"
                      style={
                        styles.dropdownProfileImage
                      }
                    />

                    <h3
                      style={
                        styles.managerName
                      }
                    >
                      General Manager
                    </h3>

                    <p
                      style={
                        styles.managerEmail
                      }
                    >
                      manager@gmail.com
                    </p>

                    <div
                      style={
                        styles.activeBadge
                      }
                    >
                      Active
                    </div>

                  </div>

                  {/* ITEMS */}

                  <div
                    style={
                      styles.dropdownItem
                    }
                  >

                    <User size={16} />

                    Profile

                  </div>

                  <div
                    style={
                      styles.dropdownItem
                    }
                  >

                    <Settings
                      size={16}
                    />

                    Settings

                  </div>

                  <div

                    style={{

                      ...styles.dropdownItem,

                      color: "#dc2626",
                    }}

                    onClick={
                      handleLogout
                    }
                  >

                    <LogOut
                      size={16}
                    />

                    Logout

                  </div>

                </div>
              )}

            </div>

          </div>

        </div>

        {/* =====================================================
            PAGE CONTENT
        ===================================================== */}

        <div style={styles.pageContent}>
          {renderPage()}
        </div>

      </main>

    </div>
  );
};

/* =====================================================
   STYLES
===================================================== */

const styles = {

  container: {

    display: "flex",

    minHeight: "100vh",

    background: "#f1f5f9",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  /* =====================================================
     SIDEBAR
  ===================================================== */

  sidebar: {

    width: 270,

    background:
      "linear-gradient(180deg,#0f172a,#1e293b)",

    color: "#fff",

    padding: "24px 18px",

    display: "flex",

    flexDirection: "column",

    justifyContent:
      "space-between",

    position: "fixed",

    top: 0,

    left: 0,

    height: "100vh",

    boxSizing: "border-box",
  },

  logoContainer: {

    marginBottom: 40,
  },

  logo: {

    margin: 0,

    color: "#38bdf8",

    fontSize: 24,

    fontWeight: 700,

    lineHeight: 1.4,
  },

  departmentText: {

    color: "#cbd5e1",

    marginTop: 6,

    fontSize: 13,

    fontWeight: 500,

    letterSpacing: 0.5,
  },

  menuWrapper: {

    marginTop: 20,
  },

  menuItem: {

    display: "flex",

    alignItems: "center",

    gap: 14,

    padding: "15px 18px",

    borderRadius: 14,

    cursor: "pointer",

    marginBottom: 14,

    transition: "0.3s ease",

    fontWeight: 500,

    fontSize: 15,
  },

  logoutBtn: {

    display: "flex",

    alignItems: "center",

    gap: 12,

    padding: "15px 18px",

    borderRadius: 14,

    background: "#dc2626",

    cursor: "pointer",

    fontWeight: 600,
  },

  /* =====================================================
     MAIN
  ===================================================== */

  main: {

    flex: 1,

    marginLeft: 270,

    padding: 30,
  },

  topbar: {

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    background: "#ffffff",

    padding: "22px 28px",

    borderRadius: 24,

    boxShadow:
      "0 10px 30px rgba(0,0,0,0.05)",

    marginBottom: 30,
  },

  title: {

    margin: 0,

    fontSize: 30,

    fontWeight: 700,

    color: "#0f172a",
  },

  subtitle: {

    color: "#64748b",

    marginTop: 8,
  },

  topbarRight: {

    display: "flex",

    alignItems: "center",

    gap: 24,
  },

  /* =====================================================
     DATE & TIME
  ===================================================== */

  dateTimeBox: {

    background: "#eff6ff",

    padding: "12px 18px",

    borderRadius: 16,

    border: "1px solid #bfdbfe",

    minWidth: 240,

    textAlign: "center",
  },

  dateText: {

    margin: 0,

    fontSize: 14,

    fontWeight: 700,

    color: "#1e3a8a",

    letterSpacing: 0.5,
  },

  /* =====================================================
     NOTIFICATION
  ===================================================== */

  notificationWrapper: {

    position: "relative",
  },

  notificationBtn: {

    width: 50,

    height: 50,

    borderRadius: "50%",

    background: "#eff6ff",

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    cursor: "pointer",

    position: "relative",
  },

  notificationBadge: {

    position: "absolute",

    top: -3,

    right: -3,

    width: 20,

    height: 20,

    borderRadius: "50%",

    background: "#dc2626",

    color: "#fff",

    fontSize: 11,

    display: "flex",

    justifyContent: "center",

    alignItems: "center",

    fontWeight: 600,
  },

  notificationDropdown: {

    position: "absolute",

    top: 65,

    right: 0,

    width: 320,

    background: "#fff",

    borderRadius: 18,

    padding: 16,

    boxShadow:
      "0 15px 40px rgba(0,0,0,0.12)",

    zIndex: 999,
  },

  notificationItem: {

    padding: 14,

    borderRadius: 14,

    background: "#f8fafc",

    marginBottom: 12,

    border:
      "1px solid #e2e8f0",
  },

  dropdownTitle: {

    marginTop: 0,

    marginBottom: 15,
  },

  emptyText: {

    color: "#64748b",
  },

  /* =====================================================
     PROFILE
  ===================================================== */

  profileWrapper: {

    position: "relative",
  },

  profileSection: {

    display: "flex",

    alignItems: "center",

    gap: 14,

    background: "#f8fafc",

    padding: "10px 14px",

    borderRadius: 18,

    cursor: "pointer",

    border: "1px solid #e2e8f0",
  },

  profileImage: {

    width: 48,

    height: 48,

    borderRadius: "50%",

    objectFit: "cover",
  },

  profileName: {

    margin: 0,

    fontSize: 15,

    fontWeight: 700,

    color: "#0f172a",
  },

  profileRole: {

    margin: 0,

    marginTop: 4,

    fontSize: 12,

    color: "#64748b",
  },

  profileDropdown: {

    position: "absolute",

    top: 72,

    right: 0,

    width: 240,

    background: "#fff",

    borderRadius: 18,

    padding: 12,

    boxShadow:
      "0 15px 40px rgba(0,0,0,0.12)",

    zIndex: 999,
  },

  profileTop: {

    display: "flex",

    flexDirection: "column",

    alignItems: "center",

    paddingBottom: 18,

    marginBottom: 14,

    borderBottom:
      "1px solid #e2e8f0",
  },

  dropdownProfileImage: {

    width: 70,

    height: 70,

    borderRadius: "50%",

    objectFit: "cover",

    marginBottom: 12,
  },

  managerName: {

    margin: 0,

    fontSize: 18,

    fontWeight: 700,

    color: "#0f172a",
  },

  managerEmail: {

    marginTop: 6,

    color: "#64748b",

    fontSize: 13,
  },

  activeBadge: {

    marginTop: 12,

    background: "#dcfce7",

    color: "#16a34a",

    padding: "6px 14px",

    borderRadius: 30,

    fontSize: 12,

    fontWeight: 600,
  },

  dropdownItem: {

    display: "flex",

    alignItems: "center",

    gap: 12,

    padding: "14px 16px",

    borderRadius: 12,

    cursor: "pointer",

    transition: "0.3s",

    fontWeight: 500,

    marginBottom: 8,

    background: "#f8fafc",
  },

  pageContent: {

    marginTop: 10,
  },
};

export default GeneralComplaintDepartment;