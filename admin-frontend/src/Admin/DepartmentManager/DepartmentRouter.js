import React from "react";
import { Navigate } from "react-router-dom";

import WaterDepartment from "./WaterDepartment/WaterDepartment";
import HealthDepartment from "./HealthDepartment/HealthDepartment";
import SanitationDepartment from "./SanitationDepartment/SanitationDepartment";
import ElectricityDepartment from "./ElectricityDepartment/ElectricityDepartment";
import RoadTransportDepartment from "./RoadTransportDepartment/RoadTransportDepartment";
import DrainageWasteDepartment from "./DrainageWasteDepartment/DrainageWasteDepartment";
import OtherComplaintDepartment from "./OtherComplaintDepartment/OtherComplaintDepartment";

const DepartmentRouter = ({
  user,
  setUser,
}) => {

  /* =====================================
     ROLE PROTECTION
  ===================================== */

  if (!user) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  if (
    user.role !==
    "department_manager"
  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =====================================
     NORMALIZE DEPARTMENT
  ===================================== */

  const dept =
    user.department
      ?.toLowerCase()
      .trim();

  console.log(
    "Department:",
    dept
  );

  /* =====================================
     DEPARTMENT ROUTING
  ===================================== */

  switch (dept) {

    /* =====================================
       WATER SUPPLY DEPARTMENT
    ===================================== */

    case "water supply department":

      return (

        <WaterDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       HEALTH DEPARTMENT
    ===================================== */

    case "health department":

      return (

        <HealthDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       SANITATION DEPARTMENT
    ===================================== */

    case "sanitation department":

      return (

        <SanitationDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       ELECTRICITY DEPARTMENT
    ===================================== */

    case "electricity department":

      return (

        <ElectricityDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       ROAD & TRANSPORTATION
    ===================================== */

    case "road & transportation department":

      return (

        <RoadTransportDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "road transportation department":

      return (

        <RoadTransportDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "road department":

      return (

        <RoadTransportDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       DRAINAGE + SEWAGE + GARBAGE
    ===================================== */

    case "drainage department":

      return (

        <DrainageWasteDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "sewage department":

      return (

        <DrainageWasteDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "garbage collection department":

      return (

        <DrainageWasteDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "waste management department":

      return (

        <DrainageWasteDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       OTHER / GENERAL COMPLAINTS
    ===================================== */

    case "other complaint department":

      return (

        <OtherComplaintDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "general complaint department":

      return (

        <OtherComplaintDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "general department":

      return (

        <OtherComplaintDepartment
          user={user}
          setUser={setUser}
        />
      );

    case "other department":

      return (

        <OtherComplaintDepartment
          user={user}
          setUser={setUser}
        />
      );

    /* =====================================
       DEFAULT
    ===================================== */

    default:

      console.log(
        "❌ Unknown Department:",
        user.department
      );

      return (

        <div style={styles.errorContainer}>

          <div style={styles.errorCard}>

            <h2 style={styles.errorTitle}>
              Department Not Assigned
            </h2>

            <p style={styles.errorText}>
              Please contact the
              system administrator.
            </p>

            <div style={styles.departmentBox}>
              {user.department ||
                "No Department"}
            </div>

          </div>

        </div>
      );
  }
};

/* =====================================
   STYLES
===================================== */

const styles = {

  errorContainer: {

    display: "flex",

    justifyContent:
      "center",

    alignItems:
      "center",

    height: "100vh",

    background: "#f1f5f9",
  },

  errorCard: {

    background: "#ffffff",

    padding: 40,

    borderRadius: 24,

    boxShadow:
      "0 10px 35px rgba(0,0,0,0.1)",

    textAlign: "center",

    width: 420,
  },

  errorTitle: {

    marginBottom: 12,

    color: "#0f172a",

    fontSize: 28,

    fontWeight: 700,
  },

  errorText: {

    color: "#64748b",

    marginBottom: 20,

    fontSize: 15,
  },

  departmentBox: {

    background: "#e2e8f0",

    padding: 14,

    borderRadius: 12,

    fontWeight: 600,

    color: "#1e293b",

    fontSize: 15,
  },
};

export default DepartmentRouter;