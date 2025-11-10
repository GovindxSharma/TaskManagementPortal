import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ArrowRight,
  Settings,
} from "lucide-react";
import { dashboardStats } from "../../../data/dashboardStats";

export default function EmployeeDashboard() {
  const navigate = useNavigate();

  // ✅ centralized stats (dummy for now)
  const stats = dashboardStats.employee;

  const assignedTasks = [
    { task: "GST Filing for Acme Corp", dueDate: "Nov 12, 2025", status: "In Progress" },
    { task: "License Renewal for GreenLeaf Pvt Ltd", dueDate: "Nov 15, 2025", status: "Pending" },
    { task: "Password Rotation for ZenTax Advisors", dueDate: "Nov 5, 2025", status: "Completed" },
  ];

  const recentNotifications = [
    { message: "New task assigned: Income Tax filing for Zenith Corp", time: "2 hours ago" },
    { message: "Client GreenLeaf Pvt Ltd overdue by 3 days", time: "1 day ago" },
    { message: "Reminder: License renewal due tomorrow for Acme Corp", time: "3 days ago" },
  ];

  const complianceList = [
    { client: "Acme Corp", progress: "80%", status: "In Progress" },
    { client: "GreenLeaf Pvt Ltd", progress: "100%", status: "Completed" },
    { client: "ZenTax Advisors", progress: "60%", status: "Pending" },
  ];

  const overdueClients = [
    { client: "GreenLeaf Pvt Ltd", days: "3 days overdue", amount: "₹12,000" },
    { client: "FutureTax Pvt Ltd", days: "7 days overdue", amount: "₹18,500" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Employee Dashboard
        </h1>

        <div className="flex items-center">
          {/* Notifications */}
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition"
            onClick={() => navigate("/employee/notifications")}
          >
            <Bell className="text-gray-600" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
          </button>

          {/* Settings */}
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition ml-3"
            onClick={() => navigate("/employee/settings")}
          >
            <Settings className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-6 mb-10">
        {stats.map((s, i) => (
          <div
            key={i}
            onClick={() => navigate(s.link)}
            className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-6 flex items-center justify-between border border-gray-100 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">{s.icon}</div>
              <div>
                <p className="text-gray-500 text-sm">{s.title}</p>
                <p className="text-3xl font-semibold text-gray-800">{s.value}</p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 transition" />
          </div>
        ))}
      </div>

      {/* 4 Easy Access Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Assigned Tasks</h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Task</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-left">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {assignedTasks.map((t, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="py-2 font-medium">{t.task}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>{t.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Notifications</h2>
          <ul className="divide-y text-gray-700 text-sm">
            {recentNotifications.map((n, i) => (
              <li key={i} className="py-3 flex justify-between items-start">
                <p className="font-medium">{n.message}</p>
                <span className="text-gray-500 text-xs">{n.time}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/employee/notifications")}
            className="text-indigo-600 text-sm font-medium mt-3 hover:underline"
          >
            View all notifications →
          </button>
        </div>

        {/* Compliance Tracker */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Compliance Tracker</h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Client</th>
                <th className="pb-2 text-left">Progress</th>
                <th className="pb-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {complianceList.map((c, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="py-2 font-medium">{c.client}</td>
                  <td>{c.progress}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : c.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Overdue Clients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Overdue Clients</h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Client</th>
                <th className="pb-2 text-left">Overdue By</th>
                <th className="pb-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              {overdueClients.map((o, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="py-2 font-medium">{o.client}</td>
                  <td>{o.days}</td>
                  <td className="font-semibold text-red-600">{o.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
