import React from "react";

const ComplaintsPage = () => {

  const complaints = [

    {
      id: "OC-101",
      issue: "Public Noise Complaint",
      area: "Ward 12",
      status: "Pending",
    },

    {
      id: "OC-102",
      issue: "Illegal Parking",
      area: "Main Road",
      status: "Resolved",
    },

    {
      id: "OC-103",
      issue: "Public Disturbance",
      area: "Market Area",
      status: "In Progress",
    },
  ];

  return (

    <div style={styles.card}>

      <h2>
        Other Complaints
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