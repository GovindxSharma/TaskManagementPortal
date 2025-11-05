import React, { useState } from "react";
import { X, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Bill generated for Acme Corp — ₹12,000",
      type: "client",
      read: false,
    },
    {
      id: 2,
      text: "Overdue payment: GreenLeaf Pvt Ltd (3 days)",
      type: "client",
      read: false,
    },
    {
      id: 3,
      text: "New task assigned to Riya Sharma",
      type: "employee",
      read: true,
    },
    {
      id: 4,
      text: "Reminder email sent to ZenTax Advisors (inactive 2+ months)",
      type: "accountant",
      read: false,
    },
    {
      id: 5,
      text: "Ticket #TCK1023 marked completed by Amit Verma",
      type: "employee",
      read: true,
    },
  ]);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);

  const filteredNotifications = notifications.filter(
    (n) =>
      (filter === "all" || n.type === filter) &&
      n.text.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const markAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => (selected.includes(n.id) ? { ...n, read: true } : n))
    );
    setSelected([]);
  };

  const deleteNotifications = () => {
    setNotifications((prev) => prev.filter((n) => !selected.includes(n.id)));
    setSelected([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
          Notifications
        </h1>
        <button
          className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          <X className="text-gray-700" />
        </button>
      </div>

      {/* Filters + Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex gap-3 items-center">
          <label className="text-gray-700 font-medium">Filter:</label>
          <select
            className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
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
          className="border border-gray-300 rounded-lg p-2 w-full md:w-64 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Actions */}
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

      {/* Notification List */}
      <div className="bg-white rounded-xl shadow-md p-4 space-y-2">
        {filteredNotifications.length === 0 && (
          <p className="text-gray-500 text-center py-10">
            No notifications found.
          </p>
        )}
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition ${
              !n.read ? "bg-blue-50" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={selected.includes(n.id)}
                onChange={() => toggleSelect(n.id)}
                className="w-4 h-4"
              />
              <span
                className={`${!n.read ? "font-semibold" : ""} text-gray-800`}
              >
                {n.text}
              </span>
            </div>
            <span className="text-sm text-gray-500 capitalize">{n.type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
