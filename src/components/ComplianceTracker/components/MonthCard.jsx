import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import StatusBadge from "./StatusBadge";
import Loader from "../../layout/Loader";
import { Pencil, Check, X } from "lucide-react";
import { useToast } from "../../layout/ToastProvider.jsx";

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

const dataOptions = [
  "Data Incomplete",
  "Data Received",
  "Not Received",
  "Inactive",
];
const workOptions = [
  "Not Started",
  "Payment Overdue",
  "Completed",
  "In Progress",
];
const billOptions = ["Pending", "Generated"];

const MonthCard = ({ clientId }) => {
  const toast = useToast();
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthStates, setMonthStates] = useState({});
  const [editingMonthId, setEditingMonthId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [newMonth, setNewMonth] = useState("");
  const [newYear, setNewYear] = useState(new Date().getFullYear());
  const [creating, setCreating] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user?.role?.toUpperCase() || "";

  const fetchMonthlyCompliance = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/monthly-compliance/client/${clientId}`
      );
      setMonthlyData(data);

      const initialStates = {};
      data.forEach((m) => {
        initialStates[m._id] = {
          dataStatus: m.dataReceiveStatus,
          workProgress: m.workProgress,
          billStatus: m.billStatus,
          expectedBill: m.expectedBill,
          actualBill: m.actualBill,
          workers: m.workersAsPerData,
          remarks: m.remarks || "",
        };
      });
      setMonthStates(initialStates);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch monthly compliance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchMonthlyCompliance();
  }, [clientId]);

  const saveChanges = async (monthRecord) => {
    const state = monthStates[monthRecord._id];
    const payload = {
      dataReceiveStatus: state.dataStatus,
      workProgress: state.workProgress,
      billStatus: state.billStatus,
      expectedBill: Number(state.expectedBill) || 0,
      actualBill: Number(state.actualBill) || 0,
      workersAsPerData: Number(state.workers) || 0,
      remarks: state.remarks,
    };

    try {
      setSaving(true);
      const { data } = await axios.put(
        `/monthly-compliance/${monthRecord._id}`,
        payload
      );
      setMonthlyData(
        monthlyData.map((m) =>
          m._id === monthRecord._id ? { ...m, ...data.record } : m
        )
      );
      toast.success("Month data saved successfully");
      setEditingMonthId(null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const canEdit = (field) => {
    if (role === "ADMIN")
      return [
        "data",
        "work",
        "bill",
        "workers", 
        "actualBill", 
        "remarks",
      ].includes(field);
    if (role === "EMPLOYEE")
      return ["data", "work", "workers", "remarks"].includes(field);
    if (role === "ACCOUNTANT")
      return ["bill", "actualBill", "remarks"].includes(field);
    return false;
  };

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
      fetchMonthlyCompliance();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create monthly compliance");
    } finally {
      setCreating(false);
    }
  };

  const resetFilters = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  if (loading) return <Loader message="Loading monthly data..." />;

  const filteredData = monthlyData
    .filter((m) => {
      const monthMatch = filterMonth ? m.month === filterMonth : true;
      const yearMatch = filterYear ? m.year === Number(filterYear) : true;
      return monthMatch && yearMatch;
    })
    .sort((a, b) => {
      // 1️⃣ Year DESC
      if (b.year !== a.year) {
        return b.year - a.year;
      }

      // 2️⃣ Month ASC (01 → 12)
      return Number(a.month) - Number(b.month);
    });


  return (
    <>
      {/* Filters & Add Button */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="border rounded px-3 py-2 text-sm"
          >
            <option value="">All Months</option>
            {monthNames.map((m, i) => (
              <option key={i} value={String(i + 1).padStart(2, "0")}>
                {m}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Year"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="border rounded px-3 py-2 text-sm w-28"
          />

          <button
            onClick={resetFilters}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-2 rounded transition text-sm"
          >
            Reset
          </button>
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

      {/* Month Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((monthRecord) => {
          const isEditing = editingMonthId === monthRecord._id;
          const state = monthStates[monthRecord._id] || {};
          const monthTitle = `${monthNames[parseInt(monthRecord.month) - 1]} ${
            monthRecord.year
          }`;

          return (
            <div
              key={monthRecord._id}
              className="border rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col gap-4 relative"
            >
              {!isEditing ? (
                <button
                  className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition"
                  onClick={() => setEditingMonthId(monthRecord._id)}
                >
                  <Pencil className="text-gray-500" size={18} />
                </button>
              ) : (
                <div className="absolute top-3 right-3 flex gap-2">
                  <button
                    className="p-1 rounded-full hover:bg-green-100 transition"
                    onClick={() => saveChanges(monthRecord)}
                    disabled={saving}
                  >
                    <Check className="text-green-500" size={18} />
                  </button>
                  <button
                    className="p-1 rounded-full hover:bg-red-100 transition"
                    onClick={() => setEditingMonthId(null)}
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
                    value={state.workers ?? ""}
                    onChange={(e) =>
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          workers: e.target.value, // 👈 keep string
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm w-24"
                  />
                ) : (
                  <span className="text-gray-800 font-semibold">
                    {state.workers || 0}
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
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          dataStatus: e.target.value,
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {dataOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={state.dataStatus} type="data" />
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
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          workProgress: e.target.value,
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {workOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={state.workProgress} type="work" />
                )}
              </div>

              {/* Expected & Final Amount */}
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">
                  Expected Amount:
                </span>
                <span className="text-gray-800 font-semibold">
                  ₹{monthRecord?.expectedBill || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Final Amount:</span>
                {isEditing && canEdit("actualBill") ? (
                  <input
                    type="number"
                    value={state.actualBill ?? ""}
                    onChange={(e) =>
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          actualBill: e.target.value, // 👈 string
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm w-24"
                  />
                ) : (
                  <span className="text-gray-800 font-semibold">
                    ₹{state.actualBill || 0}
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
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          billStatus: e.target.value,
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {billOptions.map((opt) => (
                      <option key={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <StatusBadge status={state.billStatus} type="bill" />
                )}
              </div>

              {/* Remarks */}
              <div className="flex flex-col gap-1">
                <span className="text-gray-600 font-medium">Remarks:</span>
                {isEditing && canEdit("remarks") ? (
                  <textarea
                    value={state.remarks}
                    onChange={(e) =>
                      setMonthStates({
                        ...monthStates,
                        [monthRecord._id]: {
                          ...state,
                          remarks: e.target.value,
                        },
                      })
                    }
                    className="border rounded px-2 py-1 text-sm"
                    rows={3}
                  />
                ) : (
                  <p className="text-gray-800">{state.remarks || "—"}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Blur background */}
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          ></div>

          {/* Modal content */}
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
              {monthNames.map((m, i) => (
                <option key={i} value={String(i + 1).padStart(2, "0")}>
                  {m}
                </option>
              ))}
            </select>

            <label className="block mb-2 font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={newYear}
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
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonthCard;
