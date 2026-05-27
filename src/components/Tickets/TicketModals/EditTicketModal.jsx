import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import axiosInstance from "../../../api/axiosInstance"; // adjust path

const EditTicketModal = ({
  show,
  setShow,
  selectedTicket,
  employees = [],
  isAdmin,
  handleUpdateTicket,
}) => {
  const [form, setForm] = useState({
    clientId: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    status: "",
  });

  const [clients, setClients] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState({ _id: null, name: "" });
  const [selectedClient, setSelectedClient] = useState({ _id: null, name: "" });
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const clientRef = useRef(null);
  const empRef = useRef(null);

  // Fetch clients like AddTicket
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await axiosInstance.get(
          `/client?company_id=${user.company_id}`,
        );
        setClients(res.data.clients || []);
      } catch (err) {
        console.error("Error fetching clients:", err);
      }
    };
    fetchClients();
  }, []);

  // Populate form and selected items when ticket opens
  useEffect(() => {
    if (selectedTicket) {
      setForm({
        clientId: selectedTicket.relatedClient?._id || "",
        category: selectedTicket.category || "",
        priority: selectedTicket.priority || "",
        title: selectedTicket.title || "",
        description: selectedTicket.description || "",
        dueDate: selectedTicket.dueDate?.split("T")[0] || "",
        assignedTo: selectedTicket.assignedTo?._id || "",
        status: selectedTicket.status || "Open",
      });

      setSelectedEmp({
        _id: selectedTicket.assignedTo?._id || null,
        name: selectedTicket.assignedTo?.name || "",
      });

      setSelectedClient({
        _id: selectedTicket.relatedClient?._id || null,
        name: selectedTicket.relatedClient?.name || "",
      });
    }
  }, [selectedTicket]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (clientRef.current && !clientRef.current.contains(e.target)) {
        setClientDropdownOpen(false);
      }
      if (empRef.current && !empRef.current.contains(e.target)) {
        setEmpDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!show || !selectedTicket) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-black/30">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl h-[80vh] overflow-y-auto relative shadow-lg">
        <button
          className="absolute top-3 right-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300 cursor-pointer"
          onClick={() => setShow(false)}
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Edit Ticket
        </h3>

        <div className="flex flex-col gap-3">
          {/* Client Dropdown */}
          <label className="text-sm text-gray-600">Client</label>
          <div className="relative" ref={clientRef}>
            <input
              type="text"
              placeholder="Type client name..."
              value={selectedClient.name}
              onChange={(e) => {
                setSelectedClient({ _id: null, name: e.target.value });
                setClientDropdownOpen(true);
              }}
              onFocus={() => setClientDropdownOpen(true)}
              className="border px-3 py-2 rounded-lg w-full"
            />
            {clientDropdownOpen && clients.length > 0 && (
              <ul className="absolute bg-white left-0 right-0 border rounded-lg max-h-52 overflow-y-auto mt-1 shadow z-50">
                {clients
                  .filter((c) =>
                    c.name
                      .toLowerCase()
                      .includes(selectedClient.name.toLowerCase()),
                  )
                  .map((c) => (
                    <li
                      key={c._id}
                      onClick={() => {
                        setSelectedClient(c);
                        setForm({ ...form, clientId: c._id });
                        setClientDropdownOpen(false);
                      }}
                      className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                    >
                      {c.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* Title */}
          <label className="text-sm text-gray-600">Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />

          {/* Description */}
          <label className="text-sm text-gray-600">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          />

          {/* Priority */}
          <label className="text-sm text-gray-600">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="">Select Priority</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>

          {/* Status */}
          <label className="text-sm text-gray-600">Status</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="border px-3 py-2 rounded-lg"
          >
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          {/* Admin Only Assign */}
          {isAdmin && (
            <>
              <label className="text-sm text-gray-600">Assign To</label>
              <div className="relative" ref={empRef}>
                <input
                  type="text"
                  placeholder="Type employee name..."
                  value={selectedEmp.name}
                  onChange={(e) => {
                    setSelectedEmp({ _id: null, name: e.target.value });
                    setEmpDropdownOpen(true);
                  }}
                  onFocus={() => setEmpDropdownOpen(true)}
                  className="border px-3 py-2 rounded-lg w-full"
                />
                {empDropdownOpen && employees.length > 0 && (
                  <ul className="absolute bg-white left-0 right-0 border rounded-lg max-h-52 overflow-y-auto mt-1 shadow z-50">
                    {employees
                      .filter((e) =>
                        e.name
                          .toLowerCase()
                          .includes(selectedEmp.name.toLowerCase()),
                      )
                      .map((e) => (
                        <li
                          key={e._id}
                          onClick={() => {
                            setSelectedEmp(e);
                            setEmpDropdownOpen(false);
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
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-gray-200 rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleUpdateTicket(selectedTicket._id, {
                ...form,
                assignedTo: selectedEmp._id,
              })
            }
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg cursor-pointer"
          >
            Update Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditTicketModal;
