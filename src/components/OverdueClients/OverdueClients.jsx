import React, { useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  CircleDollarSign,
  Plus,
  X,
} from "lucide-react";
import { clients as dummyClients } from "../../data/dummyClients";

const OverdueClients = () => {
  const [payments, setPayments] = useState([
    // {
    //   id: 1,
    //   client: "Riya Sharma",
    //   amount: 1200,
    //   status: "Paid",
    //   dueDate: "2025-10-10",
    // },
    // {
    //   id: 2,
    //   client: "Amit Kumar",
    //   amount: 2500,
    //   status: "Pending",
    //   dueDate: "2025-10-18",
    // },
    // {
    //   id: 3,
    //   client: "Sneha Patel",
    //   amount: 1800,
    //   status: "Overdue",
    //   dueDate: "2025-09-25",
    // },
    // {
    //   id: 4,
    //   client: "Arjun Singh",
    //   amount: 3200,
    //   status: "Paid",
    //   dueDate: "2025-10-01",
    // },
    // {
    //   id: 5,
    //   client: "Karan Mehta",
    //   amount: 2900,
    //   status: "Pending",
    //   dueDate: "2025-10-22",
    // },
  ]);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "All", sort: "Newest" });
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [addOverdueOpen, setAddOverdueOpen] = useState(false);

  // Filtered list of clients that can be added as overdue
  const overdueClientsAvailable = dummyClients
    .map((c) => c.name)
    .filter((name) => !payments.some((p) => p.client === name));

  const filteredPayments = payments
    .filter((p) => p.client.toLowerCase().includes(search.toLowerCase()))
    .filter((p) =>
      filters.status === "All" ? true : p.status === filters.status
    )
    .sort((a, b) => {
      if (filters.sort === "Amount (High → Low)") return b.amount - a.amount;
      if (filters.sort === "Amount (Low → High)") return a.amount - b.amount;
      return new Date(b.dueDate) - new Date(a.dueDate);
    });

  const addOverdueClient = (clientName) => {
    const newPayment = {
      id: payments.length + 1,
      client: clientName,
      amount: 0, // dummy amount
      status: "Overdue",
      dueDate: new Date().toISOString().split("T")[0],
    };
    setPayments([...payments, newPayment]);
    setAddOverdueOpen(false);
  };

  const removeOverdueClient = (id) => {
    setPayments(payments.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <CircleDollarSign className="text-indigo-600" /> Overdue Clients
        </h2>

        {/* Filters */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search client..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Dropdown Filters */}
          <div className="relative">
            <button
              onClick={() =>
                setDropdownOpen(dropdownOpen === "status" ? null : "status")
              }
              className="flex items-center gap-2 bg-white px-4 py-2 border border-gray-300 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <Filter size={16} className="text-indigo-600" />
              <span>Status: {filters.status}</span>
              <ChevronDown
                className={`transition-transform duration-200 ${
                  dropdownOpen === "status" ? "rotate-180" : ""
                }`}
              />
            </button>

            {dropdownOpen === "status" && (
              <div
                onMouseLeave={() => setDropdownOpen(null)}
                className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fadeIn z-10"
              >
                {["All", "Paid", "Pending", "Overdue"].map((status) => (
                  <div
                    key={status}
                    onClick={() => {
                      setFilters({ ...filters, status });
                      setDropdownOpen(null);
                    }}
                    className={`px-4 py-2 cursor-pointer hover:bg-indigo-50 transition ${
                      filters.status === status
                        ? "text-indigo-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Overdue Client Button */}
      <div className="mb-4">
        <button
          onClick={() => setAddOverdueOpen(!addOverdueOpen)}
          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={16} /> Add Overdue Client
        </button>
        {addOverdueOpen && (
          <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-w-xs overflow-hidden">
            {overdueClientsAvailable.length > 0 ? (
              overdueClientsAvailable.map((c) => (
                <div
                  key={c}
                  className="px-4 py-2 cursor-pointer hover:bg-red-50 flex justify-between items-center"
                  onClick={() => addOverdueClient(c)}
                >
                  <span>{c}</span>
                  <Plus size={14} className="text-red-600" />
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-gray-500 italic">
                No clients available
              </div>
            )}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Due Date</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.map((p) => (
              <tr
                key={p.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{p.client}</td>
                <td className="p-3 text-gray-700">₹{p.amount}</td>
                <td
                  className={`p-3 font-semibold ${
                    p.status === "Paid"
                      ? "text-green-600"
                      : p.status === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {p.status}
                </td>
                <td className="p-3 text-gray-600">{p.dueDate}</td>
                <td className="p-3">
                  {p.status === "Overdue" && (
                    <button
                      onClick={() => removeOverdueClient(p.id)}
                      className="flex items-center gap-1 text-red-600 hover:underline"
                    >
                      <X size={14} /> Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredPayments.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No matching payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverdueClients;
