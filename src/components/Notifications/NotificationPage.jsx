import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  Check,
  ChevronDown,
  Bell,
  AlertCircle,
  UserPlus,
  Edit3,
  Clock,
  CheckCircle,
  Eye,
  EyeOff,
  Loader,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useToast } from "../layout/ToastProvider.jsx";

const NOTIFICATION_TYPES = {
  "Client Added": {
    icon: UserPlus,
    color: "from-emerald-50 to-emerald-100",
    accent: "text-emerald-600",
    badge: "bg-emerald-100 text-emerald-700",
  },
  "Client Updated": {
    icon: Edit3,
    color: "from-blue-50 to-blue-100",
    accent: "text-blue-600",
    badge: "bg-blue-100 text-blue-700",
  },
  "Employee Added": {
    icon: UserPlus,
    color: "from-purple-50 to-purple-100",
    accent: "text-purple-600",
    badge: "bg-purple-100 text-purple-700",
  },
  "Employee Updated": {
    icon: Edit3,
    color: "from-indigo-50 to-indigo-100",
    accent: "text-indigo-600",
    badge: "bg-indigo-100 text-indigo-700",
  },
  "Payment Received": {
    icon: CheckCircle,
    color: "from-green-50 to-green-100",
    accent: "text-green-600",
    badge: "bg-green-100 text-green-700",
  },
  Alert: {
    icon: AlertCircle,
    color: "from-red-50 to-red-100",
    accent: "text-red-600",
    badge: "bg-red-100 text-red-700",
  },
};

// Utility: Format relative time
const formatRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return then.toLocaleDateString();
};

// Utility: Format full date
const formatFullDate = (date) => {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function NotificationsPage({ onStatusChange }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("compact"); // compact or detailed
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null); // Track expanded notification
  const [loadingDetails, setLoadingDetails] = useState(null); // Track which notification is loading details
  const [notificationDetails, setNotificationDetails] = useState({}); // Cache for detailed data

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id;

  // 🔸 Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`/notification/unreadCount/${currentUserId}`);
      onStatusChange?.(res.data.count);
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

  // 🔸 Fetch detailed notification data
  const fetchNotificationDetails = async (notificationId) => {
    // Check if already cached
    if (notificationDetails[notificationId]) {
      setExpandedId(expandedId === notificationId ? null : notificationId);
      return;
    }

    setLoadingDetails(notificationId);
    try {
      // Simulate API call to fetch details
      // Replace with actual endpoint: GET /notification/{notificationId}
      const res = await axios.get(`/notification/${notificationId}`);

      setNotificationDetails((prev) => ({
        ...prev,
        [notificationId]: res.data.data,
      }));
      setExpandedId(expandedId === notificationId ? null : notificationId);
    } catch (err) {
      console.error("Failed to fetch notification details");
      toast.error("Failed to load notification details");
    } finally {
      setLoadingDetails(null);
    }
  };

  // 🔸 Load notifications
  useEffect(() => {
    if (!currentUserId) return;

    const loadNotifications = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`/notification/recipient/${currentUserId}`);
        setNotifications(res.data.data);
        fetchUnreadCount();
      } catch {
        toast.error("Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
  }, [currentUserId]);

  // 🔸 Filter & Sort
  const filteredNotifications = notifications
    .filter(
      (n) =>
        (filter === "all" || n.type === filter) &&
        (n.message.toLowerCase().includes(search.toLowerCase()) ||
          n.type.toLowerCase().includes(search.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === "unread") {
        return a.isRead - b.isRead;
      }
      return 0;
    });

  // 🔸 Get unique notification types
  const notificationTypes = [
    "all",
    ...new Set(notifications.map((n) => n.type)),
  ];

  // 🔸 Stats
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount = notifications.filter((n) => n.isRead).length;

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // 🔸 SMART SELECT
  const selectAll = () => setSelected(filteredNotifications.map((n) => n._id));
  const selectUnread = () =>
    setSelected(
      filteredNotifications.filter((n) => !n.isRead).map((n) => n._id),
    );
  const selectRead = () =>
    setSelected(
      filteredNotifications.filter((n) => n.isRead).map((n) => n._id),
    );
  const clearSelection = () => setSelected([]);

  // 🔸 MARK AS READ
  const markAsRead = async () => {
    try {
      await Promise.all(
        selected.map((id) => axios.put(`/notification/read/${id}`)),
      );

      setNotifications((prev) =>
        prev.map((n) =>
          selected.includes(n._id) ? { ...n, isRead: true } : n,
        ),
      );

      setSelected([]);
      toast.success("Selected notifications marked as read");
      fetchUnreadCount();
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  // 🔸 MARK AS UNREAD
  const markAsUnread = async () => {
    try {
      await Promise.all(
        selected.map((id) => axios.put(`/notification/unread/${id}`)),
      );

      setNotifications((prev) =>
        prev.map((n) =>
          selected.includes(n._id) ? { ...n, isRead: false } : n,
        ),
      );

      setSelected([]);
      toast.success("Selected notifications marked as unread");
      fetchUnreadCount();
    } catch {
      toast.error("Failed to mark notifications as unread");
    }
  };

  // 🔸 DELETE NOTIFICATIONS
  const deleteNotifications = () => {
    if (!selected.length) return;

    toast.confirmDelete({
      message: `Delete ${selected.length} notification(s)?`,
      onConfirm: async () => {
        try {
          await Promise.all(
            selected.map((id) => axios.delete(`/notification/${id}`)),
          );

          setNotifications((prev) =>
            prev.filter((n) => !selected.includes(n._id)),
          );

          setSelected([]);
          toast.success("Notifications deleted");
          fetchUnreadCount();
        } catch (err) {
          console.error("Delete error:", err);
          toast.error("Failed to delete notifications");
        }
      },
    });
  };

  const getNotificationConfig = (type) => {
    return NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES["Alert"];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                <Bell size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Notifications
                </h1>
                <p className="text-sm text-slate-500">
                  {unreadCount} unread · {notifications.length} total
                </p>
              </div>
            </div>
            <button
              className="p-2 hover:bg-slate-100 rounded-lg transition"
              onClick={() => navigate(-1)}
            >
              <X size={20} className="text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {notifications.length}
                </p>
              </div>
              <Bell className="text-blue-500" size={28} opacity={0.6} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unread</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {unreadCount}
                </p>
              </div>
              <EyeOff className="text-amber-500" size={28} opacity={0.6} />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Read</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">
                  {readCount}
                </p>
              </div>
              <Eye className="text-emerald-500" size={28} opacity={0.6} />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
          {/* Search & Filter Row */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search notifications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              {notificationTypes.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <select
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="unread">Unread First</option>
            </select>

            <button
              onClick={() =>
                setViewMode(viewMode === "compact" ? "detailed" : "compact")
              }
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-slate-700 transition"
            >
              {viewMode === "compact" ? "Details" : "Compact"}
            </button>
          </div>

          {/* Selection & Actions */}
          {selected.length > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-4 border-t border-slate-200">
              <div className="text-sm font-medium text-slate-700">
                {selected.length} selected
              </div>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={selectAll}
                  className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                >
                  Select All
                </button>
                <button
                  onClick={selectUnread}
                  className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                >
                  Unread
                </button>
                <button
                  onClick={selectRead}
                  className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                >
                  Read
                </button>
                <button
                  onClick={clearSelection}
                  className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                >
                  Clear
                </button>

                <div className="w-px bg-slate-300"></div>

                <button
                  onClick={markAsRead}
                  className="px-4 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition flex items-center gap-1"
                >
                  <Check size={16} /> Mark Read
                </button>

                <button
                  onClick={markAsUnread}
                  className="px-4 py-1.5 text-sm bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition flex items-center gap-1"
                >
                  <EyeOff size={16} /> Mark Unread
                </button>

                <button
                  onClick={deleteNotifications}
                  className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center gap-1"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-16 h-16 mb-4">
                  <Loader size={64} className="text-blue-500 animate-spin" />
                </div>
                <p className="text-slate-700 font-medium text-lg">
                  Loading notifications...
                </p>
                <p className="text-sm text-slate-500 mt-2">
                  Please wait while we fetch your notifications
                </p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12">
              <div className="text-center">
                <Bell className="mx-auto text-slate-300 mb-3" size={40} />
                <p className="text-slate-500 font-medium">
                  No notifications found
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {search
                    ? "Try adjusting your search filters"
                    : "You're all caught up!"}
                </p>
              </div>
            </div>
          ) : (
            filteredNotifications.map((n) => {
              const config = getNotificationConfig(n.type);
              const Icon = config.icon;

              return (
                <div
                  key={n._id}
                  className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer ${
                    selected.includes(n._id)
                      ? "ring-2 ring-blue-500 border-blue-300"
                      : !n.isRead
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-slate-200"
                  }`}
                >
                  <div className="p-5">
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={selected.includes(n._id)}
                        onChange={() => toggleSelect(n._id)}
                        className="w-5 h-5 mt-1 cursor-pointer accent-blue-500"
                      />

                      {/* Icon */}
                      <div
                        className={`p-3 rounded-lg flex-shrink-0 bg-gradient-to-br ${config.color}`}
                      >
                        <Icon className={`${config.accent}`} size={20} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-semibold text-slate-900 ${
                              !n.isRead ? "font-bold" : ""
                            }`}
                          >
                            {n.type}
                          </span>
                          {!n.isRead && (
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-1 rounded ${config.badge}`}
                          >
                            {n.type}
                          </span>
                        </div>

                        <p className="text-slate-700 text-sm mb-2">
                          {n.message}
                        </p>

                        {viewMode === "detailed" && (
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-xs text-slate-500">
                            <div className="flex items-center gap-1">
                              <Clock size={14} />
                              <span>{formatFullDate(n.createdAt)}</span>
                            </div>
                            {/* {n.client_id && (
                              <div className="flex items-center gap-1">
                                <span>Client ID: {n.client_id.slice(-6)}</span>
                              </div>
                            )}
                            {n.company_id && (
                              <div className="flex items-center gap-1">
                                <span>
                                  Company ID: {n.company_id.slice(-6)}
                                </span>
                              </div>
                            )} */}
                          </div>
                        )}
                      </div>

                      {/* Time & Status */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-slate-500 font-medium">
                          {formatRelativeTime(n.createdAt)}
                        </p>
                        {!n.isRead && (
                          <p className="text-xs text-blue-600 font-semibold mt-1">
                            Unread
                          </p>
                        )}
                        {/* Expand button */}
                        <button
                          onClick={() => fetchNotificationDetails(n._id)}
                          className="mt-2 text-xs text-blue-500 hover:text-blue-700 font-medium transition"
                        >
                          {expandedId === n._id ? "Hide" : "Details"}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details Section */}
                    {expandedId === n._id && (
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        {loadingDetails === n._id ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader
                              size={24}
                              className="text-blue-500 animate-spin mr-3"
                            />
                            <p className="text-slate-600 text-sm font-medium">
                              Loading details...
                            </p>
                          </div>
                        ) : notificationDetails[n._id] ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Full Timestamp */}
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 font-semibold mb-1">
                                  Timestamp
                                </p>
                                <p className="text-sm text-slate-700">
                                  {formatFullDate(
                                    notificationDetails[n._id].createdAt ||
                                      n.createdAt,
                                  )}
                                </p>
                              </div>

                              {/* Notification Type */}
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 font-semibold mb-1">
                                  Type
                                </p>
                                <p className="text-sm text-slate-700">
                                  {notificationDetails[n._id].type || n.type}
                                </p>
                              </div>

                              {/* Client ID */}
                              {(notificationDetails[n._id].client_id ||
                                n.client_id) && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-600 font-semibold mb-1">
                                    Client ID
                                  </p>
                                  <p className="text-sm text-slate-700 font-mono">
                                    {notificationDetails[n._id].client_id ||
                                      n.client_id}
                                  </p>
                                </div>
                              )}

                              {/* Company ID */}
                              {(notificationDetails[n._id].company_id ||
                                n.company_id) && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-600 font-semibold mb-1">
                                    Company ID
                                  </p>
                                  <p className="text-sm text-slate-700 font-mono">
                                    {notificationDetails[n._id].company_id ||
                                      n.company_id}
                                  </p>
                                </div>
                              )}

                              {/* Created By */}
                              {(notificationDetails[n._id].createdBy ||
                                n.createdBy) && (
                                <div className="bg-slate-50 p-3 rounded-lg">
                                  <p className="text-xs text-slate-600 font-semibold mb-1">
                                    Created By
                                  </p>
                                  <p className="text-sm text-slate-700 font-mono">
                                    {notificationDetails[n._id].createdBy ||
                                      n.createdBy}
                                  </p>
                                </div>
                              )}

                              {/* Read Status */}
                              <div className="bg-slate-50 p-3 rounded-lg">
                                <p className="text-xs text-slate-600 font-semibold mb-1">
                                  Status
                                </p>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-block w-3 h-3 rounded-full ${
                                      notificationDetails[n._id].isRead ||
                                      n.isRead
                                        ? "bg-green-500"
                                        : "bg-amber-500"
                                    }`}
                                  />
                                  <p className="text-sm text-slate-700">
                                    {notificationDetails[n._id].isRead ||
                                    n.isRead
                                      ? "Read"
                                      : "Unread"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Full Message */}
                            <div className="bg-slate-50 p-3 rounded-lg">
                              <p className="text-xs text-slate-600 font-semibold mb-1">
                                Full Message
                              </p>
                              <p className="text-sm text-slate-700">
                                {notificationDetails[n._id].message ||
                                  n.message}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
