// components/Tickets/TicketModals/ResolvedTicketsModal.jsx
import React from "react";
import { X } from "lucide-react";

const ResolvedTicketsModal = ({ show, setShow, resolvedTickets }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-5 w-full max-w-4xl shadow-xl max-h-[85vh] overflow-y-auto relative">
        <button
          className="absolute top-3 right-3 p-2 bg-gray-200 rounded-full hover:bg-gray-300"
          onClick={() => setShow(false)}
        >
          <X size={18} />
        </button>

        <h3 className="text-xl font-semibold mb-4">Resolved Tickets</h3>

        <table className="min-w-full text-sm border rounded-lg">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Assigned To</th>
              <th className="p-3 text-left">Priority</th>
              <th className="p-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {resolvedTickets.length > 0 ? (
              resolvedTickets.map((t) => (
                <tr
                  key={t._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{t.title}</td>
                  <td className="p-3">{t.relatedClient?.name || "N/A"}</td>
                  <td className="p-3">{t.assignedTo?.name || "N/A"}</td>
                  <td className="p-3">{t.priority}</td>
                  <td className="p-3">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No resolved tickets.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="mt-5 flex justify-end">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolvedTicketsModal;
