import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X, Edit, Plus, Trash2 } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "../../components/layout/ToastProvider.jsx";
import Loader from "../../components/layout/Loader.jsx"; // centralized loader
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
        className="bg-white rounded-xl p-6 shadow-xl w-full max-w-[800px] relative"
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
  const { success, error } = useToast();

  const [licenses, setLicenses] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExpiringModal, setShowExpiringModal] = useState(false);
  const [newLicense, setNewLicense] = useState({
    client_id: "",
    licenseName: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [editingLicense, setEditingLicense] = useState(null);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    licenseName: "",
    category: "",
    endDate: "",
  });

  // FETCH LICENSES
  const fetchLicenses = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/license");
      setLicenses(res.data.data || []);
    } catch (err) {
      console.error(err);
      error("Failed to fetch licenses");
    } finally {
      setLoading(false);
    }
  };

  // FETCH CLIENTS
  const fetchClients = async () => {
    try {
      setLoading(true);
      const companyId = JSON.parse(
        localStorage.getItem("user") || "{}"
      )?.company_id;
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.clients || []);
    } catch (err) {
      console.error(err);
      error("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
    fetchClients();
  }, []);

  // FILTER CLIENTS BASED ON LICENSES
  const filteredClients = useMemo(() => {
    return clients
      .map((c) => {
        const clientLicenses = licenses.filter(
          (l) => l.client_id._id === c._id
        );
        const matching = clientLicenses.filter((l) => {
          const matchesName = filters.licenseName
            ? l.licenseName
                .toLowerCase()
                .includes(filters.licenseName.toLowerCase())
            : true;
          const matchesCategory = filters.category
            ? l.category.toLowerCase().includes(filters.category.toLowerCase())
            : true;
          const matchesEndDate = filters.endDate
            ? l.endDate.slice(0, 7) === filters.endDate
            : true;
          return matchesName && matchesCategory && matchesEndDate;
        });
        return matching.length > 0 ? { ...c, licenses: matching } : null;
      })
      .filter(Boolean);
  }, [clients, licenses, filters]);

  // Add License
  const handleAddLicense = async () => {
    if (
      !newLicense.client_id ||
      !newLicense.licenseName ||
      !newLicense.category ||
      !newLicense.startDate ||
      !newLicense.endDate
    )
      return error("All fields are required");
    try {
      setLoading(true);
      await axiosInstance.post("/license", newLicense);
      success("License added");
      setShowAddModal(false);
      setNewLicense({
        client_id: "",
        licenseName: "",
        category: "",
        startDate: "",
        endDate: "",
      });
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to add license");
    } finally {
      setLoading(false);
    }
  };

  // Delete License
  const handleDeleteLicense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this license?"))
      return;
    try {
      setLoading(true);
      await axiosInstance.delete(`/license/${id}`);
      success("License deleted");
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to delete license");
    } finally {
      setLoading(false);
    }
  };

  // Save Edited License
  const handleSaveEdit = async () => {
    if (!editingLicense) return;
    try {
      setLoading(true);
      await axiosInstance.put(`/license/${editingLicense._id}`, editingLicense);
      success("License updated");
      setEditingLicense(null);
      fetchLicenses();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to update license");
    } finally {
      setLoading(false);
    }
  };

  const exportLicensesPDF = () => {
    if (!licenses.length) return;

    const doc = new jsPDF();
    const tableColumn = [
      "Client",
      "License Name",
      "Category",
      "Start Date",
      "End Date",
    ];
    const tableRows = licenses.map((l) => [
      l.client_id?.name || "-",
      l.licenseName,
      l.category,
      l.startDate.slice(0, 10),
      l.endDate.slice(0, 10),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [59, 130, 246] }, // blue header
    });

    doc.save("Licenses.pdf");
  };

  // Export all licenses as Excel
  const exportLicensesExcel = () => {
    if (!licenses.length) return;

    const worksheet = XLSX.utils.json_to_sheet(
      licenses.map((l) => ({
        Client: l.client_id?.name || "-",
        "License Name": l.licenseName,
        Category: l.category,
        "Start Date": l.startDate.slice(0, 10),
        "End Date": l.endDate.slice(0, 10),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Licenses");
    XLSX.writeFile(workbook, "Licenses.xlsx");
  };

  const expiringLicenses = useMemo(() => {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const endOfNextMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 2,
      0,
      23,
      59,
      59
    );

    return licenses.filter((l) => {
      const endDate = new Date(l.endDate);
      return endDate >= startOfCurrentMonth && endDate <= endOfNextMonth;
    });
  }, [licenses]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {loading && <Loader />}

      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <button
            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-300 transition"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            License Tracker
          </h2>
        </div>

        <div className="flex gap-3">
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            onClick={() => setShowExpiringModal(true)}
          >
            Expiring Licenses
          </button>

          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={16} /> Add License
          </button>

          {/* Export buttons */}
          <button
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            onClick={exportLicensesPDF}
          >
            Export PDF
          </button>
          <button
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition"
            onClick={exportLicensesExcel}
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg shadow-sm items-center">
        <input
          type="text"
          placeholder="Search License Name..."
          value={filters.licenseName}
          onChange={(e) =>
            setFilters({ ...filters, licenseName: e.target.value })
          }
          className="border px-3 py-2 rounded-md w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Category..."
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="border px-3 py-2 rounded-md w-full md:w-60 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="month"
          placeholder="End Date..."
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
          className="border px-3 py-2 rounded-md w-full md:w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {(filters.licenseName || filters.category || filters.endDate) && (
          <button
            className="bg-red-100 text-red-600 px-3 py-2 rounded hover:bg-red-200 transition text-sm"
            onClick={() =>
              setFilters({ licenseName: "", category: "", endDate: "" })
            }
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Clients Table */}
      <table className="w-full border rounded-lg overflow-hidden mb-4">
        <thead className="bg-blue-50 border-b border-blue-300">
          <tr className="text-blue-800 text-base">
            <th className="p-3 text-left">Client</th>
            <th className="p-3 text-left"># Licenses</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.length === 0 && (
            <tr>
              <td colSpan={2} className="text-center py-6 text-gray-400 italic">
                No clients with licenses matching filters.
              </td>
            </tr>
          )}
          {filteredClients.map((c) => (
            <tr
              key={c._id}
              className="hover:bg-blue-100 cursor-pointer transition"
              onClick={() => setSelectedClient(c)}
            >
              <td className="p-3 font-medium">{c.name}</td>
              <td className="p-3">{c.licenses.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* View Client Licenses */}
      <Modal open={!!selectedClient} onClose={() => setSelectedClient(null)}>
        <h3 className="text-xl font-semibold mb-4">
          {selectedClient?.name} Licenses
        </h3>
        <table className="w-full border rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-2 text-left">License Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Start Date</th>
              <th className="p-2 text-left">End Date</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {selectedClient?.licenses.map((l) => (
              <tr key={l._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-2">{l.licenseName}</td>
                <td className="p-2">{l.category}</td>
                <td className="p-2">{l.startDate.slice(0, 10)}</td>
                <td className="p-2">{l.endDate.slice(0, 10)}</td>
                <td className="p-2 flex justify-center gap-2">
                  <button
                    className="p-1 bg-yellow-100 hover:bg-yellow-200 rounded"
                    onClick={() => setEditingLicense(l)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-1 bg-red-100 hover:bg-red-200 rounded"
                    onClick={() => handleDeleteLicense(l._id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {/* Edit License Row */}
            {editingLicense && (
              <tr className="bg-blue-50">
                <td>
                  <input
                    type="text"
                    value={editingLicense.licenseName}
                    onChange={(e) =>
                      setEditingLicense({
                        ...editingLicense,
                        licenseName: e.target.value,
                      })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={editingLicense.category}
                    onChange={(e) =>
                      setEditingLicense({
                        ...editingLicense,
                        category: e.target.value,
                      })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={editingLicense.startDate.slice(0, 10)}
                    onChange={(e) =>
                      setEditingLicense({
                        ...editingLicense,
                        startDate: e.target.value,
                      })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    value={editingLicense.endDate.slice(0, 10)}
                    onChange={(e) =>
                      setEditingLicense({
                        ...editingLicense,
                        endDate: e.target.value,
                      })
                    }
                    className="border px-2 py-1 rounded w-full"
                  />
                </td>
                <td className="flex gap-2 justify-center">
                  <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 px-3 py-1 rounded"
                    onClick={() => setEditingLicense(null)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Modal>

      {/* Add License Modal */}
      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <h3 className="text-xl font-semibold mb-4">Add License</h3>
        <div className="flex flex-col gap-4">
          <select
            value={newLicense.client_id}
            onChange={(e) =>
              setNewLicense({ ...newLicense, client_id: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          >
            <option value="">Select Client</option>
            {clients.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="License Name"
            value={newLicense.licenseName}
            onChange={(e) =>
              setNewLicense({ ...newLicense, licenseName: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            type="text"
            placeholder="Category"
            value={newLicense.category}
            onChange={(e) =>
              setNewLicense({ ...newLicense, category: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            type="date"
            value={newLicense.startDate}
            onChange={(e) =>
              setNewLicense({ ...newLicense, startDate: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
          <input
            type="date"
            value={newLicense.endDate}
            onChange={(e) =>
              setNewLicense({ ...newLicense, endDate: e.target.value })
            }
            className="border px-3 py-2 rounded-md w-full"
          />
          <div className="flex gap-2 justify-end">
            <button
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
              onClick={handleAddLicense}
            >
              Add License
            </button>
            <button
              className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={showExpiringModal}
        onClose={() => setShowExpiringModal(false)}
      >
        <h3 className="text-xl font-semibold mb-4 text-orange-600">
          Licenses Expiring Soon
        </h3>

        {expiringLicenses.length === 0 ? (
          <p className="text-gray-500 italic">
            No licenses expiring in current or next month 🎉
          </p>
        ) : (
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-orange-50 border-b">
              <tr>
                <th className="p-2 text-left">Client</th>
                <th className="p-2 text-left">License</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">End Date</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {expiringLicenses.map((l) => {
                const end = new Date(l.endDate);
                const today = new Date();
                const diffDays = Math.ceil(
                  (end - today) / (1000 * 60 * 60 * 24)
                );

                return (
                  <tr
                    key={l._id}
                    className="border-b hover:bg-orange-50 transition"
                  >
                    <td className="p-2 font-medium">{l.client_id?.name}</td>
                    <td className="p-2">{l.licenseName}</td>
                    <td className="p-2">{l.category}</td>
                    <td className="p-2">{end.toISOString().slice(0, 10)}</td>
                    <td className="p-2">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${
                          diffDays <= 30
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {diffDays <= 30
                          ? "Expiring This Month"
                          : "Expiring Next Month"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Modal>
    </div>
  );
}
