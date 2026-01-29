import React, { useEffect, useState } from "react";
import { ArrowLeft, FileText, File, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

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
    return month;
  };

  useEffect(() => {
    const fetchPendingBills = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/monthly-compliance/bill-pending");
        const data = res.data.clients || [];
        setClients(data);
        setFilteredClients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingBills();
  }, []);

  useEffect(() => {
    const filtered = clients.filter(
      (c) =>
        (!filters.month || c.month === filters.month) &&
        (!filters.year || String(c.year) === filters.year) &&
        (!filters.category || c.category === filters.category),
    );
    setFilteredClients(filtered);
  }, [filters, clients]);

  const monthOptions = [...new Set(clients.map((c) => c.month))];
  const yearOptions = [...new Set(clients.map((c) => String(c.year)))];
  const categoryOptions = [
    ...new Set(clients.map((c) => c.category).filter(Boolean)),
  ];

  const resetFilters = () => setFilters({ month: "", year: "", category: "" });

  // =======================
  // EXPORT EXCEL
  // =======================
  const exportExcel = () => {
    if (!filteredClients.length) return alert("No records to export");

    const data = filteredClients.map((c, i) => ({
      "#": i + 1,
      "Client Name": c.clientName || "-",
      Contact: c.contactPerson || c.contactNumber || c.email || "-",
      Month: getMonthName(c.month),
      Year: c.year,
      Category: c.category || "-",
      Status: "Pending",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pending Bills");
    XLSX.writeFile(workbook, "PendingBills.xlsx");
  };

  // =======================
  // EXPORT PDF
  // =======================
  const exportPDF = async () => {
    if (!filteredClients.length) return alert("No records to export");

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    const columns = [
      "#",
      "Client Name",
      "Contact",
      "Month",
      "Year",
      "Category",
      "Status",
    ];

    const rows = filteredClients.map((c, i) => [
      i + 1,
      c.clientName || "-",
      c.contactPerson || c.contactNumber || c.email || "-",
      getMonthName(c.month),
      c.year,
      c.category || "-",
      "Pending",
    ]);

    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [234, 179, 8], textColor: 0 },
    });

    doc.save("PendingBills.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-gray-700"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Pending Bills
          </h2>
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

        <button
          onClick={resetFilters}
          className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
        >
          <X size={16} /> Reset
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <Loader fullscreen size={250} />
        ) : filteredClients.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            🎉 No pending bills found!
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">Client Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Month</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((c, i) => (
                <tr key={i} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{c.clientName || "-"}</td>
                  <td className="p-3">
                    {c.contactPerson || c.contactNumber || c.email || "-"}
                  </td>
                  <td className="p-3">{getMonthName(c.month)}</td>
                  <td className="p-3">{c.year}</td>
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
