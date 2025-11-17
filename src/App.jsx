import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Loader from "./components/layout/Loader";
import Login from "./pages/auth/Login";

import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";

import { dashboardRoutes } from "./data/routes";

// Auth
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial loading splash (optional)
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Loader fullscreen={true} size={250} />;
  }

  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Routes>
            {/* Public Route */}
            <Route path="/" element={<Login />} />

            {/* ================= ADMIN ROUTES ================= */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute role="admin">
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {dashboardRoutes.admin.map((r) => (
              <Route
                key={r.path}
                path={r.path}
                element={
                  <ProtectedRoute role="admin">{r.element}</ProtectedRoute>
                }
              />
            ))}

            {/* ================= EMPLOYEE ROUTES ================= */}
            <Route
              path="/employee/dashboard"
              element={
                <ProtectedRoute role="employee">
                  <EmployeeDashboard />
                </ProtectedRoute>
              }
            />

            {dashboardRoutes.employee.map((r) => (
              <Route
                key={r.path}
                path={r.path}
                element={
                  <ProtectedRoute role="employee">{r.element}</ProtectedRoute>
                }
              />
            ))}

            {/* ================= ACCOUNTANT ROUTES ================= */}
            <Route
              path="/accountant/dashboard"
              element={
                <ProtectedRoute role="accountant">
                  <AccountantDashboard />
                </ProtectedRoute>
              }
            />

            {dashboardRoutes.accountant.map((r) => (
              <Route
                key={r.path}
                path={r.path}
                element={
                  <ProtectedRoute role="accountant">{r.element}</ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
