import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
  Bell,
  UserCircle,
} from "lucide-react";
import { GiLion } from "react-icons/gi";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersPage from "./OfficersManagerPage";

const HealthDepartment = ({ setUser }) => {
  const [page, setPage] = useState("Dashboard");
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
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
        return <OfficersPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f3f4f6" }}>
      
      {/* SIDEBAR */}
      <aside style={{
        width: 250,
        background: "#047857",
        color: "#fff",
        padding: 20,
      }}>
        {["Dashboard", "Complaints", "Audit Logs", "Officers"].map((item) => (
          <div
            key={item}
            onClick={() => setPage(item)}
            style={{
              padding: 12,
              marginBottom: 8,
              cursor: "pointer",
              borderRadius: 6,
              background: page === item ? "rgba(255,255,255,0.2)" : "transparent"
            }}
          >
            {item}
          </div>
        ))}

        <div
          onClick={() => setUser(null)}
          style={{
            marginTop: 20,
            padding: 12,
            background: "#991b1b",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          Logout
        </div>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        
        {/* NAVBAR */}
        <header style={{
          background: "#065f46",
          color: "#fff",
          padding: "20px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
            <GiLion size={36} />
            <div>
              <h2 style={{ margin: 0 }}>Kolhapur Municipal Corporation</h2>
              <p style={{ margin: 0 }}>Health Department</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            <div>{time.toLocaleTimeString("en-IN")}</div>
            <Bell size={22} />
            <UserCircle size={28} />
          </div>
        </header>

        <div style={{ padding: 30, overflowY: "auto" }}>
          {renderPage()}
        </div>
      </div>
    </div>
  );
};

export default HealthDepartment;