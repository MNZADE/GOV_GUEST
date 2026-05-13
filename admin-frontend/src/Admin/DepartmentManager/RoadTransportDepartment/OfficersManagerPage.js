
import React from "react";

const OfficersManagerPage = () => {

  const officers = [

    {
      name: "Rahul Patil",
      role: "Road Inspector",
    },

    {
      name: "Amit Jadhav",
      role: "Traffic Supervisor",
    },

    {
      name: "Sneha Kulkarni",
      role: "Road Safety Officer",
    },
  ];

  return (

    <div style={styles.grid}>

      {officers.map((officer, index) => (

        <div
          key={index}
          style={styles.card}
        >

          <h3>
            {officer.name}
          </h3>

          <p>
            {officer.role}
          </p>

          <button style={styles.btn}>
            View Profile
          </button>

        </div>
      ))}

    </div>
  );
};

const styles = {

  grid: {

    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap: 20,
  },

  card: {

    background: "#fff",

    padding: 25,

    borderRadius: 20,

    boxShadow:
      "0 8px 25px rgba(0,0,0,0.08)",
  },

  btn: {

    marginTop: 15,

    padding: "10px 18px",

    background: "#0f172a",

    color: "#fff",

    border: "none",

    borderRadius: 10,

    cursor: "pointer",
  },
};

export default OfficersManagerPage;