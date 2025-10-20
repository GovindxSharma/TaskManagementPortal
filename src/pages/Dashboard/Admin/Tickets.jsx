import React, { useState } from "react";
import {
  Search,
  UserCheck,
  ArrowLeft,
  CheckCircle2,
  Trash2,
  ChevronDown,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Tickets = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([
    {
      id: 1,
      title: "Payment not processed",
      client: "Ravi Patel",
      assignedTo: "Unassigned",
      status: "Open",
      priority: "High",
      createdAt: "2025-10-15",
      updatedAt: "2025-10-19",
    },
    {
      id: 2,
      title: "Website issue - 404 error",
      client: "Meena Singh",
      assignedTo: "Amit Kumar",
      status: "In Progress",
      priority: "Medium",
      createdAt: "2025-10-17",
      updatedAt: "2025-10-19",
    },
    {
      id: 3,
      title: "Invoice not received",
      client: "Pooja Sharma",
      assignedTo: "Riya Sharma",
      status: "Resolved",
      priority: "Low",
      createdAt: "2025-10-10",
      updatedAt: "2025-10-15",
    },
  ]);

  const [employees] = useState([
    "Amit Kumar",
    "Riya Sharma",
    "Neha Verma",
    "Unassigned",
  ]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "All",
    employee: "All",
    priority: "All",
  });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState("");

  // Filtering logic
  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filters.status === "All" || t.status === filters.status;
    const matchEmp =
      filters.employee === "All" || t.assignedTo === filters.employee;
    const matchPriority =
      filters.priority === "All" || t.priority === filters.priority;
    return matchSearch && matchStatus && matchEmp && matchPriority;
  });

  const handleAssign = () => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              assignedTo: selectedEmp,
              status: t.status === "Open" ? "In Progress" : t.status,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : t
      )
    );
    setShowAssignModal(false);
  };

  const handleDelete = (id) => {
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  const handleStatusChange = (id, newStatus) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] }
          : t
      )
    );
  };

  const statusColor = {
    Open: "bg-red-100 text-red-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "In Progress": "bg-blue-100 text-blue-700",
    Resolved: "bg-green-100 text-green-700",
  };

  const Dropdown = ({ options, value, onChange }) => (
    <div className="relative group">
      <button
        className="flex items-center justify-between gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-700 text-sm transition w-40"
      >
        <Filter size={14} className="text-indigo-500" />
        <span className="truncate">{value}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>
      <div className="absolute hidden group-hover:block bg-white border border-gray-200 rounded-lg mt-1 w-40 shadow-lg z-20">
        {options.map((opt) => (
          <div
            key={opt}
            onClick={() => onChange(opt)}
            className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
              value === opt ? "bg-indigo-100 text-indigo-700 font-medium" : ""
            }`}
          >
            {opt}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full text-gray-600"
          >
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Ticket Management
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-3 py-2">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search tickets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 flex-1 outline-none text-gray-700 bg-transparent"
            />
          </div>

          {/* Custom dropdowns */}
          <Dropdown
            label="Status"
            value={filters.status}
            onChange={(val) => setFilters({ ...filters, status: val })}
            options={["All", "Open", "Pending", "In Progress", "Resolved"]}
          />
          <Dropdown
            label="Employee"
            value={filters.employee}
            onChange={(val) => setFilters({ ...filters, employee: val })}
            options={["All", ...employees]}
          />
          <Dropdown
            label="Priority"
            value={filters.priority}
            onChange={(val) => setFilters({ ...filters, priority: val })}
            options={["All", "Low", "Medium", "High"]}
          />
        </div>
      </div>

      {/* Table */}
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
            {filteredTickets.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium text-gray-800">{t.title}</td>
                <td className="p-3 text-gray-700">{t.client}</td>
                <td className="p-3 text-gray-700">{t.assignedTo}</td>
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
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.priority === "High"
                        ? "bg-red-100 text-red-700"
                        : t.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.priority}
                  </span>
                </td>
                <td className="p-3 text-gray-600 hidden md:table-cell">
                  {t.updatedAt}
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setSelectedEmp(t.assignedTo);
                      setShowAssignModal(true);
                    }}
                    className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition"
                    title="Assign Employee"
                  >
                    <UserCheck size={16} />
                  </button>
                  <button
                    onClick={() =>
                      handleStatusChange(
                        t.id,
                        t.status === "Resolved" ? "Open" : "Resolved"
                      )
                    }
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition"
                    title="Toggle Status"
                  >
                    <CheckCircle2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredTickets.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center py-6 text-gray-400 italic">
                  No tickets found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              Assign Ticket
            </h3>
            <p className="text-gray-600 mb-2">
              <strong>Title:</strong> {selectedTicket.title}
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Raised By:</strong> {selectedTicket.client}
            </p>
            <label className="block text-sm text-gray-600 mb-1">Assign To:</label>
            <select
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-indigo-400 bg-gray-50"
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
            >
              {employees.map((emp) => (
                <option key={emp}>{emp}</option>
              ))}
            </select>

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
    </div>
  );
};

export default Tickets;
