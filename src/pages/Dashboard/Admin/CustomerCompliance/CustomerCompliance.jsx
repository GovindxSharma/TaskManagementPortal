import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, X } from "lucide-react";
import { clients as dummyClients } from "./data/dummyClients";

export default function CustomerCompliance() {
  const navigate = useNavigate();
  const [clients] = useState(dummyClients);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);
  const [dataStatusFilter, setDataStatusFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");

  const employeeList = [
    ...new Set(dummyClients.map((c) => c.assignedTo).filter(Boolean)),
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setEmployeeFilter("");
    setEmployeeSearch("");
    setDataStatusFilter("");
    setBillStatusFilter("");
    setMonthFilter("");
  };

  // Filter logic with bill only if data completed
  const filteredClients = clients.filter((client) => {
    const months = Object.keys(client.dataStatus);
    const lastMonth = months[months.length - 1];
    const dataStatus = client.dataStatus[lastMonth];
    const billStatus =
      dataStatus === "Completed" ? client.billStatus[lastMonth] : "-";

    const matchesSearch =
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dataStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      billStatus.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEmployee =
      !employeeFilter || client.assignedTo === employeeFilter;

    const matchesDataStatus =
      !dataStatusFilter || dataStatus === dataStatusFilter;

    const matchesBillStatus =
      !billStatusFilter || billStatus === billStatusFilter;

    const matchesMonth =
      !monthFilter || Object.keys(client.dataStatus).includes(monthFilter);

    return (
      matchesSearch &&
      matchesEmployee &&
      matchesDataStatus &&
      matchesBillStatus &&
      matchesMonth
    );
  });

  const handleClientClick = (id) => {
    navigate(`/admin/customer/${id}`);
  };

  const getLastUpdate = (client) => {
    const months = Object.keys(client.dataStatus);
    const lastMonth = months[months.length - 1];
    const dataStatus = client.dataStatus[lastMonth];

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            dataStatus === "Received"
              ? "bg-green-100 text-green-700"
              : dataStatus === "In Progress"
              ? "bg-yellow-100 text-yellow-700"
              : dataStatus === "Completed"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Data {dataStatus}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {lastMonth}
        </span>
      </div>
    );
  };

  const getBillUpdate = (client) => {
    const months = Object.keys(client.dataStatus);
    const lastMonth = months[months.length - 1];
    const dataStatus = client.dataStatus[lastMonth];
    const billStatus =
      dataStatus === "Completed" ? client.billStatus[lastMonth] : "-";

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            billStatus === "Generated"
              ? "bg-green-100 text-green-700"
              : billStatus === "Overdue"
              ? "bg-red-100 text-red-700"
              : billStatus === "Pending"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {billStatus !== "-" ? `Bill ${billStatus}` : "-"}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {lastMonth}
        </span>
      </div>
    );
  };

  const getCategory = (client) => {
    const count = Object.keys(client.dataStatus).length;
    if (count <= 20)
      return { label: "1-20", color: "bg-green-100 text-green-700" };
    if (count <= 50)
      return { label: "21-50", color: "bg-yellow-100 text-yellow-700" };
    return { label: "51-150", color: "bg-red-100 text-red-700" };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-800 flex items-center gap-1 font-medium"
      >
        ← Back
      </button>

      {/* Title */}
      <h1 className="text-2xl font-semibold mb-6 text-gray-800">
        Compliance Tracker
      </h1>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[220px]">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by client, status, or month..."
              className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Employee Dropdown */}
          <div className="relative min-w-[200px]">
            <button
              onClick={() => setShowEmployeeDropdown(!showEmployeeDropdown)}
              className="w-full flex justify-between items-center border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {employeeFilter || "Select Employee"}
              <ChevronDown size={16} className="text-gray-400" />
            </button>

            {showEmployeeDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
                <input
                  type="text"
                  placeholder="Search employee..."
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto">
                  {employeeList
                    .filter((emp) =>
                      emp.toLowerCase().includes(employeeSearch.toLowerCase())
                    )
                    .map((emp) => (
                      <div
                        key={emp}
                        onClick={() => {
                          setEmployeeFilter(emp);
                          setShowEmployeeDropdown(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 ${
                          emp === employeeFilter ? "bg-blue-100" : ""
                        }`}
                      >
                        {emp}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Data Status Filter */}
          <select
            value={dataStatusFilter}
            onChange={(e) => setDataStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Data Status</option>
            <option value="Not Received">Not Received</option>
            <option value="Received">Received</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Bill Status Filter */}
          <select
            value={billStatusFilter}
            onChange={(e) => setBillStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Bill Status</option>
            <option value="Generated">Generated</option>
            <option value="Overdue">Overdue</option>
            <option value="Pending">Pending</option>
          </select>

          {/* Month Filter */}
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Month</option>
            {[
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
            ].map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200"
          >
            <X size={16} className="text-red-500" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
        <table className="w-full border-collapse text-sm text-gray-700">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-left">Site</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Last Update</th>
              <th className="p-3 text-left">Bill Update</th>
              <th className="p-3 text-left">Client Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c, index) => {
                const category = getCategory(c);

                return (
                  <tr
                    key={c.id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition-all"
                    onClick={() => handleClientClick(c.id)}
                  >
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-800">{c.name}</td>
                    <td className="p-3">{c.site || "-"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
                      >
                        {category.label}
                      </span>
                    </td>
                    <td className="p-3">{c.assignedTo}</td>
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
                );
              })
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
