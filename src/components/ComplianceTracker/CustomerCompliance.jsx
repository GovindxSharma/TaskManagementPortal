import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { Search, X, FileText, File } from "lucide-react";
import Dropdown from "../layout/Dropdown";
import Loader from "../layout/Loader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function CustomerCompliance() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [dataStatusFilter, setDataStatusFilter] = useState("");
  const [workProgressFilter, setWorkProgressFilter] = useState("");
  const [billStatusFilter, setBillStatusFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState(""); // add this

  const monthNames = [
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

  const formatMonth = (str) => {
    if (!str || str === "-") return "-";
    const parts = str.split(" ");
    const monthYear = parts.pop();
    const [m, y] = monthYear?.split("-") || [];
    if (!m || !y) return "-";
    const monthIndex = parseInt(m, 10) - 1;
    return monthNames[monthIndex] + " " + y;
  };

  const parseStatus = (str) => {
    if (!str || str === "-") return "-";
    const parts = str.split(" ");
    if (parts.length <= 1) return str;
    parts.pop();
    return parts.join(" ");
  };

  // Add this function
  const parseStatusWithMonthYear = (str) => {
    if (!str || str === "-") return { status: "-", month: "-", year: "-" };
    const parts = str.split(" ");
    const status = parts.slice(0, -1).join(" ");
    const [month, year] = parts[parts.length - 1]?.split("-") || ["-", "-"];
    return { status, month, year };
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

  const monthOptions = [
    ...new Set(
      clients.flatMap((c) =>
        (c.monthlyCompliances || []).map(
          (m) => monthNames[parseInt(m.month, 10) - 1]
        )
      )
    ),
  ];

  const yearOptions = [
    ...new Set(
      clients.flatMap((c) =>
        (c.monthlyCompliances || []).map((m) => String(m.year))
      )
    ),
  ];

  const resetFilters = () => {
    setSearchQuery("");
    setEmployeeFilter("");
    setDataStatusFilter("");
    setWorkProgressFilter("");
    setBillStatusFilter("");
    setMonthFilter("");
    setYearFilter("");
  };

  const employeeList = [
    ...new Set(clients.map((c) => c.assignedTo).filter(Boolean)),
  ];

  const yearList = [
    ...new Set(
      clients
        .flatMap((c) => [
          parseStatusWithMonthYear(c.lastDataStatus).year,
          parseStatusWithMonthYear(c.lastBillStatus).year,
        ])
        .filter(Boolean)
    ),
  ];

  const normalize = (v = "") => v.trim().toLowerCase();

  const matchesMonthlyFilter = (
    monthlyCompliances,
    { dataStatusFilter, billStatusFilter, monthFilter, yearFilter }
  ) => {
    if (!monthlyCompliances?.length) return false;

    return monthlyCompliances.some((m) => {
      const monthName = monthNames[parseInt(m.month, 10) - 1];
      const year = String(m.year);

      const dataStatusMatch =
        !dataStatusFilter ||
        normalize(m.dataReceiveStatus) === normalize(dataStatusFilter);

      const billStatusMatch =
        !billStatusFilter ||
        normalize(m.billStatus) ===
          normalize(billStatusFilter.replace("Bill ", ""));

      const monthMatch = !monthFilter || monthName === monthFilter;
      const yearMatch = !yearFilter || year === yearFilter;

      return dataStatusMatch && billStatusMatch && monthMatch && yearMatch;
    });
  };
  
const filteredClients = clients.filter((client) => {
  // -----------------------------
  // SEARCH
  // -----------------------------
  const matchesSearch = client.name
    .toLowerCase()
    .includes(searchQuery.toLowerCase());

  // -----------------------------
  // EMPLOYEE
  // -----------------------------
  const matchesEmployee =
    !employeeFilter || client.assignedTo === employeeFilter;

  // -----------------------------
  // ✅ DATA STATUS (THIS IS WHERE YOUR BLOCK GOES)
  // -----------------------------
  const matchesDataStatus =
    !dataStatusFilter ||
    client.monthlyCompliances?.some(
      (m) =>
        m.dataReceiveStatus.toLowerCase() === dataStatusFilter.toLowerCase()
    );

  const matchesWorkProgress =
    !workProgressFilter ||
    client.monthlyCompliances?.some(
      (m) => m.workProgress === workProgressFilter
    );

  // -----------------------------
  // BILL STATUS
  // -----------------------------
  const matchesBillStatus =
    !billStatusFilter ||
    client.monthlyCompliances?.some(
      (m) => m.billStatus.toLowerCase() === billStatusFilter.toLowerCase()
    );

  // -----------------------------
  // MONTH
  // -----------------------------
  const matchesMonth =
    !monthFilter ||
    client.monthlyCompliances?.some(
      (m) => monthNames[parseInt(m.month, 10) - 1] === monthFilter
    );

  // -----------------------------
  // YEAR
  // -----------------------------
  const matchesYear =
    !yearFilter ||
    client.monthlyCompliances?.some(
      (m) => String(m.year) === String(yearFilter)
    );

  // -----------------------------
  // FINAL RETURN
  // -----------------------------
  return (
    matchesSearch &&
    matchesEmployee &&
    matchesDataStatus &&
    matchesWorkProgress &&
    matchesBillStatus &&
    matchesMonth &&
    matchesYear
  );
});

  const handleClientClick = (id) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role === "Admin") navigate(`/admin/customer/${id}`);
    else if (user.role === "Employee") navigate(`/employee/customer/${id}`);
    else if (user.role === "Accountant") navigate(`/accountant/customer/${id}`);
  };

  const getLastUpdate = (client) => {
    const statusText = parseStatus(client.lastDataStatus);
    const monthText = formatMonth(client.lastDataStatus);

    const bgClass = statusText.toLowerCase().includes("received")
      ? "bg-green-100 text-green-700"
      : statusText.toLowerCase().includes("in progress")
      ? "bg-yellow-100 text-yellow-700"
      : statusText.toLowerCase().includes("complete")
      ? "bg-blue-100 text-blue-700"
      : "bg-gray-100 text-gray-700";

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}
        >
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

    const billStatusText = parseStatus(billRaw);
    const billMonth = formatMonth(billRaw);

    const bgClass = billStatusText.toLowerCase().includes("generated")
      ? "bg-green-100 text-green-700"
      : billStatusText.toLowerCase().includes("pending")
      ? "bg-yellow-100 text-yellow-700"
      : billStatusText.toLowerCase().includes("overdue")
      ? "bg-red-100 text-red-700"
      : "bg-gray-100 text-gray-700";

    return (
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${bgClass}`}
        >
          {billStatusText}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {billMonth}
        </span>
      </div>
    );
  };

  // ✅ EXPORT FUNCTIONS (use only filteredClients)
  const exportExcel = () => {
    if (!filteredClients.length) return alert("No records to export");

    const data = filteredClients.map((c, i) => ({
      "#": i + 1,
      "Client Name": c.name,
      "Business Unit": c.businessUnit || "-",
      "Company Name": c.site || "-",
      "Assigned To": c.assignedTo || "-",
      "Last Update": parseStatus(c.lastDataStatus),
      "Last Update Month": formatMonth(c.lastDataStatus),
      "Bill Update": parseStatus(c.lastBillStatus),
      "Bill Update Month": formatMonth(c.lastBillStatus),
      "Client Status": c.clientStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "ClientCompliance.xlsx");
  };

  const exportPDF = async () => {
    if (!filteredClients.length) return alert("No records to export");

    // Dynamic import to avoid Vite caching issues
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    const tableColumn = [
      "#",
      "Client Name",
      "Business Unit",
      "Company Name",
      "Assigned To",
      "Last Update",
      "Last Update Month",
      "Bill Update",
      "Bill Update Month",
      "Client Status",
    ];

    const tableRows = filteredClients.map((c, i) => [
      i + 1,
      c.name,
      c.businessUnit || "-",
      c.site || "-",
      c.assignedTo || "-",
      parseStatus(c.lastDataStatus),
      formatMonth(c.lastDataStatus),
      parseStatus(c.lastBillStatus),
      formatMonth(c.lastBillStatus),
      c.clientStatus,
    ]);

    // ✅ Use autoTable plugin correctly
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
    });

    doc.save("ClientCompliance.pdf");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader />
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-gray-600"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Compliance Tracker
          </h1>
        </div>

        {/* EXPORT BUTTONS */}
        <div className="flex gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <File size={16} /> Export Excel
          </button>
          <button
            onClick={exportPDF}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileText size={16} /> Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-5 rounded-xl shadow-sm flex flex-wrap gap-3 items-center mb-6">
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
          options={[
            "Data Received",
            "Data Incomplete",
            "Not Received",
            "Inactive",
          ]}
          value={dataStatusFilter}
          onChange={setDataStatusFilter}
          placeholder="Data Status"
        />

        <Dropdown
          label="Work Progress"
          options={[
            "Not Started",
            "In Progress",
            "Completed",
            "Payment Overdue",
          ]}
          value={workProgressFilter}
          onChange={setWorkProgressFilter}
          placeholder="Work Progress"
        />

        <Dropdown
          label="Bill Status"
          options={["Bill Generated", "Bill Pending"]}
          value={billStatusFilter}
          onChange={setBillStatusFilter}
          placeholder="Bill Status"
        />

        <Dropdown
          label="Month"
          options={monthOptions}
          value={monthFilter}
          onChange={setMonthFilter}
          placeholder="Select Month"
        />

        <Dropdown
          label="Year"
          options={yearOptions}
          value={yearFilter}
          onChange={setYearFilter}
          placeholder="Select Year"
        />

        <button
          onClick={resetFilters}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all duration-200"
        >
          <X size={16} /> Reset Filters
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white p-5 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm text-gray-700 border-collapse">
          <thead className="border-b text-gray-600">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Client Name</th>
              <th className="p-3 text-left">Company Name</th>
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
                  <td className="p-3">{c.businessUnit || "-"}</td>
                  <td className="p-3">{c.site || "-"}</td>
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
