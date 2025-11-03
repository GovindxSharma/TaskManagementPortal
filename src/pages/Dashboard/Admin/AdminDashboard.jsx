import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  AlertCircle,
  CreditCard,
  Bell,
  ArrowRight,
  X,
} from "lucide-react";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const stats = [
    {
      title: "Total Clients",
      value: 42,
      icon: <Users className="text-blue-500" />,
      link: "/admin/clients",
    },
    {
      title: "Compliance Tracker",
      value: 12,
      icon: <Users className="text-purple-500" />,
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
      title: "Overdue Payments",
      value: 5,
      icon: <AlertCircle className="text-red-500" />,
      link: "/admin/payments",
    },
  ];

  const recentClients = [
    {
      name: "Acme Corp",
      email: "billing@acme.com",
      status: "Active",
      assigned: "Amit Verma",
    },
    {
      name: "GreenLeaf Pvt Ltd",
      email: "contact@greenleaf.in",
      status: "Pending",
      assigned: "Riya Sharma",
    },
    {
      name: "ZenTax Advisors",
      email: "info@zentax.com",
      status: "Active",
      assigned: "Arjun Mehta",
    },
  ];

  const recentTickets = [
    {
      id: "#TCK1021",
      subject: "GST filing delay",
      assigned: "Riya Sharma",
      status: "Open",
    },
    {
      id: "#TCK1022",
      subject: "Invoice correction",
      assigned: "Arjun Mehta",
      status: "In Progress",
    },
    {
      id: "#TCK1023",
      subject: "Client onboarding",
      assigned: "Amit Verma",
      status: "Completed",
    },
  ];

  const notifications = [
    "Bill generated for Acme Corp — ₹12,000",
    "Overdue payment: GreenLeaf Pvt Ltd (3 days)",
    "New task assigned to Riya Sharma",
    "Reminder email sent to ZenTax Advisors (inactive 2+ months)",
    "Ticket #TCK1023 marked completed by Amit Verma",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Admin Dashboard
        </h1>
        <button
          className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition"
          onClick={() => setShowNotifications(true)}
        >
          <Bell className="text-gray-600" />
          <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
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
            <ArrowRight className="text-gray-400 group-hover:text-blue-500 transition" />
          </div>
        ))}
      </div>

      {/* Clients & Tickets */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Clients
          </h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Client</th>
                <th className="pb-2 text-left">Email</th>
                <th className="pb-2 text-left">Status</th>
                <th className="pb-2 text-left">Assigned</th>
              </tr>
            </thead>
            <tbody>
              {recentClients.map((c, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="py-2 font-medium">{c.name}</td>
                  <td>{c.email}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>{c.assigned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Tickets
          </h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Ticket ID</th>
                <th className="pb-2 text-left">Subject</th>
                <th className="pb-2 text-left">Assigned</th>
                <th className="pb-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTickets.map((t, i) => (
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
                  <td className="py-2">{t.id}</td>
                  <td>{t.subject}</td>
                  <td>{t.assigned}</td>
                  <td>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "Open"
                          ? "bg-red-100 text-red-700"
                          : t.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
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

      {/* Notifications Modal */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start pt-6 z-50">
          <div className="bg-white rounded-xl shadow-lg w-[1200px] max-w-[95%] h-[160vh] max-h-[95vh] overflow-y-auto p-10 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setShowNotifications(false)}
            >
              <X />
            </button>
            <h2 className="text-3xl font-semibold mb-6 text-gray-800">
              Notifications
            </h2>
            <ul className="space-y-5">
              {notifications.map((note, i) => (
                <li
                  key={i}
                  className="flex items-start gap-4 bg-gray-50 hover:bg-gray-100 rounded-lg p-5 transition"
                >
                  <CreditCard size={24} className="text-blue-500 mt-0.5" />
                  <span className="text-gray-700 text-lg">{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
