import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Loader from "./components/layout/Loader";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";
import { dashboardRoutes } from "./data/routes";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate a short loading delay (you can replace with API/auth check)
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader fullscreen={true} size={250} />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login */}
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
