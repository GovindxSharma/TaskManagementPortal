import React, { useState, useEffect } from "react";
import {
  Search,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";

const Tickets = () => {
  const navigate = useNavigate();

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = user._id;
  const companyId = user.company_id;
  const isAdmin = user.role === "Admin";

  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    employee: "",
    priority: "",
  });

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState({ _id: null, name: "" });
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Add ticket state
  const [newTicket, setNewTicket] = useState({
    clientId: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  });

  const statusColor = {
    Open: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  // Fetch tickets
  const fetchTickets = async () => {
    try {
      const res = await axios.get("/ticket");
      setTickets(res.data.tickets);
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  // Fetch clients for dropdown
  const fetchClients = async () => {
    try {
      const res = await axios.get(`/client?company_id=${companyId}`);
      setClients(res.data.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
    }
  };

  // Fetch employees for assign dropdown
  const fetchEmployees = async () => {
    try {
      const res = await axios.get("/user/employees");
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchClients();
    if (isAdmin) fetchEmployees();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedClient?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus = !filters.status || t.status === filters.status;
    const matchEmp =
      !filters.employee || t.assignedTo?.name === filters.employee;
    const matchPriority = !filters.priority || t.priority === filters.priority;
    return matchSearch && matchStatus && matchEmp && matchPriority;
  });

  // Assign ticket
  const handleAssign = async () => {
    if (!selectedTicket || !selectedEmp._id) return;
    try {
      await axios.put(`/ticket/${selectedTicket._id}`, {
        assignedTo: selectedEmp._id,
      });
      fetchTickets();
      setShowAssignModal(false);
    } catch (err) {
      console.error("Failed to assign ticket:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this ticket?")) return;
    try {
      await axios.delete(`/ticket/${id}`);
      fetchTickets();
    } catch (err) {
      console.error("Failed to delete ticket:", err);
    }
  };

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      await axios.put(`/ticket/${ticket._id}`, { status: newStatus });
      fetchTickets();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  // Add ticket
  const handleAddTicket = async () => {
    if (!newTicket.clientId || !newTicket.title) return;
    try {
      const payload = {
        ...newTicket,
        raisedBy: currentUserId,
      };
      if (!isAdmin) delete payload.assignedTo;
      else if (selectedEmp._id) payload.assignedTo = selectedEmp._id;

      await axios.post("/ticket", payload);
      fetchTickets();
      setShowAddModal(false);
      setNewTicket({
        clientId: "",
        category: "",
        priority: "",
        title: "",
        description: "",
        dueDate: "",
        assignedTo: "",
      });
      setSelectedEmp({ _id: null, name: "" });
    } catch (err) {
      console.error("Failed to add ticket:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:block">Back</span>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Ticket Management
          </h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
        >
          <Plus size={16} /> Add Ticket
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-wrap gap-3 items-start sm:items-center mb-6">
        <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 flex-1 outline-none text-gray-700 bg-transparent"
          />
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Raised By</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left hidden md:table-cell">Priority</th>
              <th className="p-3 text-left hidden md:table-cell">Updated</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length > 0 ? (
              filteredTickets.map((t) => (
                <tr
                  key={t._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">{t.title}</td>
                  <td className="p-3">{t.raisedBy?.name || "N/A"}</td>
                  <td className="p-3 text-gray-700">
                    {t.assignedTo?.name || "Unassigned"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        statusColor[t.status] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-700 hidden md:table-cell">
                    {t.priority}
                  </td>
                  <td className="p-3 text-gray-600 hidden md:table-cell">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedTicket(t);
                          setSelectedEmp({
                            _id: t.assignedTo?._id || null,
                            name: t.assignedTo?.name || "",
                          });
                          setShowAssignModal(true);
                        }}
                        className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
                        title="Assign Employee"
                      >
                        <UserCheck size={16} />
                      </button>
                    )}
                    <button
                      onClick={() =>
                        handleStatusChange(
                          t,
                          t.status === "Resolved" ? "Open" : "Resolved"
                        )
                      }
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                      title="Toggle Status"
                    >
                      <CheckCircle2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {showAssignModal && selectedTicket && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-white/30">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl h-[70vh] overflow-y-auto relative shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Assign Ticket
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong> {selectedTicket.title}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Raised By:</strong>{" "}
              {selectedTicket.raisedBy?.name || "N/A"}
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
                <label className="block text-sm text-gray-600 mb-1">
                  Re-Assign To:
                </label>
                <div className="relative w-full mb-4">
                  <input
                    type="text"
                    placeholder="Type employee name..."
                    value={selectedEmp.name || ""}
                    onChange={(e) =>
                      setSelectedEmp({ _id: null, name: e.target.value })
                    }
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {dropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto mt-1 shadow-lg">
                      {employees
                        .filter((e) =>
                          e.name
                            .toLowerCase()
                            .includes(selectedEmp.name.toLowerCase())
                        )
                        .slice(0, 50)
                        .map((e) => (
                          <li
                            key={e._id}
                            className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                            onClick={() => {
                              setSelectedEmp(e);
                              setDropdownOpen(false);
                            }}
                          >
                            {e.name}
                          </li>
                        ))}
                      {employees.filter((e) =>
                        e.name
                          .toLowerCase()
                          .includes(selectedEmp.name.toLowerCase())
                      ).length === 0 && (
                        <li className="px-3 py-2 text-gray-400 italic">
                          No matches
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Confirm Assignment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-white/30">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl md:max-w-3xl h-[80vh] overflow-y-auto relative shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Add Ticket
            </h3>

            <div className="flex flex-col gap-3">
              <label className="text-sm text-gray-600">Client</label>
              <select
                value={newTicket.clientId}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, clientId: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Client</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Category"
                value={newTicket.category}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, category: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="text"
                placeholder="Title"
                value={newTicket.title}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, title: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              <textarea
                placeholder="Description"
                value={newTicket.description}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              <input
                type="date"
                placeholder="Due Date"
                value={newTicket.dueDate}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, dueDate: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />

              <select
                value={newTicket.priority}
                onChange={(e) =>
                  setNewTicket({ ...newTicket, priority: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="">Select Priority</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

              {isAdmin && (
                <div className="relative">
                  <label className="text-sm text-gray-600">Assign To</label>
                  <input
                    type="text"
                    placeholder="Type employee name..."
                    value={selectedEmp.name || ""}
                    onChange={(e) => {
                      setSelectedEmp({ _id: null, name: e.target.value });
                      setDropdownOpen(true);
                    }}
                    onFocus={() => setDropdownOpen(true)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  {dropdownOpen && (
                    <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-lg max-h-60 overflow-y-auto mt-1 shadow-lg">
                      {employees
                        .filter((e) =>
                          e.name
                            .toLowerCase()
                            .includes(selectedEmp.name.toLowerCase())
                        )
                        .slice(0, 50)
                        .map((e) => (
                          <li
                            key={e._id}
                            className="px-3 py-2 hover:bg-indigo-100 cursor-pointer"
                            onClick={() => {
                              setSelectedEmp(e);
                              setDropdownOpen(false);
                            }}
                          >
                            {e.name}
                          </li>
                        ))}
                      {employees.filter((e) =>
                        e.name
                          .toLowerCase()
                          .includes(selectedEmp.name.toLowerCase())
                      ).length === 0 && (
                        <li className="px-3 py-2 text-gray-400 italic">
                          No matches
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTicket}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tickets;
