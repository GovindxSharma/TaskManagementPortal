import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { Search, X } from "lucide-react";
import Dropdown from "../layout/Dropdown";

export default function CustomerCompliance() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dataStatusFilter, setDataStatusFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const formatMonth = (str) => {
    if (!str || str === "-") return "-";
    const parts = str.split(" ");
    const monthYear = parts.pop(); // last element = month-year
    const [m, y] = monthYear?.split("-") || [];
    if (!m || !y) return "-";
    const monthIndex = parseInt(m, 10) - 1;
    if (isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return "-";
    return `${monthNames[monthIndex]} ${y}`;
  };

  const parseStatus = (str) => {
    if (!str || str === "-") return "-";
    const parts = str.split(" ");
    if (parts.length <= 1) return str;
    parts.pop(); // remove month
    return parts.join(" ");
  };

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await axios.get(
        `/client/clients-with-compliance?company_id=${user.company_id}`
      );
      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const resetFilters = () => {
    setSearchQuery("");
    setEmployeeFilter("");
    setDataStatusFilter("");
    setBillStatusFilter("");
    setMonthFilter("");
  };

  const employeeList = [
    ...new Set(clients.map((c) => c.assignedTo).filter(Boolean)),
  ];

  // ---------------------- Filter Logic ----------------------
  const filteredClients = clients.filter((client) => {
    const dataStatusRaw = parseStatus(client.lastDataStatus);
    const billStatusRaw = parseStatus(client.lastBillStatus);
    const dataMonthRaw = formatMonth(client.lastDataStatus);
    const billMonthRaw = formatMonth(client.lastBillStatus);

    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataStatusRaw.toLowerCase().includes(searchQuery.toLowerCase()) ||
      billStatusRaw.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmployee =
      !employeeFilter || client.assignedTo === employeeFilter;
    const matchesDataStatus =
      !dataStatusFilter || dataStatusRaw === dataStatusFilter;
    const matchesBillStatus =
      !billStatusFilter || billStatusRaw === billStatusFilter;
    const matchesMonth =
      !monthFilter || dataMonthRaw === monthFilter || billMonthRaw === monthFilter;

    return (
      matchesSearch &&
      matchesEmployee &&
      matchesDataStatus &&
      matchesBillStatus &&
      matchesMonth
    );
  });

  const handleClientClick = (id) => navigate(`/admin/customer/${id}`);

  const getLastUpdate = (client) => {
    const statusText = parseStatus(client.lastDataStatus);
    const monthText = formatMonth(client.lastDataStatus);

    const bgClass =
      statusText.toLowerCase().includes("received")
        ? "bg-green-100 text-green-700"
        : statusText.toLowerCase().includes("in progress")
        ? "bg-yellow-100 text-yellow-700"
        : statusText.toLowerCase().includes("complete")
        ? "bg-blue-100 text-blue-700"
        : "bg-gray-100 text-gray-700";

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}>
          {statusText}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {monthText}
        </span>
      </div>
    );
  };

  const getBillUpdate = (client) => {
    const billRaw = client.lastBillStatus || "-";
    if (billRaw === "-") return "-";

    const billStatusText = parseStatus(billRaw); // "Bill Pending" or "Bill Generated"
    const billMonth = formatMonth(billRaw); // e.g. "November 2025"

    const bgClass =
      billStatusText.toLowerCase().includes("generated")
        ? "bg-green-100 text-green-700"
        : billStatusText.toLowerCase().includes("pending")
        ? "bg-yellow-100 text-yellow-700"
        : billStatusText.toLowerCase().includes("overdue")
        ? "bg-red-100 text-red-700"
        : "bg-gray-100 text-gray-700";

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}>
          {billStatusText}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {billMonth}
        </span>
      </div>
    );
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium px-3 py-2 bg-white rounded-lg shadow-sm"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800">
            Compliance Tracker
          </h1>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-xl shadow-sm flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by client, status, or month..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Dropdown
            label="Select Employee"
            options={employeeList}
            value={employeeFilter}
            onChange={setEmployeeFilter}
            placeholder="Select Employee"
          />

          <Dropdown
            label="Data Status"
            options={["Not Received", "Received", "In Progress", "Completed"]}
            value={dataStatusFilter}
            onChange={setDataStatusFilter}
            placeholder="Data Status"
          />

          <Dropdown
            label="Bill Status"
            options={["Generated", "Overdue", "Pending"]}
            value={billStatusFilter}
            onChange={setBillStatusFilter}
            placeholder="Bill Status"
          />

          <Dropdown
            label="Month"
            options={[
              ...new Set(clients.flatMap((c) => [formatMonth(c.lastDataStatus), formatMonth(c.lastBillStatus)]).filter(Boolean))
            ]}
            value={monthFilter}
            onChange={setMonthFilter}
            placeholder="Select Month"
          />

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200"
          >
            <X size={16} className="text-red-500" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-left">Site</th>
              <th className="p-3 text-left">Business Unit</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Last Update</th>
              <th className="p-3 text-left">Bill Update</th>
              <th className="p-3 text-left">Client Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c, i) => (
                <tr
                  key={c.id}
                  className="border-b hover:bg-gray-50 cursor-pointer transition-all"
                  onClick={() => handleClientClick(c.id)}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium text-gray-800">{c.name}</td>
                  <td className="p-3">{c.site || "-"}</td>
                  <td className="p-3">{c.businessUnit || "-"}</td>
                  <td className="p-3">{c.assignedTo || "-"}</td>
                  <td className="p-3">{getLastUpdate(c)}</td>
                  <td className="p-3">{getBillUpdate(c)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        c.clientStatus === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {c.clientStatus}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-6 text-gray-500">
                  No matching records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
