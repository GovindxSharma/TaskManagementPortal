import React, { useEffect, useState } from "react";
import { ArrowLeft, FileText, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance"; // your axios instance
import Loader from "../layout/Loader"; // central loader component

const PendingBills = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    month: "",
    year: "",
    category: "",
  });

  const navigate = useNavigate();

  // Helper: convert month number/string to full name
  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (!isNaN(month)) return months[parseInt(month, 10) - 1];

    const lower = month.toString().toLowerCase();
    const shortNames = months.map((m) => m.slice(0, 3).toLowerCase());
    const idx = shortNames.indexOf(lower);
    if (idx !== -1) return months[idx];

    return month;
  };

  // Fetch pending bills from backend
  useEffect(() => {
    const fetchPendingBills = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/monthly-compliance/bill-pending");
        const clientsData = res.data.clients || [];
        setClients(clientsData);
        setFilteredClients(clientsData);
      } catch (error) {
        console.error("Error fetching pending bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    const filtered = clients.filter((client) => {
      return (
        (filters.month ? client.month === filters.month : true) &&
        (filters.year ? client.year.toString() === filters.year : true) &&
        (filters.category ? client.category === filters.category : true)
      );
    });
    setFilteredClients(filtered);
  }, [filters, clients]);

  // Generate unique options for filters
  const monthOptions = [...new Set(clients.map((c) => c.month))];
  const yearOptions = [...new Set(clients.map((c) => c.year.toString()))];
  const categoryOptions = [
    ...new Set(clients.map((c) => c.category).filter(Boolean)),
  ];

  // Reset filters
  const resetFilters = () => setFilters({ month: "", year: "", category: "" });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-gray-700 font-medium transition"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span>
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          {/* <FileText className="text-yellow-600" /> */}
          Pending Bills
        </h2>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <select
          className="border rounded px-3 py-1"
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
        >
          <option value="">All Months</option>
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {getMonthName(m)}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-1"
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
        >
          <option value="">All Years</option>
          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="border rounded px-3 py-1"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categoryOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Reset Button */}
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded transition"
        >
          <X size={16} /> Reset Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <Loader fullscreen={true} size={250} />
        ) : filteredClients.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            🎉 No pending bills found for selected filters!
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b text-gray-700">
              <tr>
                <th className="p-3 text-left">Client Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {client.clientName || "-"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {client.contactPerson ||
                      client.contactNumber ||
                      client.email ||
                      "-"}
                  </td>
                  <td className="p-3 text-gray-600">
                    {getMonthName(client.month) || "-"}
                  </td>
                  <td className="p-3 text-gray-600">{client.year || "-"}</td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingBills;
