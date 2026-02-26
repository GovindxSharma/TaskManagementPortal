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
import { useToast } from "../../../components/layout/ToastProvider.jsx"; // ⭐ CENTRAL TOAST
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { clientWelcomeEmail } from "../../../commons/emailContent.js";
import WelcomeEmailEditor from "../../../commons/WelcomeEmailEditor.jsx";

const InputField = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  error,
}) => (
 <div className="flex flex-col">
  <label className="text-sm font-medium text-gray-700 mb-1">
    {label}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>

  <input
    type={type}
    value={value}
    placeholder={placeholder}
    onChange={onChange}
    required={required}
    className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none transition shadow-sm hover:shadow-md
      ${error ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}
    `}
  />

  {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
</div>

);

const Clients = () => {
  const navigate = useNavigate();
  const toast = useToast();
  // const { quill, quillRef } = useQuill({ theme: "snow" });


  const [clients, setClients] = useState([]);
  // const [emailSubject, setEmailSubject] = useState("Welcome to Our Services");
  // const [editorKey, setEditorKey] = useState(0);
  
  const [errors, setErrors] = useState({});
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
    startMonth: "",
    startYear: "",
    assignedTo: "",
    assignedToName: "",
    status: "Active",  
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  // const [emailBody, setEmailBody] = useState("");
  // const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);
  const [showModal, setShowModal] = useState(false);
  // const [attachments, setAttachments] = useState([]);
const [showEmailModal, setShowEmailModal] = useState(false);
const [selectedClientId, setSelectedClientId] = useState("");
const [emailSubject, setEmailSubject] = useState(
  "Welcome to CCS - Contractor Compliance Services"
);
const [emailBody, setEmailBody] = useState("");
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
      toast.error("Failed to fetch clients");
    }
  }, [toast]);

const fetchEmployees = useCallback(async () => {
  try {
    const { data } = await axiosInstance.get(`/user/employees`);

    const onlyEmployees = data.employees.filter(
      (user) => user.role === "Employee"
    );

    setEmployees(onlyEmployees);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch employees");
  }
}, [toast]);

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
    status: "Active",
  });
  // setAttachments([]);
  // setSendWelcomeEmail(true);
  // setEmailSubject("Welcome to Our Services");
  // setEmailBody(""); // 👈 reset body
  // setEditorKey((prev) => prev + 1); // 👈 force remount
  // if (quill) quill.setText("");
};


  const handleSubmit = async (e) => {
    e.preventDefault();

  const newErrors = {};

  if (!form.name.trim()) {
    newErrors.name = "Client name is required";
  }

  if (!form.email.trim()) {
    newErrors.email = "Email is required";
  } else if (!/^\S+@\S+\.\S+$/.test(form.email)) {
    newErrors.email = "Enter a valid email address";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    toast.error("Please fix required fields");
    return;
  }

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
        startMonth: (Number(form.startMonth) + 1).toString(),
        startYear: form.startYear.toString(),
        company_id: user.company_id,
        assignedTo: form.assignedTo,
        status: form.status,
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
        toast.success("Client updated successfully!");
      } else {
        const { data } = await axiosInstance.post("/client", payload);
        clientData = data.client;
        setClients((prev) => [...prev, clientData]);

          toast.success("Client added successfully!");

      }

      resetForm();
      setEditingId(null);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong!");
    }
  };

const openEmailModal = () => {
  setSelectedClientId("");
  setEmailSubject("Welcome to CCS - Contractor Compliance Services");
  setEmailBody("");
  setAttachments([]);
  setShowEmailModal(true);
  };
  
useEffect(() => {
  if (!selectedClientId || clients.length === 0) return;

  const client = clients.find((c) => c._id === selectedClientId);
  if (!client) return;

  const template = clientWelcomeEmail(client.contactPerson, client.name);

  setEmailBody(template);
}, [selectedClientId, clients]);

const handleFileChange = (e) => {
  if (e.target.files) {
    setAttachments(Array.from(e.target.files));
  }
};

const handleSendEmail = async () => {
  if (!selectedClientId) {
    toast.error("Please select a client");
    return;
  }

  const client = clients.find((c) => c._id === selectedClientId);
  if (!client) return;

  const formData = new FormData();
  formData.append("to", client.email);
  formData.append("subject", emailSubject);
  formData.append("html", emailBody);

  attachments.forEach((file) => formData.append("attachments", file));

  try {
    await axiosInstance.post("/email/send-welcome", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Email sent successfully 🚀");
    setShowEmailModal(false);
  } catch (err) {
    toast.error("Failed to send email");
  }
};

  const handleEdit = (client) => {
    const assignedEmp = employees.find((e) => e._id === client.assignedTo);
    setForm({
      ...client,
      startMonth: Number(client.startMonth) - 1,
      assignedToName: assignedEmp?.name || "",
      status: client.status || "Active",
    });
    setEditingId(client._id);
    setShowModal(true);
  };

  const handleDelete = (id) => {
    toast.confirmDelete({
      message: "Are you sure you want to delete this client?",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/client/${id}`);
          setClients((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete client");
        }
      },
    });
  };

  // const handleFileChange = (e) => {
  //   if (e.target.files) setAttachments(Array.from(e.target.files));
  // };

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
  { label: "Client Name", key: "name", required: true },
  { label: "Contact Person", key: "contactPerson" },
  { label: "Contact Number", key: "contactNumber" },
  { label: "Email", key: "email", type: "email", required: true },
  { label: "GST Number", key: "gstNumber" },
  { label: "Address", key: "address" },
  { label: "Company Name", key: "businessUnit" },
  { label: "Business Unit", key: "site" },
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
              // setEditorKey((prev) => prev + 1); // 🔥 force remount
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <UserPlus size={18} /> Add Client
          </button>
          <button
            onClick={openEmailModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition"
          >
            <Paperclip size={18} /> Send Welcome Email
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
                  (e) => e._id === c.assignedTo,
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
          {/* Modal Container */}
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Client" : "Add Client"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Grid Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fields.map((f) => (
                    <InputField
                      key={f.key}
                      label={f.label}
                      value={form[f.key]}
                      type={f.type}
                      placeholder={`Enter ${f.label.toLowerCase()}`}
                      required={f.required}
                      error={errors[f.key]}
                      onChange={(e) => {
                        setForm({ ...form, [f.key]: e.target.value });
                        setErrors((prev) => ({ ...prev, [f.key]: "" }));
                      }}
                    />
                  ))}

                  {/* Assign To */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Assign To
                    </label>
                    <select
                      value={form.assignedTo}
                      onChange={(e) =>
                        setForm({ ...form, assignedTo: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Start Year */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Start Year
                    </label>
                    <input
                      type="number"
                      value={form.startYear}
                      onChange={(e) =>
                        setForm({ ...form, startYear: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    />
                  </div>

                  {/* Start Month */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Start Month
                    </label>
                    <select
                      value={form.startMonth}
                      onChange={(e) =>
                        setForm({ ...form, startMonth: e.target.value })
                      }
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="">Select Month</option>
                      {months.map((m, i) => (
                        <option key={i} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Toggle (Edit Mode) */}
                  {editingId && (
                    <div className="flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">
                        Client Status
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            status:
                              prev.status === "Active" ? "Inactive" : "Active",
                          }))
                        }
                        className={`relative w-14 h-7 rounded-full transition ${
                          form.status === "Active"
                            ? "bg-green-600"
                            : "bg-gray-400"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${
                            form.status === "Active" ? "translate-x-7" : ""
                          }`}
                        />
                      </button>
                      <span className="text-xs font-medium">{form.status}</span>
                    </div>
                  )}

                  {/* Welcome Email Toggle
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">
                      Send Welcome Email
                    </label>

                    <button
                      type="button"
                      onClick={() => setSendWelcomeEmail((prev) => !prev)}
                      className={`relative w-12 h-6 rounded-full transition ${
                        sendWelcomeEmail ? "bg-blue-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition ${
                          sendWelcomeEmail ? "translate-x-6" : ""
                        }`}
                      />
                    </button>
                  </div> */}
                </div>

                {/* ✅ Welcome Email Editor FULL WIDTH
                {sendWelcomeEmail && (
                  <div className="w-full">
                    <WelcomeEmailEditor
                        key={editorKey}   // 👈 IMPORTANT
                      visible={sendWelcomeEmail}
                      subject={emailSubject}
                      setSubject={setEmailSubject}
                      attachments={attachments}
                      setAttachments={setAttachments}
                      emailBody={emailBody}
                      setEmailBody={setEmailBody}
                    />
                  </div>
                )} */}
              </div>

              {/* Footer Buttons (Sticky Bottom) */}
              <div className="border-t p-4 flex justify-end bg-white">
                <button
                  type="submit"
                  disabled={!form.name || !form.email}
                  className={`px-6 py-2 rounded-lg font-medium transition ${
                    !form.name || !form.email
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {editingId ? "Update Client" : "Add Client"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Send Welcome Email</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-500 hover:text-red-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Client Dropdown */}
              <div>
                <label className="block mb-1 font-medium">Select Client</label>

                <div className="relative">
                  <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full border p-2 rounded-lg pr-10"
                  >
                    <option value="">-- Select Client --</option>
                    {clients.map((client) => (
                      <option key={client._id} value={client._id}>
                        {client.name} ({client.email})
                      </option>
                    ))}
                  </select>

                  {/* Clear Button */}
                  {selectedClientId && (
                    <button
                      type="button"
                      onClick={() => setSelectedClientId("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block mb-1 font-medium">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
              </div>

              {/* Editor */}
              <WelcomeEmailEditor
                emailBody={emailBody}
                setEmailBody={setEmailBody}
              />

              {/* Attachments */}
              <div className="mt-4">
                <label className="block mb-2 font-medium text-gray-700">
                  Attach Files
                </label>

                {/* Upload Box */}
                <label className="flex flex-col items-center justify-center w-full px-6 py-6 border-2 border-dashed border-blue-400 rounded-xl cursor-pointer hover:bg-blue-50 transition-all">
                  <span className="text-sm text-gray-600">
                    Click to upload or drag files here
                  </span>
                  <span className="text-xs text-gray-400 mt-1">
                    Multiple files supported
                  </span>

                  <input
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length) return;

                      setAttachments((prev) => [...prev, ...files]);
                      e.target.value = null;
                    }}
                  />
                </label>

                {/* Selected Files List */}
                {attachments.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg text-sm"
                      >
                        <div className="flex flex-col">
                          <span className="truncate max-w-xs font-medium">
                            {file.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index),
                            )
                          }
                          className="text-red-500 hover:text-red-700 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={handleSendEmail}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
