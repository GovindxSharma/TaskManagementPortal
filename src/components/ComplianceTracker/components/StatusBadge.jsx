import React from "react";

const StatusBadge = ({ status, type }) => {
  const colors = {
    data: {
      Received: "bg-blue-100 text-blue-700",
      "In Progress": "bg-yellow-100 text-yellow-700",
      Completed: "bg-green-100 text-green-700",
      "Not Received": "bg-gray-100 text-gray-700",
    },
    bill: {
      Generated: "bg-green-100 text-green-700",
      Overdue: "bg-red-100 text-red-700",
    },
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        colors[type][status] || "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
