// components/Tickets/TicketFilters.jsx
import React from "react";
import { Search } from "lucide-react";

const TicketFilters = ({
  filters,
  setFilters,
  search,
  setSearch,
  employees,
  clients,
}) => {
  return (
    <div className="bg-white shadow p-4 rounded-xl mb-6">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Search */}
        <div className="flex items-center border px-3 py-2 rounded-lg bg-gray-50">
          <Search size={18} className="text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ml-2 flex-1 bg-transparent outline-none"
          />
        </div>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Status</option>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>

        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <select
          value={filters.employee}
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Employee</option>
          {employees.map((e) => (
            <option key={e._id} value={e.name}>
              {e.name}
            </option>
          ))}
        </select>

        <select
          value={filters.client}
          onChange={(e) => setFilters({ ...filters, client: e.target.value })}
          className="border px-3 py-2 rounded-lg"
        >
          <option value="">Client</option>
          {clients.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        {/* <input
          type="text"
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          placeholder="Category"
          className="border px-3 py-2 rounded-lg"
        /> */}
      </div>

      <button
        onClick={() =>
          setFilters({
            status: "",
            priority: "",
            employee: "",
            client: "",
            // category: "",
          })
        }
        className="mt-3 bg-red-500 text-white rounded-lg px-3 py-2 hover:bg-red-600 cursor-pointer"
      >
        Reset Filters
      </button>
    </div>
  );
};

export default TicketFilters;
