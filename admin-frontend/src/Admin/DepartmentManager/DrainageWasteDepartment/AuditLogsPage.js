import React from "react";

const AuditLogsPage = () => {

  const logs = [

    "Drainage complaint assigned",

    "Garbage complaint resolved",

    "Sewage issue escalated",
  ];

  return (

    <div style={styles.card}>

      <h2>
        Audit Logs
      </h2>

      {logs.map((log, index) => (

        <div
          key={index}
          style={styles.log}
        >

          {log}

        </div>
      ))}

    </div>
  );
};

const styles = {

  card: {

    background: "#fff",

    padding: 25,

    borderRadius: 20,
  },

  log: {

    background: "#f8fafc",

    padding: 14,

    borderRadius: 12,

    marginTop: 12,
  },
};

export default AuditLogsPage;