import React from "react";

const DashboardPage = () => {

  const stats = [

    {
      title: "Total Complaints",
      value: 820,
    },

    {
      title: "Pending",
      value: 210,
    },

    {
      title: "Resolved",
      value: 510,
    },

    {
      title: "Escalated",
      value: 100,
    },
  ];

  return (

    <div>

      <div style={styles.grid}>

        {stats.map((item, index) => (

          <div
            key={index}
            style={styles.card}
          >

            <h3>
              {item.title}
            </h3>

            <h1>
              {item.value}
            </h1>

          </div>
        ))}

      </div>

    </div>
  );
};

const styles = {

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",

    gap: 20,
  },

  card: {

    background: "#fff",

    padding: 25,

    borderRadius: 20,

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.08)",
  },
};

export default DashboardPage;