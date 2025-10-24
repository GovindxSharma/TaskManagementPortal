import React from "react";
import StatusBadge from "./StatusBadge";

const MonthCard = ({ month, dataStatus, billStatus, suspensionNote }) => {
  return (
    <div className="border rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col gap-3">
      {/* Month Title */}
      <h4 className="text-lg font-semibold text-gray-800">{month}</h4>

      {/* Data Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Data Status:</span>
        <StatusBadge status={dataStatus} type="data" />
      </div>

      {/* Bill Status */}
      <div className="flex justify-between items-center">
        <span className="text-gray-600 font-medium">Bill Status:</span>
        <StatusBadge status={billStatus} type="bill" />
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
