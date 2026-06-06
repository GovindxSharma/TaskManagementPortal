// components/Tickets/TicketsTable.jsx
import React from "react";
import { UserCheck, CheckCircle2, Trash2, Pencil, Ticket } from "lucide-react";

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-700 border border-red-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  Low: "bg-green-50 text-green-700 border border-green-200",
};

const STATUS_STYLES = {
  Open: "bg-blue-50 text-blue-700 border border-blue-200",
  "In Progress": "bg-purple-50 text-purple-700 border border-purple-200",
  Closed: "bg-gray-100 text-gray-600 border border-gray-200",
  Resolved: "bg-green-50 text-green-700 border border-green-200",
};

const Badge = ({ label, styleMap }) => (
  <span
    className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
      styleMap[label] || "bg-gray-100 text-gray-600 border border-gray-200"
    }`}
  >
    {label}
  </span>
);

const TicketsTable = ({
  filteredTickets,
  isAdmin,
  handleDelete,
  handleStatusChange,
  openAssignModal,
  openEditModal,
}) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
      {filteredTickets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
          <Ticket size={32} className="opacity-30" />
          <p className="text-sm">No tickets match your filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Title</th>
                <th className="px-4 py-3 text-left font-medium">Client</th>
                <th className="px-4 py-3 text-left font-medium">Raised by</th>
                <th className="px-4 py-3 text-left font-medium">Assigned to</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium hidden md:table-cell">
                  Priority
                </th>
                <th className="px-4 py-3 text-left font-medium hidden lg:table-cell">
                  Updated
                </th>
                <th className="px-4 py-3 text-center font-medium">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {filteredTickets.map((t) => {
                const assigneeName = t.assignedTo?.name;
                const isUnassigned = !assigneeName;

                return (
                  <tr key={t._id} className="hover:bg-gray-50 transition group">
                    {/* Title */}
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800 leading-snug max-w-[180px] truncate">
                        {t.title}
                      </p>
                      {t.description && (
                        <p className="text-xs text-gray-400 truncate max-w-[180px] mt-0.5">
                          {t.description}
                        </p>
                      )}
                    </td>

                    {/* Client */}
                    <td className="px-4 py-3 text-gray-600">
                      {t.relatedClient?.name || (
                        <span className="text-gray-300 italic">N/A</span>
                      )}
                    </td>

                    {/* Raised by */}
                    <td className="px-4 py-3 text-gray-600">
                      {t.raisedBy?.name || (
                        <span className="text-gray-300 italic">N/A</span>
                      )}
                    </td>

                    {/* Assigned to — show placeholder clearly if unassigned */}
                    <td className="px-4 py-3">
                      {isUnassigned ? (
                        <span className="text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Unassigned
                        </span>
                      ) : (
                        <span className="text-gray-700">{assigneeName}</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <Badge label={t.status} styleMap={STATUS_STYLES} />
                    </td>

                    {/* Priority */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      <Badge label={t.priority} styleMap={PRIORITY_STYLES} />
                    </td>

                    {/* Updated */}
                    <td className="px-4 py-3 hidden lg:table-cell text-gray-400 text-xs">
                      {new Date(t.updatedAt).toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Assign (admin only) */}
                        {isAdmin && (
                          <ActionBtn
                            onClick={() => openAssignModal(t)}
                            color="indigo"
                            title="Assign ticket"
                          >
                            <UserCheck size={15} />
                          </ActionBtn>
                        )}

                        {/* Toggle resolve */}
                        <ActionBtn
                          onClick={() =>
                            handleStatusChange(
                              t,
                              t.status === "Resolved" ? "Open" : "Resolved",
                            )
                          }
                          color="green"
                          title={
                            t.status === "Resolved" ? "Reopen" : "Mark resolved"
                          }
                        >
                          <CheckCircle2 size={15} />
                        </ActionBtn>

                        {/* Edit */}
                        <ActionBtn
                          onClick={() => openEditModal(t)}
                          color="yellow"
                          title="Edit ticket"
                        >
                          <Pencil size={15} />
                        </ActionBtn>

                        {/* Delete (admin only) */}
                        {isAdmin && (
                          <ActionBtn
                            onClick={() => handleDelete(t._id)}
                            color="red"
                            title="Delete ticket"
                          >
                            <Trash2 size={15} />
                          </ActionBtn>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// Small reusable action button
const COLOR_MAP = {
  indigo: "bg-indigo-50 hover:bg-indigo-100 text-indigo-600",
  green: "bg-green-50 hover:bg-green-100 text-green-600",
  yellow: "bg-amber-50 hover:bg-amber-100 text-amber-600",
  red: "bg-red-50 hover:bg-red-100 text-red-600",
};

function ActionBtn({ onClick, color, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded-lg transition ${COLOR_MAP[color]}`}
    >
      {children}
    </button>
  );
}

export default TicketsTable;
