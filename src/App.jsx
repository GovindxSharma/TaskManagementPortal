import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";
import { dashboardRoutes } from "./data/routes";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          {dashboardRoutes.admin.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}

          {/* Employee Dashboard */}
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          {dashboardRoutes.employee.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}

          {/* Accountant Dashboard */}
          <Route
            path="/accountant/dashboard"
            element={<AccountantDashboard />}
          />
          {dashboardRoutes.accountant.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
