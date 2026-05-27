import React from "react";
import { UserCheck, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { statusColor } from "./ticketUtils";

const TicketsTable = ({
  filteredTickets,
  isAdmin,
  handleDelete,
  handleStatusChange,
  setSelectedTicket,
  setSelectedEmp,
  setShowAssignModal,
  setShowEditModal,
}) => {
  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100 border-b">
          <tr className="text-gray-700">
            <th className="p-3 text-left">Title</th>
            <th className="p-3 text-left">Client</th> {/* Added Client column */}
            <th className="p-3 text-left">Raised By</th>
            <th className="p-3 text-left">Assigned To</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left hidden md:table-cell">Priority</th>
            <th className="p-3 text-left hidden md:table-cell">Updated</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTickets.length ? (
            filteredTickets.map((t) => (
              <tr key={t._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium text-gray-800">{t.title}</td>
                <td className="p-3">{t.relatedClient?.name || "N/A"}</td> {/* Show client name */}
                <td className="p-3">{t.raisedBy?.name || "N/A"}</td>
                <td className="p-3">{t.assignedTo?.name || "Unassigned"}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      statusColor[t.status] || "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-3 hidden md:table-cell">{t.priority}</td>
                <td className="p-3 hidden md:table-cell">
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
                      className="p-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition cursor-pointer"
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
                    className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition cursor-pointer"
                  >
                    <CheckCircle2 size={16} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTicket(t);
                      setShowEditModal(true);
                    }}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>

                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(t._id);
                        if (t._id === selectedTicket?._id) {
                          setShowEditModal(false);
                        }
                        setSelectedTicket(null);
                        setSelectedEmp({ _id: null, name: "" });
                      }}
                      className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-6 text-gray-400">
                No tickets found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TicketsTable;
