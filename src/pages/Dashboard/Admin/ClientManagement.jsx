import React, { useState } from "react";
import { Pencil, Trash2, UserPlus, Search, ArrowLeft, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([
    {
      id: 1,
      name: "John Doe",
      company: "TechCorp",
      email: "john@tech.com",
      phone: "9876543210",
      gst: "22AAAAA0000A1Z5",
      address: "123 Business Street, Mumbai",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      pincode: "400001",
      contactPerson: "Amit Verma",
      industry: "IT Services",
      pan: "ABCDE1234F",
      website: "www.techcorp.com",
      status: "Active",
    },
    {
      id: 2,
      name: "Jane Smith",
      company: "HealthPlus",
      email: "jane@health.com",
      phone: "9988776655",
      gst: "29BBBBB0000B1Z9",
      address: "55 Green Road, Pune",
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      pincode: "411001",
      contactPerson: "Riya Sharma",
      industry: "Healthcare",
      pan: "FGHIJ6789K",
      website: "www.healthplus.in",
      status: "Pending",
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    gst: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    contactPerson: "",
    industry: "",
    pan: "",
    website: "",
    status: "Active",
  });

  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const resetForm = () =>
    setForm({
      name: "",
      company: "",
      email: "",
      phone: "",
      gst: "",
      address: "",
      city: "",
      state: "",
      country: "",
      pincode: "",
      contactPerson: "",
      industry: "",
      pan: "",
      website: "",
      status: "Active",
    });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      setClients((prev) =>
        prev.map((c) => (c.id === editingId ? { ...c, ...form } : c))
      );
    } else {
      setClients([...clients, { ...form, id: Date.now() }]);
    }
    setEditingId(null);
    resetForm();
    setShowModal(false);
  };

  const handleEdit = (client) => {
    setForm(client);
    setEditingId(client.id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    setClients(clients.filter((c) => c.id !== id));
  };

  const filteredClients = clients.filter((c) =>
    Object.values(c)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
 {/* Header */}
<div className="mb-6">
{/* First line: Back button left, Title right */}
<div className="flex justify-between items-center mb-4">
  <button
    onClick={() => navigate(-1)}
    className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 transition"
  >
    <ArrowLeft size={18} />
    <span className="hidden sm:block">Back</span>
  </button>

  <h2 className="text-2xl font-semibold text-gray-800">
    Client Management
  </h2>
</div>

{/* Second line: Search input + Add Client button */}
<div className="flex flex-col md:flex-row gap-3">
  <div className="relative flex-1 md:flex-none">
    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
    <input
      type="text"
      placeholder="Search clients..."
      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
  <button
    onClick={() => {
      resetForm();
      setEditingId(null);
      setShowModal(true);
    }}
    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
  >
    <UserPlus size={18} />
    <span className="hidden sm:block">Add Client</span>
  </button>
</div>
</div>


      {/* Client Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left hidden md:table-cell">Company</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left hidden md:table-cell">Phone</th>
              <th className="p-3 text-left hidden lg:table-cell">City</th>
              <th className="p-3 text-left hidden lg:table-cell">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr
                key={c.id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{c.name}</td>
                <td className="p-3 text-gray-700 hidden md:table-cell">
                  {c.company}
                </td>
                <td className="p-3 text-gray-600">{c.email}</td>
                <td className="p-3 text-gray-600 hidden md:table-cell">
                  {c.phone}
                </td>
                <td className="p-3 text-gray-600 hidden lg:table-cell">
                  {c.city}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      c.status === "Active"
                        ? "bg-green-100 text-green-700"
                        : c.status === "Pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(c)}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Add/Edit Client */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-4 p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <X size={20} />
            </button>
            <h3 className="text-lg font-semibold mb-4">
              {editingId ? "Edit Client" : "Add Client"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {[
                { label: "Name", key: "name" },
                { label: "Company", key: "company" },
                { label: "Email", key: "email", type: "email" },
                { label: "Phone", key: "phone" },
                { label: "GST", key: "gst" },
                { label: "PAN", key: "pan" },
                { label: "Industry", key: "industry" },
                { label: "Contact Person", key: "contactPerson" },
                { label: "Website", key: "website" },
                { label: "Address", key: "address" },
                { label: "City", key: "city" },
                { label: "State", key: "state" },
                { label: "Country", key: "country" },
                { label: "Pincode", key: "pincode" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="text-sm text-gray-600">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    value={form[f.key]}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                  />
                </div>
              ))}

              <div>
                <label className="text-sm text-gray-600">Status</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value })
                  }
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Inactive</option>
                </select>
              </div>

              <div className="md:col-span-3 flex justify-end mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  {editingId ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
