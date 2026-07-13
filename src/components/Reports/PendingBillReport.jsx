import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, FileText, File, X, RefreshCw, ChevronDown, ChevronRight } from "lucide-react";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";
import Dropdown from "../layout/Dropdown";
import { useToast } from "../layout/ToastProvider.jsx";
import * as XLSX from "xlsx";

export default function PendingBillReport() {
  const navigate = useNavigate();
  const toast = useToast();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  // Filters State
  const [searchText, setSearchText] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getMonthName = (m) => {
    const parsed = parseInt(m, 10);
    return isNaN(parsed) ? m : monthNames[parsed - 1];
  };

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userRole = (user.role || "Admin").toLowerCase();

  const fetchReportData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await axios.get("/monthly-compliance/pending-bills-report", {
        params: { company_id: user.company_id }
      });
      setRecords(res.data.data || []);
      if (isRefresh) {
        toast?.success("Report data refreshed!");
      }
    } catch (err) {
      console.error(err);
      toast?.error("Failed to load report data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user.company_id, toast]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Unique Filter Options derived from current dataset
  const monthOptions = useMemo(() => {
    return [...new Set(records.map(r => getMonthName(r.month)))].sort(
      (a, b) => monthNames.indexOf(a) - monthNames.indexOf(b)
    );
  }, [records]);

  const yearOptions = useMemo(() => {
    return [...new Set(records.map(r => String(r.year)))].sort();
  }, [records]);

  const employeeOptions = useMemo(() => {
    return [...new Set(records.map(r => r.assignedEmployee).filter(Boolean))].sort();
  }, [records]);

  const categoryOptions = useMemo(() => {
    return [...new Set(records.map(r => r.categoryName).filter(Boolean))].sort();
  }, [records]);

  
  const groupedRecords = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // 1. Group all past records by client
    const clientGroups = {};
    records.forEach((r) => {
      const recordYear = parseInt(r.year, 10);
      const recordMonth = parseInt(r.month, 10);
      const monthsDifference = (currentYear - recordYear) * 12 + (currentMonth - recordMonth);

      if (monthsDifference >= 1) {
        if (!clientGroups[r.clientId]) {
          clientGroups[r.clientId] = [];
        }
        clientGroups[r.clientId].push(r);
      }
    });

    // 2. Filter clients with 2 or more "Not Received" months
    const eligibleClientIds = new Set(
      Object.keys(clientGroups).filter(
        (clientId) => clientGroups[clientId].length >= 2
      )
    );

    // 3. Group and filter records for eligible clients
    const grouped = {};
    records.forEach((r) => {
      if (!eligibleClientIds.has(r.clientId)) return;

      const recordYear = parseInt(r.year, 10);
      const recordMonth = parseInt(r.month, 10);
      const monthsDifference = (currentYear - recordYear) * 12 + (currentMonth - recordMonth);

      if (monthsDifference < 1) return;

      const trimmedSearch = searchText.trim().toLowerCase();
      const matchesSearch =
        !trimmedSearch ||
        r.clientName.toLowerCase().includes(trimmedSearch) ||
        r.businessUnit.toLowerCase().includes(trimmedSearch) ||
        r.site.toLowerCase().includes(trimmedSearch) ||
        r.assignedEmployee.toLowerCase().includes(trimmedSearch);

      const matchesMonth = !monthFilter || getMonthName(r.month) === monthFilter;
      const matchesYear = !yearFilter || String(r.year) === yearFilter;
      const matchesEmployee = !employeeFilter || r.assignedEmployee === employeeFilter;
      const matchesCategory = !categoryFilter || r.categoryName === categoryFilter;

      if (matchesSearch && matchesMonth && matchesYear && matchesEmployee && matchesCategory) {
        if (!grouped[r.clientId]) {
          grouped[r.clientId] = [];
        }
        grouped[r.clientId].push(r);
      }
    });

    return Object.values(grouped).filter((group) => group.length >= 2);
  }, [records, searchText, monthFilter, yearFilter, employeeFilter, categoryFilter]);

  const filteredRecords = useMemo(() => {
    return groupedRecords.flat();
  }, [groupedRecords]);

  // Stats Calculations
  const stats = useMemo(() => {
    const uniqueClients = new Set(filteredRecords.map(r => r.clientId));
    const totalExpectedBill = filteredRecords.reduce((sum, r) => sum + r.expectedBill, 0);

    return {
      totalClients: uniqueClients.size,
      totalPendingBills: filteredRecords.length,
      totalExpectedBill
    };
  }, [filteredRecords]);

  const toggleRow = (clientId) => {
    setExpandedRows(prev => ({ ...prev, [clientId]: !prev[clientId] }));
  };

  const resetFilters = () => {
    setSearchText("");
    setMonthFilter("");
    setYearFilter("");
    setEmployeeFilter("");
    setCategoryFilter("");
    toast?.success("Filters reset successfully");
  };

  // Excel Export
  const exportExcel = () => {
    if (!filteredRecords.length) {
      return toast?.warning("No records to export");
    }

    const data = filteredRecords.map((r, i) => ({
      "Client Name": r.clientName,
      "Business Unit": r.businessUnit,
      "Site": r.site,
      "Contact Person": r.contactPerson,
      "Contact Number": r.contactNumber,
      "Email": r.email,
      "Assigned Employee": r.assignedEmployee,
      "Month": getMonthName(r.month),
      "Year": r.year,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Worst Bills");
    XLSX.writeFile(workbook, "Worst_Bill_Report.xlsx");
  };

  // PDF Export
  const exportPDF = async () => {
    if (!filteredRecords.length) {
      return toast?.warning("No records to export");
    }

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF("landscape");

    const tableColumn = [
      "Client Name",
      "BU / Site",
      "Contact Info",
      "Assigned Employee",
      "Month / Year",
    ];

    const tableRows = filteredRecords.map((r) => [
      r.clientName,
      `${r.businessUnit} / ${r.site}`,
      `${r.contactPerson}\n${r.contactNumber}\n${r.email}`,
      r.assignedEmployee,
      `${getMonthName(r.month)} ${r.year}`,
    ]);

    doc.text("Worst Bill Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 20);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [79, 70, 229] }, // Premium Indigo color
    });

    doc.save("Worst_Bill_Report.pdf");
  };

  // Helper styles for badges
  const getDataStatusBadge = (status) => {
    switch (status) {
      case "Data Received":
        return "bg-emerald-100 text-emerald-800";
      case "Data Incomplete":
        return "bg-amber-100 text-amber-800";
      case "Data Pending":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getWorkProgressBadge = (progress) => {
    switch (progress) {
      case "Completed":
        return "bg-emerald-100 text-emerald-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Payment Overdue":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => navigate("/admin/reports")}
            className="flex items-center gap-2 bg-white shadow-sm border px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 text-sm font-medium transition mb-2 cursor-pointer"
          >
            <ArrowLeft size={16} />
            Back to Reports
          </button>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-950">
            Worst Bill Report
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Overview of client compliance records pending billing for the last two months.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => fetchReportData(true)}
            disabled={refreshing}
            className="flex items-center justify-center gap-1.5 px-4 py-2 border bg-white rounded-xl shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>

          <button
            onClick={exportExcel}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl shadow-md text-sm font-semibold hover:bg-emerald-700 hover:shadow-lg transition cursor-pointer"
          >
            <File size={16} />
            Export Excel
          </button>

          <button
            onClick={exportPDF}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md text-sm font-semibold hover:bg-indigo-700 hover:shadow-lg transition cursor-pointer"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition duration-300 hover:shadow-md">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Clients</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mt-1">{stats.totalClients}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition duration-300 hover:shadow-md">
          <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Months Records</p>
          <h2 className="text-3xl font-extrabold text-amber-600 mt-1">{stats.totalPendingBills}</h2>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
        <div className="flex flex-wrap items-center gap-4">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Client, BU, Site or Employee..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 shadow-inner"
            />
          </div>

          {/* Month Dropdown */}
          <Dropdown
            options={monthOptions}
            value={monthFilter}
            onChange={setMonthFilter}
            placeholder="Month"
          />

          {/* Year Dropdown */}
          <Dropdown
            options={yearOptions}
            value={yearFilter}
            onChange={setYearFilter}
            placeholder="Year"
          />

          {/* Employee Dropdown */}
          <Dropdown
            options={employeeOptions}
            value={employeeFilter}
            onChange={setEmployeeFilter}
            placeholder="Employee"
            width="w-48"
          />

          {/* Category Dropdown */}
          <Dropdown
            options={categoryOptions}
            value={categoryFilter}
            onChange={setCategoryFilter}
            placeholder="Category"
            width="w-48"
          />

          {/* Reset Filters */}
          {(searchText || monthFilter || yearFilter || employeeFilter || categoryFilter) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-4 py-2 text-sm font-semibold border border-rose-300 text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer"
            >
              <X size={16} />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-4">Client Detail</th>
                <th className="py-4 px-4">Contact Info</th>
                <th className="py-4 px-4">Assigned Employee</th>
                <th className="py-4 px-4 text-center">Month/Year</th>
                <th className="py-4 px-6 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groupedRecords.length > 0 ? (
                groupedRecords.map((group) => {
                  const r = group[0];
                  const isExpanded = expandedRows[r.clientId];
                  return (
                    <React.Fragment key={r.clientId}>
                      <tr
                        onClick={() => toggleRow(r.clientId)}
                        className={`hover:bg-indigo-50/20 transition duration-150 cursor-pointer ${isExpanded ? 'bg-indigo-50/10' : ''}`}
                      >
                        <td className="py-4 px-4 align-top border-b border-gray-50">
                          <div className="font-bold text-gray-900">{r.clientName}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            <span className="font-semibold">BU:</span> {r.businessUnit} | <span className="font-semibold">Site:</span> {r.site}
                          </div>
                        </td>
                        <td className="py-4 px-4 align-top border-b border-gray-50">
                          <div className="text-xs font-medium text-gray-800">{r.contactPerson}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{r.contactNumber}</div>
                          <div className="text-xs text-gray-400">{r.email}</div>
                        </td>
                        <td className="py-4 px-4 text-gray-600 font-medium border-b border-gray-50">{r.assignedEmployee}</td>
                        <td className="py-4 px-4 text-center border-b border-gray-50">
                          <span className="bg-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-bold border border-amber-200/50 shadow-sm inline-flex items-center gap-1">
                            {group.length} Pending
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center border-b border-gray-50">
                           <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition cursor-pointer">
                             {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                           </button>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/30">
                          <td colSpan="5" className="p-0 border-b border-gray-100">
                            <div className="px-6 py-4 border-l-2 border-indigo-500 bg-white shadow-inner">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                    <th className="pb-3 text-left font-bold pl-2">Month / Year</th>
                                    <th className="pb-3 text-right font-bold pr-2">Action</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.map((record) => (
                                    <tr key={record._id} className="border-b border-gray-50 last:border-0 hover:bg-indigo-50/20 transition">
                                      <td className="py-3 font-semibold text-gray-800 text-left pl-2">
                                        {getMonthName(record.month)} {record.year}
                                      </td>
                                      <td className="py-3 text-right pr-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                              `/${userRole}/customer/${record.clientId}`,
                                              {
                                                state: {
                                                  selectedMonthRecordId: record._id,
                                                  autoOpenMonthlyRecord: true,
                                                },
                                              }
                                            );
                                          }}
                                          className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg border border-indigo-200/50 transition cursor-pointer shadow-sm inline-flex items-center gap-1"
                                        >
                                          Edit →
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12 text-gray-400 font-medium">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
