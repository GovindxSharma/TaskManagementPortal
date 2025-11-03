import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { clients as dummyClients } from "./data/dummyClients";
import MonthCard from "./components/MonthCard.jsx";
import { ChevronLeft } from "lucide-react";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = dummyClients.find((c) => c.id === parseInt(id));

  if (!client) return <p className="text-gray-500">Client not found</p>;

  const [financialYear, setFinancialYear] = useState("2025");
  const months = Object.keys(client.dataStatus);
  const [selectedMonth, setSelectedMonth] = useState("");

  const displayedMonths = selectedMonth ? [selectedMonth] : months;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition"
      >
        <ChevronLeft size={18} />
        Back to Compliance
      </button>

      {/* Title + Filters Container */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        {/* Client Name */}
        <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Financial Year */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">
              Financial Year:
            </label>
            <div className="relative">
              <select
                value={financialYear}
                onChange={(e) => setFinancialYear(e.target.value)}
                className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
              >
                <option>2025</option>
                <option>2024</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                ▼
              </div>
            </div>
          </div>

          {/* Month Selector */}
          <div className="flex flex-col">
            <label className="text-gray-600 font-medium mb-1">
              Month (optional):
            </label>
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
              >
                <option value="">All Months</option>
                {months.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                ▼
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Month Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {displayedMonths.map((month) => (
          <MonthCard key={month} client={client} month={month} />
        ))}
      </div>
    </div>
  );
}
