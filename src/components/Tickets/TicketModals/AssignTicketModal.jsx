// components/Tickets/TicketModals/AssignTicketModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

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

  if (!show || !selectedTicket) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-white/30">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl h-[70vh] overflow-y-auto relative shadow-lg">
        <button
          className="absolute top-3 right-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
          onClick={() => setShow(false)}
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Assign Ticket
        </h3>
        <p className="text-gray-600 mb-2">
          <strong>Title:</strong> {selectedTicket.title}
        </p>

        <label className="block text-sm text-gray-600 mb-1">
          Current Assignee:
        </label>
        <input
          type="text"
          value={selectedTicket.assignedTo?.name || "Unassigned"}
          disabled
          className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 bg-gray-100 text-gray-700 cursor-not-allowed"
        />

        {isAdmin && (
          <>
            <label className="text-sm text-gray-600">Reassign To</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Type employee name..."
                value={selectedEmp.name}
                onChange={(e) => {
                  setSelectedEmp({ _id: null, name: e.target.value });
                  setDropdownOpen(true);
                }}
                onFocus={() => setDropdownOpen(true)}
                className="border w-full px-3 py-2 rounded-lg"
              />

              {dropdownOpen && (
                <ul className="absolute bg-white w-full border rounded-lg max-h-52 overflow-y-auto mt-1 shadow">
                  {employees
                    .filter((e) =>
                      e.name
                        .toLowerCase()
                        .includes(selectedEmp.name.toLowerCase())
                    )
                    .map((emp) => (
                      <li
                        key={emp._id}
                        className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                        onClick={() => {
                          setSelectedEmp(emp);
                          setDropdownOpen(false);
                        }}
                      >
                        {emp.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </>
        )}

        <div className="flex justify-end mt-5 gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
            onClick={handleAssign}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignTicketModal;
