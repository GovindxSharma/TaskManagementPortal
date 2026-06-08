// components/Tickets/TicketModals/ResolvedTicketsModal.jsx

import React, { useState, useMemo } from "react";
import { X, CheckCircle, Search } from "lucide-react";

const PRIORITY_ORDER = { High: 0, Medium: 1, Low: 2 };

const ResolvedTicketsModal = ({ show, setShow, resolvedTickets = [] }) => {
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("");
  const [assignee, setAssignee] = useState("");
  const [sort, setSort] = useState("newest");

  const assignees = useMemo(
    () => [...new Set(resolvedTickets.map((t) => t.assignedTo?.name).filter(Boolean))],
    [resolvedTickets]
  );

  const filtered = useMemo(() => {
    let result = resolvedTickets.filter((t) => {
      const q = search.toLowerCase();
      const matchQ =
        !q ||
        t.title.toLowerCase().includes(q) ||
        (t.relatedClient?.name || "").toLowerCase().includes(q);
      const matchP = !priority || t.priority === priority;
      const matchA = !assignee || t.assignedTo?.name === assignee;
      return matchQ && matchP && matchA;
    });

    if (sort === "newest") result.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    else if (sort === "oldest") result.sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    else if (sort === "priority") result.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
    else if (sort === "title") result.sort((a, b) => a.title.localeCompare(b.title));

    return result;
  }, [resolvedTickets, search, priority, assignee, sort]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Resolved Tickets</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filtered.length} of {resolvedTickets.length} resolved ticket
                  {resolvedTickets.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShow(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex gap-2 pb-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or client…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-indigo-400 focus:outline-none transition"
              />
            </div>

            {/* Priority filter */}
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="">All Priorities</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>

            {/* Assignee filter */}
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="">All Assignees</option>
              {assignees.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:border-indigo-400 focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>

          <hr className="border-gray-100" />
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Search size={40} className="text-gray-300" />
              <p className="text-sm text-gray-400">No tickets match your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50 z-10">
                <tr>
                  {["Title", "Client", "Assigned To", "Priority", "Resolved On"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((ticket) => (
                  <tr key={ticket._id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-semibold text-gray-900 max-w-[220px]">
                      <span className="block truncate" title={ticket.title}>{ticket.title}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{ticket.relatedClient?.name || <span className="text-gray-300">N/A</span>}</td>
                    <td className="px-4 py-3 text-gray-600">{ticket.assignedTo?.name || <span className="text-gray-300">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        ticket.priority === "High"
                          ? "bg-red-100 text-red-700"
                          : ticket.priority === "Medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-700"
                      }`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {ticket.updatedAt
                        ? new Date(ticket.updatedAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center">
          <span className="text-xs text-gray-400">
            {filtered.length !== resolvedTickets.length
              ? `Showing ${filtered.length} of ${resolvedTickets.length}`
              : `${resolvedTickets.length} ticket${resolvedTickets.length !== 1 ? "s" : ""} total`}
          </span>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResolvedTicketsModal;