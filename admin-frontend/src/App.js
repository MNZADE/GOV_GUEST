import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

/* ================= AUTH ================= */
import AdminLogin from "./Admin/Login";

/* ================= SYSTEM MANAGER ================= */
import SystemManagerDashboard from "./Admin/SystemManager/SystemManagerDashboard";
import ManagersPage from "./Admin/SystemManager/ManagersPage";
import AddManager from "./Admin/SystemManager/AddManager";

/* ================= DEPARTMENT ROUTER ================= */
import DepartmentRouter from "./Admin/DepartmentManager/DepartmentRouter";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      {/* ================= LOGIN ================= */}
      {!user && (
        <Route
          path="*"
          element={<AdminLogin setUser={setUser} />}
        />
      )}

      {/* ================= SYSTEM MANAGER ================= */}
      {user?.role === "system_manager" && (
        <>
          <Route path="/" element={<Navigate to="/system-manager" />} />

          <Route
            path="/system-manager"
            element={<SystemManagerDashboard setUser={setUser} />}
          />

          <Route
            path="/system-manager/managers"
            element={<ManagersPage />}
          />

          <Route
            path="/system-manager/add-manager"
            element={<AddManager />}
          />
        </>
      )}

      {/* ================= DEPARTMENT MANAGER ================= */}
      {user?.role === "department_manager" && (
        <>
          <Route path="/" element={<Navigate to="/department" />} />

          <Route
            path="/department"
            element={
              <DepartmentRouter user={user} setUser={setUser} />
            }
          />
        </>
      )}

      {/* ================= FALLBACK ================= */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;