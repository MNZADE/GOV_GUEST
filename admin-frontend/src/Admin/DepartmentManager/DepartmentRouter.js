import React from "react";

import {
  Navigate,
} from "react-router-dom";

import WaterDepartment from "./WaterDepartment/WaterDepartment";

import HealthDepartment from "./HealthDepartment/HealthDepartment";

import SanitationDepartment from "./SanitationDepartment/SanitationDepartment";

import ElectricityDepartment from "./ElectricityDepartment/ElectricityDepartment";

import RoadTransportDepartment from "./RoadTransportDepartment/RoadTransportDepartment";

import DrainageWasteDepartment from "./DrainageWasteDepartment/DrainageWasteDepartment";

import OtherComplaintDepartment from "./OtherComplaintDepartment/OtherComplaintDepartment";

/* =====================================
   NORMALIZE DEPARTMENT
===================================== */

const normalizeDepartment = (
  department
) => {

  return department
    ?.toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

/* =====================================
   MAIN COMPONENT
===================================== */

const DepartmentRouter = ({
  user,
  setUser,
}) => {

  /* =====================================
     AUTH CHECK
  ===================================== */

  if (!user) {

    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  /* =====================================
     ROLE CHECK
  ===================================== */

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
     NORMALIZED DEPARTMENT
  ===================================== */

  const department =
    normalizeDepartment(
      user.department
    );

  console.log(
    "Normalized Department:",
    department
  );

  /* =====================================
     WATER SUPPLY
  ===================================== */

  if (

    [
      "water supply department",
      "water department",
      "water management department",
    ].includes(department)

  ) {

    return (

      <WaterDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     HEALTH
  ===================================== */

  if (

    [
      "health department",
      "medical department",
      "hospital department",
    ].includes(department)

  ) {

    return (

      <HealthDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     SANITATION
  ===================================== */

  if (

    [
      "sanitation department",
      "cleaning department",
      "waste cleaning department",
    ].includes(department)

  ) {

    return (

      <SanitationDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     ELECTRICITY
  ===================================== */

  if (

    [
      "electricity department",
      "electric department",
      "power department",
    ].includes(department)

  ) {

    return (

      <ElectricityDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     ROAD & TRANSPORT
  ===================================== */

  if (

    [
      "road department",
      "road transportation department",
      "road & transportation department",
      "transport department",
      "road and transport department",
    ].includes(department)

  ) {

    return (

      <RoadTransportDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     DRAINAGE + SEWAGE + GARBAGE
  ===================================== */

  if (

    [
      "drainage department",
      "drainage & sewage department",
      "sewage department",
      "drainage sewage department",
      "garbage collection department",
      "garbage department",
      "waste management department",
      "garbage management department",
      "drainage and sewage department",
    ].includes(department)

  ) {

    return (

      <DrainageWasteDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     OTHER COMPLAINTS
  ===================================== */

  if (

    [
      "other complaint department",
      "general complaint department",
      "general department",
      "other department",
    ].includes(department)

  ) {

    return (

      <OtherComplaintDepartment
        user={user}
        setUser={setUser}
      />
    );
  }

  /* =====================================
     UNKNOWN DEPARTMENT
  ===================================== */

  console.log(
    "❌ Unknown Department:",
    user.department
  );

  return (

    <div style={styles.errorContainer}>

      <div style={styles.errorCard}>

        <div style={styles.errorIcon}>
          ⚠️
        </div>

        <h2 style={styles.errorTitle}>
          Department Not Assigned
        </h2>

        <p style={styles.errorText}>

          Your department is not configured correctly.
          Please contact the system administrator.

        </p>

        <div style={styles.departmentBox}>

          {user.department ||
            "No Department"}

        </div>

      </div>

    </div>
  );
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

    minHeight: "100vh",

    background:
      "linear-gradient(135deg,#e2e8f0,#f8fafc)",

    padding: 20,
  },

  errorCard: {

    background:
      "rgba(255,255,255,0.95)",

    backdropFilter:
      "blur(12px)",

    padding: 40,

    borderRadius: 28,

    boxShadow:
      "0 10px 40px rgba(0,0,0,0.15)",

    textAlign: "center",

    width: 460,

    border:
      "1px solid rgba(255,255,255,0.3)",
  },

  errorIcon: {

    fontSize: 60,

    marginBottom: 16,
  },

  errorTitle: {

    marginBottom: 12,

    color: "#0f172a",

    fontSize: 30,

    fontWeight: 800,
  },

  errorText: {

    color: "#64748b",

    marginBottom: 24,

    fontSize: 16,

    lineHeight: 1.7,
  },

  departmentBox: {

    background:
      "linear-gradient(135deg,#dbeafe,#bfdbfe)",

    padding: 16,

    borderRadius: 14,

    fontWeight: 700,

    color: "#1e3a8a",

    fontSize: 15,

    wordBreak: "break-word",
  },
};

export default DepartmentRouter;