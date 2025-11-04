import React, { useState } from "react";
import StatusBadge from "./StatusBadge";
import { Pencil, Check, X } from "lucide-react";

// monthDataKeys is the month string we want to show, e.g., "June"
const MonthCard = ({ client, month }) => {
  const monthData = client.monthData[month] || {};
  const suspensionNote = client.suspensionReason?.[month] || "";

  const [isEditing, setIsEditing] = useState(false);
  const [dataStatus, setDataStatus] = useState(
    client.dataStatus[month] || "Pending"
  );
  const [billStatus, setBillStatus] = useState(
    client.billStatus[month] || "Pending"
  );

  const dataOptions = ["Pending", "Received", "In Progress", "Completed"];
  const billOptions = ["Pending", "Generated", "Overdue", "Paid"];

  const saveChanges = () => {
    // Here you can call your backend API to save changes
    // For now, we just update local state
    client.dataStatus[month] = dataStatus;
    client.billStatus[month] = billStatus;
    setIsEditing(false);
  };

  return (
    <div className="border rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col gap-4 relative">
      {/* Edit / Save / Cancel Buttons */}
      {!isEditing ? (
        <button
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition"
          onClick={() => setIsEditing(true)}
          title="Edit Month Data"
        >
          <Pencil className="text-gray-500" size={18} />
        </button>
      ) : (
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            className="p-1 rounded-full hover:bg-green-100 transition"
            onClick={saveChanges}
            title="Save"
          >
            <Check className="text-green-500" size={18} />
          </button>
          <button
            className="p-1 rounded-full hover:bg-red-100 transition"
            onClick={() => setIsEditing(false)}
            title="Cancel"
          >
            <X className="text-red-500" size={18} />
          </button>
        </div>
      )}

      {/* Month Title */}
      <h4 className="text-lg font-semibold text-gray-800">{month}</h4>

      {/* No. of Workers */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">No. of Workers:</span>
        <span className="text-gray-800 font-semibold">
          {monthData.noOfWorkers || 0}
        </span>
      </div>

      {/* Data Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Data Status:</span>
        {isEditing ? (
          <select
            value={dataStatus}
            onChange={(e) => setDataStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {dataOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={dataStatus} type="data" />
        )}
      </div>

      {/* Expected Amount */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Expected Amount:</span>
        <span className="text-gray-800 font-semibold">
          ₹{monthData.expectedAmount || 0}
        </span>
      </div>

      {/* Final Amount */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Final Amount:</span>
        <span className="text-gray-800 font-semibold">
          ₹{monthData.finalAmount || 0}
        </span>
      </div>

      {/* Bill Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Bill Status:</span>
        {isEditing ? (
          <select
            value={billStatus}
            onChange={(e) => setBillStatus(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
          >
            {billOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <StatusBadge status={billStatus} type="bill" />
        )}
      </div>

      {/* Suspension / Overdue Note */}
      {billStatus === "Overdue" && suspensionNote && (
        <p className="text-red-600 text-sm mt-2 px-2 py-1 bg-red-50 rounded-lg border border-red-100">
          ⚠ {suspensionNote}
        </p>
      )}
    </div>
  );
};

export default MonthCard;
