import React, { useState, useEffect } from "react";
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

const pageTitles = {
  dashboard: "System Overview",
  managers: "Department Managers",
  departments: "Departments",
  analytics: "Analytics & Insights",
  reports: "System Reports",
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

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("kmc_token");
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setProfile(data);
      } catch (err) {}
    };
    fetchProfile();
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

  /* ================= OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".dropdownArea")) {
        setShowProfile(false);
        setShowNotif(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kmc_token");
    setUser(null);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage />;
      case "managers": return <ManagersPage />;
      case "departments": return <DepartmentsPage />;
      case "analytics": return <AnalyticsPage />;
      case "reports": return <ReportsPage />;
      default: return <DashboardPage />;
    }
  };

  const menuItems = [
    { label: "Dashboard", value: "dashboard", icon: <LayoutDashboard size={18}/> },
    { label: "Managers", value: "managers", icon: <Users size={18}/> },
    { label: "Departments", value: "departments", icon: <Building2 size={18}/> },
    { label: "Analytics", value: "analytics", icon: <BarChart3 size={18}/> },
    { label: "Reports", value: "reports", icon: <FileText size={18}/> },
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

          <div className="rightHeader dropdownArea">

            {/* NOTIFICATIONS */}
            <div className="iconBox">
              <Bell
                size={20}
                className={blink ? "blinkBell" : ""}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNotif(!showNotif);
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
            <div className="iconBox">
              <User
                size={20}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfile(!showProfile);
                  setShowNotif(false);
                }}
              />

              {showProfile && profile && (
                <div className="dropdown profileDropdown">

                  <div className="profileTop">
                    <div className="avatar">
                      <ShieldCheck size={18}/>
                    </div>

                    <div className="profileDetails">
                      <h3>{profile.name}</h3>
                      <p>{profile.email}</p>

                      <div className="statusRow">
                        <span className={`statusDot ${profile.isOnline ? "online" : "offline"}`}></span>
                        {profile.isOnline ? "Online" : "Offline"}
                      </div>
                    </div>
                  </div>

                  <div className="divider"></div>

                  <div className="dropdownOption">
                    <Settings size={16}/> Account Settings
                  </div>

                  <div className="dropdownOption logoutOption" onClick={handleLogout}>
                    <LogOut size={16}/> Secure Logout
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

      {/* ================= CSS ================= */}
      <style>{`
        *{margin:0;padding:0;box-sizing:border-box;font-family:Poppins,sans-serif;}
        html,body,#root{height:100%;}

        .appContainer{display:flex;height:100vh;width:100%;background:#f4f6fa;overflow:hidden;}

        .sidebar{
          width:260px;
          min-width:260px;
          background:linear-gradient(180deg,#0b2c48,#071c2f);
          color:white;
          padding:20px 15px;
          display:flex;
          flex-direction:column;
          justify-content:space-between;
          transition:width 0.3s ease;
        }

        .sidebar.collapsed{width:80px;min-width:80px;}

        .sidebarTop{display:flex;justify-content:space-between;align-items:center;margin-bottom:35px;}
        .brand{display:flex;align-items:center;gap:12px;}
        .emblem{width:38px;}

        .brandText h2{font-size:14px;font-weight:600;line-height:1.3;}
        .brandText p{font-size:11px;opacity:0.7;}

        ul{list-style:none;display:flex;flex-direction:column;gap:6px;}

        li{
          width:100%;
          padding:12px 14px;
          display:flex;
          align-items:center;
          gap:14px;
          border-radius:8px;
          cursor:pointer;
          transition:0.2s;
        }

        li span{font-size:14px;}
        li:hover{background:rgba(255,153,51,0.2);}
        li.active{background:rgba(255,153,51,0.35);}
        .sidebar.collapsed li{justify-content:center;}
        .sidebar.collapsed li span{display:none;}

        .logout{
          background:#b91c1c;
          padding:10px;
          border-radius:8px;
          display:flex;
          align-items:center;
          justify-content:center;
          gap:8px;
          cursor:pointer;
          transition:0.2s;
        }

        .logout:hover{background:#991b1b;}

        .main{flex:1;display:flex;flex-direction:column;overflow:hidden;}

        header{
          background:white;
          padding:18px 30px;
          display:flex;
          justify-content:space-between;
          align-items:center;
          box-shadow:0 2px 10px rgba(0,0,0,0.06);
        }

        header h1{font-size:18px;font-weight:600;}

        .rightHeader{display:flex;align-items:center;gap:28px;}

        .iconBox{position:relative;cursor:pointer;}

        .badge{
          position:absolute;
          top:-6px;
          right:-6px;
          background:#ef4444;
          color:white;
          font-size:10px;
          padding:3px 6px;
          border-radius:50%;
        }

        .dropdown{
          position:absolute;
          top:42px;
          right:0;
          width:300px;
          max-height:380px;
          overflow-y:auto;
          background:white;
          border-radius:12px;
          padding:16px;
          box-shadow:0 15px 35px rgba(0,0,0,0.12);
          animation:fadeIn 0.2s ease;
          z-index:100;
        }

        .notifItem{
          padding:10px;
          border-radius:8px;
          background:#f9fafb;
          margin-bottom:8px;
          transition:0.2s;
        }

        .notifItem.urgent{background:#fee2e2;}
        .notifItem:hover{background:#eef2ff;}

        .notifItem p{font-size:13px;font-weight:600;margin-bottom:3px;}
        .notifItem small{font-size:12px;color:#6b7280;}

        .profileTop{display:flex;gap:14px;align-items:center;}
        .avatar{
          width:44px;height:44px;border-radius:50%;
          background:linear-gradient(135deg,#ff9933,#ff7a00);
          display:flex;align-items:center;justify-content:center;color:white;
        }

        .profileDetails h3{font-size:14px;font-weight:600;}
        .profileDetails p{font-size:12px;color:#6b7280;margin-top:2px;}

        .statusRow{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:12px;}
        .statusDot{width:8px;height:8px;border-radius:50%;}
        .statusDot.online{background:#22c55e;}
        .statusDot.offline{background:#ef4444;}

        .divider{height:1px;background:#e5e7eb;margin:14px 0;}

        .dropdownOption{
          padding:8px;
          border-radius:8px;
          display:flex;
          align-items:center;
          gap:8px;
          cursor:pointer;
          transition:0.2s;
          font-size:13px;
        }

        .dropdownOption:hover{background:#f3f4f6;}
        .logoutOption{color:#dc2626;}

        .clock{text-align:right;font-size:12px;line-height:1.3;}

        main{flex:1;padding:30px;overflow:auto;}

        @keyframes fadeIn{
          from{opacity:0;transform:translateY(-8px);}
          to{opacity:1;transform:translateY(0);}
        }

        .blinkBell{
          animation:blinkRed 0.5s ease-in-out 4;
          color:#ef4444;
        }

        @keyframes blinkRed{
          0%{opacity:1;}
          50%{opacity:0;}
          100%{opacity:1;}
        }

      `}</style>
    </div>
  );
}
