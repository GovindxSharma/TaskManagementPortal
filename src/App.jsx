import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Loader from "./components/layout/Loader";
import Login from "./pages/auth/Login";

// Dashboards
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";

// Route config
import { dashboardRoutes } from "./data/routes";

// Auth
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// ✅ Import Toast
import { ToastProvider } from "./components/layout/ToastProvider.jsx";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader fullscreen size={250} />;

  return (
    <Router>
      <AuthProvider>
        {/* ✅ Wrap entire app so every route can trigger toast */}
        <ToastProvider>
          <div className="App">
            <Routes>
              {/* PUBLIC ROUTE */}
              <Route path="/" element={<Login />} />

              {/* ========================== ADMIN ROUTES ========================== */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              {dashboardRoutes.admin.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute role="admin">
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* ========================== EMPLOYEE ROUTES ======================= */}
              <Route
                path="/employee/dashboard"
                element={
                  <ProtectedRoute role="employee">
                    <EmployeeDashboard />
                  </ProtectedRoute>
                }
              />

              {dashboardRoutes.employee.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute role="employee">
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}

              {/* ========================== ACCOUNTANT ROUTES ====================== */}
              <Route
                path="/accountant/dashboard"
                element={
                  <ProtectedRoute role="accountant">
                    <AccountantDashboard />
                  </ProtectedRoute>
                }
              />

              {dashboardRoutes.accountant.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={
                    <ProtectedRoute role="accountant">
                      {route.element}
                    </ProtectedRoute>
                  }
                />
              ))}
            </Routes>
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
