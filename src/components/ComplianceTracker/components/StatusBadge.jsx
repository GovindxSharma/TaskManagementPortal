import React from "react";

const StatusBadge = ({ status, type }) => {
  const colors = {
    data: {
      "Data Received": "bg-blue-100 text-blue-700",
      "In Progress": "bg-yellow-100 text-yellow-700",
      Completed: "bg-green-100 text-green-700",
      "Not Received": "bg-gray-100 text-gray-700",
      "Data Incomplete": "bg-orange-100 text-orange-700",
      Inactive: "bg-gray-200 text-gray-800",
      "Data Pending": "bg-yellow-50 text-yellow-800",
    },
    bill: {
      Generated: "bg-green-100 text-green-700",
      Overdue: "bg-red-100 text-red-700",
      Pending: "bg-gray-100 text-gray-700",
    },
    work: {
      "Not Started": "bg-gray-100 text-gray-700",
      "Payment Overdue": "bg-red-100 text-red-700",
      Completed: "bg-green-100 text-green-700",
      "In Progress": "bg-yellow-100 text-yellow-700",
    },
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[type]?.[status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};


export default StatusBadge;
