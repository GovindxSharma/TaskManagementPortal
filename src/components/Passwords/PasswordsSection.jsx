import React, { useState } from "react";
import { X, Edit, Plus, Search } from "lucide-react";
import { passwords as dummyPasswords } from "../../data/dummyClients";

// Dummy client list for dropdown
const clientsList = [
  "Acme Corp",
  "GreenLeaf Pvt Ltd",
  "ZenTax Advisors",
  "Riya Sharma",
  "Amit Verma",
];

export default function PasswordsSection() {
  const [passwords, setPasswords] = useState(dummyPasswords);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [newData, setNewData] = useState({
    client: "",
    category: "",
    username: "",
    password: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");

  const filteredPasswords = passwords.filter(
    (p) =>
      p.client.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!newData.client || !newData.username || !newData.password) return;
    if (editingId) {
      setPasswords(
        passwords.map((p) => (p.id === editingId ? { ...p, ...newData } : p))
      );
    } else {
      setPasswords([...passwords, { ...newData, id: Date.now() }]);
    }
    resetModal();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setNewData(p);
    setModalOpen(true);
  };

  const confirmDelete = (id) => setDeleteId(id);
  const handleDelete = () => {
    setPasswords(passwords.filter((p) => p.id !== deleteId));
    setDeleteId(null);
  };

  const resetModal = () => {
    setEditingId(null);
    setNewData({
      client: "",
      category: "",
      username: "",
      password: "",
      description: "",
    });
    setModalOpen(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">Passwords</h2>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none text-base w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={18} /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-base border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Password</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasswords.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium">{p.client}</td>
                <td className="p-3">{p.category}</td>
                <td className="p-3">{p.username}</td>
                <td className="p-3">{p.password}</td>
                <td className="p-3">{p.description}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => handleEdit(p)}
                    className="text-indigo-600 hover:text-indigo-800 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => confirmDelete(p.id)}
                    className="text-red-600 hover:text-red-800 transition"
                  >
                    <X size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredPasswords.length === 0 && (
              <tr>
                <td
                  colSpan="6"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No passwords found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[550px] max-w-[95%] relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={resetModal}
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editingId ? "Edit Password" : "Add Password"}
            </h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-gray-600 text-sm mb-1">Client</label>
                <input
                  list="clients"
                  placeholder="Select client"
                  value={newData.client}
                  onChange={(e) =>
                    setNewData({ ...newData, client: e.target.value })
                  }
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
                />
                <datalist id="clients">
                  {clientsList
                    .filter((c) =>
                      c.toLowerCase().includes(clientSearch.toLowerCase())
                    )
                    .map((c, i) => (
                      <option key={i} value={c} />
                    ))}
                </datalist>
              </div>
              {["category", "username", "password", "description"].map(
                (field) => (
                  <div key={field}>
                    <label className="text-gray-600 text-sm mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    <input
                      placeholder={field}
                      value={newData[field]}
                      onChange={(e) =>
                        setNewData({ ...newData, [field]: e.target.value })
                      }
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-indigo-400 outline-none"
                    />
                  </div>
                )
              )}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              {editingId && (
                <button
                  onClick={resetModal}
                  className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px] max-w-[90%] relative">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this password entry?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
