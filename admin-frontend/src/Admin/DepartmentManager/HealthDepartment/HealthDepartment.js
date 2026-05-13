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
  UserCircle2,
  LogOut,
  ShieldCheck,
  Activity,
  ChevronRight,
  Settings,
  Mail,
  CheckCircle2,
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const HealthDepartment = ({ setUser }) => {
  /* =====================================================
      STATES
  ===================================================== */

  const [page, setPage] =
    useState("Dashboard");

  const [time, setTime] =
    useState(new Date());

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationOpen,
    setNotificationOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(null);

  const [notifications,
    setNotifications] =
    useState([]);

  const profileRef =
    useRef(null);

  const notificationRef =
    useRef(null);

  /* =====================================================
      LIVE CLOCK
  ===================================================== */

  useEffect(() => {

    const timer =
      setInterval(() => {

        setTime(new Date());

      }, 1000);

    return () =>
      clearInterval(timer);

  }, []);

  /* =====================================================
      LOAD PROFILE
  ===================================================== */

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

  /* =====================================================
      LOAD NOTIFICATIONS
  ===================================================== */

  useEffect(() => {

    fetchNotifications();

  }, []);

  /* =====================================================
      CLOSE DROPDOWN
  ===================================================== */

  useEffect(() => {

    const closeDropdown =
      (e) => {

        if (
          profileRef.current &&
          !profileRef.current.contains(
            e.target
          )
        ) {

          setProfileOpen(false);
        }

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            e.target
          )
        ) {

          setNotificationOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      closeDropdown
    );

    return () =>

      document.removeEventListener(
        "mousedown",
        closeDropdown
      );

  }, []);

  /* =====================================================
      FETCH NOTIFICATIONS
  ===================================================== */

  const fetchNotifications =
    async () => {

      try {

        const token =
          localStorage.getItem(
            "kmc_token"
          );

        const response =
          await fetch(

            "http://localhost:5000/api/health-manager/notifications",

            {
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          );

        const data =
          await response.json();

        setNotifications(data);

      } catch (error) {

        console.log(error);
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
      PAGE RENDER
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
        return <OfficersPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (

    <div
      style={{

        display: "flex",

        height: "100vh",

        overflow: "hidden",

        fontFamily: "Segoe UI",

        background:
          "linear-gradient(135deg,#020617,#0f172a,#111827,#1e293b)",

        backgroundSize:
          "400% 400%",

        animation:
          "gradientMove 15s ease infinite",
      }}
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside
        style={{

          width: "290px",

          background:
            "rgba(15,23,42,0.92)",

          backdropFilter:
            "blur(18px)",

          borderRight:
            "1px solid rgba(255,255,255,0.08)",

          display: "flex",

          flexDirection: "column",

          justifyContent:
            "space-between",

          padding: "24px 18px",

          boxShadow:
            "10px 0 40px rgba(0,0,0,0.35)",

          zIndex: 1000,
        }}
      >

        <div>

          {/* LOGO */}

          <div
            style={{

              display: "flex",

              alignItems: "center",

              gap: "15px",

              padding: "18px",

              borderRadius: "24px",

              background:
                "linear-gradient(135deg,#2563eb,#06b6d4)",

              boxShadow:
                "0 12px 35px rgba(37,99,235,0.35)",

              marginBottom: "35px",
            }}
          >

            <div
              style={{

                width: "70px",

                height: "70px",

                borderRadius: "20px",

                background:
                  "rgba(255,255,255,0.15)",

                display: "flex",

                justifyContent: "center",

                alignItems: "center",

                color: "#fff",

                fontSize: "28px",

                fontWeight: "700",
              }}
            >
              KMC
            </div>

            <div>

              <h2
                style={{

                  margin: 0,

                  color: "#fff",

                  fontSize: "17px",

                  fontWeight: "700",

                  lineHeight: "24px",
                }}
              >
                Kolhapur Municipal Corporation
              </h2>

              <p
                style={{

                  margin: "5px 0 0",

                  color:
                    "rgba(255,255,255,0.88)",

                  fontSize: "13px",
                }}
              >
                Health Department System
              </p>

            </div>
          </div>

          {/* MENU */}

          <div>

            <p
              style={{

                color: "#94a3b8",

                fontSize: "12px",

                letterSpacing: "1px",

                marginBottom: "15px",

                paddingLeft: "10px",
              }}
            >
              MAIN MENU
            </p>

            {menuItems.map(
              (item, index) => (

                <div
                  key={index}

                  onClick={() =>
                    setPage(item.name)
                  }

                  style={{

                    display: "flex",

                    alignItems: "center",

                    justifyContent:
                      "space-between",

                    padding:
                      "15px 18px",

                    marginBottom:
                      "12px",

                    borderRadius:
                      "18px",

                    cursor: "pointer",

                    transition:
                      "0.3s ease",

                    background:
                      page === item.name

                        ? "linear-gradient(135deg,#2563eb,#3b82f6)"

                        : "transparent",

                    boxShadow:
                      page === item.name

                        ? "0 10px 25px rgba(37,99,235,0.3)"

                        : "none",
                  }}
                >

                  <div
                    style={{

                      display: "flex",

                      alignItems:
                        "center",

                      gap: "14px",

                      color: "#fff",

                      fontSize: "15px",

                      fontWeight: "500",
                    }}
                  >

                    {item.icon}

                    {item.name}

                  </div>

                  <ChevronRight
                    size={18}
                    color="#fff"
                  />

                </div>
              )
            )}
          </div>

          {/* STATUS CARD */}

          <div
            style={{

              marginTop: "30px",

              background:
                "linear-gradient(135deg,#0f766e,#14b8a6)",

              borderRadius: "22px",

              padding: "22px",

              color: "#fff",

              boxShadow:
                "0 12px 35px rgba(20,184,166,0.3)",
            }}
          >

            <div
              style={{

                display: "flex",

                alignItems: "center",

                gap: "10px",

                marginBottom: "15px",
              }}
            >

              <ShieldCheck size={24} />

              <h3
                style={{
                  margin: 0,
                  fontSize: "18px",
                }}
              >
                System Status
              </h3>

            </div>

            <div
              style={{

                display: "flex",

                alignItems: "center",

                gap: "10px",

                marginBottom: "10px",
              }}
            >

              <Activity size={18} />

              <span
                style={{
                  fontSize: "14px",
                }}
              >
                All services operational
              </span>

            </div>

            <p
              style={{

                margin: 0,

                opacity: 0.9,

                fontSize: "13px",

                lineHeight: "22px",
              }}
            >
              Real-time complaint
              monitoring active.
            </p>

          </div>

        </div>

        {/* LOGOUT */}

        <div
          onClick={() =>
            setUser(null)
          }

          style={{

            background:
              "linear-gradient(135deg,#dc2626,#ef4444)",

            color: "#fff",

            padding: "16px",

            borderRadius: "18px",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "center",

            gap: "12px",

            cursor: "pointer",

            fontWeight: "600",

            fontSize: "15px",
          }}
        >

          <LogOut size={20} />

          Logout

        </div>

      </aside>

      {/* =====================================================
          MAIN SECTION
      ===================================================== */}

      <div
        style={{

          flex: 1,

          display: "flex",

          flexDirection: "column",

          overflow: "hidden",

          position: "relative",

          zIndex: 1,
        }}
      >

        {/* NAVBAR */}

        <header
          style={{

            height: "95px",

            position: "relative",

            zIndex: 9999,

            padding: "0 32px",

            background:
              "rgba(15,23,42,0.78)",

            backdropFilter:
              "blur(20px)",

            borderBottom:
              "1px solid rgba(255,255,255,0.08)",

            display: "flex",

            alignItems: "center",

            justifyContent:
              "space-between",
          }}
        >

          {/* LEFT */}

          <div>
<div>
  <h1
    style={{
      margin: 0,
      color: "#fff",
      fontSize: "30px",
      fontWeight: "700",
      letterSpacing: "0.5px",
    }}
  >
    Kolhapur Municipal Corporation
  </h1>

  <p
    style={{
      marginTop: "6px",
      color: "#94a3b8",
      fontSize: "14px",
      letterSpacing: "0.4px",
    }}
  >
    Public Health Complaint Management System
  </p>
</div>

          </div>

          {/* RIGHT */}

          <div
            style={{

              display: "flex",

              alignItems: "center",

              gap: "18px",
            }}
          >

            {/* DATE TIME */}

            <div
              style={{

                background:
                  "rgba(255,255,255,0.06)",

                border:
                  "1px solid rgba(255,255,255,0.08)",

                padding: "12px 18px",

                borderRadius: "18px",

                minWidth: "250px",

                textAlign: "right",
              }}
            >

              <div
                style={{

                  color: "#fff",

                  fontSize: "15px",

                  fontWeight: "600",
                }}
              >
                {time.toLocaleDateString(
                  "en-IN",
                  {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  }
                )}
              </div>

              <div
                style={{

                  color: "#94a3b8",

                  marginTop: "4px",

                  fontSize: "14px",
                }}
              >
                {time.toLocaleTimeString(
                  "en-IN"
                )}
              </div>

            </div>

            {/* NOTIFICATION */}

            <div
              ref={notificationRef}

              style={{
                position: "relative",
              }}
            >

              <div
                onClick={() =>
                  setNotificationOpen(
                    !notificationOpen
                  )
                }

                style={{

                  width: "54px",

                  height: "54px",

                  borderRadius: "16px",

                  background:
                    "rgba(255,255,255,0.06)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  display: "flex",

                  justifyContent: "center",

                  alignItems: "center",

                  cursor: "pointer",

                  position: "relative",
                }}
              >

                <Bell
                  size={22}
                  color="#fff"
                />

                <div
                  style={{

                    minWidth: "20px",

                    height: "20px",

                    borderRadius: "50%",

                    background: "#ef4444",

                    position: "absolute",

                    top: "8px",

                    right: "10px",

                    display: "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",

                    color: "#fff",

                    fontSize: "11px",

                    fontWeight: "700",
                  }}
                >
                  {notifications.length}
                </div>

              </div>

              {notificationOpen && (

                <div
                  style={{

                    position: "absolute",

                    top: "70px",

                    right: 0,

                    width: "340px",

                    background: "#111827",

                    borderRadius: "22px",

                    overflow: "hidden",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    zIndex: 99999,
                  }}
                >

                  <div
                    style={{

                      padding: "18px 22px",

                      borderBottom:
                        "1px solid rgba(255,255,255,0.08)",

                      color: "#fff",

                      fontWeight: "600",
                    }}
                  >
                    Notifications
                  </div>

                  {notifications.map(
                    (item, index) => (

                      <div
                        key={index}

                        style={{

                          padding:
                            "18px 22px",

                          borderBottom:
                            "1px solid rgba(255,255,255,0.05)",
                        }}
                      >

                        <div
                          style={{

                            color: "#fff",

                            fontWeight:
                              "600",

                            marginBottom:
                              "6px",
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{

                            color: "#94a3b8",

                            fontSize:
                              "14px",
                          }}
                        >
                          {item.message}
                        </div>

                        <div
                          style={{

                            marginTop:
                              "8px",

                            color:
                              "#64748b",

                            fontSize:
                              "12px",
                          }}
                        >
                          {item.time}
                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* PROFILE */}

            <div
              ref={profileRef}

              style={{
                position: "relative",
              }}
            >

              <div
                onClick={() =>
                  setProfileOpen(
                    !profileOpen
                  )
                }

                style={{

                  display: "flex",

                  alignItems: "center",

                  gap: "14px",

                  background:
                    "rgba(255,255,255,0.06)",

                  border:
                    "1px solid rgba(255,255,255,0.08)",

                  padding: "10px 18px",

                  borderRadius: "18px",

                  cursor: "pointer",
                }}
              >

                <div>

                  <div
                    style={{

                      color: "#fff",

                      fontWeight: "600",

                      fontSize: "15px",
                    }}
                  >
                    {profile?.name ||
                      "Loading..."}
                  </div>

                  <div
                    style={{

                      color: "#22c55e",

                      fontSize: "13px",

                      marginTop: "3px",
                    }}
                  >
                    ●{" "}
                    {profile?.isOnline
                      ? "Active"
                      : "Offline"}
                  </div>

                </div>

                <div
                  style={{

                    width: "48px",

                    height: "48px",

                    borderRadius: "14px",

                    background:
                      "linear-gradient(135deg,#2563eb,#06b6d4)",

                    display: "flex",

                    justifyContent:
                      "center",

                    alignItems:
                      "center",
                  }}
                >

                  <UserCircle2
                    size={28}
                    color="#fff"
                  />

                </div>

              </div>

              {profileOpen && (

                <div
                  style={{

                    position: "absolute",

                    top: "74px",

                    right: 0,

                    width: "320px",

                    background: "#111827",

                    borderRadius: "24px",

                    overflow: "hidden",

                    border:
                      "1px solid rgba(255,255,255,0.08)",

                    zIndex: 99999,
                  }}
                >

                  {/* TOP */}

                  <div
                    style={{

                      padding: "28px",

                      background:
                        "linear-gradient(135deg,#2563eb,#06b6d4)",

                      textAlign: "center",
                    }}
                  >

                    <div
                      style={{

                        width: "90px",

                        height: "90px",

                        borderRadius: "24px",

                        background:
                          "rgba(255,255,255,0.18)",

                        display: "flex",

                        justifyContent:
                          "center",

                        alignItems:
                          "center",

                        margin:
                          "0 auto 16px",
                      }}
                    >

                      <UserCircle2
                        size={50}
                        color="#fff"
                      />

                    </div>

                    <h2
                      style={{

                        margin: 0,

                        color: "#fff",

                        fontSize: "20px",
                      }}
                    >
                      {profile?.name}
                    </h2>

                    <p
                      style={{

                        marginTop: "6px",

                        color:
                          "rgba(255,255,255,0.9)",

                        fontSize: "14px",
                      }}
                    >
                      {profile?.email}
                    </p>

                  </div>

                  {/* BODY */}

                  <div
                    style={{
                      padding: "20px",
                    }}
                  >

                    <ProfileRow
                      icon={
                        <UserCircle2 size={18} />
                      }

                      label="Full Name"

                      value={
                        profile?.name
                      }
                    />

                    <ProfileRow
                      icon={
                        <Mail size={18} />
                      }

                      label="Email"

                      value={
                        profile?.email
                      }
                    />

                    <ProfileRow
                      icon={
                        <CheckCircle2 size={18} />
                      }

                      label="Status"

                      value={
                        profile?.isOnline
                          ? "Active"
                          : "Offline"
                      }

                      active
                    />

                    <ProfileRow
                      icon={
                        <Settings size={18} />
                      }

                      label="Role"

                      value={
                        profile?.role
                      }
                    />

                    <div
                      onClick={() =>
                        setUser(null)
                      }

                      style={{

                        marginTop: "18px",

                        background:
                          "linear-gradient(135deg,#dc2626,#ef4444)",

                        padding: "15px",

                        borderRadius: "16px",

                        display: "flex",

                        alignItems:
                          "center",

                        justifyContent:
                          "center",

                        gap: "10px",

                        color: "#fff",

                        fontWeight: "600",

                        cursor: "pointer",
                      }}
                    >

                      <LogOut size={18} />

                      Logout

                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>

        </header>

        {/* PAGE CONTENT */}

        <main
          style={{

            flex: 1,

            overflowY: "auto",

            padding: "30px",
          }}
        >
          {renderPage()}
        </main>

      </div>

      {/* ANIMATION */}

      <style>
        {`
          @keyframes gradientMove {

            0% {
              background-position:
                0% 50%;
            }

            50% {
              background-position:
                100% 50%;
            }

            100% {
              background-position:
                0% 50%;
            }
          }
        `}
      </style>

    </div>
  );
};

const ProfileRow = ({
  icon,
  label,
  value,
  active,
}) => (

  <div
    style={{

      display: "flex",

      alignItems: "center",

      justifyContent:
        "space-between",

      padding: "14px 0",

      borderBottom:
        "1px solid rgba(255,255,255,0.06)",
    }}
  >

    <div
      style={{

        display: "flex",

        alignItems: "center",

        gap: "12px",

        color: "#fff",

        fontSize: "14px",
      }}
    >

      {icon}

      {label}

    </div>

    <span
      style={{

        color: active
          ? "#22c55e"
          : "#cbd5e1",

        fontWeight: "600",

        fontSize: "14px",
      }}
    >
      {value}
    </span>

  </div>
);

export default HealthDepartment;