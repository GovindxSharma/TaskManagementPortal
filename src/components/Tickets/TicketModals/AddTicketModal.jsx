// components/Tickets/TicketModals/AddTicketModal.jsx
import React, { useState } from "react";
import { X } from "lucide-react";

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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl h-[80vh] overflow-y-auto relative shadow-lg">
        <button
          className="absolute top-3 right-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => setShow(false)}
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Ticket</h3>

        <div className="flex flex-col gap-3">
          {/* Client */}
          <label className="text-sm text-gray-600">Client</label>
          <select
            value={newTicket.clientId}
            onChange={(e) =>
              setNewTicket({ ...newTicket, clientId: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Category */}
          {/* <input
            type="text"
            placeholder="Category"
            value={newTicket.category}
            onChange={(e) =>
              setNewTicket({ ...newTicket, category: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          /> */}

          {/* Title */}
          <input
            type="text"
            placeholder="Title"
            value={newTicket.title}
            onChange={(e) =>
              setNewTicket({ ...newTicket, title: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          />

          {/* Description */}
          <textarea
            placeholder="Description"
            value={newTicket.description}
            onChange={(e) =>
              setNewTicket({ ...newTicket, description: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          />

          {/* Due Date */}
          {/* <input
            type="date"
            value={newTicket.dueDate}
            onChange={(e) =>
              setNewTicket({ ...newTicket, dueDate: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          /> */}

          {/* Priority */}
          <select
            value={newTicket.priority}
            onChange={(e) =>
              setNewTicket({ ...newTicket, priority: e.target.value })
            }
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Assign To (Admin Only) */}
          {isAdmin && (
            <>
              <label className="text-sm text-gray-600">Assign To</label>
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
                  className="border px-3 py-2 rounded-lg w-full"
                />
                {dropdownOpen && (
                  <ul className="absolute bg-white left-0 right-0 border rounded-lg max-h-52 overflow-y-auto mt-1 shadow z-50">
                    {employees
                      .filter((e) =>
                        e.name
                          .toLowerCase()
                          .includes(selectedEmp.name.toLowerCase())
                      )
                      .map((e) => (
                        <li
                          key={e._id}
                          onClick={() => {
                            setSelectedEmp(e);
                            setDropdownOpen(false);
                          }}
                          className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                        >
                          {e.name}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end mt-5 gap-3">
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg"
            onClick={() => setShow(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={handleAddTicket}
          >
            Add Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTicketModal;
