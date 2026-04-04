import React from "react";

const OfficersPage = () => {
  const officers = [
    { name: "Dr. Anjali Deshmukh", ward: "Ward 7" },
    { name: "Health Supervisor", ward: "Ward 4" },
  ];

  return (
    <div>
      <h2>Health Officers</h2>

      {officers.map((o, i) => (
        <div key={i} style={{
          background: "#fff",
          padding: 20,
          marginTop: 15,
          borderRadius: 10
        }}>
          {o.name} — {o.ward}
        </div>
      ))}
    </div>
  );
};

export default OfficersPage;