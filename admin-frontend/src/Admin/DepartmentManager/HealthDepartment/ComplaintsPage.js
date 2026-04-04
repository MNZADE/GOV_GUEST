import React from "react";

const ComplaintsPage = () => {
  const complaints = [
    { id: "H-101", title: "Drainage Overflow", ward: "Ward 4", status: "Pending" },
    { id: "H-102", title: "Unhygienic Toilet", ward: "Ward 7", status: "Escalated" },
  ];

  return (
    <div>
      <h2>Health Complaints</h2>

      {complaints.map((c) => (
        <div key={c.id} style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          marginTop: 15
        }}>
          <strong>{c.id}</strong> - {c.title}
          <div>{c.ward}</div>
          <div style={{ marginTop: 5 }}>{c.status}</div>
        </div>
      ))}
    </div>
  );
};

export default ComplaintsPage;