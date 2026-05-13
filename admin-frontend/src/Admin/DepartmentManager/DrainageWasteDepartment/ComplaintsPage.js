import React from "react";

const ComplaintsPage = () => {

  const complaints = [

    {
      id: "DW-101",
      issue: "Drainage Overflow",
      area: "Ward 12",
      status: "Pending",
    },

    {
      id: "DW-102",
      issue: "Garbage Not Collected",
      area: "Ward 5",
      status: "Resolved",
    },

    {
      id: "DW-103",
      issue: "Sewage Leakage",
      area: "Market Area",
      status: "In Progress",
    },
  ];

  return (

    <div style={styles.card}>

      <h2>
        Complaints
      </h2>

      <table style={styles.table}>

        <thead>

          <tr>

            <th>ID</th>

            <th>Issue</th>

            <th>Area</th>

            <th>Status</th>

          </tr>

        </thead>

        <tbody>

          {complaints.map((c) => (

            <tr key={c.id}>

              <td>{c.id}</td>

              <td>{c.issue}</td>

              <td>{c.area}</td>

              <td>{c.status}</td>

            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
};

const styles = {

  card: {

    background: "#fff",

    padding: 25,

    borderRadius: 20,
  },

  table: {

    width: "100%",

    borderCollapse: "collapse",

    marginTop: 20,
  },
};

export default ComplaintsPage;