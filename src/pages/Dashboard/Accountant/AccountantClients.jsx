import React from "react";

const AccountantClients = () => {
  const completedTasks = [
    { client: "Aarav Enterprises", amount: "₹25,000", status: "Paid", date: "2025-10-10" },
    { client: "VisionTech", amount: "₹5,000", status: "Overdue", date: "2025-09-28" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">
        Client Payments & Completed Tasks
      </h1>
      <div className="bg-white p-5 rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="p-3">Client</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Status</th>
              <th className="p-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {completedTasks.map((t, i) => (
              <tr key={i} className="border-b last:border-none hover:bg-gray-50 transition">
                <td className="p-3">{t.client}</td>
                <td className="p-3">{t.amount}</td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
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
                <td className="p-3">{t.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantClients;
