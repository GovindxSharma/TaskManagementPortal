import React, { useState } from "react";
import { PlusCircle, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const EmployeeTickets = () => {
  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: "Invoice clarification needed",
      description: "Client data missing for BlueSky billing entry.",
      priority: "High",
      status: "Open",
      date: "2025-10-18",
    },
    {
      id: 2,
      title: "Payment record sync issue",
      description: "Issue syncing client payment records with main DB.",
      priority: "Medium",
      status: "In Progress",
      date: "2025-10-15",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    title: "",
    description: "",
    priority: "Low",
  });

  const addTicket = () => {
    if (!newTicket.title || !newTicket.description) return;
    const ticket = {
      id: tickets.length + 1,
      ...newTicket,
      status: "Open",
      date: new Date().toISOString().split("T")[0],
    };
    setTickets([ticket, ...tickets]);
    setNewTicket({ title: "", description: "", priority: "Low" });
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return "bg-red-100 text-red-700";
      case "In Progress":
        return "bg-yellow-100 text-yellow-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold text-gray-800">Tickets</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition"
        >
          <PlusCircle size={20} />
          Raise Ticket
        </button>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b text-gray-600">
              <th className="p-4">Title</th>
              <th className="p-4">Description</th>
              <th className="p-4">Priority</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr
                key={t.id}
                className="border-b last:border-none hover:bg-gray-50 transition"
              >
                <td className="p-4 font-medium text-gray-800">{t.title}</td>
                <td className="p-4 text-gray-600">{t.description}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      t.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : t.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(
                      t.status
                    )}`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-4 text-gray-500">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Raise a New Ticket
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={newTicket.title}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, title: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Enter issue title"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    value={newTicket.description}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, description: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Describe the issue in detail"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-6 gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={addTicket}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeTickets;
