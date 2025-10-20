import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard/Admin/AdminDashboard";
import Clients from "./pages/Dashboard/Admin/Clients";
import Employees from "./pages/Dashboard/Admin/Employees";
import Ticket from "./pages/Dashboard/Admin/Tickets";
import Payments from "./pages/Dashboard/Admin/Payments";

import AccountantDashboard from "./pages/Dashboard/Accountant/AccountantDashboard";
import AccountantClients from "./pages/Dashboard/Accountant/AccountantClients";
import AccountantTickets from "./pages/Dashboard/Accountant/AccountantTickets";
import EmployeeDashboard from "./pages/Dashboard/Employee/EmployeeDashboard";
import EmployeeTickets from "./pages/Dashboard/Employee/EmployeeTickets";

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
          <Route path="/admin/payments" element={<Payments />} />
          <Route
            path="/accountant/dashboard"
            element={<AccountantDashboard />}
          />
          <Route path="/accountant/clients" element={<AccountantClients />} />
          <Route path="/accountant/tickets" element={<AccountantTickets />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/tickets" element={<EmployeeTickets />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
