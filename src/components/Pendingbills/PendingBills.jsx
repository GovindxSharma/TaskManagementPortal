import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  File,
  X,
  ChevronDown,
  ChevronRight,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

const PendingBills = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [expandedClients, setExpandedClients] = useState({});
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    month: "",
    year: "",
    category: "",
  });

  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (user.role || "Admin").toLowerCase();

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

    if (!isNaN(month)) {
      return months[parseInt(month, 10) - 1];
    }

    return month;
  };

  useEffect(() => {
    const fetchPendingBills = async () => {
      setLoading(true);

      try {
        const res = await axios.get("/monthly-compliance/bill-pending");

        const data = res.data.clients || [];

        setClients(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, []);

  // ===========================
  // FILTERED DATA
  // ===========================
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesFilters =
        (!filters.month || c.month === filters.month) &&
        (!filters.year || String(c.year) === filters.year) &&
        (!filters.category || c.category === filters.category);

      const matchesSearch =
        !search || c.clientName?.toLowerCase().includes(search.toLowerCase());

      return matchesFilters && matchesSearch;
    });
  }, [clients, filters, search]);

  // ===========================
  // GROUP BY CLIENT
  // ===========================
  const groupedClients = useMemo(() => {
    return filteredClients.reduce((acc, curr) => {
      const key = curr.clientName || "Unknown Client";

      if (!acc[key]) {
        acc[key] = [];
      }

      acc[key].push(curr);

      return acc;
    }, {});
  }, [filteredClients]);

  const monthOptions = [...new Set(clients.map((c) => c.month))];

  const yearOptions = [...new Set(clients.map((c) => String(c.year)))];

  const categoryOptions = [
    ...new Set(clients.map((c) => c.category).filter(Boolean)),
  ];

  const resetFilters = () => {
    setFilters({
      month: "",
      year: "",
      category: "",
    });

    setSearch("");
  };

  const toggleClient = (clientName) => {
    setExpandedClients((prev) => ({
      ...prev,
      [clientName]: !prev[clientName],
    }));
  };

  // ===========================
  // EXPORT EXCEL
  // ===========================
  const exportExcel = () => {
    if (!filteredClients.length) {
      return alert("No records to export");
    }

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

  // ===========================
  // EXPORT PDF
  // ===========================
  const exportPDF = async () => {
    if (!filteredClients.length) {
      return alert("No records to export");
    }

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    const columns = ["#", "Client Name", "Month", "Year", "Category", "Status"];

    const rows = filteredClients.map((c, i) => [
      i + 1,
      c.clientName || "-",
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
      headStyles: {
        fillColor: [234, 179, 8],
        textColor: 0,
      },
    });

    doc.save("PendingBills.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-gray-700"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <h2 className="text-2xl font-semibold text-gray-800">
            Pending Bills
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            onClick={exportExcel}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <File size={16} />
            Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow mb-5 flex flex-wrap gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />

          <input
            type="text"
            placeholder="Search client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg pl-10 pr-3 py-2"
          />
        </div>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.month}
          onChange={(e) =>
            setFilters({
              ...filters,
              month: e.target.value,
            })
          }
        >
          <option value="">All Months</option>

          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {getMonthName(m)}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.year}
          onChange={(e) =>
            setFilters({
              ...filters,
              year: e.target.value,
            })
          }
        >
          <option value="">All Years</option>

          {yearOptions.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="border rounded-lg px-3 py-2"
          value={filters.category}
          onChange={(e) =>
            setFilters({
              ...filters,
              category: e.target.value,
            })
          }
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
          className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 px-4 rounded-lg"
        >
          <X size={16} />
          Reset
        </button>
      </div>

      {/* CONTENT */}
      <div className="space-y-4">
        {loading ? (
          <Loader fullscreen size={250} />
        ) : Object.keys(groupedClients).length === 0 ? (
          <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500">
            🎉 No pending bills found!
          </div>
        ) : (
          Object.entries(groupedClients).map(([clientName, records]) => (
            <div
              key={clientName}
              className="bg-white rounded-2xl shadow overflow-hidden border"
            >
              <button
                onClick={() => toggleClient(clientName)}
                className="w-full flex justify-between items-center p-5 hover:bg-yellow-50 transition"
              >
                <div className="text-left">
                  <h3 className="font-semibold text-lg text-gray-800">
                    {clientName}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {records.length} Pending Bill
                    {records.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                    Pending
                  </span>

                  {expandedClients[clientName] ? (
                    <ChevronDown />
                  ) : (
                    <ChevronRight />
                  )}
                </div>
              </button>

              {expandedClients[clientName] && (
                <div className="border-t overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-3 text-left">Month</th>
                        <th className="p-3 text-left">Year</th>
                        <th className="p-3 text-left">Category</th>
                        <th className="p-3 text-center">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {records.map((record, idx) => (
                        <tr
                          key={idx}
                          onClick={() =>
                            navigate(
                              `/${userRole}/customer/${
                                typeof record.clientId === "object"
                                  ? record.clientId._id
                                  : record.clientId
                              }`,
                              {
                                state: {
                                  selectedMonthRecordId: record._id,
                                  autoOpenMonthlyRecord: true,
                                },
                              },
                            )
                          }
                          className="border-t hover:bg-yellow-50 cursor-pointer transition duration-200"
                        >
                          <td className="p-3 font-medium text-indigo-600">
                            {getMonthName(record.month)}
                          </td>

                          <td className="p-3">{record.year}</td>

                          <td className="p-3">{record.category || "-"}</td>

                          <td className="p-3 text-center">
                            <div className="flex justify-center items-center gap-2">
                              <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                                Pending
                              </span>

                              <span className="text-xs text-gray-500">
                                Click to Edit →
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PendingBills;
