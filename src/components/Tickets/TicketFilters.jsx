// components/Tickets/TicketFilters.jsx
import React from "react";
import { Search, X } from "lucide-react";

const TicketFilters = ({
  filters,
  setFilters,
  search,
  setSearch,
  employees,
  clients,
}) => {
  const hasActiveFilters =
    search.trim() ||
    filters.status ||
    filters.priority ||
    filters.employee ||
    filters.client;

  const resetFilters = () => {
    setFilters({ status: "", priority: "", employee: "", client: "" });
    setSearch("");
  };

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-4 mb-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 border border-gray-300 px-3 py-2 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-indigo-300 focus-within:border-indigo-400 transition lg:col-span-2">
          <Search size={15} className="text-gray-400 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by title, client, or assignee…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status — excludes Resolved (shown in separate modal) */}
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All statuses</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        {/* Priority */}
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        {/* Employee — filter by _id for accuracy */}
        {employees.length > 0 && (
          <select
            value={filters.employee}
            onChange={(e) =>
              setFilters({ ...filters, employee: e.target.value })
            }
            className="border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
          >
            <option value="">All employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        )}

        {/* Client — filter by _id for accuracy */}
        <select
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          className="border border-gray-300 px-3 py-2 rounded-lg text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-gray-400">Active filters:</span>
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-full hover:bg-red-100 transition"
          >
            <X size={11} /> Clear all
          </button>
        </div>
      )}
    </div>
  );
};

export default TicketFilters;
