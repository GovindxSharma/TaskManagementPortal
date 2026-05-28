import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Settings, LogOut, Clock } from "lucide-react";
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
import axios from "../../../api/axiosInstance";
import Loader from "../../../components/layout/Loader.jsx";
import { loadDashboardStats } from "../../../data/dashboardStats.jsx";

const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentBills, setRecentBills] = useState([]);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingBills, setLoadingBills] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id;

  // Fetch unread notifications count
  const fetchUnreadCount = async () => {
      await loadDashboardStats();
    if (!currentUserId) return;
    try {
      const res = await axios.get(`/notification/unreadCount/${currentUserId}`);
      setUnreadCount(res.data.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread notifications:", err);
    }
  };

  // Fetch latest 5 pending bills
  const fetchPendingBills = async () => {
    setLoadingBills(true);
    try {
      const res = await axios.get("/monthly-compliance/bill-pending");
      const bills = res.data.clients || [];
      bills.sort(
        (a, b) =>
          b.year - a.year || parseInt(b.month, 10) - parseInt(a.month, 10)
      );
      setRecentBills(bills.slice(0, 5));
    } catch (err) {
      console.error("Failed to fetch pending bills:", err);
    } finally {
      setLoadingBills(false);
    }
  };

  // Fetch latest 5 notifications for user
const fetchRecentNotifications = async () => {
  if (!currentUserId) return;
  setLoadingNotifications(true);
  try {
    const res = await axios.get(`/notification/recipient/${currentUserId}`);
    const notifications = res.data.data || []; // <-- use .data instead of .notifications
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    setRecentNotifications(notifications.slice(0, 5));
  } catch (err) {
    console.error("Failed to fetch notifications:", err);
  } finally {
    setLoadingNotifications(false);
  }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };


  useEffect(() => {
    fetchUnreadCount();
    fetchPendingBills();
    fetchRecentNotifications();
  }, [currentUserId]);

  // Helper for month name
  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return !isNaN(month) ? months[parseInt(month, 10) - 1] : month;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Accountant Dashboard
        </h1>
        <div className="flex items-center">
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition mr-3 cursor-pointer"
            onClick={() => navigate("/accountant/reminders")}
            title="Reminders"
          >
            <Clock className="text-gray-600" />
          </button>
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition mr-3 cursor-pointer"
            onClick={() => navigate("/accountant/notifications")}
          >
            <Bell className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition cursor-pointer"
            onClick={() => navigate("/accountant/settings")}
          >
            <Settings className="text-gray-600" />
          </button>

          {/* Logout */}
          <button
            className="ml-3 bg-red-500 p-3 rounded-full shadow hover:shadow-md hover:bg-red-600 transition cursor-pointer"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="text-white" />
          </button>

        </div>
      </div>

      {/* Top Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-7 gap-6 mb-10">
        {dashboardStats.accountant.map((s, i) => (
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
          {loadingBills ? (
            <Loader fullscreen={false} size={100} />
          ) : recentBills.length === 0 ? (
            <p className="text-gray-500 text-center py-6">
              🎉 No pending bills!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="text-gray-600 border-b">
                    <th className="py-2 px-3">Client</th>
                    <th className="py-2 px-3">Month</th>
                    <th className="py-2 px-3">Year</th>
                    <th className="py-2 px-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBills.map((b, i) => (
                    <tr
                      key={i}
                      className="border-b last:border-none hover:bg-indigo-50/40 transition"
                      onClick={() =>
                        navigate(`/accountant/pending-bills/${b.clientId}`)
                      }
                    >
                      <td className="py-2 px-3 font-medium">{b.clientName}</td>
                      <td className="py-2 px-3">{getMonthName(b.month)}</td>
                      <td className="py-2 px-3">{b.year}</td>
                      <td className="py-2 px-3">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          {b.billStatus || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {recentNotifications.map((n, i) => (
                <li key={i}>{n.message}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
