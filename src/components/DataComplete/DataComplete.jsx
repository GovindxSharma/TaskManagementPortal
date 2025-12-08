import React, { useEffect, useState } from "react";
import { ArrowLeft, Database } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";

const DataComplete = () => {
  const [clients, setClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    clientName: "",
    month: "",
    year: "",
    assignedTo: "",
    billStatus: "",
  });

  const navigate = useNavigate();

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

  // Fetch completed clients
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/monthly-compliance/data-complete");
        setClients(res.data.clients || []);
        setFilteredClients(res.data.clients || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...clients];
    if (filters.clientName)
      filtered = filtered.filter((c) =>
        c.clientName.toLowerCase().includes(filters.clientName.toLowerCase())
      );
    if (filters.month)
      filtered = filtered.filter(
        (c) => getMonthName(c.month) === filters.month
      );
    if (filters.year)
      filtered = filtered.filter(
        (c) => c.year.toString() === filters.year.toString()
      );
    if (filters.assignedTo)
      filtered = filtered.filter(
        (c) =>
          (c.assignedTo || "").toLowerCase() ===
          filters.assignedTo.toLowerCase()
      );
    if (filters.billStatus)
      filtered = filtered.filter(
        (c) =>
          (c.billStatus || "").toLowerCase() ===
          filters.billStatus.toLowerCase()
      );

    setFilteredClients(filtered);
  }, [filters, clients]);

  const resetFilters = () =>
    setFilters({
      clientName: "",
      month: "",
      year: "",
      billStatus: "",
    });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      {loading && <Loader fullscreen={true} size={250} />}

      {/* Header */}
      <div className="mb-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span>
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          Data Complete
        </h2>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-xl p-4 mb-4 flex flex-wrap gap-4 items-end">
        <input
          type="text"
          placeholder="Search Client Name"
          value={filters.clientName}
          onChange={(e) =>
            setFilters({ ...filters, clientName: e.target.value })
          }
          className="border rounded px-3 py-1 focus:outline-blue-500"
        />
        <select
          value={filters.month}
          onChange={(e) => setFilters({ ...filters, month: e.target.value })}
          className="border rounded px-3 py-1 focus:outline-blue-500"
        >
          <option value="">Month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i} value={getMonthName(i + 1)}>
              {getMonthName(i + 1)}
            </option>
          ))}
        </select>
        <select
          value={filters.year}
          onChange={(e) => setFilters({ ...filters, year: e.target.value })}
          className="border rounded px-3 py-1 focus:outline-blue-500"
        >
          <option value="">Year</option>
          {[2023, 2024, 2025].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
        <select
          value={filters.billStatus}
          onChange={(e) =>
            setFilters({ ...filters, billStatus: e.target.value })
          }
          className="border rounded px-3 py-1 focus:outline-blue-500"
        >
          <option value="">Bill Status</option>
          <option value="Pending">Pending</option>
          <option value="Generated">Generated</option>
        </select>
        <button
          onClick={resetFilters}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
        >
          Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {!loading && filteredClients.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            ✅ No completed data!
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b text-gray-700">
              <tr>
                <th className="p-3 text-left">Client Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Bill Status</th>
                <th className="p-3 text-left">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c, i) => (
                <tr key={i} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">
                    {c.clientName}
                  </td>
                  <td className="p-3 text-gray-600">
                    {c.contactPerson || c.contactNumber || c.email}
                  </td>
                  <td className="p-3 text-gray-600">{getMonthName(c.month)}</td>
                  <td className="p-3 text-gray-600">{c.year}</td>
                  <td className="p-3 text-gray-600">{c.billStatus || "-"}</td>
                  <td className="p-3 text-gray-600">{c.remarks || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default DataComplete;
