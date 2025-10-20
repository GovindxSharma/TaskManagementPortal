import React, { useState } from "react";
import { ClipboardList, CheckCircle, Hourglass, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const EmployeeDashboard = () => {
  const [tasks, setTasks] = useState([
    {
      client: "Aarav Enterprises",
      description: "Prepare invoice and reconcile payment details",
      deadline: "2025-10-25",
      status: "In Progress",
    },
    {
      client: "BlueSky Corp",
      description: "Verify completed services and submit billing data",
      deadline: "2025-10-22",
      status: "Pending",
    },
    {
      client: "VisionTech",
      description: "Finalize and upload work summary report",
      deadline: "2025-10-18",
      status: "Completed",
    },
  ]);

  const stats = [
    {
      icon: <ClipboardList size={28} />,
      label: "Total Tasks",
      value: tasks.length,
      color: "from-blue-500 to-indigo-600",
    },
    {
      icon: <Hourglass size={28} />,
      label: "In Progress",
      value: tasks.filter((t) => t.status === "In Progress").length,
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: <CheckCircle size={28} />,
      label: "Completed",
      value: tasks.filter((t) => t.status === "Completed").length,
      color: "from-green-500 to-emerald-600",
    },
  ];

  const updateStatus = (index, newStatus) => {
    const updated = [...tasks];
    updated[index].status = newStatus;
    setTasks(updated);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Employee Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Manage your assigned tasks, update progress, and raise tickets
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            className={`bg-gradient-to-r ${item.color} text-white shadow-lg rounded-xl p-5 flex items-center justify-between`}
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-3 rounded-lg">{item.icon}</div>
              <div>
                <h3 className="text-sm opacity-90">{item.label}</h3>
                <p className="text-2xl font-semibold">{item.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Link to="/employee/tickets">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-blue-100 shadow-sm hover:shadow-md rounded-xl p-6 flex items-center gap-4 transition"
          >
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Ticket size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Raise a Ticket</h3>
              <p className="text-sm text-gray-500">
                Report issues or communicate with the admin
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Assigned Tasks */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Tasks</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Deadline</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-blue-50/40 transition"
                >
                  <td className="py-3 px-4 font-medium">{t.client}</td>
                  <td className="py-3 px-4">{t.description}</td>
                  <td className="py-3 px-4 text-gray-500">{t.deadline}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        t.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : t.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <select
                      value={t.status}
                      onChange={(e) => updateStatus(i, e.target.value)}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400 outline-none"
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
