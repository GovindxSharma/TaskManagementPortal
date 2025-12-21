import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight, Settings } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { dashboardStats } from "../../../data/dashboardStats.jsx";
import axios from "../../../api/axiosInstance";
import React, { useEffect, useState } from "react";
import { loadDashboardStats } from "../../../data/dashboardStats.jsx";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  /* -------------------- NEW STATES -------------------- */
  const [recentClients, setRecentClients] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [clientStats, setClientStats] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  /* -------------------- NOTIFICATIONS -------------------- */
  const fetchUnreadCount = async () => {
    await loadDashboardStats();
    try {
      const res = await axios.get(`/notification/unreadCount/${user._id}`);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

  /* -------------------- RECENT CLIENTS -------------------- */
  const fetchRecentClients = async () => {
    try {
      const res = await axios.get(`/client?company_id=${user.company_id}`);
      const clients = (res.data?.data || res.data?.clients || [])
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 5);
      setRecentClients(clients);
    } catch (err) {
      console.error("Failed to fetch recent clients");
    }
  };

  /* -------------------- RECENT TICKETS -------------------- */
  const fetchRecentTickets = async () => {
    try {
      const res = await axios.get(`/ticket`);
      const tickets = (res.data?.tickets || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      setRecentTickets(tickets);
    } catch (err) {
      console.error("Failed to fetch recent tickets", err);
    }
  };

  /* -------------------- CLIENT STATS -------------------- */
  const fetchClientStats = async () => {
    try {
      const res = await axios.get("/auth/client-monthly-stats");
      setClientStats(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch client stats", err);
    }
  };

  /* -------------------- REVENUE DATA -------------------- */
  const fetchRevenueData = async () => {
    try {
      const res = await axios.get("/auth/revenue-monthly");
      setRevenueData(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch revenue stats", err);
    }
  };

  /* -------------------- LOAD ON MOUNT -------------------- */
  useEffect(() => {
    fetchUnreadCount();
    fetchRecentClients();
    fetchRecentTickets();
    fetchClientStats();
    fetchRevenueData();
  }, []);

  /* -------------------- STATS -------------------- */
  const stats = dashboardStats.admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Admin Dashboard
        </h1>

        <div className="flex items-center">
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition"
            onClick={() => navigate("/admin/notifications")}
          >
            <Bell className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full"></span>
            )}
          </button>

          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition ml-3"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
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

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Clients Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Clients
          </h2>
          <table className="w-full text-sm text-gray-700">
            <thead className="border-b text-gray-600">
              <tr>
                <th className="pb-2 text-left">Client</th>
                <th className="pb-2 text-left">Email</th>
                <th className="pb-2 text-left">Phone</th>
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
                  <td>{c.contactNumber}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent Tickets Table */}
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
                  <td className="py-2">#{t.ticketId || t._id}</td>
                  <td>{t.title}</td>
                  <td>{t.assignedTo?.name || "-"}</td>
                  <td>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        {/* Client Growth Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Client Growth Trend
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={clientStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="new"
                stroke="#4F46E5"
                strokeWidth={3}
                name="New Clients"
              />
              <Line
                type="monotone"
                dataKey="inactive"
                stroke="#EF4444"
                strokeWidth={3}
                name="Inactive Clients"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Monthly Revenue
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" name="Revenue (₹)" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
