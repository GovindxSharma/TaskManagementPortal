import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Pencil,
  Trash2,
  UserPlus,
  Search,
  ArrowLeft,
  X,
  Paperclip,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";
import { clientWelcomeEmail } from "../../../commons/emailContent";

const InputField = ({ label, value, onChange, type = "text", placeholder }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition shadow-sm hover:shadow-md"
    />
  </div>
);

const Clients = () => {
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    gstNumber: "",
    address: "",
    businessUnit: "",
    site: "",
    startMonth: "", // 0-11 internally
    startYear: "",
    assignedTo: "", // ID
    assignedToName: "", // UI
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const fetchClients = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await axiosInstance.get(
        `/client?company_id=${user.company_id}`
      );
      setClients(data.clients);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch clients");
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/user/employees`);
      setEmployees(data.employees);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch employees");
    }
  }, []);

  useEffect(() => {
    fetchClients();
    fetchEmployees();
  }, [fetchClients, fetchEmployees]);

  const resetForm = () => {
    setForm({
      name: "",
      contactPerson: "",
      contactNumber: "",
      email: "",
      gstNumber: "",
      address: "",
      businessUnit: "",
      site: "",
      startMonth: "",
      startYear: "",
      assignedTo: "",
      assignedToName: "",
    });
    setAttachments([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        name: form.name,
        contactPerson: form.contactPerson,
        contactNumber: form.contactNumber,
        email: form.email,
        gstNumber: form.gstNumber,
        address: form.address,
        businessUnit: form.businessUnit,
        site: form.site,
        startMonth: (Number(form.startMonth) + 1).toString(), // 0-11 → 1-12
        startYear: form.startYear.toString(),
        company_id: user.company_id,
        assignedTo: form.assignedTo,
        status: "Active",
      };

      let clientData;
      if (editingId) {
        const { data } = await axiosInstance.put(
          `/client/${editingId}`,
          payload
        );
        clientData = data.client;
        setClients((prev) =>
          prev.map((c) => (c._id === editingId ? clientData : c))
        );
        alert("Client updated successfully!");
      } else {
        const { data } = await axiosInstance.post("/client", payload);
        clientData = data.client;
        setClients((prev) => [...prev, clientData]);

        const formData = new FormData();
        formData.append("contactPerson", clientData.contactPerson);
        formData.append("companyName", clientData.name);
        formData.append("email", clientData.email);
        formData.append(
          "html",
          clientWelcomeEmail(clientData.contactPerson, clientData.name)
        );
        attachments.forEach((file) => formData.append("attachments", file));

        await axiosInstance.post("/email/send-welcome", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Client added and welcome email sent!");
      }

      resetForm();
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleEdit = (client) => {
    const assignedEmp = employees.find((e) => e._id === client.assignedTo);
    setForm({
      ...client,
      startMonth: Number(client.startMonth) - 1,
      assignedToName: assignedEmp?.name || "",
    });
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;
    try {
      await axiosInstance.delete(`/client/${id}`);
      setClients((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete client");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) setAttachments(Array.from(e.target.files));
  };

  const filteredClients = useMemo(
    () =>
      clients.filter((c) =>
        Object.values(c).join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [clients, search]
  );

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = [new Date().getFullYear() - 1, new Date().getFullYear()];

  const fields = [
    { label: "Company Name", key: "name" },
    { label: "Contact Person", key: "contactPerson" },
    { label: "Contact Number", key: "contactNumber" },
    { label: "Email", key: "email", type: "email" },
    { label: "GST Number", key: "gstNumber" },
    { label: "Address", key: "address" },
    { label: "Business Unit", key: "businessUnit" },
    { label: "Site", key: "site" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Client Management</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none transition"
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
            <UserPlus size={18} /> Add Client
          </button>
        </div>
      </div>

      {/* Client Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              {[
                "Name",
                "Contact Person",
                "Email",
                "Phone",
                "Assigned To",
                "Start Period",
              ].map((th) => (
                <th key={th} className="p-3 text-left">
                  {th}
                </th>
              ))}
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((c) => {
                const assignedEmp = employees.find(
                  (e) => e._id === c.assignedTo
                );
                return (
                  <tr
                    key={c._id}
                    className="border-b last:border-0 hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-800">{c.name}</td>
                    <td className="p-3 text-gray-700">{c.contactPerson}</td>
                    <td className="p-3 text-gray-600">{c.email}</td>
                    <td className="p-3 text-gray-600">{c.contactNumber}</td>
                    <td className="p-3 text-gray-600">
                      {assignedEmp?.name || "-"}
                    </td>
                    <td className="p-3 text-gray-600">
                      {months[Number(c.startMonth) - 1]} {c.startYear}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="text-center py-6 text-gray-400 italic"
                >
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Client" : "Add Client"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((f) => (
                  <InputField
                    key={f.key}
                    label={f.label}
                    value={form[f.key]}
                    type={f.type}
                    placeholder={`Enter ${f.label.toLowerCase()}`}
                    onChange={(e) =>
                      setForm({ ...form, [f.key]: e.target.value })
                    }
                  />
                ))}

                {/* Assign To */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={form.assignedTo}
                    onChange={(e) =>
                      setForm({ ...form, assignedTo: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition shadow-sm hover:shadow-md"
                  >
                    <option value="">Select Employee</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Month */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Start Month
                  </label>
                  <select
                    value={form.startMonth}
                    onChange={(e) =>
                      setForm({ ...form, startMonth: e.target.value })
                    }
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition shadow-sm hover:shadow-md"
                  >
                    <option value="">Select Month</option>
                    {months.map((m, i) => (
                      <option key={i} value={i}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Year */}
                <div className="flex flex-col relative">
                  <label className="text-sm font-medium text-gray-700 mb-1">
                    Start Year
                  </label>
                  <input
                    type="number"
                    min={years[0]}
                    max={years[1]}
                    value={form.startYear}
                    onChange={(e) =>
                      setForm({ ...form, startYear: e.target.value })
                    }
                    placeholder={`Enter year (e.g., ${years[0]} or ${years[1]})`}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition shadow-sm hover:shadow-md"
                  />
                  <small className="text-gray-400 text-xs mt-1">
                    Can type custom numeric year
                  </small>
                </div>

                {/* Attachments */}
                <div className="flex items-center gap-2 mt-2">
                  <label className="text-sm text-gray-600 flex items-center gap-1">
                    <Paperclip /> Attach Files
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="text-sm text-gray-600"
                  />
                </div>
              </div>

              <div className="flex justify-end border-t pt-4">
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
