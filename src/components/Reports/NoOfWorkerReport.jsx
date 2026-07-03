import React, { useEffect, useState, useCallback } from "react";
import axios from "../../api/axiosInstance";
import Dropdown from "../layout/Dropdown";
import Loader from "../layout/Loader";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function SimpleComplianceTable() {
  const navigate = useNavigate();
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

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const getMonthNumber = (monthName) => {
    const index = monthNames.indexOf(monthName);
    return index >= 0 ? String(index + 1).padStart(2, "0") : "";
  };

const getComplianceData = (client) => {
  if (!client?.monthlyCompliances?.length) return null;

  // ✅ Case 1: Month + Year (same as before)
  if (monthFilter && yearFilter) {
    const monthNumber = getMonthNumber(monthFilter);

    return client.monthlyCompliances.find(
      (m) => m.month === monthNumber && String(m.year) === String(yearFilter),
    );
  }

  // 🔥 Case 2: Only Year → SUM all months
  if (yearFilter && !monthFilter) {
    const filtered = client.monthlyCompliances.filter(
      (m) => String(m.year) === String(yearFilter),
    );

    if (!filtered.length) return null;

    const totalWorkers = filtered.reduce(
      (sum, m) => sum + (m.noOfWorkers || 0),
      0,
    );

    const totalBill = filtered.reduce((sum, m) => sum + (m.bill || 0), 0);

    // ✅ Return aggregated object
    return {
      noOfWorkers: totalWorkers,
      bill: totalBill,
      isAggregated: true,
    };
  }

  // ✅ Case 3: Only Month (same as before)
  if (monthFilter && !yearFilter) {
    const monthNumber = getMonthNumber(monthFilter);

    const filtered = client.monthlyCompliances.filter(
      (m) => m.month === monthNumber,
    );

    if (filtered.length) {
      return filtered.sort((a, b) => b.year - a.year)[0];
    }
  }

  // ✅ Default: latest record
  return [...client.monthlyCompliances].sort(
    (a, b) => b.year - a.year || Number(b.month) - Number(a.month),
  )[0];
};

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const { data } = await axios.get(
        `/client/clients-with-compliance?company_id=${user.company_id}`,
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

  // ✅ Stats
  const totalClientsWithWorkers = clients.reduce((count, c) => {
    const comp = getComplianceData(c);
    return count + ((comp?.noOfWorkers || 0) > 0 ? 1 : 0);
  }, 0);

  const totalWorkers = clients.reduce((sum, c) => {
    const comp = getComplianceData(c);
    return sum + (comp?.noOfWorkers || 0);
  }, 0);

  const totalBill = clients.reduce((sum, c) => {
    const comp = getComplianceData(c);
    return sum + (comp?.bill || 0);
  }, 0);

  const sortedClients = [...clients].sort((a, b) => {
    const compA = getComplianceData(a);
    const compB = getComplianceData(b);
    const workersA = compA?.noOfWorkers || 0;
    const workersB = compB?.noOfWorkers || 0;
    return workersB - workersA;
  });

const monthOptions = [
  ...new Set(
    clients.flatMap((c) =>
      (c.monthlyCompliances || []).map(
        (m) => monthNames[parseInt(m.month, 10) - 1]
      )
    )
  ),
].sort(
  (a, b) => monthNames.indexOf(a) - monthNames.indexOf(b)
);

  const yearOptions = [
    ...new Set(
      clients.flatMap((c) =>
        (c.monthlyCompliances || []).map((m) => String(m.year)),
      ),
    ),
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader />
      </div>
    );
    }
    
    const getExportData = () => {
      return sortedClients.map((c, i) => {
        const comp = getComplianceData(c);

        return {
          "#": i + 1,
          "Client Name": c.name,
          Employee: c.assignedTo || "-",
          "No. of Workers": comp?.noOfWorkers || 0,
          "Bill Amount": comp?.bill || 0,
        };
      });
    };

    const exportExcel = () => {
      if (!clients.length) return alert("No records to export");

      const data = getExportData();

      // 🔥 Add totals
      const totalWorkers = data.reduce(
        (sum, r) => sum + r["No. of Workers"],
        0,
      );
      const totalBill = data.reduce((sum, r) => sum + r["Bill Amount"], 0);

      data.push({
        "#": "",
        "Client Name": "TOTAL",
        Employee: "",
        "No. of Workers": totalWorkers,
        "Bill Amount": totalBill,
      });

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Workers Report");

      XLSX.writeFile(workbook, "NoOfWorkersReport.xlsx");
    };

    const exportPDF = async () => {
      if (!clients.length) return alert("No records to export");

      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();

      const tableColumn = [
        "#",
        "Client Name",
        "Employee",
        "Workers",
        "Bill",
      ];

      const data = getExportData();

      const tableRows = data.map((r) => [
        r["#"],
        r["Client Name"],
        r["Employee"],
        r["No. of Workers"],
        r["Bill Amount"],
      ]);

      // 🔥 Totals
      const totalWorkers = data.reduce(
        (sum, r) => sum + r["No. of Workers"],
        0,
      );
      const totalBill = data.reduce((sum, r) => sum + r["Bill Amount"], 0);

      tableRows.push(["", "TOTAL", "", totalWorkers, totalBill]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 20,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [40, 167, 69] }, // green vibe
      });

      doc.save("NoOfWorkersReport.pdf");
    };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* 🔥 Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/reports")}
          className="flex items-center gap-2 bg-white shadow-sm border px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 text-sm font-medium transition mb-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          Number Of Workers Report
        </h1>
      </div>

      {/* 🔥 Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Clients</p>
          <h2 className="text-2xl font-semibold">{totalClientsWithWorkers}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Workers</p>
          <h2 className="text-2xl font-semibold">{totalWorkers}</h2>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Billing</p>
          <h2 className="text-2xl font-semibold">₹ {totalBill}</h2>
        </div>
      </div>

      {/* 🔥 Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap items-end gap-4 mb-6">
        {/* Filters */}
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

        {/* RIGHT ACTIONS */}
        <div className="ml-auto flex gap-3 items-center">
          {/* 🔴 Reset Button (More Visible) */}
          {(monthFilter || yearFilter) && (
            <button
              onClick={() => {
                setMonthFilter("");
                setYearFilter("");
              }}
              className="
          px-4 py-2 text-sm font-medium
          border border-red-300
          text-red-600
          rounded-lg
          hover:bg-red-50
          transition
        "
            >
              Reset
            </button>
          )}

          {/* 📥 Export Excel */}
          <button
            onClick={exportExcel}
            className="
        flex items-center gap-1
        px-4 py-2 text-sm
        bg-green-600 text-white
        rounded-lg
        hover:bg-green-700
        transition
      "
          >
            Export Excel
          </button>

          {/* 📄 Export PDF */}
          <button
            onClick={exportPDF}
            className="
        flex items-center gap-1
        px-4 py-2 text-sm
        bg-blue-600 text-white
        rounded-lg
        hover:bg-blue-700
        transition
      "
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* 🔥 Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left w-12">#</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Workers</th>
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-left">Bill</th>
            </tr>
          </thead>

          <tbody>
            {sortedClients.length > 0 ? (
              sortedClients.map((c, index) => {
                const comp = getComplianceData(c);

                return (
                  <tr
                    key={c.id}
                    className={`border-t hover:bg-gray-50 transition ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                    }`}
                  >
                    <td className="p-4 text-gray-400 text-sm">{index + 1}</td>

                    <td className="p-4 font-medium text-gray-800">{c.name}</td>

                    <td className="p-4">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md">
                        {comp?.noOfWorkers ?? "-"}
                      </span>
                    </td>

                    <td className="p-4 text-gray-600">{c.assignedTo || "-"}</td>

                    <td className="p-4 font-semibold text-green-600">
                      ₹ {comp?.bill ?? 0}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  No data available for selected filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
