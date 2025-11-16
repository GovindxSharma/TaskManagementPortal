import React, { useState, useEffect } from "react";
import axios from "../../../api/axiosInstance";
import StatusBadge from "./StatusBadge";
import Loader from "../../layout/Loader";
import { Pencil, Check, X } from "lucide-react";

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
  "Data Pending",
];

const workOptions = [
  "Not Started",
  "Payment Overdue",
  "Completed",
  "In Progress",
];

const billOptions = ["Pending", "Generated"];

const MonthCard = ({ clientId }) => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthStates, setMonthStates] = useState({}); // per-month editing state
  const [editingMonthId, setEditingMonthId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchMonthlyCompliance = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `/monthly-compliance/client/${clientId}`
      );
      setMonthlyData(data);

      // initialize states
      const initialStates = {};
      data.forEach((m) => {
        initialStates[m._id] = {
          dataStatus: m.dataReceiveStatus,
          workProgress: m.workProgress,
          billStatus: m.billStatus,
          expectedBill: m.expectedBill,
          actualBill: m.actualBill,
        };
      });
      setMonthStates(initialStates);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch monthly compliance data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (clientId) fetchMonthlyCompliance();
  }, [clientId]);

  const saveChanges = async (monthRecord) => {
    const payload = {
      dataReceiveStatus: monthStates[monthRecord._id].dataStatus,
      workProgress: monthStates[monthRecord._id].workProgress,
      billStatus: monthStates[monthRecord._id].billStatus,
      expectedBill: monthStates[monthRecord._id].expectedBill,
      actualBill: monthStates[monthRecord._id].actualBill,
    };

    try {
      setSaving(true);
      const { data } = await axios.put(
        `/monthly-compliance/${monthRecord._id}`,
        payload
      );
      // update local state
      setMonthlyData(
        monthlyData.map((m) =>
          m._id === monthRecord._id ? { ...m, ...data.record } : m
        )
      );
      setEditingMonthId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader message="Loading monthly data..." />;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {monthlyData.map((monthRecord) => {
        const isEditing = editingMonthId === monthRecord._id;
        const state = monthStates[monthRecord._id] || {};
        const monthTitle = `${
          monthNames[parseInt(monthRecord.month, 10) - 1]
        } ${monthRecord.year}`;

        return (
          <div
            key={monthRecord._id}
            className="border rounded-xl p-5 bg-white shadow hover:shadow-md transition flex flex-col gap-4 relative"
          >
            {/* Edit / Save / Cancel */}
            {!isEditing ? (
              <button
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition"
                onClick={() => setEditingMonthId(monthRecord._id)}
                title="Edit Month Data"
              >
                <Pencil className="text-gray-500" size={18} />
              </button>
            ) : (
              <div className="absolute top-3 right-3 flex gap-2">
                <button
                  className="p-1 rounded-full hover:bg-green-100 transition"
                  onClick={() => saveChanges(monthRecord)}
                  title="Save"
                  disabled={saving}
                >
                  <Check className="text-green-500" size={18} />
                </button>
                <button
                  className="p-1 rounded-full hover:bg-red-100 transition"
                  onClick={() => setEditingMonthId(null)}
                  title="Cancel"
                >
                  <X className="text-red-500" size={18} />
                </button>
              </div>
            )}

            <h4 className="text-lg font-semibold text-gray-800">
              {monthTitle}
            </h4>

            {/* No. of Workers */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">No. of Workers:</span>
              <span className="text-gray-800 font-semibold">
                {monthRecord.workersAsPerData || 0}
              </span>
            </div>

            {/* Data Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Data Status:</span>
              {isEditing ? (
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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={state.dataStatus} type="data" />
              )}
            </div>

            {/* Work Progress */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Work Progress:</span>
              {isEditing ? (
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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={state.workProgress} type="work" />
              )}
            </div>

            {/* Expected Amount */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">
                Expected Amount:
              </span>
              <span className="text-gray-800 font-semibold">
                ₹{state.expectedBill || 0}
              </span>
            </div>

            {/* Final Amount */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Final Amount:</span>
              <span className="text-gray-800 font-semibold">
                ₹{state.actualBill || 0}
              </span>
            </div>

            {/* Bill Status */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Bill Status:</span>
              {isEditing ? (
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
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <StatusBadge status={state.billStatus} type="bill" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonthCard;
