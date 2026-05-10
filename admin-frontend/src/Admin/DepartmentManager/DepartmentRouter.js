import React from "react";
import { Navigate } from "react-router-dom";

import WaterDepartment from "./WaterDepartment/WaterDepartment";
import HealthDepartment from "./HealthDepartment/HealthDepartment";
import SanitationDepartment from "./SanitationDepartment/SanitationDepartment";
import ElectricityDepartment from "./ElectricityDepartment/ElectricityDepartment";

const DepartmentRouter = ({ user, setUser }) => {
  // 🔐 Role Protection
  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (user.role !== "department_manager") {
    return <Navigate to="/" replace />;
  }

  // 🔥 NORMALIZE DEPARTMENT STRING
  const dept = user.department?.toLowerCase().trim();

  // 🏢 Department Routing
  switch (dept) {
    case "water supply department":
      return <WaterDepartment user={user} setUser={setUser} />;

    case "health department":
      return <HealthDepartment user={user} setUser={setUser} />;

    case "sanitation department":
      return <SanitationDepartment user={user} setUser={setUser} />;

    case "electricity department":
      return <ElectricityDepartment user={user} setUser={setUser} />;

    default:
      console.log("❌ Unknown department:", user.department);

      return (
        <div style={{ padding: "40px", fontSize: "18px" }}>
          Department not assigned
        </div>
      );
  }
};

export default DepartmentRouter;