import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Flame,
  Search,
  Eye,
  X,
  Bell,
} from "lucide-react";

const DashboardPage = ({ departmentName }) => {

  /* ================= SAMPLE DATA ================= */

  const complaintsData = [
    {
      id: "SAN101",
      address: "MG Road, Andheri East, Mumbai",
      type: "Garbage Not Collected",
      description: "Garbage not collected for 3 days.",
      status: "Pending",
      priority: "High",
      date: "26 Feb 2026",
      slaHours: 48,
      createdAt: Date.now() - 20 * 60 * 60 * 1000,
      image: "https://images.unsplash.com/photo-1581579185169-8d8e8c5c91a5",
    },
    {
      id: "SAN102",
      address: "Borivali West, Mumbai",
      type: "Drainage Blockage",
      description: "Blocked drainage causing overflow.",
      status: "Escalated",
      priority: "Critical",
      date: "25 Feb 2026",
      slaHours: 24,
      createdAt: Date.now() - 30 * 60 * 60 * 1000,
      image: "https://images.unsplash.com/photo-1597262975002-c5c3b14bbd62",
    },
    {
      id: "SAN103",
      address: "Dadar East, Mumbai",
      type: "Public Toilet Unclean",
      description: "Public toilet not cleaned.",
      status: "Resolved",
      priority: "Medium",
      date: "24 Feb 2026",
      slaHours: 72,
      createdAt: Date.now() - 10 * 60 * 60 * 1000,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
    },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [timeNow, setTimeNow] = useState(Date.now());

  /* ================= LIVE SLA TIMER ================= */

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeNow(Date.now());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getRemainingTime = (createdAt, slaHours) => {
    const deadline = createdAt + slaHours * 60 * 60 * 1000;
    const diff = deadline - timeNow;

    if (diff <= 0) return "Overdue";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return `${hours}h ${minutes}m left`;
  };

  /* ================= FILTER ================= */

  const filteredComplaints = complaintsData.filter((complaint) => {
    const matchesSearch =
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "All" || complaint.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  /* ================= STATS ================= */

  const stats = [
    {
      label: "Total",
      value: filteredComplaints.length,
      icon: <AlertTriangle size={18} />,
      color: "#2563eb",
    },
    {
      label: "Pending",
      value: filteredComplaints.filter(c => c.status === "Pending").length,
      icon: <Clock size={18} />,
      color: "#f59e0b",
    },
    {
      label: "Escalated",
      value: filteredComplaints.filter(c => c.status === "Escalated").length,
      icon: <Flame size={18} />,
      color: "#ef4444",
    },
    {
      label: "Resolved",
      value: filteredComplaints.filter(c => c.status === "Resolved").length,
      icon: <CheckCircle size={18} />,
      color: "#22c55e",
    },
  ];

  const resolvedToday = complaintsData.filter(
    c => c.status === "Resolved"
  ).length;

  const criticalCases = complaintsData.filter(
    c => c.priority === "Critical" && c.status !== "Resolved"
  ).length;

  return (
    <div style={pageContainer}>

      <h1 style={mainTitle}>{departmentName}</h1>
      <p style={subTitle}>Smart Sanitation Monitoring Dashboard</p>

      {/* 🔔 Notification */}
      <div style={notificationBar}>
        <Bell size={18} />
        {resolvedToday} complaints resolved today
        {criticalCases > 0 && (
          <span style={{ color: "#dc2626", marginLeft: 10 }}>
            | {criticalCases} Critical Cases Pending 🚨
          </span>
        )}
      </div>

      {/* 📊 Stat Cards */}
      <div style={statsGrid}>
        {stats.map((stat, i) => (
          <div key={i} style={{ ...statCard, borderLeft: `4px solid ${stat.color}` }}>
            <div>
              <p style={statLabel}>{stat.label}</p>
              <h2 style={{ ...statValue, color: stat.color }}>{stat.value}</h2>
            </div>
            <div style={{ color: stat.color }}>{stat.icon}</div>
          </div>
        ))}
      </div>

      {/* 🔍 Search */}
      <div style={filterBar}>
        <Search size={14} style={searchIcon}/>
        <input
          placeholder="Search by ID or Address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={searchInput}
        />
      </div>

      {/* 🟦 Status Filter */}
      <div style={statusButtonBar}>
        {["All", "Pending", "Escalated", "Resolved"].map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            style={{
              ...statusButton,
              background: selectedStatus === status ? "#2563eb" : "#e5e7eb",
              color: selectedStatus === status ? "#fff" : "#374151"
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* 📋 Table */}
      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Address</th>
              <th style={th}>Priority</th>
              <th style={th}>SLA</th>
              <th style={th}>Status</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredComplaints.map(complaint => {

              const remaining = getRemainingTime(
                complaint.createdAt,
                complaint.slaHours
              );

              const isOverdue = remaining === "Overdue";

              return (
                <tr
                  key={complaint.id}
                  style={{
                    background: isOverdue ? "#fee2e2" : "#fff"
                  }}
                >
                  <td style={tdStrong}>{complaint.id}</td>
                  <td style={td}>{complaint.address}</td>
                  <td style={td}>
                    <PriorityBadge priority={complaint.priority}/>
                  </td>
                  <td style={{
                    ...td,
                    color: isOverdue ? "#dc2626" : "#111",
                    fontWeight: isOverdue ? "600" : "normal"
                  }}>
                    {remaining}
                  </td>
                  <td style={td}>
                    <StatusBadge status={complaint.status}/>
                  </td>
                  <td style={td}>
                    <button
                      style={viewButton}
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <Eye size={14}/> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {selectedComplaint && (
        <ComplaintModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
        />
      )}
    </div>
  );
};

/* ================= BADGES ================= */

const PriorityBadge = ({ priority }) => {
  const colors = {
    Low: "#16a34a",
    Medium: "#f59e0b",
    High: "#ef4444",
    Critical: "#991b1b",
  };
  return (
    <span style={{
      padding: "5px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: `${colors[priority]}20`,
      color: colors[priority]
    }}>
      {priority}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    Pending: "#f59e0b",
    Escalated: "#ef4444",
    Resolved: "#22c55e",
  };
  return (
    <span style={{
      padding: "5px 12px",
      borderRadius: 20,
      fontSize: 12,
      fontWeight: 600,
      background: `${colors[status]}20`,
      color: colors[status]
    }}>
      {status}
    </span>
  );
};

/* ================= MODAL ================= */

const ComplaintModal = ({ complaint, onClose }) => (
  <div style={overlay}>
    <div style={modal}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>{complaint.id}</h2>
        <X onClick={onClose} style={{ cursor: "pointer" }}/>
      </div>
      <p><strong>Address:</strong> {complaint.address}</p>
      <p><strong>Description:</strong> {complaint.description}</p>
      <img src={complaint.image} alt="" style={modalImage}/>
    </div>
  </div>
);

/* ================= STYLES ================= */

const pageContainer = { padding: 40, background: "#f3f4f6", minHeight: "100vh" };
const mainTitle = { fontSize: 28, fontWeight: 700 };
const subTitle = { color: "#6b7280", marginBottom: 20 };

const notificationBar = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  background: "#e0f2fe",
  padding: "10px 15px",
  borderRadius: 10,
  marginBottom: 25,
  fontWeight: 500
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
  gap: 20,
  marginBottom: 25
};

const statCard = {
  background: "#fff",
  padding: 18,
  borderRadius: 14,
  boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center"
};

const statLabel = { fontSize: 13, color: "#6b7280" };
const statValue = { marginTop: 4, fontWeight: 700 };

const filterBar = { marginBottom: 20, position: "relative", width: 280 };
const searchIcon = { position: "absolute", left: 10, top: 8 };
const searchInput = {
  width: "100%",
  padding: "6px 10px 6px 30px",
  borderRadius: 8,
  border: "1px solid #d1d5db"
};

const statusButtonBar = { display: "flex", gap: 10, marginBottom: 25 };
const statusButton = { padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer" };

const tableContainer = {
  background: "#fff",
  padding: 25,
  borderRadius: 16,
  boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
};

const table = { width: "100%", borderCollapse: "collapse" };
const th = { textAlign: "left", padding: 12 };
const td = { padding: 12 };
const tdStrong = { padding: 12, fontWeight: 600 };

const viewButton = {
  display: "flex",
  alignItems: "center",
  gap: 5,
  padding: "5px 10px",
  borderRadius: 6,
  background: "#2563eb",
  color: "#fff",
  border: "none",
  cursor: "pointer"
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modal = { background: "#fff", width: 500, borderRadius: 16, padding: 25 };
const modalImage = { width: "100%", marginTop: 15, borderRadius: 12 };

export default DashboardPage;