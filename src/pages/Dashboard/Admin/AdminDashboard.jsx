import { useNavigate } from "react-router-dom";
import { Bell, ArrowRight, Settings, LogOut } from "lucide-react";
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

  const [recentClients, setRecentClients] = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [expiringLicenses, setExpiringLicenses] = useState([]);
  const [overdueClients, setOverdueClients] = useState([]);
  const [clientStats, setClientStats] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const currentYear = new Date().getFullYear();

  const [selectedYear, setSelectedYear] = useState(currentYear);
  // const [revenueData, setRevenueData] = useState([]);

  const monthNames = {
    "01": "Jan",
    "02": "Feb",
    "03": "Mar",
    "04": "Apr",
    "05": "May",
    "06": "Jun",
    "07": "Jul",
    "08": "Aug",
    "09": "Sep",
    "10": "Oct",
    "11": "Nov",
    "12": "Dec",
  };

  const fetchUnreadCount = async () => {
    await loadDashboardStats();
    try {
      const res = await axios.get(`/notification/unreadCount/${user._id}`);
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

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

  const fetchExpiringLicenses = async () => {
    try {
      const res = await axios.get("/license");

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
    }
  };

  const fetchOverdueClients = async () => {
    try {
      const res = await axios.get("/client/overdue");
      setOverdueClients(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch overdue clients", err);
    }
  };

  const fetchClientStats = async () => {
    try {
      const res = await axios.get("/auth/client-monthly-stats");
      setClientStats(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch client stats", err);
    }
  };

const fetchRevenueData = async (year) => {
  try {
    const res = await axios.get(`/auth/revenue-monthly?year=${year}`);

    const formatted = (res.data.data || []).map((item) => ({
      month: monthNames[item.month] || item.month,
      revenue: item.revenue || 0,
    }));

    setRevenueData(formatted);
  } catch (err) {
    console.error("Failed to fetch revenue stats", err);
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    fetchUnreadCount();
    fetchRecentClients();
    fetchRecentTickets();
    fetchExpiringLicenses();
    fetchOverdueClients();
    fetchClientStats();
    fetchRevenueData();
  }, []);

useEffect(() => {
  fetchRevenueData(selectedYear);
}, [selectedYear]);

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
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full animate-pulse"></span>
            )}
          </button>
          <button
            className="relative bg-white p-3 rounded-full shadow hover:shadow-md transition ml-3"
            onClick={() => navigate("/admin/settings")}
          >
            <Settings className="text-gray-600" />
          </button>
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

      {/* Tables */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Clients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Clients
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentClients.map((c, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                      {c.name}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {c.email}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {c.contactNumber}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {/* Tickets + Overdue Clients */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {/* Recent Tickets */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Recent Tickets
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket ID
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTickets.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      #{t.ticketId || t._id}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {t.title}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {t.assignedTo?.name || "-"}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">
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

        {/* Overdue Clients */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Overdue Clients
          </h2>
          {overdueClients.length === 0 ? (
            <p className="text-gray-500 text-sm text-center">
              🎉 No overdue clients
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
                      Contact Person
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Overdue Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {overdueClients.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {c.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {c.contactPerson}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {c.email}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-semibold text-red-600">
                        ₹{c.overdueAmount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mt-10">
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

        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition">
          <div className="flex items-center gap-3 mb-4">
            <label className="text-sm font-medium text-gray-600">
              Select Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="border rounded-lg px-3 py-1.5 shadow-sm"
            >
              {[currentYear - 2, currentYear - 1, currentYear].map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
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
