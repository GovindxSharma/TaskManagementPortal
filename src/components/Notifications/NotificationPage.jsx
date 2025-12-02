import React, { useState, useEffect } from "react";
import { X, Trash2, Check, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { useToast } from "../layout/ToastProvider.jsx";

export default function NotificationsPage({ onStatusChange }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id;

  // 🔹 Fetch unread count for the orange dot
  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get(`/notification/unreadCount/${currentUserId}`);
      onStatusChange?.(res.data.count); // update dashboard icon
    } catch (err) {
      console.error("Failed to fetch unread count");
    }
  };

  // fetch notifications on mount
  useEffect(() => {
    if (!currentUserId) return;

    const loadNotifications = async () => {
      try {
        const res = await axios.get(`/notification/recipient/${currentUserId}`);
        setNotifications(res.data.data);
        fetchUnreadCount(); // update unread dot
      } catch {
        toast.error("Failed to load notifications");
      }
    };

    loadNotifications();
  }, [currentUserId]);

  const filteredNotifications = notifications.filter(
    (n) =>
      (filter === "all" || n.type === filter) &&
      n.message.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // SMART SELECT
  const selectAll = () => setSelected(filteredNotifications.map((n) => n._id));
  const selectUnread = () =>
    setSelected(
      filteredNotifications.filter((n) => !n.isRead).map((n) => n._id)
    );
  const selectRead = () =>
    setSelected(
      filteredNotifications.filter((n) => n.isRead).map((n) => n._id)
    );
  const clearSelection = () => setSelected([]);

  // MARK AS READ
  const markAsRead = async () => {
    try {
      await Promise.all(
        selected.map((id) => axios.put(`/notification/read/${id}`))
      );
      setNotifications((prev) =>
        prev.map((n) => (selected.includes(n._id) ? { ...n, isRead: true } : n))
      );
      setSelected([]);
      toast.success("Selected notifications marked as read");
      fetchUnreadCount(); // refresh orange dot
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  // DELETE
  const deleteNotifications = () => {
    if (!selected.length) return;

    toast.confirmDelete({
      message: `Delete ${selected.length} notification(s)?`,
      onConfirm: () => {
        setNotifications((prev) =>
          prev.filter((n) => !selected.includes(n._id))
        );
        setSelected([]);
        fetchUnreadCount(); // refresh orange dot
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
        <button
          className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3 items-center">
          <label className="text-gray-700 font-medium">Filter:</label>
          <select
            className="border border-gray-300 rounded-lg p-2"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="client">Client</option>
            <option value="employee">Employee</option>
            <option value="accountant">Accountant</option>
          </select>
        </div>

        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full md:w-64"
        />
      </div>

      {/* SMART SELECT MENU */}
      <div className="relative mb-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Select <ChevronDown size={16} />
        </button>

        {menuOpen && (
          <div className="absolute mt-2 w-48 bg-white rounded-lg shadow-lg border z-20">
            <button
              onClick={() => {
                selectAll();
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Select All
            </button>
            <button
              onClick={() => {
                selectUnread();
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Select Unread
            </button>
            <button
              onClick={() => {
                selectRead();
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Select Read
            </button>
            <button
              onClick={() => {
                clearSelection();
                setMenuOpen(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={markAsRead}
          disabled={selected.length === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${
            selected.length === 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          <Check size={16} /> Mark as Read
        </button>

        <button
          onClick={deleteNotifications}
          disabled={selected.length === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg transition ${
            selected.length === 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-red-500 text-white hover:bg-red-600"
          }`}
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>

      {/* NOTIFICATION LIST */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
        {filteredNotifications.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No notifications found.
          </p>
        )}

        {filteredNotifications.map((n) => (
          <div
            key={n._id}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition ${
              !n.isRead ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(n._id)}
                onChange={() => toggleSelect(n._id)}
                className="w-4 h-4"
              />
              <span className={`${!n.isRead ? "font-semibold" : ""}`}>
                {n.message}
              </span>
            </div>

            <span className="text-sm text-gray-500 capitalize">{n.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
