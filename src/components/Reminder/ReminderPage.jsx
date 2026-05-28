import React, { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  CalendarClock,
  AlarmClockOff,
  Timer,
  ChevronLeft,
} from "lucide-react";
import {
  getReminders,
  createReminder,
  updateReminder,
  deleteReminderApi,
} from "../../api/reminderApi";
import { useToast } from "../layout/ToastProvider";
import { useReminderToast } from "./ReminderToastProvider";
import { useNavigate } from "react-router-dom";
import Loader from "../layout/Loader";

export default function ReminderPage() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    message: "",
    date: "",
    time: "",
  });
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all"); // all, upcoming, snoozed, dismissed

  const toast = useToast();
  const { refreshReminders } = useReminderToast();
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toLowerCase();

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getReminders();
      setReminders(res.data?.data || []);
    } catch (err) {
      toast.error("Failed to load reminders");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  // Get status for a reminder
  const getStatus = (r) => {
    if (r.isDismissed) return "dismissed";
    const now = new Date();
    const rTime = new Date(r.reminderTime);
    if (r.isSnoozed && rTime > now) return "snoozed";
    return "upcoming";
  };

  // Filter reminders
  const filteredReminders = reminders
    .filter((r) => {
      if (filter === "all") return true;
      return getStatus(r) === filter;
    })
    .filter((r) =>
      r.message.toLowerCase().includes(search.toLowerCase())
    );

  // Open modal for create
  const handleCreate = () => {
    setEditingReminder(null);
    setFormData({ message: "", date: "", time: "" });
    setShowModal(true);
  };

  // Open modal for edit
  const handleEdit = (r) => {
    setEditingReminder(r);
    const dt = new Date(r.reminderTime);
    const date = dt.toISOString().split("T")[0];
    const time = dt.toTimeString().slice(0, 5);
    setFormData({ message: r.message, date, time });
    setShowModal(true);
  };

  // Save (create or update)
  const handleSave = async () => {
    if (!formData.message.trim()) {
      toast.warning("Please enter a reminder message");
      return;
    }
    if (!formData.date || !formData.time) {
      toast.warning("Please select date and time");
      return;
    }

    const reminderTime = new Date(`${formData.date}T${formData.time}:00`);

    if (isNaN(reminderTime.getTime())) {
      toast.warning("Invalid date or time");
      return;
    }

    setSaving(true);
    try {
      if (editingReminder) {
        await updateReminder(editingReminder._id, {
          message: formData.message.trim(),
          reminderTime: reminderTime.toISOString(),
        });
        toast.success("Reminder updated successfully");
      } else {
        await createReminder({
          message: formData.message.trim(),
          reminderTime: reminderTime.toISOString(),
        });
        toast.success("Reminder created successfully");
      }
      setShowModal(false);
      fetchReminders();
      refreshReminders();
    } catch (err) {
      toast.error(
        editingReminder
          ? "Failed to update reminder"
          : "Failed to create reminder"
      );
    } finally {
      setSaving(false);
    }
  };

  // Delete
  const handleDelete = (r) => {
    toast.confirmDelete({
      message: `Delete reminder "${r.message.slice(0, 50)}${r.message.length > 50 ? "..." : ""}"?`,
      onConfirm: async () => {
        try {
          await deleteReminderApi(r._id);
          fetchReminders();
          refreshReminders();
        } catch (err) {
          toast.error("Failed to delete reminder");
        }
      },
    });
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const styles = {
      upcoming:
        "bg-blue-50 text-blue-700 border-blue-200",
      snoozed:
        "bg-yellow-50 text-yellow-700 border-yellow-200",
      dismissed:
        "bg-gray-50 text-gray-500 border-gray-200",
    };
    const icons = {
      upcoming: <CalendarClock size={12} />,
      snoozed: <Timer size={12} />,
      dismissed: <AlarmClockOff size={12} />,
    };
    const labels = {
      upcoming: "Upcoming",
      snoozed: "Snoozed",
      dismissed: "Dismissed",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full border ${styles[status]}`}
      >
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const formatDateTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/${role}/dashboard`)}
            className="p-2 bg-white rounded-xl shadow hover:shadow-md transition"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-200">
                <Clock size={22} className="text-white" />
              </div>
              Reminders
            </h1>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all font-medium text-sm"
        >
          <Plus size={18} />
          New Reminder
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          {["all", "upcoming", "snoozed", "dismissed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                filter === f
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs ml-auto">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reminders..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
          />
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-20">
            <Loader fullscreen={false} size={100} />
          </div>
        ) : filteredReminders.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <Clock size={28} className="text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              No reminders found
            </h3>
            <p className="text-gray-400 text-sm">
              {filter !== "all"
                ? `No ${filter} reminders`
                : "Create your first reminder to get started!"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredReminders.map((r) => {
                  const status = getStatus(r);
                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-indigo-50/30 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p
                          className={`text-sm font-medium ${
                            status === "dismissed"
                              ? "text-gray-400 line-through"
                              : "text-gray-800"
                          }`}
                        >
                          {r.message}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {formatDateTime(r.reminderTime)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!r.isDismissed && (
                            <button
                              onClick={() => handleEdit(r)}
                              className="p-2 rounded-lg hover:bg-indigo-50 text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Edit"
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(r)}
                            className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 rounded-t-2xl bg-white">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Clock size={20} className="text-indigo-600" />
                {editingReminder ? "Edit Reminder" : "New Reminder"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-6">
              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Time
                  </label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="What do you want to be reminded about?"
                  rows={8}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {saving
                  ? "Saving..."
                  : editingReminder
                  ? "Update"
                  : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
