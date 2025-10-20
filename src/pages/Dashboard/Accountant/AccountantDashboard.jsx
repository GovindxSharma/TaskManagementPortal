import React from "react";
import { DollarSign, Clock, AlertCircle, Users, Ticket } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const AccountantDashboard = () => {
  const stats = [
    {
      icon: <DollarSign size={28} />,
      label: "Total Payments",
      value: "₹3,45,000",
      color: "from-green-500 to-emerald-600",
    },
    {
      icon: <Clock size={28} />,
      label: "Pending Payments",
      value: "₹45,000",
      color: "from-yellow-400 to-amber-500",
    },
    {
      icon: <AlertCircle size={28} />,
      label: "Overdue",
      value: "₹10,000",
      color: "from-red-500 to-rose-600",
    },
  ];

  const recentTransactions = [
    { client: "Aarav Enterprises", amount: "₹25,000", status: "Paid", date: "2025-10-10" },
    { client: "BlueSky Corp", amount: "₹15,000", status: "Pending", date: "2025-10-15" },
    { client: "VisionTech", amount: "₹5,000", status: "Overdue", date: "2025-09-28" },
  ];

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-800">Accountant Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of payments and assigned work</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {stats.map((item, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
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

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
        <Link to="/accountant/clients">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-indigo-100 shadow-sm hover:shadow-md rounded-xl p-6 flex items-center gap-4 transition"
          >
            <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
              <Users size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Client Payments</h3>
              <p className="text-sm text-gray-500">
                View completed tasks & generate bills for clients
              </p>
            </div>
          </motion.div>
        </Link>

        <Link to="/accountant/tickets">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-white border border-purple-100 shadow-sm hover:shadow-md rounded-xl p-6 flex items-center gap-4 transition"
          >
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <Ticket size={28} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Tickets</h3>
              <p className="text-sm text-gray-500">
                Manage and update tickets assigned to you
              </p>
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="text-gray-600 border-b">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((t, i) => (
                <tr
                  key={i}
                  className="border-b last:border-none hover:bg-indigo-50/40 transition"
                >
                  <td className="py-3 px-4 font-medium">{t.client}</td>
                  <td className="py-3 px-4">{t.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        t.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : t.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{t.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
