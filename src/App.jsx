import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import Clients from "./pages/Dashboard/Admin/ClientManagement.jsx";
import Employees from "./pages/Dashboard/Admin/EmployeeManagement.jsx";
import Ticket from "./components/Tickets/Tickets.jsx";
import OverdueClients from "./components/OverdueClients/OverdueClients.jsx";
import CustomerCompliance from "./components/ComplianceTracker/CustomerCompliance.jsx";
import PasswordsSection from "./components/Passwords/PasswordsSection.jsx";
import LicenseTrackerSection from "./components/LicenseTracker/LicenseTrackerSection.jsx";

import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";

import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import CustomerDetails from "./components/ComplianceTracker/ClientDetail.jsx"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Login Page */}
          <Route path="/" element={<Login />} />

          {/* Admin Dashboard */}
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/employees" element={<Employees />} />
          <Route path="/admin/tickets" element={<Ticket />} />
          <Route path="/admin/payments" element={<OverdueClients />} />
          <Route
            path="/admin/customer-compliance"
            element={<CustomerCompliance />}
          />
          <Route path="/admin/customer/:id" element={<CustomerDetails />} />
          <Route path="/admin/passwords" element={<PasswordsSection />} />
          <Route
            path="/admin/license-tracker"
            element={<LicenseTrackerSection />}
          />
          <Route
            path="/accountant/dashboard"
            element={<AccountantDashboard />}
          />
          <Route path="/accountant/clients" element={<Clients />} />
          <Route path="/accountant/tickets" element={<Ticket />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/tickets" element={<Ticket />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
