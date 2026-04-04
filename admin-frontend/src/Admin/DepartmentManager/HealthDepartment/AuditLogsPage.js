import React from "react";

const AuditLogsPage = () => {
  const logs = [
    "Complaint H-101 assigned to Health Inspector",
    "Complaint H-102 escalated to System Manager",
  ];

  return (
    <div>
      <h2>Audit Logs</h2>

      {logs.map((log, i) => (
        <div key={i} style={{
          background: "#fff",
          padding: 10,
          marginTop: 10,
          borderRadius: 6
        }}>
          {log}
        </div>
      ))}
    </div>
  );
};

export default AuditLogsPage;