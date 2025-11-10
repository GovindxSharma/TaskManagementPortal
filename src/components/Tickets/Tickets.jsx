import React, { useState } from "react";
import { Search, UserCheck, ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../layout/Dropdown";

const Tickets = () => {
const navigate = useNavigate();

const [tickets, setTickets] = useState([
{ id: 1, title: "Payment not processed", client: "Ravi Patel", assignedTo: "Unassigned", status: "Open", priority: "High", createdAt: "2025-10-15", updatedAt: "2025-10-19" },
{ id: 2, title: "Website issue - 404 error", client: "Meena Singh", assignedTo: "Amit Kumar", status: "In Progress", priority: "Medium", createdAt: "2025-10-17", updatedAt: "2025-10-19" },
{ id: 3, title: "Invoice not received", client: "Pooja Sharma", assignedTo: "Riya Sharma", status: "Resolved", priority: "Low", createdAt: "2025-10-10", updatedAt: "2025-10-15" },
]);

const [employees] = useState(["Amit Kumar", "Riya Sharma", "Neha Verma", "Unassigned"]);
const [search, setSearch] = useState("");
const [filters, setFilters] = useState({ status: "", employee: "", priority: "" });
const [showAssignModal, setShowAssignModal] = useState(false);
const [selectedTicket, setSelectedTicket] = useState(null);
const [selectedEmp, setSelectedEmp] = useState("");

const statusColor = {
Open: "bg-red-100 text-red-700",
Pending: "bg-yellow-100 text-yellow-700",
"In Progress": "bg-blue-100 text-blue-700",
Resolved: "bg-green-100 text-green-700",
};

const filteredTickets = tickets.filter((t) => {
const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.client.toLowerCase().includes(search.toLowerCase());
const matchStatus = !filters.status || t.status === filters.status;
const matchEmp = !filters.employee || t.assignedTo === filters.employee;
const matchPriority = !filters.priority || t.priority === filters.priority;
return matchSearch && matchStatus && matchEmp && matchPriority;
});

const handleAssign = () => {
if (!selectedTicket || !selectedEmp) return;
setTickets((prev) =>
prev.map((t) =>
t.id === selectedTicket.id
? { ...t, assignedTo: selectedEmp, status: t.status === "Open" ? "In Progress" : t.status, updatedAt: new Date().toISOString().split("T")[0] }
: t
)
);
setShowAssignModal(false);
};

const handleDelete = (id) => setTickets((prev) => prev.filter((t) => t.id !== id));

const handleStatusChange = (id, newStatus) =>
setTickets((prev) =>
prev.map((t) => (t.id === id ? { ...t, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] } : t))
);

return ( <div className="min-h-screen bg-gray-50 p-4 md:p-8">
{/* Header */} <div className="mb-6"> <div className="flex justify-between items-center mb-4">
<button
onClick={() => navigate(-1)}
className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
> <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span> </button> <h2 className="text-2xl font-semibold text-gray-800">Ticket Management</h2> </div>

    {/* Filters */}
    <div className="flex flex-wrap gap-3 items-start sm:items-center">
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

      <Dropdown
        label="Status"
        value={filters.status}
        onChange={(val) => setFilters({ ...filters, status: val })}
        options={["Open", "Pending", "In Progress", "Resolved"]}
        placeholder="Select Status"
      />

      <Dropdown
        label="Employee"
        value={filters.employee}
        onChange={(val) => setFilters({ ...filters, employee: val })}
        options={employees}
        placeholder="Select Employee"
      />

      <Dropdown
        label="Priority"
        value={filters.priority}
        onChange={(val) => setFilters({ ...filters, priority: val })}
        options={["Low", "Medium", "High"]}
        placeholder="Select Priority"
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
            <tr key={t.id} className="border-b hover:bg-gray-50 transition">
              <td className="p-3 font-medium text-gray-800">{t.title}</td>
              <td className="p-3 text-gray-700">{t.client}</td>
              <td className="p-3 text-gray-700">{t.assignedTo}</td>
              <td className="p-3">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor[t.status] || "bg-gray-100 text-gray-700"}`}>
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
              <td className="p-3 text-gray-600 hidden md:table-cell">{t.updatedAt}</td>
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
                  onClick={() => handleStatusChange(t.id, t.status === "Resolved" ? "Open" : "Resolved")}
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
          ))
        ) : (
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
  {showAssignModal && selectedTicket && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md relative shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Assign Ticket</h3>
        <p className="text-gray-600 mb-2"><strong>Title:</strong> {selectedTicket.title}</p>
        <p className="text-gray-600 mb-4"><strong>Raised By:</strong> {selectedTicket.client}</p>

        <label className="block text-sm text-gray-600 mb-1">Assign To:</label>
        <Dropdown
          value={selectedEmp}
          onChange={setSelectedEmp}
          options={employees}
          placeholder="Select Employee"
          width="w-full"
        />

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
