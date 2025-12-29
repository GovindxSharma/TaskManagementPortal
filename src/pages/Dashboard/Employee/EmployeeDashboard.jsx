import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight, Settings, LogOut } from "lucide-react";
import { dashboardStats } from "../../../data/dashboardStats";
import Loader from "../../../components/layout/Loader";
import axiosInstance from "../../../api/axiosInstance";
import { loadDashboardStats } from "../../../data/dashboardStats";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [overdueClients, setOverdueClients] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [loadingOverdue, setLoadingOverdue] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id;

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
  await loadDashboardStats();
    if (!currentUserId) return;
    try {
      const res = await axiosInstance.get(
        `/notification/unreadCount/${currentUserId}`
      );
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  };

  // Fetch latest 5 notifications
  const fetchRecentNotifications = async () => {
    if (!currentUserId) return;
    setLoadingNotifications(true);
    try {
      const res = await axiosInstance.get(
        `/notification/recipient/${currentUserId}`
      );
      const notifications = res.data.data || [];
      notifications.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setRecentNotifications(notifications.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Fetch overdue clients
const fetchOverdueClients = async () => {
  setLoadingOverdue(true);
  try {
    const res = await axiosInstance.get("/client/overdue");
    const clients = res.data.data || [];
    // Sort by createdAt descending so latest overdue clients first
    clients.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setOverdueClients(clients.slice(0, 5));
  } catch (err) {
    console.error("Failed to fetch overdue clients:", err);
  } finally {
    setLoadingOverdue(false);
  }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };


  useEffect(() => {
    fetchUnreadCount();
    fetchRecentNotifications();
    fetchOverdueClients();
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [currentUserId]);

  const stats = dashboardStats.employee;
  const assignedTasks = [
    {
      task: "GST Filing for Acme Corp",
      dueDate: "Nov 12, 2025",
      status: "In Progress",
    },
    {
      task: "License Renewal for GreenLeaf Pvt Ltd",
      dueDate: "Nov 15, 2025",
      status: "Pending",
    },
    {
      task: "Password Rotation for ZenTax Advisors",
      dueDate: "Nov 5, 2025",
      status: "Completed",
    },
  ];

  const complianceList = [
    { client: "Acme Corp", progress: "80%", status: "In Progress" },
    { client: "GreenLeaf Pvt Ltd", progress: "100%", status: "Completed" },
    { client: "ZenTax Advisors", progress: "60%", status: "Pending" },
  ];

  if (loading) return <Loader fullscreen={true} size={250} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Employee Dashboard
        </h1>
        <div className="flex items-center">
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition"
            onClick={() => navigate("/employee/notifications")}
          >
            <Bell className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition ml-3"
            onClick={() => navigate("/employee/settings")}
          >
            <Settings className="text-gray-600" />
          </button>

          {/* Logout */}
          <button
            className="ml-3 bg-red-500 p-3 rounded-full shadow hover:shadow-md hover:bg-red-600 transition"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="text-white" />
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
                <p className="text-3xl font-semibold text-gray-800">
                  {s.value}
                </p>
              </div>
            </div>
            <ArrowRight className="text-gray-400 transition" />
          </div>
        ))}
      </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Assigned Tasks */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Assigned Tasks
          </h2>
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
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Notifications
          </h2>
          {loadingNotifications ? (
            <Loader fullscreen={false} size={100} />
          ) : recentNotifications.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              🎉 No new notifications!
            </p>
          ) : (
            <ul className="divide-y text-gray-700 text-sm">
              {recentNotifications.map((n, i) => (
                <li key={i} className="py-3 flex justify-between items-start">
                  <p className="font-medium">{n.message}</p>
                  <span className="text-gray-500 text-xs">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <button
            onClick={() => navigate("/employee/notifications")}
            className="text-indigo-600 text-sm font-medium mt-3 hover:underline"
          >
            View all notifications →
          </button>
        </div>

        {/* Compliance Tracker */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Compliance Tracker
          </h2>
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
                <tr
                  key={i}
                  className="border-b last:border-0 hover:bg-gray-50 transition"
                >
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Overdue Clients
          </h2>
          {loadingOverdue ? (
            <Loader fullscreen={false} size={100} />
          ) : overdueClients.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              🎉 No overdue clients!
            </p>
          ) : (
            <table className="w-full text-sm text-gray-700">
              <thead className="border-b text-gray-600">
                <tr>
                  <th className="pb-2 text-left">Client</th>
                  <th className="pb-2 text-left">Amount</th>
                </tr>
              </thead>
              <tbody>
                {overdueClients.map((o, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="py-2 font-medium">{o.name}</td>
                    <td className="font-semibold text-red-600">
                      ₹{o.overdueAmount?.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
