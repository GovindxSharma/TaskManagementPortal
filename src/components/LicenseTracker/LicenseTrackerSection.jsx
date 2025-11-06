import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { licenses as dummyLicenses } from "../../data/dummyClients";
import { X, Edit, Plus } from "lucide-react";

const getAllCategories = (licenses) => {
  const categorySet = new Set();
  licenses.forEach((l) =>
    l.policies.forEach((p) => {
      if (p.category && p.category.trim().length > 0) {
        categorySet.add(p.category);
      }
    })
  );
  return Array.from(categorySet);
};

function Modal({ open, children, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white rounded-xl p-8 shadow-2xl min-w-[400px] max-w-[800px] w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          className="absolute top-4 right-4 p-2"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={24} className="text-gray-500 hover:text-gray-800" />
        </button>
      </div>
    </div>
  );
}

export default function LicenseTrackerSection() {
  const navigate = useNavigate();
  const [licenses, setLicenses] = useState(dummyLicenses);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newPolicy, setNewPolicy] = useState({
    name: "",
    start: "",
    end: "",
    category: "",
  });
  const [filter, setFilter] = useState({
    policyName: "",
    category: "",
    endMonth: "",
  });
  const [editingIdx, setEditingIdx] = useState(null);
  const [showAddRow, setShowAddRow] = useState(false);

  const allCategories = useMemo(() => getAllCategories(licenses), [licenses]);

  const filteredClients = useMemo(() => {
    return licenses.filter((client) =>
      client.policies.some((policy) => {
        const matchesName = filter.policyName
          ? policy.name.toLowerCase().includes(filter.policyName.toLowerCase())
          : true;
        const matchesCategory = filter.category
          ? policy.category
              .toLowerCase()
              .includes(filter.category.toLowerCase())
          : true;
        const matchesMonth = filter.endMonth
          ? policy.end.slice(0, 7) === filter.endMonth
          : true;
        return matchesName && matchesCategory && matchesMonth;
      })
    );
  }, [licenses, filter]);

  const handleAddPolicy = () => {
    if (
      !selectedClient ||
      !newPolicy.name ||
      !newPolicy.start ||
      !newPolicy.end ||
      !newPolicy.category
    )
      return;
    setLicenses(
      licenses.map((l) =>
        l.client === selectedClient.client
          ? { ...l, policies: [...l.policies, { ...newPolicy }] }
          : l
      )
    );
    setNewPolicy({ name: "", start: "", end: "", category: "" });
    setShowAddRow(false);
  };

  const handleDeletePolicy = (clientName, idx) => {
    if (!window.confirm("Are you sure you want to delete this policy?")) return;
    setLicenses(
      licenses.map((l) =>
        l.client === clientName
          ? { ...l, policies: l.policies.filter((_, i) => i !== idx) }
          : l
      )
    );
    setEditingIdx(null);
    setNewPolicy({ name: "", start: "", end: "", category: "" });
  };

  const handleSaveEdit = () => {
    if (editingIdx === null) return;
    setLicenses(
      licenses.map((l) =>
        l.client === selectedClient.client
          ? {
              ...l,
              policies: l.policies.map((p, i) =>
                i === editingIdx ? { ...newPolicy } : p
              ),
            }
          : l
      )
    );
    setNewPolicy({ name: "", start: "", end: "", category: "" });
    setEditingIdx(null);
  };

  const handleClearFilters = () => {
    setFilter({ policyName: "", category: "", endMonth: "" });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
    {/* Back button + heading */}
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium px-3 py-2 bg-white rounded-lg shadow-sm"
      >
        ← Back
      </button>
  
      <h2 className="text-2xl font-semibold text-gray-800">License Tracker</h2>
    </div>
  

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 p-3 bg-gray-50 rounded-lg shadow-sm max-w-full">
        <div className="flex items-center gap-2 flex-1 min-w-[140px]">
          <input
            placeholder="Search Policy..."
            value={filter.policyName}
            onChange={(e) =>
              setFilter({ ...filter, policyName: e.target.value })
            }
            className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[130px]">
          <input
            type="month"
            value={filter.endMonth}
            onChange={(e) =>
              setFilter({ ...filter, endMonth: e.target.value })
            }
            className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-[130px]">
          <input
            type="text"
            placeholder="Filter Category..."
            value={filter.category}
            onChange={(e) =>
              setFilter({ ...filter, category: e.target.value })
            }
            className="border rounded-md px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        {(filter.policyName || filter.endMonth || filter.category) && (
          <button
            className="text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded px-3 py-1 transition"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Clients Table */}
      <table className="w-full border mb-4 rounded-lg overflow-hidden">
        <thead className="bg-blue-50 border-b border-blue-300">
          <tr className="text-blue-800 text-base">
            <th className="p-2 text-left">Client</th>
            <th className="p-2 text-left"># Policies</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center py-4 text-gray-400 italic">
                No clients found matching filters.
              </td>
            </tr>
          )}
          {filteredClients.map((client) => (
            <tr
              className="hover:bg-blue-100 cursor-pointer transition"
              key={client.id}
              onClick={() => setSelectedClient(client)}
            >
              <td className="p-2 font-medium">{client.client}</td>
              <td className="p-2">{client.policies.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal Pop-up */}
      <Modal
        open={!!selectedClient}
        onClose={() => {
          setSelectedClient(null);
          setEditingIdx(null);
          setShowAddRow(false);
          setNewPolicy({ name: "", start: "", end: "", category: "" });
        }}
      >
        {selectedClient && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-blue-800 text-xl">
                {selectedClient.client} Policies
              </h3>
              {!showAddRow && (
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
                  onClick={() => {
                    setShowAddRow(true);
                    setEditingIdx(null);
                    setNewPolicy({ name: "", start: "", end: "", category: "" });
                  }}
                >
                  <Plus size={16} /> Add Policy
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {/* policy table here (unchanged) */}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
