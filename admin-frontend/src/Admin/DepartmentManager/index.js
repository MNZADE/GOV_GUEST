import React from "react";
import { Navigate } from "react-router-dom";

import {
  WaterDepartment,
  HealthDepartment,
  SanitationDepartment,
  ElectricityDepartment,
} from "../Department";   // 👈 IMPORTANT PATH

const DepartmentRouter = ({ user, setUser }) => {
  if (!user || user.role !== "department_manager") {
    return <Navigate to="/" />;
  }

  switch (user.department) {
    case "Water Supply Department":
      return <WaterDepartment setUser={setUser} />;

    case "Health Department":
      return <HealthDepartment setUser={setUser} />;

    case "Sanitation Department":
      return <SanitationDepartment setUser={setUser} />;

    case "Electricity Department":
      return <ElectricityDepartment setUser={setUser} />;

    default:
      return <div>Department not assigned</div>;
  }
};

export default DepartmentRouter;
