import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import { Search, X, FileText, File } from "lucide-react";
import Dropdown from "../layout/Dropdown";
import * as XLSX from "xlsx";

// ─── Skeleton — pure CSS, no Tailwind keyframes needed ───────────────────────
const SKELETON_CSS = `
@keyframes cc-shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.cc-skel {
  position: relative;
  overflow: hidden;
  background: #edf0f2;
  border-radius: 6px;
  height: 14px;
  flex-shrink: 0;
}
.cc-skel::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.65) 50%,
    transparent 100%
  );
  animation: cc-shimmer 1.5s ease-in-out infinite;
}
`;

const COL_CONFIGS = [
  [[20]], // #
  [[110], [90], [130]], // Client Name
  [[95], [75], [115]], // Company Name
  [[80], [60], [100]], // Business Unit
  [[80], [60], [100]], // Assigned To
  [[64, 56]], // Last Update  (badge + month pill)
  [[64, 56]], // Bill Update
  [[58]], // Client Status
];

function SkeletonRow({ index }) {
  return (
    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
      {COL_CONFIGS.map((variants, col) => {
        const pills = variants[index % variants.length];
        return (
          <td key={col} style={{ padding: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {pills.map((w, pi) => (
                <div key={pi} className="cc-skel" style={{ width: w }} />
              ))}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const MONTH_NAMES = [
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

const SEARCH_MAX_LENGTH = 30;

const DATA_STATUS_OPTIONS = [
  "Data Received",
  "Data Incomplete",
  "Not Received",
  "Inactive",
];
const WORK_PROGRESS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Completed",
  "Payment Overdue",
];
const BILL_STATUS_OPTIONS = ["Bill Generated", "Bill Pending"];

// ─── sessionStorage key ───────────────────────────────────────────────────────
const SS_KEY = "customerComplianceFilters";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatMonth = (str) => {
  if (!str || str === "-") return "-";
  const parts = str.trim().split(" ");
  const monthYear = parts[parts.length - 1];
  const [m, y] = (monthYear || "").split("-");
  if (!m || !y || isNaN(Number(m)) || isNaN(Number(y))) return "-";
  const monthIndex = parseInt(m, 10) - 1;
  if (monthIndex < 0 || monthIndex > 11) return "-";
  return `${MONTH_NAMES[monthIndex]} ${y}`;
};

const parseStatus = (str) => {
  if (!str || str === "-") return "-";
  const parts = str.trim().split(" ");
  if (parts.length <= 1) return str;
  parts.pop();
  return parts.join(" ");
};

const normalizeBillStatus = (value) => {
  if (value === "Bill Generated") return "Generated";
  if (value === "Bill Pending") return "Pending";
  return "";
};

const readFilters = () => {
  try {
    const raw = sessionStorage.getItem(SS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return null;
};

const saveFilters = (filters) => {
  try {
    sessionStorage.setItem(SS_KEY, JSON.stringify(filters));
  } catch (_) {}
};

const clearFilters = () => {
  try {
    sessionStorage.removeItem(SS_KEY);
  } catch (_) {}
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerCompliance() {
  const navigate = useNavigate();

  const saved = readFilters();

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchText, setSearchText] = useState(saved?.searchText || "");
  const [debouncedSearch, setDebouncedSearch] = useState(
    saved?.searchText || "",
  );
  const [employeeFilter, setEmployeeFilter] = useState(
    saved?.employeeFilter || "",
  );
  const [dataStatusFilter, setDataStatusFilter] = useState(
    saved?.dataStatusFilter || "",
  );
  const [workProgressFilter, setWorkProgressFilter] = useState(
    saved?.workProgressFilter || "",
  );
  const [billStatusFilter, setBillStatusFilter] = useState(
    saved?.billStatusFilter || "",
  );
  const [monthFilter, setMonthFilter] = useState(saved?.monthFilter || "");
  const [yearFilter, setYearFilter] = useState(saved?.yearFilter || "");

  const [allEmployeeOptions, setAllEmployeeOptions] = useState([]);
  const [allMonthOptions, setAllMonthOptions] = useState([]);
  const [allYearOptions, setAllYearOptions] = useState([]);

  const abortRef = useRef(null);
  const searchInputRef = useRef(null);
  const isFirstFetch = useRef(true);

  /**
   * Guard flag — set to true immediately before navigating into ANY record
   * (client row or monthly card). The unmount cleanup checks this flag and
   * skips clearFilters() so the filters survive the round-trip back.
   *
   * Any other navigation (← Back, sidebar, browser back from THIS page)
   * leaves the flag false, so filters are wiped on unmount as intended.
   */
  const navigatingIntoRecord = useRef(false);

  // ── Inject skeleton CSS once ───────────────────────────────────────────────
  useEffect(() => {
    const id = "cc-skeleton-style";
    if (!document.getElementById(id)) {
      const tag = document.createElement("style");
      tag.id = id;
      tag.textContent = SKELETON_CSS;
      document.head.appendChild(tag);
    }
    return () => {
      if (!navigatingIntoRecord.current) clearFilters();
      navigatingIntoRecord.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keep sessionStorage in sync ────────────────────────────────────────────
  useEffect(() => {
    saveFilters({
      searchText,
      employeeFilter,
      dataStatusFilter,
      workProgressFilter,
      billStatusFilter,
      monthFilter,
      yearFilter,
    });
  }, [
    searchText,
    employeeFilter,
    dataStatusFilter,
    workProgressFilter,
    billStatusFilter,
    monthFilter,
    yearFilter,
  ]);

  // ── Debounce search ────────────────────────────────────────────────────────
  useEffect(() => {
    const trimmed = searchText.trim();
    const timer = setTimeout(() => setDebouncedSearch(trimmed), 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  // ── Fetch clients ──────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      setLoading(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const params = new URLSearchParams();
      params.append("company_id", user.company_id);

      if (employeeFilter) params.append("employee", employeeFilter);
      if (dataStatusFilter) params.append("dataStatus", dataStatusFilter);
      if (workProgressFilter) params.append("workProgress", workProgressFilter);
      if (billStatusFilter) {
        const normalized = normalizeBillStatus(billStatusFilter);
        if (normalized) params.append("billStatus", normalized);
      }
      if (monthFilter) {
        const monthNumber = String(
          MONTH_NAMES.indexOf(monthFilter) + 1,
        ).padStart(2, "0");
        params.append("month", monthNumber);
      }
      if (yearFilter) params.append("year", yearFilter);
      if (debouncedSearch) params.append("searchText", debouncedSearch);

      const { data } = await axios.get(
        `/client/clients-with-compliance?${params.toString()}`,
        { signal: controller.signal },
      );

      const fetched = data.clients || [];
      setClients(fetched);

      if (isFirstFetch.current) {
        isFirstFetch.current = false;

        setAllEmployeeOptions([
          ...new Set(fetched.map((c) => c.assignedTo).filter(Boolean)),
        ]);

        setAllMonthOptions(
          [
            ...new Set(
              fetched
                .flatMap((c) =>
                  (c.monthlyCompliances || []).map(
                    (m) => MONTH_NAMES[parseInt(m.month, 10) - 1],
                  ),
                )
                .filter(Boolean),
            ),
          ].sort((a, b) => MONTH_NAMES.indexOf(a) - MONTH_NAMES.indexOf(b)),
        );

        setAllYearOptions(
          [
            ...new Set(
              fetched
                .flatMap((c) =>
                  (c.monthlyCompliances || []).map((m) => String(m.year)),
                )
                .filter(Boolean),
            ),
          ].sort((a, b) => Number(b) - Number(a)),
        );
      }
    } catch (err) {
      if (err.name === "CanceledError" || err.name === "AbortError") return;
      console.error(err);
      alert("Failed to fetch clients");
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        if (
          searchInputRef.current &&
          document.activeElement !== searchInputRef.current
        ) {
          const len = searchInputRef.current.value.length;
          searchInputRef.current.focus({ preventScroll: true });
          searchInputRef.current.setSelectionRange(len, len);
        }
      });
    }
  }, [
    employeeFilter,
    dataStatusFilter,
    workProgressFilter,
    billStatusFilter,
    monthFilter,
    yearFilter,
    debouncedSearch,
  ]);

  useEffect(() => {
    fetchClients();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchClients]);

  // ── Reset filters ──────────────────────────────────────────────────────────
  const resetFilters = () => {
    clearFilters();
    setSearchText("");
    setDebouncedSearch("");
    setEmployeeFilter("");
    setDataStatusFilter("");
    setWorkProgressFilter("");
    setBillStatusFilter("");
    setMonthFilter("");
    setYearFilter("");
    isFirstFetch.current = true;
  };

  // ── drillInto — use for ALL navigations into detail records ───────────────
  // Sets the guard flag so unmount cleanup preserves filters, then navigates.
  const drillInto = (path, state = {}) => {
    navigatingIntoRecord.current = true;
    saveFilters({
      searchText,
      employeeFilter,
      dataStatusFilter,
      workProgressFilter,
      billStatusFilter,
      monthFilter,
      yearFilter,
    });
    navigate(path, { state });
  };

  // ── Client row click ───────────────────────────────────────────────────────
  const handleClientClick = (id) => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const filters = {
      month: monthFilter
        ? String(MONTH_NAMES.indexOf(monthFilter) + 1).padStart(2, "0")
        : "",
      year: yearFilter || "",
      dataStatus: dataStatusFilter || "",
      workProgress: workProgressFilter || "",
      billStatus: normalizeBillStatus(billStatusFilter),
    };

    if (user.role === "Admin") drillInto(`/admin/customer/${id}`, { filters });
    else if (user.role === "Employee")
      drillInto(`/employee/customer/${id}`, { filters });
    else if (user.role === "Accountant")
      drillInto(`/accountant/customer/${id}`, { filters });
  };

  // ── Badge renderers ────────────────────────────────────────────────────────
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
        {monthText !== "-" && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {monthText}
          </span>
        )}
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
        {billMonth !== "-" && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {billMonth}
          </span>
        )}
      </div>
    );
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const exportExcel = () => {
    if (!clients.length) return alert("No records to export");
    const data = clients.map((c, i) => ({
      "#": i + 1,
      "Client Name": c.name,
      "Company Name": c.businessUnit || "-",
      "Business Unit": c.site || "-",
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
    if (!clients.length) return alert("No records to export");
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();
    const tableColumn = [
      "#",
      "Client Name",
      "Company Name",
      "Business Unit",
      "Assigned To",
      "Last Update",
      "Last Update Month",
      "Bill Update",
      "Bill Update Month",
      "Client Status",
    ];
    const tableRows = clients.map((c, i) => [
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
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 144, 255], textColor: 255 },
    });
    doc.save("ClientCompliance.pdf");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          {/* Back — navigatingIntoRecord stays false, so unmount clears filters */}
          <button
            onClick={() => {
              clearFilters();
              navigate(-1);
            }}
            className="px-3 py-2 bg-white rounded-lg shadow-sm hover:bg-gray-100 text-gray-600"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-800 mt-2">
            Compliance Tracker
          </h1>
        </div>

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
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search client, business unit, or company..."
            value={searchText}
            maxLength={SEARCH_MAX_LENGTH}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-8 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 shadow-sm transition-all duration-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300 outline-none"
          />
          {searchText && (
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setSearchText("");
                searchInputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <Dropdown
          label="Select Employee"
          options={allEmployeeOptions}
          value={employeeFilter}
          onChange={setEmployeeFilter}
          placeholder="Select Employee"
        />
        <Dropdown
          label="Data Status"
          options={DATA_STATUS_OPTIONS}
          value={dataStatusFilter}
          onChange={setDataStatusFilter}
          placeholder="Data Status"
        />
        <Dropdown
          label="Work Progress"
          options={WORK_PROGRESS_OPTIONS}
          value={workProgressFilter}
          onChange={setWorkProgressFilter}
          placeholder="Work Progress"
        />
        <Dropdown
          label="Bill Status"
          options={BILL_STATUS_OPTIONS}
          value={billStatusFilter}
          onChange={setBillStatusFilter}
          placeholder="Bill Status"
        />
        <Dropdown
          label="Month"
          options={allMonthOptions}
          value={monthFilter}
          onChange={setMonthFilter}
          placeholder="Select Month"
        />
        <Dropdown
          label="Year"
          options={allYearOptions}
          value={yearFilter}
          onChange={setYearFilter}
          placeholder="Select Year"
        />

        <button
          onClick={resetFilters}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-200"
        >
          Reset Filters
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
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <SkeletonRow key={i} index={i} />
              ))
            ) : clients.length > 0 ? (
              clients.map((c, i) => (
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${c.clientStatus === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
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
