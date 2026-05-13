import React, {
  useState,
} from "react";

import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Users,
} from "lucide-react";

import DashboardPage from "./DashboardPage";
import ComplaintsPage from "./ComplaintsPage";
import AuditLogsPage from "./AuditLogsPage";
import OfficersManagerPage from "./OfficersManagerPage";

const DrainageWasteDepartment = () => {

  const [page, setPage] =
    useState("Dashboard");

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

      {/* SIDEBAR */}

      <aside style={styles.sidebar}>

        <h2 style={styles.logo}>
          Drainage & Waste
        </h2>

        {menuItems.map((item) => (

          <div

            key={item.name}

            style={{

              ...styles.menuItem,

              background:

                page === item.name

                  ? "#0f172a"

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

      </aside>

      {/* MAIN */}

      <main style={styles.main}>

        <div style={styles.header}>

          <div>

            <h1 style={styles.title}>
              Drainage, Sewage & Garbage Collection Department
            </h1>

            <p style={styles.subtitle}>
              Smart Municipal Monitoring Dashboard
            </p>

          </div>

        </div>

        {renderPage()}

      </main>

    </div>
  );
};

const styles = {

  container: {

    display: "flex",

    minHeight: "100vh",

    background: "#f1f5f9",

    fontFamily:
      "Segoe UI, sans-serif",
  },

  sidebar: {

    width: 260,

    background:
      "#1e293b",

    color: "#fff",

    padding: 20,
  },

  logo: {

    marginBottom: 30,

    color: "#38bdf8",
  },

  menuItem: {

    display: "flex",

    alignItems: "center",

    gap: 12,

    padding: 14,

    borderRadius: 12,

    cursor: "pointer",

    marginBottom: 12,
  },

  main: {

    flex: 1,

    padding: 30,
  },

  header: {

    marginBottom: 30,
  },

  title: {

    margin: 0,

    fontSize: 30,
  },

  subtitle: {

    color: "#64748b",

    marginTop: 8,
  },
};

export default DrainageWasteDepartment;