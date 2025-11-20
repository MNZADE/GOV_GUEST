import React from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  const complaints = [
    { id: 1, issue: "Water Leakage", department: "Water Supply", status: "Pending" },
    { id: 2, issue: "Garbage Not Collected", department: "Sanitation", status: "In Progress" },
    { id: 3, issue: "Street Light Not Working", department: "Street Light", status: "Pending" },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard 🛠️</h2>

      <button style={styles.officersBtn} onClick={() => navigate("/manage-officers")}>
        Manage Department Officers
      </button>

      <h3 style={styles.subtitle}>All Complaints</h3>

      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Issue</th>
            <th style={styles.th}>Department</th>
            <th style={styles.th}>Status</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.map((complaint) => (
            <tr key={complaint.id}>
              <td style={styles.td}>{complaint.id}</td>
              <td style={styles.td}>{complaint.issue}</td>
              <td style={styles.td}>{complaint.department}</td>
              <td
                style={{
                  ...styles.td,
                  color: complaint.status === "Resolved" ? "green" : "red",
                }}
              >
                {complaint.status}
              </td>
              <td style={styles.td}>
                <button style={styles.assignBtn} onClick={() => alert("Assigned ✅")}>
                  Assign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button style={styles.logout} onClick={() => navigate("/")}>
        🚪 Logout
      </button>
    </div>
  );
};

const styles = {
  container: { padding: "30px", fontFamily: "Arial" },
  title: { fontSize: "28px", color: "#003366", fontWeight: "bold" },
  subtitle: { marginTop: "20px", fontSize: "20px", fontWeight: "bold" },
  table: { width: "100%", marginTop: "12px", borderCollapse: "collapse" },
  th: { border: "1px solid #ccc", background: "#003366", color: "#fff", padding: "10px" },
  td: { border: "1px solid #ccc", padding: "10px", textAlign: "center" },
  assignBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    cursor: "pointer",
    borderRadius: "5px",
  },
  officersBtn: {
    background: "#008000",
    color: "#fff",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    marginBottom: "20px",
  },
  logout: {
    marginTop: "25px",
    background: "#ff3b3b",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
  },
};

export default AdminDashboard;
