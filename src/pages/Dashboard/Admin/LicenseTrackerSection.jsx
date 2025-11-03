import React, { useState, useMemo } from "react";
import { licenses as dummyLicenses } from "./CustomerCompliance/data/dummyClients";
import { X, Edit, Plus } from "lucide-react";

export default function LicenseTrackerSection() {
  const [licenses, setLicenses] = useState(dummyLicenses);
  const [selectedClient, setSelectedClient] = useState(null);
  const [newPolicy, setNewPolicy] = useState({ name: "", start: "", end: "" });
  const [filter, setFilter] = useState({ policyName: "", endMonth: "" });
  const [editingIdx, setEditingIdx] = useState(null);

  // Filtered client list based on universal filter
  const filteredClients = useMemo(() => {
    return licenses.filter((l) =>
      l.policies.some((p) => {
        const matchesName = filter.policyName
          ? p.name.toLowerCase().includes(filter.policyName.toLowerCase())
          : true;
        const matchesMonth = filter.endMonth
          ? p.end.slice(0, 7) === filter.endMonth
          : true;
        return matchesName && matchesMonth;
      })
    );
  }, [licenses, filter]);

  const handleAddPolicy = () => {
    if (!selectedClient || !newPolicy.name) return;
    setLicenses(
      licenses.map((l) =>
        l.client === selectedClient.client
          ? { ...l, policies: [...l.policies, { ...newPolicy }] }
          : l
      )
    );
    setNewPolicy({ name: "", start: "", end: "" });
    setEditingIdx(null);
  };

  const handleEditPolicy = (idx) => {
    setEditingIdx(idx);
    const p = selectedClient.policies[idx];
    setNewPolicy({ ...p });
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
    setNewPolicy({ name: "", start: "", end: "" });
    setEditingIdx(null);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">License Tracker</h2>

      {/* Universal Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Search Policy Name..."
          value={filter.policyName}
          onChange={(e) => setFilter({ ...filter, policyName: e.target.value })}
          className="border px-3 py-2 rounded-lg text-sm flex-1 min-w-[150px]"
        />
        <input
          type="month"
          placeholder="End Month"
          value={filter.endMonth}
          onChange={(e) => setFilter({ ...filter, endMonth: e.target.value })}
          className="border px-3 py-2 rounded-lg text-sm"
        />
      </div>

      {/* Clients Row */}
      <div className="flex flex-wrap gap-3 mb-4">
        {filteredClients.map((l) => (
          <button
            key={l.id}
            onClick={() => setSelectedClient(l)}
            className={`px-4 py-2 rounded-lg border font-medium ${
              selectedClient?.client === l.client
                ? "bg-blue-500 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {l.client}
          </button>
        ))}
      </div>

      {/* Selected Client Policies */}
      {selectedClient && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3 text-lg">
            {selectedClient.client} Policies
          </h3>

          {/* Add/Edit Policy */}
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              placeholder="Policy Name"
              value={newPolicy.name}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, name: e.target.value })
              }
              className="border px-2 py-1 rounded-lg text-sm"
            />
            <input
              type="date"
              placeholder="Start Date"
              value={newPolicy.start}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, start: e.target.value })
              }
              className="border px-2 py-1 rounded-lg text-sm"
            />
            <input
              type="date"
              placeholder="End Date"
              value={newPolicy.end}
              onChange={(e) =>
                setNewPolicy({ ...newPolicy, end: e.target.value })
              }
              className="border px-2 py-1 rounded-lg text-sm"
            />
            {editingIdx !== null ? (
              <button
                onClick={handleSaveEdit}
                className="bg-green-500 text-white px-3 py-1 rounded-lg"
              >
                Update
              </button>
            ) : (
              <button
                onClick={handleAddPolicy}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          {/* Policies Table */}
          <table className="w-full text-sm border-collapse text-gray-700">
            <thead className="bg-gray-100 border-b">
              <tr className="text-gray-700 text-base">
                <th className="p-2 text-left">Policy</th>
                <th className="p-2 text-left">Start Date</th>
                <th className="p-2 text-left">End Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedClient.policies.map((p, idx) => (
                <tr
                  key={idx}
                  className="border-b hover:bg-gray-50 transition text-base"
                >
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">{p.start}</td>
                  <td className="p-2">{p.end}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => handleEditPolicy(idx)}>
                      <Edit size={18} className="text-blue-500" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeletePolicy(selectedClient.client, idx)
                      }
                    >
                      <X size={18} className="text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
              {selectedClient.policies.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-4 text-gray-400 italic"
                  >
                    No policies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
