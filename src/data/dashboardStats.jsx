// src/data/dashboardStats.jsx
import React from "react";
import { Users, FileText, AlertCircle, Key, Award } from "lucide-react";
import axios from "../api/axiosInstance";

// Default stats structure with icons and links
const dashboardStats = {
  admin: [
    {
      title: "Total Clients",
      value: 0,
      icon: <Users className="text-blue-500" />,
      link: "/admin/clients",
    },
    {
      title: "Compliance Tracker",
      value: 0,
      icon: <FileText className="text-purple-500" />,
      link: "/admin/customer-compliance",
    },
    {
      title: "Employees",
      value: 0,
      icon: <Users className="text-green-500" />,
      link: "/admin/employees",
    },
    {
      title: "Open Tickets",
      value: 0,
      icon: <FileText className="text-orange-500" />,
      link: "/admin/tickets",
    },
    {
      title: "Overdue Clients",
      value: 0,
      icon: <AlertCircle className="text-red-500" />,
      link: "/admin/payments",
    },
    {
      title: "Passwords",
      value: 0,
      icon: <Key className="text-indigo-500" />,
      link: "/admin/passwords",
    },
    {
      title: "License Tracker",
      value: 0,
      icon: <Award className="text-teal-500" />,
      link: "/admin/license-tracker",
    },
  ],

  accountant: [
    {
      title: "Compliance Tracker",
      value: 0,
      icon: <FileText className="text-purple-500" />,
      link: "/accountant/compliance-tracker",
    },
    {
      title: "Tickets",
      value: 0,
      icon: <FileText className="text-orange-500" />,
      link: "/accountant/tickets",
    },
    {
      title: "Overdue Clients",
      value: 0,
      icon: <AlertCircle className="text-red-500" />,
      link: "/accountant/overdue-clients",
    },
    {
      title: "License Tracker",
      value: 0,
      icon: <Award className="text-teal-500" />,
      link: "/accountant/license-tracker",
    },
    {
      title: "Passwords",
      value: 0,
      icon: <Key className="text-indigo-500" />,
      link: "/accountant/passwords",
    },
    {
      title: "Bill Pending",
      value: 0,
      icon: <AlertCircle className="text-amber-500" />,
      link: "/accountant/bill-pending",
    },
  ],

  employee: [
    {
      title: "Compliance Tracker",
      value: 0,
      icon: <FileText className="text-purple-500" />,
      link: "/employee/compliance-tracker",
    },
    {
      title: "Tickets",
      value: 0,
      icon: <FileText className="text-orange-500" />,
      link: "/employee/tickets",
    },
    {
      title: "Overdue Clients",
      value: 0,
      icon: <AlertCircle className="text-red-500" />,
      link: "/employee/overdue-clients",
    },
    {
      title: "License Tracker",
      value: 0,
      icon: <Award className="text-teal-500" />,
      link: "/employee/license-tracker",
    },
    {
      title: "Passwords",
      value: 0,
      icon: <Key className="text-indigo-500" />,
      link: "/employee/passwords",
    },
    {
      title: "Data Received",
      value: 0,
      icon: <Users className="text-blue-500" />,
      link: "/employee/data-received",
    },
    {
      title: "Data Complete",
      value: 0,
      icon: <Users className="text-yellow-500" />,
      link: "/employee/data-complete",
    },
  ],
};

// ✅ THIS is the important addition
export async function loadDashboardStats() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user?.role) return;

  try {
    const res = await axios.get("/auth/dashboard-stats");
    const data = res.data?.data || {};

    if (user.role === "Admin") {
      dashboardStats.admin[0].value = data.totalClients || 0;
      dashboardStats.admin[1].value = data.complianceTracker || 0;
      dashboardStats.admin[2].value = data.employees || 0;
      dashboardStats.admin[3].value = data.openTickets || 0;
      dashboardStats.admin[4].value = data.overdueClients || 0;
      dashboardStats.admin[5].value = data.passwords || 0;
      dashboardStats.admin[6].value = data.licenses || 0;
    }

    if (user.role === "Accountant") {
      dashboardStats.accountant[0].value = data.complianceTracker || 0;
      dashboardStats.accountant[1].value = data.openTickets || 0;
      dashboardStats.accountant[2].value = data.overdueClients || 0;
      dashboardStats.accountant[3].value = data.licenses || 0;
      dashboardStats.accountant[4].value = data.passwords || 0;
      dashboardStats.accountant[5].value = data.billPending || 0;
    }

    if (user.role === "Employee") {
      dashboardStats.employee[0].value = data.complianceTracker || 0;
      dashboardStats.employee[1].value = data.openTickets || 0;
      dashboardStats.employee[2].value = data.overdueClients || 0;
      dashboardStats.employee[3].value = data.licenses || 0;
      dashboardStats.employee[4].value = data.passwords || 0;
      dashboardStats.employee[5].value = data.dataReceived || 0;
      dashboardStats.employee[6].value = data.dataComplete || 0;
    }
  } catch (err) {
    console.error("Failed to fetch dashboard stats:", err);
  }
}

export { dashboardStats };
