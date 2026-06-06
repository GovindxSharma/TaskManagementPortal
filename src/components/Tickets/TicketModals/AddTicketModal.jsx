// components/Tickets/TicketModals/AddTicketModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Search } from "lucide-react";

const AddTicketModal = ({
  show,
  setShow,
  newTicket,
  setNewTicket,
  clients,
  isAdmin,
  selectedEmp,
  setSelectedEmp,
  employees,
  handleAddTicket,
}) => {
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const empRef = useRef(null);

  // Close employee dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (empRef.current && !empRef.current.contains(e.target))
        setEmpDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!show) return null;

  const filteredEmps = employees.filter((e) =>
    e.name.toLowerCase().includes((selectedEmp.name || "").toLowerCase()),
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-800">New ticket</h3>
          <button
            onClick={() => setShow(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Client */}
          <Field label="Client" required>
            <select
              value={newTicket.clientId}
              onChange={(e) =>
                setNewTicket({ ...newTicket, clientId: e.target.value })
              }
              className={selectCls}
            >
              <option value="">Select a client…</option>
              {clients.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

          {/* Title */}
          <Field label="Title" required>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              value={newTicket.title}
              onChange={(e) =>
                setNewTicket({ ...newTicket, title: e.target.value })
              }
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label="Description" required>
            <textarea
              placeholder="Describe the issue in detail…"
              value={newTicket.description}
              onChange={(e) =>
                setNewTicket({ ...newTicket, description: e.target.value })
              }
              rows={3}
              className={inputCls + " resize-none"}
            />
          </Field>

          {/* Priority */}
          <Field label="Priority" required>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setNewTicket({ ...newTicket, priority: p })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
                    newTicket.priority === p
                      ? PRIORITY_ACTIVE[p]
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {/* Assign to (admin only) */}
          {isAdmin && (
            <Field label="Assign to" required>
              <div className="relative" ref={empRef}>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-300 transition">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search employee…"
                    value={selectedEmp.name}
                    onChange={(e) => {
                      setSelectedEmp({ _id: null, name: e.target.value });
                      setEmpDropdownOpen(true);
                    }}
                    onFocus={() => setEmpDropdownOpen(true)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  {selectedEmp._id && (
                    <button
                      onClick={() => setSelectedEmp({ _id: null, name: "" })}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                {empDropdownOpen && filteredEmps.length > 0 && (
                  <ul className="absolute z-50 bg-white left-0 right-0 mt-1 border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredEmps.map((e) => (
                      <li
                        key={e._id}
                        onClick={() => {
                          setSelectedEmp({ _id: e._id, name: e.name });
                          setEmpDropdownOpen(false);
                        }}
                        className={`px-3 py-2 text-sm cursor-pointer transition ${
                          selectedEmp._id === e._id
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "hover:bg-gray-50 text-gray-700"
                        }`}
                      >
                        {e.name}
                      </li>
                    ))}
                  </ul>
                )}
                {empDropdownOpen && filteredEmps.length === 0 && (
                  <div className="absolute z-50 bg-white left-0 right-0 mt-1 border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-400 text-center">
                    No employees found
                  </div>
                )}
              </div>
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleAddTicket}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Create ticket
          </button>
        </div>
      </div>
    </div>
  );
};

// Shared styles
const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition";
const selectCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 transition";

const PRIORITY_ACTIVE = {
  Low: "border-green-400 bg-green-50 text-green-700",
  Medium: "border-amber-400 bg-amber-50 text-amber-700",
  High: "border-red-400 bg-red-50 text-red-700",
};

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export default AddTicketModal;
