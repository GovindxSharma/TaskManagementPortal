import React, { useState } from "react";
import { Search, Filter, ChevronDown, CircleDollarSign, Plus, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Dropdown from "../layout/Dropdown";
import { clients as dummyClients } from "../../data/dummyClients";

const OverdueClients = () => {
const navigate = useNavigate();
const [payments, setPayments] = useState([]);
const [search, setSearch] = useState("");
const [filters, setFilters] = useState({ status: "All", sort: "Newest" });
const [addOverdueOpen, setAddOverdueOpen] = useState(false);

const overdueClientsAvailable = dummyClients
.map((c) => c.name)
.filter((name) => !payments.some((p) => p.client === name));

const filteredPayments = payments
.filter((p) => p.client.toLowerCase().includes(search.toLowerCase()))
.filter((p) => (filters.status === "All" ? true : p.status === filters.status))
.sort((a, b) => {
if (filters.sort === "Amount (High → Low)") return b.amount - a.amount;
if (filters.sort === "Amount (Low → High)") return a.amount - b.amount;
return new Date(b.dueDate) - new Date(a.dueDate);
});

const addOverdueClient = (clientName) => {
const newPayment = {
id: payments.length + 1,
client: clientName,
amount: 0,
status: "Overdue",
dueDate: new Date().toISOString().split("T")[0],
};
setPayments([...payments, newPayment]);
setAddOverdueOpen(false);
};

const removeOverdueClient = (id) => setPayments(payments.filter((p) => p.id !== id));

return ( <div className="min-h-screen bg-gray-50 p-4 md:p-8">
{/* Header */} <div className="mb-6 flex justify-between items-center">
<button
onClick={() => navigate(-1)}
className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
> <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span> </button> <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2"> <CircleDollarSign className="text-indigo-600" /> Overdue Clients </h2> </div>

  {/* Filters */}
  <div className="flex flex-wrap gap-3 items-start sm:items-center mb-4">
    <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72">
      <Search size={18} className="text-gray-500" />
      <input
        type="text"
        placeholder="Search client..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="ml-2 flex-1 outline-none text-gray-700 bg-transparent"
      />
    </div>

    <Dropdown
      label="Status"
      value={filters.status}
      onChange={(val) => setFilters({ ...filters, status: val })}
      options={["All", "Paid", "Pending", "Overdue"]}
      placeholder="Select Status"
    />

    <Dropdown
      label="Sort"
      value={filters.sort}
      onChange={(val) => setFilters({ ...filters, sort: val })}
      options={["Newest", "Amount (High → Low)", "Amount (Low → High)"]}
      placeholder="Sort By"
    />
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
      <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-w-xs overflow-hidden">
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
          <div className="px-4 py-2 text-gray-500 italic">No clients available</div>
        )}
      </div>
    )}
  </div>

  {/* Payments Table */}
  <div className="bg-white shadow rounded-xl overflow-hidden">
    <table className="min-w-full text-sm">
      <thead className="bg-gray-100 border-b">
        <tr className="text-gray-700">
          <th className="p-3 text-left">Client</th>
          <th className="p-3 text-left">Amount</th>
          <th className="p-3 text-left">Status</th>
          <th className="p-3 text-left">Due Date</th>
          <th className="p-3 text-center">Action</th>
        </tr>
      </thead>
      <tbody>
        {filteredPayments.length > 0 ? (
          filteredPayments.map((p) => (
            <tr key={p.id} className="border-b hover:bg-gray-50 transition">
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
              <td className="p-3 text-center">
                {p.status === "Overdue" && (
                  <button
                    onClick={() => removeOverdueClient(p.id)}
                    className="flex items-center gap-1 text-red-600 hover:underline mx-auto"
                  >
                    <X size={14} /> Remove
                  </button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center py-6 text-gray-400 italic">
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
