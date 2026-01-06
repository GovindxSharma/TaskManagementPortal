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
  const [expiringLicenses, setExpiringLicenses] = useState([]);
  const [loadingExpiring, setLoadingExpiring] = useState(true);
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

  const fetchExpiringLicenses = async () => {
    try {
      const res = await axiosInstance.get("/license");

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const nextMonth = (currentMonth + 1) % 12;
      const nextMonthYear = currentMonth === 11 ? currentYear + 1 : currentYear;

      const licenses = (res.data?.data || [])
        .filter((l) => {
          if (!l.endDate) return false;
          const expiry = new Date(l.endDate);
          const expiryMonth = expiry.getMonth();
          const expiryYear = expiry.getFullYear();
          return (
            (expiryMonth === currentMonth && expiryYear === currentYear) ||
            (expiryMonth === nextMonth && expiryYear === nextMonthYear)
          );
        })
        .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
        .slice(0, 5);

      setExpiringLicenses(licenses);
    } catch (err) {
      console.error("Failed to fetch expiring licenses", err);
    } finally {
      setLoadingExpiring(false);
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
  fetchExpiringLicenses();
  const timer = setTimeout(() => setLoading(false), 1200);
  return () => clearTimeout(timer);
}, [currentUserId]);


  const stats = dashboardStats.employee;
  
  if (loading) return <Loader fullscreen={true} size={250} />;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-8">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((s, i) => (
                <div
                  key={i}
                  onClick={() => navigate(s.link)}
                  className="group bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition">
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">{s.title}</p>
                      <p className="text-3xl font-semibold text-gray-800">
                        {s.value}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="text-gray-300 group-hover:text-gray-500 transition" />
                </div>
              ))}
            </div>

      {/* Panels */}
      <div className="grid md:grid-cols-2 gap-6">
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

        {/* Expiring Licenses */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Expiring Licenses
          </h2>
          {expiringLicenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              🎉 No licenses expiring soon
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expiringLicenses.map((l) => (
                    <tr key={l._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {l.client_id?.name || "-"}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {l.licenseName}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-red-600">
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
