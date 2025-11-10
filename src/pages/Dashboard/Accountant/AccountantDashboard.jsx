import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Settings } from "lucide-react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";


import { dashboardStats } from "../../../data/dashboardStats.jsx";

const AccountantDashboard = () => {
  const navigate = useNavigate();

  // Use centralized stats
  const stats = dashboardStats.accountant;

  // Dummy data for bottom panels
  const recentTasks = [
    {
      client: "Aarav Enterprises",
      description: "Generate bill for October data",
      deadline: "2025-10-25",
      status: "Pending",
    },
    {
      client: "BlueSky Corp",
      description: "Verify processed data & generate bill",
      deadline: "2025-10-22",
      status: "In Progress",
    },
    {
      client: "VisionTech",
      description: "Mark overdue client & notify team",
      deadline: "2025-10-18",
      status: "Completed",
    },
  ];

  const notifications = [
    "Data processing complete: Aarav Enterprises",
    "BlueSky Corp pending bill generated",
    "New overdue client added: VisionTech",
    "Ticket #TCK204 updated",
    "License renewal required for GreenLeaf Pvt Ltd",
  ];

  const overdueClients = [
    { name: "GreenLeaf Pvt Ltd", days: 3 },
    { name: "ZenTax Advisors", days: 7 },
  ];

  const complianceStats = [
    { month: "Jan", processed: 10, pending: 5 },
    { month: "Feb", processed: 12, pending: 3 },
    { month: "Mar", processed: 8, pending: 6 },
    { month: "Apr", processed: 15, pending: 2 },
    { month: "May", processed: 18, pending: 4 },
    { month: "Jun", processed: 14, pending: 3 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Accountant Dashboard
        </h1>
        <div className="flex items-center">
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition mr-3"
            onClick={() => navigate("/accountant/notifications")}
          >
            <Bell className="text-gray-600" />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
          </button>
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition"
            onClick={() => navigate("/accountant/settings")}
          >
            <Settings className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Top Cards - Dynamic */}
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
                <p className="text-3xl font-semibold text-gray-800">
                  {s.value}
                </p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 transition" />
          </div>
        ))}
      </div>

      {/* Bottom Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pending Bills */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Pending Bills
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Task</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentTasks.map((t, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-none hover:bg-indigo-50/40 transition"
                  >
                    <td className="py-3 px-4 font-medium">{t.client}</td>
                    <td className="py-3 px-4">{t.description}</td>
                    <td className="py-3 px-4 text-gray-500">{t.deadline}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full ${
                          t.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : t.status === "In Progress"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Notifications
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {notifications.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        </div>

        {/* Overdue Clients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Overdue Clients
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-gray-700">
            {overdueClients.map((o, i) => (
              <li key={i}>
                {o.name} - {o.days} day(s) overdue
              </li>
            ))}
          </ul>
        </div>

        {/* Compliance Tracker Mini */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Compliance Tracker
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={complianceStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="processed"
                stroke="#4F46E5"
                name="Processed"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="pending"
                stroke="#EF4444"
                name="Pending"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
