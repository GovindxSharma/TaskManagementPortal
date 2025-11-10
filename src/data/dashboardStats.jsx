// src/data/dashboardStats.jsx
import React from "react";
import { Users, FileText, AlertCircle, Key, Award, Bell } from "lucide-react";

export const dashboardStats = {
  admin: [
    {
      title: "Total Clients",
      value: 42,
      icon: <Users className="text-blue-500" />,
      link: "/admin/clients",
    },
    {
      title: "Compliance Tracker",
      value: 12,
      icon: <FileText className="text-purple-500" />,
      link: "/admin/customer-compliance",
    },
    {
      title: "Employees",
      value: 15,
      icon: <Users className="text-green-500" />,
      link: "/admin/employees",
    },
    {
      title: "Open Tickets",
      value: 8,
      icon: <FileText className="text-orange-500" />,
      link: "/admin/tickets",
    },
    {
      title: "Overdue Clients",
      value: 5,
      icon: <AlertCircle className="text-red-500" />,
      link: "/admin/payments",
    },
    {
      title: "Passwords",
      value: 28,
      icon: <Key className="text-indigo-500" />,
      link: "/admin/passwords",
    },
    {
      title: "License Tracker",
      value: 18,
      icon: <Award className="text-teal-500" />,
      link: "/admin/license-tracker",
    },
  ],

  employee: [
    {
      title: "Compliance Tracker",
      value: 12,
      icon: <FileText className="text-purple-500" />,
      link: "/employee/compliance-tracker",
    },
    {
      title: "Tickets",
      value: 8,
      icon: <FileText className="text-orange-500" />,
      link: "/employee/tickets",
    },
    {
      title: "Overdue Clients",
      value: 5,
      icon: <AlertCircle className="text-red-500" />,
      link: "/employee/overdue-clients",
    },
    {
      title: "License Tracker",
      value: 18,
      icon: <Award className="text-teal-500" />,
      link: "/employee/license-tracker",
    },
    {
      title: "Passwords",
      value: 28,
      icon: <Key className="text-indigo-500" />,
      link: "/employee/passwords",
    },
    {
      title: "Data Received",
      value: 7,
      icon: <Users className="text-blue-500" />,
      link: "/employee/data-received",
    },
    {
      title: "In Progress",
      value: 4,
      icon: <Users className="text-yellow-500" />,
      link: "/employee/in-progress",
    },
  ],

  accountant: [
    {
      title: "Compliance Tracker",
      value: 12,
      icon: <FileText className="text-purple-500" />,
      link: "/accountant/compliance-tracker",
    },
    {
      title: "Tickets",
      value: 8,
      icon: <FileText className="text-orange-500" />,
      link: "/accountant/tickets",
    },
    {
      title: "Overdue Clients",
      value: 5,
      icon: <AlertCircle className="text-red-500" />,
      link: "/accountant/overdue-clients",
    },
    {
      title: "License Tracker",
      value: 18,
      icon: <Award className="text-teal-500" />,
      link: "/accountant/license-tracker",
    },
    {
      title: "Passwords",
      value: 28,
      icon: <Key className="text-indigo-500" />,
      link: "/accountant/passwords",
    },
    {
      title: "Bill Pending",
      value: 6,
      icon: <AlertCircle className="text-amber-500" />,
      link: "/accountant/bill-pending",
    },
  ],
};
