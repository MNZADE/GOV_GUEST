import React from "react";

const DashboardPage = () => {
  return (
    <div>
      <h2>Health Department Dashboard</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4,1fr)",
        gap: 20,
        marginTop: 30
      }}>
        <Card label="Total Complaints" value="42" />
        <Card label="Pending" value="12" />
        <Card label="Escalated" value="3" />
        <Card label="Resolved" value="27" />
      </div>
    </div>
  );
};

const Card = ({ label, value }) => (
  <div style={{
    background: "#fff",
    padding: 20,
    borderRadius: 10,
    textAlign: "center"
  }}>
    <p>{label}</p>
    <h2>{value}</h2>
  </div>
);

export default DashboardPage;