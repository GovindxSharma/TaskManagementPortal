import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "../../../api/axiosInstance";
import StatusBadge from "./StatusBadge";
import Loader from "../../layout/Loader";
import { Pencil, Check, X } from "lucide-react";
import { useToast } from "../../layout/ToastProvider.jsx";

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

const DATA_OPTIONS = [
  "Data Incomplete",
  "Data Received",
  "Not Received",
  "Inactive",
];
const WORK_OPTIONS = [
  "Not Started",
  "Payment Overdue",
  "Completed",
  "In Progress",
];
const BILL_OPTIONS = ["Pending", "Generated"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract a clean per-record state snapshot from a raw API record */
const recordToState = (m) => ({
  dataStatus: m.dataReceiveStatus,
  workProgress: m.workProgress,
  billStatus: m.billStatus,
  expectedBill: m.expectedBill ?? 0,
  actualBill: m.actualBill ?? 0,
  workers: m.workersAsPerData ?? 0,
  remarks: m.remarks || "",
});

/** Clamp a numeric string to ≥ 0; returns "" for empty input */
const clampNonNeg = (val) => {
  if (val === "" || val === null || val === undefined) return "";
  const n = Number(val);
  return isNaN(n) ? "" : String(Math.max(0, Math.floor(n)));
};

/** Clamp a decimal numeric string to ≥ 0; returns "" for empty input */
const clampNonNegDecimal = (val) => {
  if (val === "" || val === null || val === undefined) return "";
  const n = parseFloat(val);
  return isNaN(n) ? "" : String(Math.max(0, n));
};

// ─── Component ────────────────────────────────────────────────────────────────
const MonthCard = ({ clientId }) => {
  const location = useLocation();
  // Filters passed from the compliance list page
  const filters = location.state?.filters || {};

  // When arriving from PendingBills, only this record ID should be shown/opened
  const selectedMonthRecordId = location.state?.selectedMonthRecordId || null;

  const toast = useToast();

  const [monthlyData, setMonthlyData] = useState([]);
  // committedStates = last-saved (or initially fetched) state per record
  const [committedStates, setCommittedStates] = useState({});
  // draftStates = in-flight edits; only exists while a card is being edited
  const [draftStates, setDraftStates] = useState({});
  const [editingMonthId, setEditingMonthId] = useState(null);

  // Ref map so we can scroll the highlighted card into view on arrival
  const cardRefs = useRef({});
  // Guard: auto-open should fire only once after the initial fetch
  const hasAutoOpened = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local display filters (not sent to API)
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Add-new-month modal
  const [modalOpen, setModalOpen] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [creating, setCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toUpperCase() || "";

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchMonthlyCompliance = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/monthly-compliance/client/${clientId}`,
        { params: filters },
      );
      setMonthlyData(data);

      const initial = {};
      data.forEach((m) => {
        initial[m._id] = recordToState(m);
      });
      setCommittedStates(initial);
      setDraftStates({});
      setEditingMonthId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch monthly compliance data");
    } finally {
      setLoading(false);
    }
  }, [clientId, JSON.stringify(filters)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (clientId) fetchMonthlyCompliance();
  }, [fetchMonthlyCompliance]);

  // ── Auto-open & scroll when arriving from PendingBills ───────────────────
  useEffect(() => {
    // Only act once, after data has loaded, and only if a target ID was passed
    if (
      loading ||
      !selectedMonthRecordId ||
      hasAutoOpened.current ||
      monthlyData.length === 0
    )
      return;

    hasAutoOpened.current = true;

    // Start editing that specific card
    startEditing(selectedMonthRecordId);

    // Scroll it into view with a small delay so the DOM has painted
    setTimeout(() => {
      cardRefs.current[selectedMonthRecordId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  }, [loading, monthlyData, selectedMonthRecordId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Edit lifecycle ────────────────────────────────────────────────────────

  const startEditing = (id) => {
    setDraftStates((prev) => ({
      ...prev,
      [id]: { ...committedStates[id] },
    }));
    setEditingMonthId(id);
  };

  const cancelEditing = () => {
    setDraftStates((prev) => {
      const next = { ...prev };
      delete next[editingMonthId];
      return next;
    });
    setEditingMonthId(null);
  };

  const updateDraft = (id, field, value) => {
    setDraftStates((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  // ── Save ─────────────────────────────────────────────────────────────────
  const saveChanges = async (monthRecord) => {
    const draft = draftStates[monthRecord._id];
    if (!draft) return;

    const payload = {
      dataReceiveStatus: draft.dataStatus,
      workProgress: draft.workProgress,
      billStatus: draft.billStatus,
      expectedBill: Number(draft.expectedBill) || 0,
      actualBill: Math.max(0, Number(draft.actualBill) || 0),
      workersAsPerData: Math.max(0, Math.floor(Number(draft.workers) || 0)),
      remarks: draft.remarks,
    };

    try {
      setSaving(true);
      const { data } = await axios.put(
        `/monthly-compliance/${monthRecord._id}`,
        payload,
      );

      const updated = {
        ...committedStates[monthRecord._id],
        ...recordToState({ ...monthRecord, ...data.record }),
      };

      setCommittedStates((prev) => ({ ...prev, [monthRecord._id]: updated }));
      setMonthlyData((prev) =>
        prev.map((m) =>
          m._id === monthRecord._id ? { ...m, ...data.record } : m,
        ),
      );
      setDraftStates((prev) => {
        const next = { ...prev };
        delete next[monthRecord._id];
        return next;
      });

      toast.success("Month data saved successfully");
      setEditingMonthId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // ── Permissions ───────────────────────────────────────────────────────────
  const canEdit = (field) => {
    const adminFields = [
      "data",
      "work",
      "bill",
      "workers",
      "actualBill",
      "remarks",
    ];
    const employeeFields = ["data", "work", "workers", "remarks"];
    const accountantFields = ["bill", "actualBill", "remarks"];

    if (role === "ADMIN") return adminFields.includes(field);
    if (role === "EMPLOYEE") return employeeFields.includes(field);
    if (role === "ACCOUNTANT") return accountantFields.includes(field);
    return false;
  };

  // ── Create new month ──────────────────────────────────────────────────────
  const handleCreateMonth = async () => {
    if (!newMonth || !newYear) {
      toast.error("Please select month and year");
      return;
    }
    try {
      setCreating(true);
      await axios.post("/monthly-compliance", {
        client_id: clientId,
        month: newMonth,
        year: newYear,
      });
      toast.success("Monthly compliance created");
      setModalOpen(false);
      setNewMonth("");
      setNewYear(new Date().getFullYear());
      fetchMonthlyCompliance();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create monthly compliance");
    } finally {
      setCreating(false);
    }
  };

  // ── Filtered view ─────────────────────────────────────────────────────────
  //
  // KEY FIX: if we arrived from PendingBills with a selectedMonthRecordId,
  // show ONLY that record — ignore the manual month/year filter controls.
  // The user can clear the highlight by using the Reset button.
  //
  const [pendingFilterActive, setPendingFilterActive] = useState(
    !!selectedMonthRecordId,
  );

  const filteredData = monthlyData.filter((m) => {
    // Arriving from PendingBills: show only the targeted record
    if (pendingFilterActive && selectedMonthRecordId) {
      return m._id === selectedMonthRecordId;
    }
    // Normal filter controls
    const monthMatch = filterMonth ? m.month === filterMonth : true;
    const yearMatch = filterYear ? m.year === Number(filterYear) : true;
    return monthMatch && yearMatch;
  });

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) return <Loader message="Loading monthly data..." />;

  return (
    <>
      {/* Filters & Add Button */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* If viewing a specific record from PendingBills, show a clear banner */}
          {pendingFilterActive && selectedMonthRecordId ? (
            <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-3 py-2 rounded-lg">
              <span>Showing selected record only</span>
              <button
                onClick={() => {
                  setPendingFilterActive(false);
                  setFilterMonth("");
                  setFilterYear("");
                }}
                className="ml-1 hover:text-yellow-900 transition"
                title="Show all records"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="border rounded px-3 py-2 text-sm"
              >
                <option value="">All Months</option>
                {MONTH_NAMES.map((m, i) => (
                  <option key={i} value={String(i + 1).padStart(2, "0")}>
                    {m}
                  </option>
                ))}
              </select>

              <input
                type="number"
                placeholder="Year"
                value={filterYear}
                min="2000"
                max="2100"
                onChange={(e) => setFilterYear(e.target.value)}
                className="border rounded px-3 py-2 text-sm w-28"
              />

              <button
                onClick={() => {
                  setFilterMonth("");
                  setFilterYear("");
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded transition text-sm"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {role === "ADMIN" && (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
          >
            + Add Monthly Compliance
          </button>
        )}
      </div>

      {/* Empty state */}
      {filteredData.length === 0 && (
        <p className="text-center text-gray-500 py-10">No records found.</p>
      )}

      {/* Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((monthRecord) => {
          const id = monthRecord._id;
          const isEditing = editingMonthId === id;
          const isHighlighted =
            selectedMonthRecordId === id && pendingFilterActive;
          // While editing, show draft values; otherwise show committed values
          const state = isEditing ? draftStates[id] : committedStates[id];
          if (!state) return null;

          const monthTitle = `${MONTH_NAMES[parseInt(monthRecord.month, 10) - 1]} ${monthRecord.year}`;

          return (
            <div
              key={id}
              ref={(el) => {
                cardRefs.current[id] = el;
              }}
              className={`border rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col gap-4 relative ${
                isHighlighted ? "ring-2 ring-yellow-400 border-yellow-300" : ""
              }`}
            >
              {/* Edit / Save / Cancel controls */}
              {!isEditing ? (
                <button
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition"
                  onClick={() => startEditing(id)}
                >
                  <Pencil className="text-gray-500" size={18} />
                </button>
              ) : (
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    className="p-1 rounded-full hover:bg-green-100 transition disabled:opacity-50"
                    onClick={() => saveChanges(monthRecord)}
                    disabled={saving}
                    title="Save changes"
                  >
                    <Check className="text-green-500" size={18} />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-red-100 transition"
                    onClick={cancelEditing}
                    title="Discard changes"
                  >
                    <X className="text-red-500" size={18} />
                  </button>
                </div>
              )}

              <h4 className="text-lg font-semibold text-gray-800">
                {monthTitle}
              </h4>

              {/* Workers */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  No. of Workers:
                </span>
                {isEditing && canEdit("workers") ? (
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={state.workers ?? ""}
                    onChange={(e) =>
                      updateDraft(id, "workers", clampNonNeg(e.target.value))
                    }
                    onBlur={(e) =>
                      updateDraft(id, "workers", clampNonNeg(e.target.value))
                    }
                    className="border rounded px-2 py-1 text-sm w-24"
                  />
                ) : (
                  <span className="text-gray-800 font-semibold">
                    {committedStates[id]?.workers || 0}
                  </span>
                )}
              </div>

              {/* Data Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Data Status:</span>
                {isEditing && canEdit("data") ? (
                  <select
                    value={state.dataStatus}
                    onChange={(e) =>
                      updateDraft(id, "dataStatus", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {DATA_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge
                    status={committedStates[id]?.dataStatus}
                    type="data"
                  />
                )}
              </div>

              {/* Work Progress */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Work Progress:
                </span>
                {isEditing && canEdit("work") ? (
                  <select
                    value={state.workProgress}
                    onChange={(e) =>
                      updateDraft(id, "workProgress", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {WORK_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge
                    status={committedStates[id]?.workProgress}
                    type="work"
                  />
                )}
              </div>

              {/* Expected Amount — always read-only */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Expected Amount:
                </span>
                <span className="text-gray-800 font-semibold">
                  ₹{monthRecord?.expectedBill || 0}
                </span>
              </div>

              {/* Final Amount */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Final Amount:</span>
                {isEditing && canEdit("actualBill") ? (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={state.actualBill ?? ""}
                    onChange={(e) =>
                      updateDraft(
                        id,
                        "actualBill",
                        clampNonNegDecimal(e.target.value),
                      )
                    }
                    onBlur={(e) =>
                      updateDraft(
                        id,
                        "actualBill",
                        clampNonNegDecimal(e.target.value),
                      )
                    }
                    className="border rounded px-2 py-1 text-sm w-24"
                  />
                ) : (
                  <span className="text-gray-800 font-semibold">
                    ₹{committedStates[id]?.actualBill || 0}
                  </span>
                )}
              </div>

              {/* Bill Status */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Bill Status:</span>
                {isEditing && canEdit("bill") ? (
                  <select
                    value={state.billStatus}
                    onChange={(e) =>
                      updateDraft(id, "billStatus", e.target.value)
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {BILL_OPTIONS.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge
                    status={committedStates[id]?.billStatus}
                    type="bill"
                  />
                )}
              </div>

              {/* Remarks */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium">Remarks:</span>
                {isEditing && canEdit("remarks") ? (
                  <textarea
                    value={state.remarks}
                    onChange={(e) => updateDraft(id, "remarks", e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800">
                    {committedStates[id]?.remarks || "—"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Monthly Compliance Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="bg-white rounded-lg shadow-lg p-6 z-10 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">
              Add Monthly Compliance
            </h3>

            <label className="block mb-2 font-medium text-gray-700">
              Month
            </label>
            <select
              value={newMonth}
              onChange={(e) => setNewMonth(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-4"
            >
              <option value="">Select Month</option>
              {MONTH_NAMES.map((m, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={newYear}
              min="2000"
              max="2100"
              onChange={(e) => setNewYear(e.target.value)}
              className="border rounded px-3 py-2 w-full mb-4"
            />

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMonth}
                disabled={creating}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {creating ? "Adding…" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthCard;
