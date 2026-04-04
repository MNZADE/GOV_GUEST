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

  // 🏢 Department Routing
  switch (user.department) {
    case "Water Supply Department":
      return <WaterDepartment user={user} setUser={setUser} />;

    case "Health Department":
      return <HealthDepartment user={user} setUser={setUser} />;

    case "Sanitation Department":
      return <SanitationDepartment user={user} setUser={setUser} />;

    case "Electricity Department":
      return <ElectricityDepartment user={user} setUser={setUser} />;

    default:
      return (
        <div style={{ padding: "40px", fontSize: "18px" }}>
          Department not assigned
        </div>
      );
  }
};

export default DepartmentRouter;