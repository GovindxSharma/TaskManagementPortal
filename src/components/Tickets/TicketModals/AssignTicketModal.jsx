// components/Tickets/TicketModals/AssignTicketModal.jsx
import React, { useState, useRef, useEffect } from "react";
import { X, Search, UserCheck } from "lucide-react";

const AssignTicketModal = ({
  show,
  setShow,
  selectedTicket,
  selectedEmp,
  setSelectedEmp,
  employees,
  handleAssign,
  isAdmin,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!show || !selectedTicket) return null;

  const currentAssignee = selectedTicket.assignedTo?.name;
  const filteredEmps = employees.filter((e) =>
    e.name.toLowerCase().includes((selectedEmp.name || "").toLowerCase()),
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 rounded-lg">
              <UserCheck size={16} className="text-indigo-600" />
            </div>
            <h3 className="text-base font-semibold text-gray-800">
              Assign ticket
            </h3>
          </div>
          <button
            onClick={() => setShow(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Ticket info */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-0.5">
              Ticket
            </p>
            <p className="text-sm font-medium text-gray-800">
              {selectedTicket.title}
            </p>
          </div>

          {/* Current assignee */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Current assignee
            </p>
            <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold flex-shrink-0">
                {currentAssignee
                  ? currentAssignee.charAt(0).toUpperCase()
                  : "—"}
              </div>
              <span className="text-sm text-gray-600">
                {currentAssignee || "Unassigned"}
              </span>
            </div>
          </div>

          {/* Reassign (admin only) */}
          {isAdmin && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                Reassign to
              </p>
              <div className="relative" ref={dropdownRef}>
                <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-300 transition">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search employee…"
                    value={selectedEmp.name}
                    onChange={(e) => {
                      setSelectedEmp({ _id: null, name: e.target.value });
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  />
                  {selectedEmp.name && (
                    <button
                      onClick={() => {
                        setSelectedEmp({ _id: null, name: "" });
                        setDropdownOpen(false);
                      }}
                      className="text-gray-300 hover:text-gray-500"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {dropdownOpen && (
                  <ul className="absolute z-50 bg-white left-0 right-0 mt-1 border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {filteredEmps.length === 0 ? (
                      <li className="px-3 py-2 text-sm text-gray-400 text-center">
                        No employees found
                      </li>
                    ) : (
                      filteredEmps.map((emp) => (
                        <li
                          key={emp._id}
                          onClick={() => {
                            setSelectedEmp({ _id: emp._id, name: emp.name });
                            setDropdownOpen(false);
                          }}
                          className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-2 transition ${
                            selectedEmp._id === emp._id
                              ? "bg-indigo-50 text-indigo-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          {emp.name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>

              {selectedEmp._id && (
                <p className="text-xs text-indigo-600 mt-1.5">
                  ✓ {selectedEmp.name} selected
                </p>
              )}
            </div>
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
          {isAdmin && (
            <button
              onClick={handleAssign}
              disabled={!selectedEmp._id}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Assign
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;
