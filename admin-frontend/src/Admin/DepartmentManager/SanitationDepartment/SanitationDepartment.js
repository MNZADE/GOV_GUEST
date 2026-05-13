import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import {
  Bell,
  UserCircle,
  LogOut,
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Settings,
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const SanitationDepartment = ({
  setUser,
}) => {

  /* =====================================
     STATES
  ===================================== */

  const [page, setPage] =
    useState("Dashboard");

  const [time, setTime] =
    useState(new Date());

  const [showProfile,
    setShowProfile] =
    useState(false);

  const [
    showNotifications,

    setShowNotifications,
  ] = useState(false);

  const [
    showLogoutConfirm,

    setShowLogoutConfirm,
  ] = useState(false);

  const [profile,
    setProfile] =
    useState(null);

  const [notifications,
    setNotifications] =
    useState([]);

  const [unreadCount,
    setUnreadCount] =
    useState(0);

  const profileRef =
    useRef(null);

  const notificationRef =
    useRef(null);

  /* =====================================
     MENU ITEMS
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

  /* =====================================
     LIVE CLOCK
  ===================================== */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTime(new Date());

      }, 1000);

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

          const savedUser =
            localStorage.getItem(
              "kmc_user"
            );

          if (!savedUser) {

            return;
          }

          const user =
            JSON.parse(savedUser);

          console.log(
            "Logged User:",
            user
          );

          setProfile({

            _id:
              user?._id || "",

            name:
              user?.name ||
              user?.fullName ||
              "Department Manager",

            email:
              user?.email ||
              "manager@kmc.gov.in",

            role:
              user?.role ||
              "Department Manager",

            department:
              user?.department ||
              "Sanitation Department",
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

          const notificationsData = [

            {
              title:
                "Complaint Assigned",

              message:
                "New complaint assigned to officer",

              priority:
                "High",

              createdAt:
                new Date(),
            },

            {
              title:
                "Complaint Resolved",

              message:
                "Complaint resolved successfully",

              priority:
                "Medium",

              createdAt:
                new Date(),
            },
          ];

          setNotifications(
            notificationsData
          );

          setUnreadCount(
            notificationsData.length
          );

        } catch (err) {

          console.log(err);
        }
      };

    loadNotifications();

  }, []);

  /* =====================================
     CLOSE DROPDOWNS
  ===================================== */

  useEffect(() => {

    const handleClickOutside =
      (e) => {

        if (

          profileRef.current &&

          !profileRef.current.contains(
            e.target
          )
        ) {

          setShowProfile(false);
        }

        if (

          notificationRef.current &&

          !notificationRef.current.contains(
            e.target
          )
        ) {

          setShowNotifications(
            false
          );
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

  const handleLogout =
    () => {

      localStorage.removeItem(
        "kmc_token"
      );

      localStorage.removeItem(
        "kmc_user"
      );

      setShowLogoutConfirm(
        false
      );

      setUser(null);
    };

  /* =====================================
     PAGE RENDER
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
            department={
              profile?.department ||
              "Sanitation Department"
            }
          />
        );

      default:

        return <DashboardPage />;
    }
  };

  return (

    <div style={styles.container}>

      {/* =====================================
          HEADER
      ===================================== */}

      <header style={styles.header}>

        {/* LEFT */}

        <div>

          <h1 style={styles.kmcTitle}>

            Kolhapur Municipal Corporation

          </h1>

          <div style={styles.menuRow}>

            {menuItems.map(
              (item) => (

                <div

                  key={item.name}

                  onClick={() =>
                    setPage(item.name)
                  }

                  style={{

                    ...styles.menuItem,

                    background:

                      page === item.name

                        ? "rgba(255,255,255,0.14)"

                        : "transparent",
                  }}
                >

                  {item.icon}

                  <span>

                    {item.name}

                  </span>

                </div>
              )
            )}

          </div>

        </div>

        {/* RIGHT */}

        <div style={styles.rightSection}>

          {/* TIME */}

          <div
            style={{
              textAlign: "right",
            }}
          >

            <div>
              {time.toLocaleDateString(
                "en-IN"
              )}
            </div>

            <div style={styles.timeText}>

              {time.toLocaleTimeString(
                "en-IN"
              )}

            </div>

          </div>

          {/* =====================================
              NOTIFICATIONS
          ===================================== */}

          <div
            ref={notificationRef}
            style={{
              position: "relative",
            }}
          >

            <Bell

              size={24}

              style={{
                cursor: "pointer",
              }}

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
                style={styles.notificationDropdown}
              >

                <div
                  style={
                    styles.notificationHeader
                  }
                >

                  🔔 Notifications

                </div>

                <div
                  style={{
                    padding: 16,
                  }}
                >

                  {notifications.map(
                    (n, index) => (

                      <div

                        key={index}

                        style={styles.notificationCard}
                      >

                        <strong>
                          {n.title}
                        </strong>

                        <p
                          style={{
                            margin:
                              "6px 0",
                          }}
                        >

                          {n.message}

                        </p>

                        <small>

                          {new Date(
                            n.createdAt
                          ).toLocaleString()}

                        </small>

                      </div>
                    )
                  )}

                </div>

              </div>
            )}

          </div>

          {/* =====================================
              PROFILE
          ===================================== */}

          <div
            style={styles.profileWrapper}
            ref={profileRef}
          >

            <div
              style={styles.profileButton}
              onClick={() =>
                setShowProfile(
                  !showProfile
                )
              }
            >

              <UserCircle size={30} />

            </div>

            {showProfile && (

              <div style={styles.dropdown}>

                {/* PROFILE HEADER */}

                <div style={styles.profileInfo}>

                  <div style={styles.avatar}>

                    {profile?.name
                      ?.substring(0, 2)
                      ?.toUpperCase() ||
                      "KM"}

                  </div>

                  <div>

                    <strong
                      style={{
                        display: "block",
                        fontSize: 16,
                        marginBottom: 4,
                        color: "#0f172a",
                      }}
                    >

                      {profile?.name ||
                        "Department Manager"}

                    </strong>

                    <p
                      style={{
                        fontSize: 12,
                        margin: 0,
                        color: "#64748b",
                      }}
                    >

                      {profile?.email ||
                        "manager@kmc.gov.in"}

                    </p>

                  </div>

                </div>

                {/* ROLE */}

                <div style={styles.dropdownItem}>

                  <Settings size={17} />

                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >

                      {profile?.role ||
                        "Department Manager"}

                    </div>

                    <small
                      style={{
                        color: "#64748b",
                      }}
                    >

                      User Role

                    </small>

                  </div>

                </div>

                {/* DEPARTMENT */}

                <div style={styles.dropdownItem}>

                  <Bell size={17} />

                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >

                      {profile?.department ||
                        "Sanitation Department"}

                    </div>

                    <small
                      style={{
                        color: "#64748b",
                      }}
                    >

                      Active Department

                    </small>

                  </div>

                </div>

                {/* ACTIVE STATUS */}

                <div style={styles.dropdownItem}>

                  <div
                    style={styles.activeDot}
                  />

                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                        color: "#16a34a",
                      }}
                    >

                      Active

                    </div>

                    <small
                      style={{
                        color: "#64748b",
                      }}
                    >

                      Logged into system

                    </small>

                  </div>

                </div>

                {/* SESSION */}

                <div style={styles.dropdownItem}>

                  <UserCircle size={17} />

                  <div>

                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 14,
                      }}
                    >

                      {new Date().toLocaleTimeString(
                        "en-IN"
                      )}

                    </div>

                    <small
                      style={{
                        color: "#64748b",
                      }}
                    >

                      Current Session

                    </small>

                  </div>

                </div>

                {/* LOGOUT */}

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

                  <strong>
                    Logout
                  </strong>

                </div>

              </div>
            )}

          </div>

        </div>

      </header>

      {/* =====================================
          CONTENT
      ===================================== */}

      <div style={styles.content}>

        {renderPage()}

      </div>

      {/* =====================================
          LOGOUT MODAL
      ===================================== */}

      {showLogoutConfirm && (

        <div style={styles.logoutOverlay}>

          <div style={styles.logoutModal}>

            <div style={styles.logoutIcon}>

              <LogOut size={26} />

            </div>

            <h3>
              Confirm Logout
            </h3>

            <p>

              Are you sure you want
              to logout?

            </p>

            <div style={styles.logoutButtons}>

              <button

                style={styles.cancelButton}

                onClick={() =>
                  setShowLogoutConfirm(
                    false
                  )
                }
              >

                Cancel

              </button>

              <button

                style={styles.logoutButton}

                onClick={
                  handleLogout
                }
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
   STYLES
===================================== */

const styles = {

  container: {

    minHeight: "100vh",

    background: "#f1f5f9",

    fontFamily:
      "'Inter',sans-serif",
  },

  header: {

    background:
      "linear-gradient(135deg,#064e3b,#047857,#059669)",

    padding:
      "22px 35px",

    color: "#fff",

    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "center",

    position: "sticky",

    top: 0,

    zIndex: 999,
  },

  kmcTitle: {

    margin: 0,

    fontSize: 28,

    fontWeight: 800,

    color: "#fff",
  },

  menuRow: {

    display: "flex",

    gap: 12,

    marginTop: 16,
  },

  menuItem: {

    display: "flex",

    alignItems: "center",

    gap: 8,

    padding:
      "10px 18px",

    borderRadius: 12,

    cursor: "pointer",

    fontWeight: 600,

    color:
      "rgba(255,255,255,0.88)",

    transition: "0.3s",

    fontSize: 15,
  },

  rightSection: {

    display: "flex",

    alignItems: "center",

    gap: 24,
  },

  timeText: {

    fontSize: 12,
  },

  badge: {

    position: "absolute",

    top: -6,

    right: -6,

    background: "#dc2626",

    color: "#fff",

    fontSize: 10,

    padding:
      "2px 6px",

    borderRadius: "50%",
  },

  notificationDropdown: {

    position: "absolute",

    right: 0,

    top: 50,

    width: 320,

    background: "#fff",

    borderRadius: 18,

    overflow: "hidden",

    boxShadow:
      "0 20px 50px rgba(0,0,0,0.15)",
  },

  notificationHeader: {

    padding: 16,

    background:
      "linear-gradient(135deg,#047857,#10b981)",

    color: "#fff",

    fontWeight: 700,
  },

  notificationCard: {

    padding: 14,

    borderBottom:
      "1px solid #e2e8f0",
  },

  profileWrapper: {

    position: "relative",
  },

  profileButton: {

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    width: 45,

    height: 45,

    borderRadius: "50%",

    cursor: "pointer",

    background:
      "rgba(255,255,255,0.15)",
  },

  dropdown: {

    position: "absolute",

    right: 0,

    top: 60,

    width: 320,

    background: "#fff",

    borderRadius: 20,

    overflow: "hidden",

    boxShadow:
      "0 20px 50px rgba(0,0,0,0.15)",

    zIndex: 999,
  },

  profileInfo: {

    padding: 20,

    display: "flex",

    alignItems: "center",

    gap: 14,

    borderBottom:
      "1px solid #e2e8f0",

    background:
      "linear-gradient(135deg,#f8fafc,#eef2ff)",
  },

  avatar: {

    width: 55,

    height: 55,

    borderRadius: "50%",

    background:
      "linear-gradient(135deg,#047857,#10b981)",

    color: "#fff",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    fontWeight: 700,

    fontSize: 20,
  },

  dropdownItem: {

    display: "flex",

    alignItems: "center",

    gap: 12,

    padding:
      "16px 18px",

    cursor: "pointer",

    borderBottom:
      "1px solid #f1f5f9",
  },

  activeDot: {

    width: 12,

    height: 12,

    borderRadius: "50%",

    background: "#16a34a",

    boxShadow:
      "0 0 10px #16a34a",
  },

  content: {

    padding: 30,
  },

  logoutOverlay: {

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

  logoutModal: {

    width: 380,

    background: "#fff",

    borderRadius: 20,

    padding: 30,

    textAlign: "center",
  },

  logoutIcon: {

    width: 60,

    height: 60,

    borderRadius: "50%",

    background: "#fee2e2",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    margin:
      "0 auto 18px",

    color: "#dc2626",
  },

  logoutButtons: {

    display: "flex",

    gap: 12,

    marginTop: 20,
  },

  cancelButton: {

    flex: 1,

    padding: 12,

    borderRadius: 10,

    border:
      "1px solid #e2e8f0",

    cursor: "pointer",
  },

  logoutButton: {

    flex: 1,

    padding: 12,

    borderRadius: 10,

    border: "none",

    background: "#dc2626",

    color: "#fff",

    cursor: "pointer",
  },
};

export default SanitationDepartment;