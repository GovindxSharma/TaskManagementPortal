import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";
import { ArrowLeft } from "lucide-react";
import * as XLSX from "xlsx";

export default function CategoryDetails() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const monthFilter = state?.monthFilter;
  const yearFilter = state?.yearFilter;
  const categoryName = state?.categoryName;

  // 🚨 Refresh-safe guard
  if (!monthFilter || !yearFilter) {
    return (
      <div className="p-6">
        <p className="text-red-500 mb-4">
          Missing filters. Please go back and select Month & Year.
        </p>

        <button
          onClick={() => navigate("/admin/reports/category")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Back to Categories
        </button>
      </div>
    );
  }

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);

      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const params = new URLSearchParams();
      params.append("company_id", user.company_id);

      const monthNumber = String(monthNames.indexOf(monthFilter) + 1).padStart(
        2,
        "0",
      );

      params.append("month", monthNumber);
      params.append("year", yearFilter);
      params.append("category_id", id);

      const { data } = await axios.get(
        `/client/clients-with-compliance?${params.toString()}`,
      );

      setClients(data.clients || []);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  }, [id, monthFilter, yearFilter]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const getExportData = () => {
    return clients.map((c, i) => {
      const comp = c.monthlyCompliances?.[0];
      return {
        "#": i + 1,
        "Client Name": c.name,
        "Workers": comp?.noOfWorkers ?? 0,
        "Bill Amount (INR)": comp?.bill ?? 0,
      };
    });
  };

  const exportExcel = () => {
    if (!clients.length) return alert("No records to export");

    const data = getExportData();

    // Add totals
    data.push({
      "#": "TOTAL",
      "Client Name": "",
      "Workers": totalWorkers,
      "Bill Amount (INR)": totalBill,
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Category Details");

    XLSX.writeFile(workbook, `${categoryName}_Category_Report.xlsx`);
  };

  const exportPDF = async () => {
    if (!clients.length) return alert("No records to export");

    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();

    const tableColumn = ["#", "Client Name", "Workers", "Bill Amount"];
    const data = getExportData();
    const tableRows = data.map((r) => [
      r["#"],
      r["Client Name"],
      r["Workers"],
      `INR ${r["Bill Amount (INR)"]}`,
    ]);

    tableRows.push(["", "TOTAL", totalWorkers, `INR ${totalBill}`]);

    doc.text(`${categoryName} Category Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`${monthFilter} ${yearFilter}`, 14, 20);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }, // matching theme color
    });

    doc.save(`${categoryName}_Category_Report.pdf`);
  };

  // 🔥 Totals
  const totalWorkers = clients.reduce(
    (sum, c) => sum + (c.monthlyCompliances?.[0]?.noOfWorkers || 0),
    0,
  );

  const totalBill = clients.reduce(
    (sum, c) => sum + (c.monthlyCompliances?.[0]?.bill || 0),
    0,
  );

  if (loading) {
    return (
      <div className="h-[70vh] flex justify-center items-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* 🔙 Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 bg-white shadow-sm border px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 text-sm font-medium transition mb-4 cursor-pointer"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* 🔥 Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {categoryName} Category
        </h1>
        <p className="text-gray-500 text-sm">
          {monthFilter} {yearFilter}
        </p>
      </div>

      {/* 🔥 Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Workers</p>
          <h2 className="text-xl font-semibold">{totalWorkers}</h2>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm">
          <p className="text-gray-500 text-sm">Total Billing</p>
          <h2 className="text-xl font-semibold text-green-600">
            ₹ {totalBill}
          </h2>
        </div>
      </div>

      {/* 🔥 Export Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={exportExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer text-sm font-semibold transition"
        >
          Export Excel
        </button>

        <button
          onClick={exportPDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-semibold transition"
        >
          Export PDF
        </button>
      </div>

      {/* 🔥 Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 w-12">#</th>
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Workers</th>
              <th className="p-4 text-left">Bill</th>
            </tr>
          </thead>

          <tbody>
            {clients.length > 0 ? (
              clients.map((c, i) => {
                const comp = c.monthlyCompliances?.[0];

                return (
                  <tr key={c._id} className="border-t hover:bg-gray-50">
                    <td className="p-4 text-gray-400">{i + 1}</td>
                    <td className="p-4 font-medium">{c.name}</td>
                    <td className="p-4">{comp?.noOfWorkers ?? 0}</td>
                    <td className="p-4 text-green-600 font-semibold">
                      ₹ {comp?.bill ?? 0}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  No data found for this category
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
