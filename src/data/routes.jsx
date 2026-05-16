// src/data/routes.js
import Clients from "../pages/Dashboard/Admin/ClientManagement.jsx";
import Employees from "../pages/Dashboard/Admin/EmployeeManagement.jsx";
import Ticket from "../components/Tickets/Tickets.jsx";
import OverdueClients from "../components/OverdueClients/OverdueClients.jsx";
import CustomerCompliance from "../components/ComplianceTracker/CustomerCompliance.jsx";
import CustomerDetails from "../components/ComplianceTracker/ClientDetail.jsx";
import PasswordsSection from "../components/Passwords/PasswordsSection.jsx";
import LicenseTrackerSection from "../components/LicenseTracker/LicenseTrackerSection.jsx";
import SettingsPage from "../components/Settings/SettingsPage.jsx";
import NotificationsPage from "../components/Notifications/NotificationPage.jsx";
import PendingBills from "../components/Pendingbills/PendingBills.jsx";
import DataReceived from "../components/DataReceived/DataReceived.jsx";
import DataComplete from "../components/DataComplete/DataComplete.jsx";
import Reports from "../pages/Dashboard/Admin/Report.jsx";
import NoOfWorkers from "../components/Reports/NoOfWorkerReport.jsx";
import CategoryReport from "../components/Reports/CategoryWiseReport.jsx";
import CategoryDetails from "../components/Reports/CategoryDetails.jsx";
import SendEmail from "../pages/Dashboard/Admin/SendEmail.jsx";

export const dashboardRoutes = {
  admin: [
    { path: "/admin/clients", element: <Clients /> },
    { path: "/admin/employees", element: <Employees /> },
    { path: "/admin/tickets", element: <Ticket /> },
    { path: "/admin/payments", element: <OverdueClients /> },
    { path: "/admin/customer-compliance", element: <CustomerCompliance /> },
    { path: "/admin/customer/:id", element: <CustomerDetails /> },
    { path: "/admin/passwords", element: <PasswordsSection /> },
    { path: "/admin/license-tracker", element: <LicenseTrackerSection /> },
    { path: "/admin/notifications", element: <NotificationsPage /> },
    { path: "/admin/settings", element: <SettingsPage /> },
    { path: "/admin/bill-pending", element: <PendingBills /> },
    { path: "/admin/reports", element: <Reports /> },
    { path: "/admin/reports/workers", element: <NoOfWorkers /> },
    { path: "/admin/reports/category", element: <CategoryReport /> },
    { path: "/admin/reports/category/:id", element: <CategoryDetails /> },
    { path: "/admin/send-email", element: <SendEmail /> },
  ],

  employee: [
    { path: "/employee/tickets", element: <Ticket /> },
    { path: "/employee/overdue-clients", element: <OverdueClients /> },
    { path: "/employee/compliance-tracker", element: <CustomerCompliance /> },
    { path: "/employee/customer/:id", element: <CustomerDetails /> },
    { path: "/employee/passwords", element: <PasswordsSection /> },
    { path: "/employee/license-tracker", element: <LicenseTrackerSection /> },
    { path: "/employee/notifications", element: <NotificationsPage /> },
    { path: "/employee/settings", element: <SettingsPage /> },
    { path: "/employee/data-received", element: <DataReceived /> },
    { path: "/employee/data-complete", element: <DataComplete /> },
    { path: "/employee/send-email", element: <SendEmail /> },
  ],

  accountant: [
    { path: "/accountant/tickets", element: <Ticket /> },
    { path: "/accountant/overdue-clients", element: <OverdueClients /> },
    { path: "/accountant/compliance-tracker", element: <CustomerCompliance /> },
    { path: "/accountant/customer/:id", element: <CustomerDetails /> },
    { path: "/accountant/passwords", element: <PasswordsSection /> },
    { path: "/accountant/license-tracker", element: <LicenseTrackerSection /> },
    { path: "/accountant/notifications", element: <NotificationsPage /> },
    { path: "/accountant/settings", element: <SettingsPage /> },
    { path: "/accountant/bill-pending", element: <PendingBills /> },
  ],
};
