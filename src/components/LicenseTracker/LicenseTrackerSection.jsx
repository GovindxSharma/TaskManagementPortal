import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Edit,
  Plus,
  Trash2,
  Calendar,
  FileText,
  Download,
  Filter,
  Search,
  Award,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowLeft
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "../../components/layout/ToastProvider.jsx";
import Loader from "../../components/layout/Loader.jsx"; // centralized loader
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

function Modal({ open, children, onClose, title, maxWidth = "max-w-lg" }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all duration-300 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} overflow-hidden relative transform scale-100 transition-all duration-300 border border-slate-100 flex flex-col max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50/80 backdrop-blur border-b border-slate-100 px-6 py-4 flex justify-between items-center flex-shrink-0">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <button
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function LicenseTrackerSection() {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [licenses, setLicenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [licenseCategories, setLicenseCategories] = useState([]);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [activeTab, setActiveTab] = useState("all"); // "all" | "clients"
  
  // Expand states for Grouped Client Cards
  const [expandedClients, setExpandedClients] = useState({});

const [newLicense, setNewLicense] = useState({
  client_id: "",
  licenseName: "",
  category: "",
  workerLimit: "",
  startDate: "",
  endDate: "",
});
  
  const [editingLicense, setEditingLicense] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    clientName: "",
    licenseName: "",
    category: "",
    expireMonth: "",
    expireYear: "",
  });

  // FETCH LICENSES
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/license");
      setLicenses(res.data.data || []);
    } catch (err) {
      console.error(err);
      error("Failed to fetch licenses");
    } finally {
      setLoading(false);
    }
  };

  const fetchLicenseCategories = async () => {
    try {
      const res = await axiosInstance.get("/dropdown?type=license");

      setLicenseCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      error("Failed to fetch license categories");
    }
  };

const getCategoryName = (category) => {
  if (!category) return "-";

  if (typeof category === "object") {
    return category.name || "-";
  }

  const found = licenseCategories.find((c) => c._id === category);

  return found?.name || "-";
};

  // FETCH CLIENTS
  const fetchClients = async () => {
    try {
      setLoading(true);
      const companyId = JSON.parse(
        localStorage.getItem("user") || "{}"
      )?.company_id;
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.clients || []);
    } catch (err) {
      console.error(err);
      error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  fetchLicenses();
  fetchClients();
  fetchLicenseCategories();
}, []);

  // DYNAMIC FILTER UTILITIES
const uniqueCategories = useMemo(() => {
  return licenseCategories.sort((a, b) => a.name.localeCompare(b.name));
}, [licenseCategories]);

  const uniqueExpiryYears = useMemo(() => {
    const years = licenses
      .map((l) => {
        if (!l.endDate) return null;
        return new Date(l.endDate).getFullYear().toString();
      })
      .filter(Boolean);
    return [...new Set(years)].sort((a, b) => Number(a) - Number(b));
  }, [licenses]);

  const getLicenseStatus = (endDateStr) => {
    const end = new Date(endDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (end < today) {
      return {
        label: "Expired",
        color: "bg-rose-50 text-rose-700 border-rose-200",
        badge: "bg-rose-100 text-rose-800"
      };
    }

    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59);

    if (end >= startOfCurrentMonth && end <= endOfNextMonth) {
      return {
        label: "Expiring Soon",
        color: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
        badge: "bg-amber-100 text-amber-800"
      };
    }

    return {
      label: "Active",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      badge: "bg-emerald-100 text-emerald-800"
    };
  };

  // MAIN FILTERED LICENSES
  const filteredLicenses = useMemo(() => {
    return licenses.filter((l) => {
      const clientName = l.client_id?.name || "";
      const matchesClient =
        !filters.clientName ||
        clientName.toLowerCase().includes(filters.clientName.toLowerCase());
      
      const matchesLicense =
        !filters.licenseName ||
        l.licenseName.toLowerCase().includes(filters.licenseName.toLowerCase());
      
const matchesCategory =
  !filters.category ||
  (typeof l.category === "object"
    ? l.category?._id === filters.category
    : getCategoryName(l.category) === getCategoryName(filters.category));

      let matchesMonth = true;
      let matchesYear = true;

      if (l.endDate) {
        const date = new Date(l.endDate);
        const m = String(date.getMonth() + 1).padStart(2, "0"); // 1-indexed month
        const y = String(date.getFullYear());

        if (filters.expireMonth) {
          matchesMonth = m === filters.expireMonth;
        }
        if (filters.expireYear) {
          matchesYear = y === filters.expireYear;
        }
      } else {
        if (filters.expireMonth || filters.expireYear) {
          return false;
        }
      }

      return (
        matchesClient &&
        matchesLicense &&
        matchesCategory &&
        matchesMonth &&
        matchesYear
      );
    });
  }, [licenses, filters]);

  // GROUP BY CLIENT
  const groupedClients = useMemo(() => {
    const clientMap = {};
    filteredLicenses.forEach((l) => {
      const client = l.client_id;
      if (!client) return;

      if (!clientMap[client._id]) {
        const fullClient = clients.find((c) => c._id === client._id) || client;
        clientMap[client._id] = {
          ...fullClient,
          licenses: [],
        };
      }
      clientMap[client._id].licenses.push(l);
    });
    return Object.values(clientMap).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredLicenses, clients]);

  // STATS DASHBOARD COUNTERS
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      0,
      23,
      59,
      59
    );

    let active = 0;
    let expiring = 0;
    let expired = 0;

    licenses.forEach((l) => {
      if (!l.endDate) return;
      const end = new Date(l.endDate);
      if (end < today) {
        expired++;
      } else if (end >= startOfCurrentMonth && end <= endOfNextMonth) {
        expiring++;
      } else {
        active++;
      }
    });

    return {
      total: licenses.length,
      active,
      expiring,
      expired,
    };
  }, [licenses]);

  // Add License Action
  const handleAddLicense = async () => {
    if (
      !newLicense.client_id ||
      !newLicense.licenseName ||
      !newLicense.category ||
      !newLicense.startDate ||
      !newLicense.endDate
    ) {
      return error("All fields are required");
    }
    try {
      setLoading(true);
      await axiosInstance.post("/license", newLicense);
      success("License added successfully");
      setShowAddModal(false);
      setNewLicense({
        client_id: "",
        licenseName: "",
        category: "",
        workerLimit: "",
        startDate: "",
        endDate: "",
      });
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to add license");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setNewLicense({
      client_id: "",
      licenseName: "",
      category: "",
      workerLimit: "",
      startDate: "",
      endDate: "",
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewLicense({
      client_id: "",
      licenseName: "",
      category: "",
      workerLimit: "",
      startDate: "",
      endDate: "",
    });
  };

  // Delete License Action
  const handleDeleteLicense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this license?")) return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/license/${id}`);
      success("License deleted successfully");
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to delete license");
    } finally {
      setLoading(false);
    }
  };

  // Open Edit Dialog
const handleEditClick = (l) => {
setEditingLicense({
  _id: l._id,
  client_id: l.client_id?._id || l.client_id,
  licenseName: l.licenseName,
  category: typeof l.category === "object" ? l.category._id : l.category,
  workerLimit: l.workerLimit || 0,
  startDate: l.startDate.slice(0, 10),
  endDate: l.endDate.slice(0, 10),
});
};

  // Save Edit Action
  const handleSaveEdit = async () => {
    if (
      !editingLicense.licenseName ||
      !editingLicense.category ||
      !editingLicense.startDate ||
      !editingLicense.endDate
    ) {
      return error("All fields are required");
    }
    try {
      setLoading(true);
      await axiosInstance.put(`/license/${editingLicense._id}`, editingLicense);
      success("License updated successfully");
      setEditingLicense(null);
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to update license");
    } finally {
      setLoading(false);
    }
  };

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      clientName: "",
      licenseName: "",
      category: "",
      expireMonth: "",
      expireYear: "",
    });
  };

  // Export PDF (Respecting Filters)
  const exportLicensesPDF = () => {
    if (!filteredLicenses.length) return error("No licenses to export");

    const doc = new jsPDF();
    
    // Title & Header Info
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("License Tracker Report", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Filtered Count: ${filteredLicenses.length}`, 14, 20);

    const tableColumn = [
      "Client",
      "License Name",
      "Category",
      "Start Date",
      "End Date",
      "Status",
    ];
    const tableRows = filteredLicenses.map((l) => {
      const statusInfo = getLicenseStatus(l.endDate);
      return [
        l.client_id?.name || "-",
        l.licenseName,
        l.category?.value || "-",
        l.startDate.slice(0, 10),
        l.endDate.slice(0, 10),
        statusInfo.label,
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] }, // indigo header
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    doc.save("Filtered_Licenses.pdf");
  };

  // Export Excel (Respecting Filters)
  const exportLicensesExcel = () => {
    if (!filteredLicenses.length) return error("No licenses to export");

    const worksheet = XLSX.utils.json_to_sheet(
      filteredLicenses.map((l) => {
        const statusInfo = getLicenseStatus(l.endDate);
        return {
          Client: l.client_id?.name || "-",
          "License Name": l.licenseName,
          Category: l.category?.value || "-",
          "Start Date": l.startDate.slice(0, 10),
          "End Date": l.endDate.slice(0, 10),
          Status: statusInfo.label,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Filtered Licenses");
    XLSX.writeFile(workbook, "Filtered_Licenses.xlsx");
  };

  // Export Expiring Licenses PDF
  const exportExpiringLicensesPDF = () => {
    if (!expiringLicenses.length) return error("No expiring licenses to export");

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text("Expiring Licenses Report", 14, 15);
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on ${new Date().toLocaleDateString()} | Expiring Count: ${expiringLicenses.length}`, 14, 20);

    const tableColumn = [
      "Client",
      "License Name",
      "Category",
      "End Date",
      "Remaining Days",
    ];
    
    const tableRows = expiringLicenses.map((l) => {
      const end = new Date(l.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      return [
        l.client_id?.name || "-",
        l.licenseName,
        l.category?.value || "-",
        l.endDate.slice(0, 10),
        diffDays <= 0 ? "Expired" : `${diffDays} Days`,
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [249, 115, 22], textColor: [255, 255, 255] }, // Orange/amber header
      alternateRowStyles: { fillColor: [254, 243, 199] },
    });

    doc.save("Expiring_Licenses.pdf");
  };

  // Export Expiring Licenses Excel
  const exportExpiringLicensesExcel = () => {
    if (!expiringLicenses.length) return error("No expiring licenses to export");

    const worksheet = XLSX.utils.json_to_sheet(
      expiringLicenses.map((l) => {
        const end = new Date(l.endDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
        return {
          Client: l.client_id?.name || "-",
          "License Name": l.licenseName,
          "Category": l.category?.value || "-",
          "End Date": l.endDate.slice(0, 10),
          "Remaining Days": diffDays <= 0 ? "Expired" : diffDays,
        };
      })
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expiring Licenses");
    XLSX.writeFile(workbook, "Expiring_Licenses.xlsx");
  };

  // Collapsible toggle for Client Cards
  const toggleClientCard = (id) => {
    setExpandedClients((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Helper for quick Add License from Client Card
  const handleQuickAddForClient = (clientId) => {
    setNewLicense({
      client_id: clientId,
      licenseName: "",
      category: "",
      workerLimit: "",
      startDate: "",
      endDate: "",
    });
    setShowAddModal(true);
  };

  const expiringLicenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfNextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 2,
      0,
      23,
      59,
      59
    );

    return licenses.filter((l) => {
      if (!l.endDate) return false;
      const end = new Date(l.endDate);
      return end >= startOfCurrentMonth && end <= endOfNextMonth;
    });
  }, [licenses]);

  const monthsList = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  return (
    <div className="bg-slate-50/50 min-h-screen p-6 md:p-8 space-y-8">
      {loading && <Loader />}

      {/* TOP HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <div className="flex items-center gap-3">
            <button
              className="group bg-slate-50 border border-slate-200/60 text-slate-600 hover:text-slate-900 px-4 py-2 rounded-xl hover:bg-slate-100 transition-all font-semibold text-sm flex items-center gap-2 cursor-pointer shadow-sm shadow-slate-100"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft
                size={16}
                className="group-hover:-translate-x-0.5 transition-transform duration-200 text-indigo-500"
              />
              <span>Back</span>
            </button>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
              License Tracker
            </h2>
          </div>
          <p className="text-slate-500 text-sm mt-1 ml-1">
            Monitor, manage, and export client software and operational licenses
          </p>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            className="bg-orange-50 text-orange-600 border border-orange-200/80 px-4 py-2 rounded-xl font-semibold hover:bg-orange-100 transition-all flex items-center gap-2 cursor-pointer relative"
            onClick={() => setShowExpiringModal(true)}
          >
            <AlertTriangle size={16} />
            Expiring Soon
            {expiringLicenses.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold border-2 border-white animate-bounce">
                {expiringLicenses.length}
              </span>
            )}
          </button>

          <button
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all font-semibold shadow-sm shadow-indigo-100 cursor-pointer"
            onClick={handleOpenAddModal}
          >
            <Plus size={18} /> Add License
          </button>

          <div className="h-6 w-px bg-slate-200 hidden sm:block mx-1"></div>

          {/* Export buttons */}
          <button
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm flex items-center gap-2 cursor-pointer"
            onClick={exportLicensesPDF}
          >
            <Download size={15} className="text-indigo-500" /> PDF
          </button>
          <button
            className="bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all font-semibold text-sm flex items-center gap-2 cursor-pointer"
            onClick={exportLicensesExcel}
          >
            <Download size={15} className="text-emerald-500" /> Excel
          </button>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Licenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-slate-400 text-sm font-medium">
              Total Licenses
            </span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {stats.total}
            </h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
            <Award size={24} />
          </div>
        </div>

        {/* Active Licenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-slate-400 text-sm font-medium">
              Active Licenses
            </span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {stats.active}
            </h3>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-slate-400 text-sm font-medium">
              Expiring Soon
            </span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {stats.expiring}
            </h3>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* Expired Licenses */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all duration-300">
          <div>
            <span className="text-slate-400 text-sm font-medium">
              Expired Licenses
            </span>
            <h3 className="text-3xl font-bold text-slate-800 mt-1">
              {stats.expired}
            </h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex items-center gap-2 text-slate-800 font-semibold text-base border-b border-slate-100 pb-3">
          <Filter size={18} className="text-indigo-500" />
          <span>Filter & Search Licenses</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Client Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-3.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search Client..."
              value={filters.clientName}
              onChange={(e) =>
                setFilters({ ...filters, clientName: e.target.value })
              }
              className="border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm placeholder:text-slate-400"
            />
          </div>

          {/* License Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-3.5 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search License Name..."
              value={filters.licenseName}
              onChange={(e) =>
                setFilters({ ...filters, licenseName: e.target.value })
              }
              className="border border-slate-200 pl-9 pr-3 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter */}
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="border border-slate-200 px-3 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm"
          >
            <option value="">All Categories</option>

            {uniqueCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Expiry Month */}
          <select
            value={filters.expireMonth}
            onChange={(e) =>
              setFilters({ ...filters, expireMonth: e.target.value })
            }
            className="border border-slate-200 px-3 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm"
          >
            <option value="">Expiry Month (All)</option>
            {monthsList.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          {/* Expiry Year */}
          <select
            value={filters.expireYear}
            onChange={(e) =>
              setFilters({ ...filters, expireYear: e.target.value })
            }
            className="border border-slate-200 px-3 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all text-sm"
          >
            <option value="">Expiry Year (All)</option>
            {uniqueExpiryYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr}
              </option>
            ))}
          </select>
        </div>

        {/* Clear Filters Button */}
        {(filters.clientName ||
          filters.licenseName ||
          filters.category ||
          filters.expireMonth ||
          filters.expireYear) && (
          <div className="flex justify-end pt-2">
            <button
              className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200 transition-all text-sm font-semibold flex items-center gap-1.5 cursor-pointer"
              onClick={resetFilters}
            >
              <RefreshCw size={14} /> Clear Active Filters
            </button>
          </div>
        )}
      </div>

      {/* VIEW TOGGLE TABS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div className="bg-slate-100 p-1 rounded-xl flex gap-1 w-fit border border-slate-200/50">
          <button
            onClick={() => setActiveTab("all")}
            className={`${
              activeTab === "all"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/40"
            } font-semibold px-4.5 py-2 rounded-lg text-sm transition-all cursor-pointer`}
          >
            All Licenses ({filteredLicenses.length})
          </button>
          <button
            onClick={() => setActiveTab("clients")}
            className={`${
              activeTab === "clients"
                ? "bg-white text-indigo-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800 hover:bg-slate-200/40"
            } font-semibold px-4.5 py-2 rounded-lg text-sm transition-all cursor-pointer`}
          >
            Grouped by Client ({groupedClients.length})
          </button>
        </div>

        <p className="text-slate-400 text-xs font-medium self-end">
          Showing {filteredLicenses.length} of {licenses.length} Total Licenses
        </p>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === "all" ? (
        /* ALL LICENSES LIST TABLE */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-sm">
                  <th className="px-6 py-4">Client Name</th>
                  <th className="px-6 py-4">License Name</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Start Date</th>
                  <th className="px-6 py-4">End Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {filteredLicenses.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-slate-400 italic"
                    >
                      No licenses match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLicenses.map((l) => {
                    const statusInfo = getLicenseStatus(l.endDate);
                    return (
                      <tr
                        key={l._id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {l.client_id?.name || "-"}
                        </td>
                        <td className="px-6 py-4 font-medium text-indigo-600">
                          {l.licenseName}
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200/40">
                            {getCategoryName(l.category)}{" "}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          {l.startDate.slice(0, 10)}
                        </td>
                        <td className="px-6 py-4 text-slate-800 font-medium">
                          {l.endDate.slice(0, 10)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${statusInfo.color}`}
                          >
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="p-2 bg-slate-50 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-100 rounded-xl transition cursor-pointer"
                              onClick={() => handleEditClick(l)}
                              title="Edit License"
                            >
                              <Edit size={15} />
                            </button>
                            <button
                              className="p-2 bg-slate-50 text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-100 rounded-xl transition cursor-pointer"
                              onClick={() => handleDeleteLicense(l._id)}
                              title="Delete License"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GROUPED BY CLIENT GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupedClients.length === 0 ? (
            <div className="col-span-full bg-white text-center py-12 rounded-2xl border border-slate-100 shadow-sm text-slate-400 italic">
              No clients with licenses matching criteria.
            </div>
          ) : (
            groupedClients.map((client) => {
              const isExpanded = expandedClients[client._id];
              return (
                <div
                  key={client._id}
                  className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="p-5 border-b border-slate-50 bg-slate-50/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg leading-tight">
                          {client.name}
                        </h4>
                        <p className="text-slate-400 text-xs mt-1">
                          {client.email || "No Email"}
                        </p>
                      </div>
                      <span className="bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-xl text-xs">
                        {client.licenses.length} License(s)
                      </span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/60 flex items-center justify-between text-xs text-slate-500">
                      <div>
                        <span className="block font-medium text-slate-400">
                          Contact
                        </span>
                        <span className="text-slate-700 font-semibold mt-0.5 block">
                          {client.contactPerson || "-"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block font-medium text-slate-400">
                          Phone
                        </span>
                        <span className="text-slate-700 font-semibold mt-0.5 block">
                          {client.contactNumber || "-"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick License Count & Quick Add */}
                  <div className="px-5 py-3 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <button
                      onClick={() => toggleClientCard(client._id)}
                      className="text-indigo-600 hover:text-indigo-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {isExpanded ? (
                        <>
                          Hide Licenses <ChevronUp size={14} />
                        </>
                      ) : (
                        <>
                          View Licenses <ChevronDown size={14} />
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleQuickAddForClient(client._id)}
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={14} /> Add One
                    </button>
                  </div>

                  {/* Expand Drawer */}
                  {isExpanded && (
                    <div className="p-4 bg-slate-50/40 divide-y divide-slate-100 flex-grow max-h-72 overflow-y-auto">
                      {client.licenses.map((lic) => {
                        const statusInfo = getLicenseStatus(lic.endDate);
                        return (
                          <div
                            key={lic._id}
                            className="py-3 first:pt-0 last:pb-0 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-semibold text-slate-800 text-sm">
                                  {lic.licenseName}
                                </h5>
                                <p className="text-[11px] text-slate-400">
                                  Category: {getCategoryName(lic.category)}{" "}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-xs">
                              <span className="text-slate-400">
                                Expiry:{" "}
                                <strong className="text-slate-600">
                                  {lic.endDate.slice(0, 10)}
                                </strong>
                              </span>

                              <div className="flex gap-2">
                                <button
                                  className="text-slate-400 hover:text-indigo-600 transition p-1 hover:bg-indigo-50 rounded cursor-pointer"
                                  onClick={() => handleEditClick(lic)}
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  className="text-slate-400 hover:text-rose-600 transition p-1 hover:bg-rose-50 rounded cursor-pointer"
                                  onClick={() => handleDeleteLicense(lic._id)}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* EXPIRING LICENSES LIST DIALOG */}
      <Modal
        open={showExpiringModal}
        onClose={() => setShowExpiringModal(false)}
        title="Licenses Expiring Soon (This & Next Month)"
        maxWidth="max-w-3xl"
      >
        {expiringLicenses.length === 0 ? (
          <div className="text-center py-8">
            <span className="block text-4xl mb-2">🎉</span>
            <p className="text-slate-500 font-medium italic">
              No licenses expiring soon! All look good.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-end gap-2">
              <button
                className="bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-slate-100"
                onClick={exportExpiringLicensesPDF}
              >
                <Download size={13} className="text-orange-500" /> Export PDF
              </button>
              <button
                className="bg-white border border-slate-200 text-slate-700 px-3.5 py-2 rounded-xl hover:bg-slate-50 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-slate-100"
                onClick={exportExpiringLicensesExcel}
              >
                <Download size={13} className="text-emerald-500" /> Export Excel
              </button>
            </div>

            <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold">
                    <th className="p-3">Client</th>
                    <th className="p-3">License Name</th>
                    <th className="p-3">Expiry Date</th>
                    <th className="p-3 text-center">Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expiringLicenses.map((l) => {
                    const end = new Date(l.endDate);
                    const today = new Date();
                    const diffDays = Math.ceil(
                      (end - today) / (1000 * 60 * 60 * 24),
                    );

                    return (
                      <tr
                        key={l._id}
                        className="hover:bg-slate-50/50 transition"
                      >
                        <td className="p-3 font-semibold text-slate-800">
                          {l.client_id?.name}
                        </td>
                        <td className="p-3 font-medium text-indigo-600">
                          {l.licenseName}
                        </td>
                        <td className="p-3 text-slate-500">
                          {end.toISOString().slice(0, 10)}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              diffDays <= 30
                                ? "bg-rose-50 text-rose-700 border border-rose-100"
                                : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                          >
                            {diffDays <= 0 ? "Expired" : `${diffDays} Day(s)`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* ADD LICENSE MODAL */}
      <Modal
        open={showAddModal}
        onClose={handleCloseAddModal}
        title="Add New License"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Select Client
            </label>
            <select
              value={newLicense.client_id}
              onChange={(e) =>
                setNewLicense({ ...newLicense, client_id: e.target.value })
              }
              className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
            >
              <option value="">-- Choose Client --</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              License Name
            </label>
            <input
              type="text"
              placeholder="e.g. Tally Prime Multi-User"
              value={newLicense.licenseName}
              onChange={(e) =>
                setNewLicense({ ...newLicense, licenseName: e.target.value })
              }
              className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              value={newLicense.category}
              onChange={(e) =>
                setNewLicense({
                  ...newLicense,
                  category: e.target.value,
                })
              }
              className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Select Category</option>

              {licenseCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Worker Limit (if applicable)
            </label>

            <input
              type="number"
              min="0"
              value={newLicense.workerLimit || ""}
              onChange={(e) =>
                setNewLicense({
                  ...newLicense,
                  workerLimit: e.target.value,
                })
              }
              className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full"
              placeholder="Enter worker limit"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={newLicense.startDate}
                onChange={(e) =>
                  setNewLicense({ ...newLicense, startDate: e.target.value })
                }
                className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                End Date (Expiry)
              </label>
              <input
                type="date"
                value={newLicense.endDate}
                onChange={(e) =>
                  setNewLicense({ ...newLicense, endDate: e.target.value })
                }
                className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm cursor-pointer"
              onClick={handleCloseAddModal}
            >
              Cancel
            </button>
            <button
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-sm cursor-pointer"
              onClick={handleAddLicense}
            >
              Save License
            </button>
          </div>
        </div>
      </Modal>

      {/* EDIT LICENSE MODAL */}
      <Modal
        open={!!editingLicense}
        onClose={() => setEditingLicense(null)}
        title="Edit License Information"
      >
        {editingLicense && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                License Name
              </label>
              <input
                type="text"
                value={editingLicense.licenseName}
                onChange={(e) =>
                  setEditingLicense({
                    ...editingLicense,
                    licenseName: e.target.value,
                  })
                }
                className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={editingLicense.category || ""}
                onChange={(e) =>
                  setEditingLicense({
                    ...editingLicense,
                    category: e.target.value,
                  })
                }
                className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full"
              >
                <option value="">Select Category</option>

                {licenseCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Worker Limit (if applicable)
              </label>

              <input
                type="number"
                min="0"
                value={editingLicense.workerLimit || ""}
                onChange={(e) =>
                  setEditingLicense({
                    ...editingLicense,
                    workerLimit: e.target.value,
                  })
                }
                className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingLicense.startDate}
                  onChange={(e) =>
                    setEditingLicense({
                      ...editingLicense,
                      startDate: e.target.value,
                    })
                  }
                  className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={editingLicense.endDate}
                  onChange={(e) =>
                    setEditingLicense({
                      ...editingLicense,
                      endDate: e.target.value,
                    })
                  }
                  className="border border-slate-200 px-3.5 py-2.5 rounded-xl w-full text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
              <button
                className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-all font-semibold text-sm cursor-pointer"
                onClick={() => setEditingLicense(null)}
              >
                Cancel
              </button>
              <button
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all font-semibold text-sm shadow-sm cursor-pointer"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
