import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  User,
  Bell,
  LogOut,
  Menu,
  Settings,
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  FileText,
  ShieldCheck
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ManagersPage from "./ManagersPage";
import DepartmentsPage from "./DepartmentsPage";
import AnalyticsPage from "./AnalyticsPage";
import ReportsPage from "./ReportsPage";
import SystemEscalatedComplaintsPage from "./SystemEscalatedComplaintsPage";

const pageTitles = {
  dashboard: "System Overview",
  managers: "Department Managers",
  departments: "Departments",
  analytics: "Analytics & Insights",
  reports: "System Reports",
  escalated: "Escalated Complaints",
};

export default function SystemManagerDashboard({ setUser }) {

  const [activePage, setActivePage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [profile, setProfile] = useState(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [notifications, setNotifications] = useState([]);
  const [blink, setBlink] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  /* ================= FETCH PROFILE ================= */
 useEffect(() => {
  try {
    const token = localStorage.getItem("kmc_token");
    const savedUser = localStorage.getItem("kmc_user");

    // ❌ If no token or user → logout state
    if (!token || !savedUser) {
      console.warn("No session found");
      setProfile(null);
      return;
    }

    const user = JSON.parse(savedUser);

    console.log("✅ Profile from login:", user);

    // ✅ Set profile directly from login data
    setProfile({
      name: user.name || "System Manager",
      email: user.email || "admin@kmc.gov.in",
      role: user.role || "",
      department: user.department || null,
      isOnline: true   // always true after login
    });

  } catch (err) {
    console.error("❌ Profile load error:", err);
    setProfile(null);
  }
}, []);

  /* ================= SOCKET ================= */
  useEffect(() => {
    const socket = io("http://localhost:5000");

    socket.on("newNotification", (data) => {
      setNotifications(prev => [data, ...prev]);

      if (data.type === "urgent") {
        setBlink(true);
        setTimeout(() => setBlink(false), 2000);
      }
    });

    return () => socket.disconnect();
  }, []);

  /* ================= CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ================= FIXED OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        notifRef.current &&
        !notifRef.current.contains(e.target)
      ) {
        setShowProfile(false);
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("kmc_token");
      setUser(null);
    }
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "managers": return <ManagersPage />;
      case "departments": return <DepartmentsPage />;
      case "analytics": return <AnalyticsPage />;
      case "reports": return <ReportsPage />;
      case "escalated":
      return (
        <SystemEscalatedComplaintsPage />
      );
      default: return <DashboardPage />;
    }
  };

  const menuItems = [

  {
    label: "Dashboard",
    value: "dashboard",
    icon: <LayoutDashboard size={18}/>
  },

  {
    label: "Managers",
    value: "managers",
    icon: <Users size={18}/>
  },

  {
    label: "Departments",
    value: "departments",
    icon: <Building2 size={18}/>
  },

  {
    label: "Analytics",
    value: "analytics",
    icon: <BarChart3 size={18}/>
  },

  {
    label: "Reports",
    value: "reports",
    icon: <FileText size={18}/>
  },

  {
    label: "Escalated",
    value: "escalated",
    icon: <ShieldCheck size={18}/>
  },
];

  return (
    <div className="appContainer">

      {/* ================= SIDEBAR ================= */}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <div>
          <div className="sidebarTop">

            <div className="brand">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/512px-Emblem_of_India.svg.png"
                alt="Emblem"
                className="emblem"
              />
              {!collapsed && (
                <div className="brandText">
                  <h2>Kolhapur Municipal Corporation</h2>
                  <p>System Manager Portal</p>
                </div>
              )}
            </div>

            <button
              className="collapseBtn"
              onClick={() => setCollapsed(prev => !prev)}
            >
              <Menu size={20}/>
            </button>
          </div>

          <ul>
            {menuItems.map(item => (
              <li
                key={item.value}
                className={activePage === item.value ? "active" : ""}
                onClick={() => setActivePage(item.value)}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </li>
            ))}
          </ul>
        </div>

        <div className="logout" onClick={handleLogout}>
          <LogOut size={18}/>
          {!collapsed && <span>Secure Logout</span>}
        </div>
      </aside>

      {/* ================= MAIN ================= */}
      <div className="main">

        <header>
          <h1>{pageTitles[activePage]}</h1>

          <div className="rightHeader">

            {/* NOTIFICATIONS */}
            <div className="iconBox" ref={notifRef}>
              <Bell
                size={20}
                className={blink ? "blinkBell" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotif(prev => !prev);
                  setShowProfile(false);
                }}
              />

              {notifications.length > 0 && (
                <span className="badge">{notifications.length}</span>
              )}

              {showNotif && (
                <div className="dropdown">
                  <h4>Notifications</h4>

                  {notifications.length === 0 && (
                    <p className="emptyText">No notifications</p>
                  )}

                  {notifications.map((n, index) => (
                    <div key={index} className={`notifItem ${n.type}`}>
                      <p>{n.title}</p>
                      <small>{n.message}</small>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* PROFILE */}
           <div className="iconBox" ref={profileRef}>
  <User
    size={20}
    onClick={(e) => {
      e.stopPropagation();
      setShowProfile(true);
      setShowNotif(false);
    }}
  />

  {showProfile && (
    <div className="dropdown profileDropdown">

      <div className="profileTop">
        <div className="avatar">
          <ShieldCheck size={18}/>
        </div>

        <div className="profileDetails">
          <h3>{profile?.name || "System Manager"}</h3>
          <p className="email">{profile?.email || "admin@kmc.gov"}</p>

          <div className="statusRow">
            <span className={`statusDot ${profile?.isOnline ? "online" : "offline"}`}></span>
            <span className="statusText">
              {profile?.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      <div className="dropdownOption">
        <Settings size={16}/>
        <span>Account Settings</span>
      </div>

      <div 
        className="dropdownOption logoutOption"
        onClick={(e) => {
          e.stopPropagation();
          handleLogout();
        }}
      >
        <LogOut size={16}/>
        <span>Secure Logout</span>
      </div>

    </div>
  )}
</div>

            <div className="clock">
              <div>{dateTime.toLocaleTimeString()}</div>
              <small>{dateTime.toDateString()}</small>
            </div>

          </div>
        </header>

        <main>{renderPage()}</main>
      </div>

      {/* ================= CSS (UNCHANGED) ================= */}
      <style>{`
  *{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Poppins,sans-serif;
  }

  html,body,#root{
    height:100%;
    font-size:13px;
  }

  .appContainer{
    display:flex;
    height:100vh;
    width:100%;
    background:#f4f6fa;
    overflow:hidden;
  }

  /* SIDEBAR */
  .sidebar{
    width:220px;
    min-width:220px;
    background:linear-gradient(180deg,#0b2c48,#071c2f);
    color:white;
    padding:15px 10px;
    display:flex;
    flex-direction:column;
    justify-content:space-between;
    transition:0.3s;
  }

  .sidebar.collapsed{
    width:70px;
    min-width:70px;
  }

  .sidebarTop{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:25px;
  }

  .brand{
    display:flex;
    align-items:center;
    gap:8px;
  }

  .emblem{
    width:30px;
  }

  .brandText h2{
    font-size:12px;
    font-weight:600;
    line-height:1.2;
  }

  .brandText p{
    font-size:10px;
    opacity:0.7;
  }

  /* MENU */
  ul{
    list-style:none;
    display:flex;
    flex-direction:column;
    gap:4px;
  }

  li{
    padding:8px 10px;
    display:flex;
    align-items:center;
    gap:10px;
    border-radius:6px;
    cursor:pointer;
    transition:0.2s;
  }

  li span{
    font-size:12px;
  }

  li:hover{
    background:rgba(255,153,51,0.2);
  }

  li.active{
    background:rgba(255,153,51,0.35);
  }

  .sidebar.collapsed li{
    justify-content:center;
  }

  .sidebar.collapsed li span{
    display:none;
  }

  /* LOGOUT */
  .logout{
    background:#b91c1c;
    padding:8px;
    border-radius:6px;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:6px;
    cursor:pointer;
    font-size:12px;
    transition:0.2s;
  }

  .logout:hover{
    background:#991b1b;
  }

  /* MAIN */
  .main{
    flex:1;
    display:flex;
    flex-direction:column;
    overflow:hidden;
  }

  /* HEADER */
  header{
    background:white;
    padding:12px 20px;
    display:flex;
    justify-content:space-between;
    align-items:center;
    box-shadow:0 2px 8px rgba(0,0,0,0.05);
  }

  header h1{
    font-size:15px;
    font-weight:600;
  }

  .rightHeader{
    display:flex;
    align-items:center;
    gap:18px;
  }

  /* ICON */
  .iconBox{
    position:relative;
    cursor:pointer;
  }

  .iconBox svg{
    width:18px;
    height:18px;
  }

  /* BADGE */
  .badge{
    position:absolute;
    top:-5px;
    right:-5px;
    background:#ef4444;
    color:white;
    font-size:9px;
    padding:2px 5px;
    border-radius:50%;
  }

  /* DROPDOWN */
  .dropdown{
    position:absolute;
    top:38px;
    right:0;
    width:250px;
    max-height:350px;
    overflow-y:auto;
    background:white;
    border-radius:10px;
    padding:12px;
    box-shadow:0 10px 25px rgba(0,0,0,0.1);
    z-index:100;
  }

  .notifItem{
    padding:8px;
    border-radius:6px;
    background:#f9fafb;
    margin-bottom:6px;
  }

  .notifItem.urgent{
    background:#fee2e2;
  }

  .notifItem p{
    font-size:12px;
    font-weight:600;
  }

  .notifItem small{
    font-size:11px;
    color:#6b7280;
  }

  /* PROFILE */
  ./* PROFILE DROPDOWN */
.profileDropdown{
  width:260px;
  padding:14px;
}

/* TOP SECTION */
.profileTop{
  display:flex;
  align-items:center;
  gap:12px;
}

/* AVATAR */
.avatar{
  width:40px;
  height:40px;
  border-radius:50%;
  background:linear-gradient(135deg,#ff9933,#ff7a00);
  display:flex;
  align-items:center;
  justify-content:center;
  color:white;
  flex-shrink:0;
}

/* DETAILS */
.profileDetails{
  display:flex;
  flex-direction:column;
  gap:2px;
}

.profileDetails h3{
  font-size:13px;
  font-weight:600;
  margin:0;
}

.profileDetails .email{
  font-size:11px;
  color:#6b7280;
}

/* STATUS */
.statusRow{
  display:flex;
  align-items:center;
  gap:6px;
  margin-top:4px;
}

.statusDot{
  width:7px;
  height:7px;
  border-radius:50%;
}

.statusDot.online{ background:#22c55e; }
.statusDot.offline{ background:#ef4444; }

.statusText{
  font-size:11px;
  color:#555;
}

/* DIVIDER */
.divider{
  height:1px;
  background:#e5e7eb;
  margin:12px 0;
}

/* OPTIONS */
.dropdownOption{
  display:flex;
  align-items:center;
  gap:8px;
  padding:8px;
  border-radius:6px;
  font-size:12px;
  cursor:pointer;
  transition:0.2s;
}

.dropdownOption span{
  flex:1;
}

.dropdownOption:hover{
  background:#f3f4f6;
}

.logoutOption{
  color:#dc2626;
}

  /* OPTIONS */
  .dropdownOption{
    padding:6px;
    border-radius:6px;
    display:flex;
    align-items:center;
    gap:6px;
    cursor:pointer;
    font-size:12px;
  }

  .dropdownOption:hover{
    background:#f3f4f6;
  }

  .logoutOption{
    color:#dc2626;
  }

  /* CLOCK */
  .clock{
    text-align:right;
    font-size:11px;
  }

  /* MAIN CONTENT */
  main{
    flex:1;
    padding:20px;
    overflow:auto;
  }
`}</style>
    </div>
  );
}