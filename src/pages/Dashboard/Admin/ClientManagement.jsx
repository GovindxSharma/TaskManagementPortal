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
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

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
  const { success, error, warning, confirmDelete } = useToast();
  const [clients, setClients] = useState([]);
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
  const [showModal, setShowModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [emailSubject, setEmailSubject] = useState(
    "Welcome to CCS - Contractor Compliance Services",
  );
  const [emailBody, setEmailBody] = useState("");
  const [attachments, setAttachments] = useState([]);

  const validateField = (name, value) => {
    let errorMsg = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          errorMsg = "Client name is required";
        } else if (!/^[A-Za-z0-9\s]+$/.test(value.trim())) {
          errorMsg = "Client name must contain only alphanumeric characters and spaces";
        } else {
          const duplicate = clients.find(
            (c) => c.name.trim().toLowerCase() === value.trim().toLowerCase() && c._id !== editingId
          );
          if (duplicate) errorMsg = "Client name already exists";
        }
        break;

      case "email":
        if (!value.trim()) {
          errorMsg = "Email is required";
        } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(value.trim())) {
          errorMsg = "Enter a valid email address";
        } else {
          const duplicateEmail = clients.find(
            (c) => c.email.trim().toLowerCase() === value.trim().toLowerCase() && c._id !== editingId
          );
          if (duplicateEmail) errorMsg = "A client with this email already exists";
        }
        break;

      case "contactNumber":
        if (value.trim()) {
          if (!/^\d{10}$/.test(value.trim())) {
            errorMsg = "Contact number must be exactly 10 digits";
          } else {
            const duplicatePhone = clients.find(
              (c) => c.contactNumber?.trim() === value.trim() && c._id !== editingId
            );
            if (duplicatePhone) errorMsg = "A client with this phone number already exists";
          }
        }
        break;

      case "gstNumber":
        if (value.trim()) {
          if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.trim())) {
            errorMsg = "Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)";
          } else {
            const duplicateGST = clients.find(
              (c) => c.gstNumber?.trim().toUpperCase() === value.trim().toUpperCase() && c._id !== editingId
            );
            if (duplicateGST) errorMsg = "A client with this GST number already exists";
          }
        }
        break;

      case "businessUnit":
        if (value.trim() && !/^[A-Za-z0-9\s]+$/.test(value.trim())) {
          errorMsg = "Company Name must contain only alphanumeric characters and spaces";
        }
        break;

      case "site":
        if (value.trim() && !/^[A-Za-z\s]+$/.test(value.trim())) {
          errorMsg = "Business Unit must contain only alphabetic characters";
        }
        break;

      case "address":
        if (value.trim() && /^[^A-Za-z0-9]+$/.test(value.trim())) {
          errorMsg = "Address cannot contain only special characters";
        }
        break;

      case "assignedTo":
        if (!value) {
          errorMsg = "Assign To is required";
        }
        break;

      case "startYear":
        if (!value) {
          errorMsg = "Start Year is required";
        }
        break;

      case "startMonth":
        if (value === "" || value === undefined) {
          errorMsg = "Start Month is required";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };

  const fetchClients = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await axiosInstance.get(
        `/client?company_id=${user.company_id}`,
      );
      setClients(data.clients);
    } catch (err) {
      console.error(err);
      error("Failed to fetch clients");
    }
  }, [error]);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get(`/user/employees`);

      const onlyEmployees = data.employees.filter(
        (user) => user.role === "Employee",
      );

      setEmployees(onlyEmployees);
    } catch (err) {
      console.error(err);
      error("Failed to fetch employees");
    }
  }, [error]);

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
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "Client name is required";
    } else if (!/^[A-Za-z0-9\s]+$/.test(form.name.trim())) {
      newErrors.name = "Client name must contain only alphanumeric characters and spaces";
    } else {
      const duplicate = clients.find(
        (c) => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() && c._id !== editingId
      );
      if (duplicate) newErrors.name = "Client name already exists";
    }

    if (!form.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(form.email.trim())) {
      newErrors.email = "Enter a valid email address";
    } else {
      const duplicateEmail = clients.find(
        (c) => c.email.trim().toLowerCase() === form.email.trim().toLowerCase() && c._id !== editingId
      );
      if (duplicateEmail) newErrors.email = "A client with this email already exists";
    }

    if (form.contactNumber && !/^\d{10}$/.test(form.contactNumber.trim())) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits";
    } else if (form.contactNumber) {
      const duplicatePhone = clients.find(
        (c) => c.contactNumber?.trim() === form.contactNumber.trim() && c._id !== editingId
      );
      if (duplicatePhone) newErrors.contactNumber = "A client with this phone number already exists";
    }

    if (form.gstNumber && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(form.gstNumber.trim())) {
      newErrors.gstNumber = "Enter a valid 15-character GST number (e.g. 22AAAAA0000A1Z5)";
    } else if (form.gstNumber) {
      const duplicateGST = clients.find(
        (c) => c.gstNumber?.trim().toUpperCase() === form.gstNumber.trim().toUpperCase() && c._id !== editingId
      );
      if (duplicateGST) newErrors.gstNumber = "A client with this GST number already exists";
    }

    if (form.businessUnit && !/^[A-Za-z0-9\s]+$/.test(form.businessUnit.trim())) {
      newErrors.businessUnit = "Company Name must contain only alphanumeric characters and spaces";
    }

    if (form.site && !/^[A-Za-z\s]+$/.test(form.site.trim())) {
      newErrors.site = "Business Unit must contain only alphabetic characters";
    }

    if (form.address && /^[^A-Za-z0-9]+$/.test(form.address.trim())) {
      newErrors.address = "Address cannot contain only special characters";
    }

    if (!form.assignedTo) {
      newErrors.assignedTo = "Assign To is required";
    }

    if (!form.startYear) {
      newErrors.startYear = "Start Year is required";
    }

    if (form.startMonth === "") {
      newErrors.startMonth = "Start Month is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      error("Please fix the highlighted fields");
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const payload = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim(),
        contactNumber: form.contactNumber.trim(),
        email: form.email.trim().toLowerCase(),
        gstNumber: form.gstNumber.trim(),
        address: form.address.trim(),
        businessUnit: form.businessUnit.trim(),
        site: form.site.trim(),
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
          payload,
        );
        clientData = data.client;
        setClients((prev) =>
          prev.map((c) => (c._id === editingId ? clientData : c)),
        );
        success("Client updated successfully!");
        resetForm();
        setEditingId(null);
        setShowModal(false);
      } else {
        const { data } = await axiosInstance.post("/client", payload);
        clientData = data.client;
        setClients((prev) => [...prev, clientData]);
        success("Client added successfully!");
        resetForm();
        setEditingId(null);
        setShowModal(false);
      }
    } catch (err) {
      console.error(err);

      const responseData = err.response?.data;

      if (responseData?.field) {
        const fieldMap = {
          email: "email",
          contactNumber: "contactNumber",
          gstNumber: "gstNumber",
          name: "name",
        };
        const fieldKey = fieldMap[responseData.field];
        if (fieldKey) {
          setErrors((prev) => ({ ...prev, [fieldKey]: responseData.message }));
        }
        warning(responseData.message);
        return;
      }

      if (responseData?.message) {
        const msgLower = responseData.message.toLowerCase();
        if (msgLower.includes("client name already exists") || msgLower.includes("client already exists")) {
          setErrors((prev) => ({ ...prev, name: "Client name already exists" }));
          warning("Client name already exists");
          return;
        }
        if (msgLower.includes("email")) {
          setErrors((prev) => ({ ...prev, email: responseData.message }));
          warning(responseData.message);
          return;
        }
        if (msgLower.includes("phone") || msgLower.includes("contact")) {
          setErrors((prev) => ({ ...prev, contactNumber: responseData.message }));
          warning(responseData.message);
          return;
        }
        if (msgLower.includes("gst")) {
          setErrors((prev) => ({ ...prev, gstNumber: responseData.message }));
          warning(responseData.message);
          return;
        }
      }

      if (responseData?.error?.code === 11000) {
        const duplicateField = Object.keys(responseData.error.keyPattern || {})[0];
        const fieldMessages = {
          email: "A client with this email already exists",
          contactNumber: "A client with this phone number already exists",
          gstNumber: "A client with this GST number already exists",
        };
        const message = fieldMessages[duplicateField] || "Duplicate value already exists";
        if (fieldMessages[duplicateField]) {
          setErrors((prev) => ({ ...prev, [duplicateField]: message }));
        }
        warning(message);
        return;
      }

      error(responseData?.message || "Something went wrong!");
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
      error("Please select a client");
      return;
    }

    const client = clients.find((c) => c._id === selectedClientId);
    if (!client) return;

    const recipientEmail = client.email?.trim();
    if (!recipientEmail || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/.test(recipientEmail)) {
      error("Client has an invalid email address. Cannot send email.");
      return;
    }

    if (!emailSubject.trim()) {
      error("Email subject cannot be blank");
      return;
    }

    const formData = new FormData();
    formData.append("to", recipientEmail);
    formData.append("subject", emailSubject.trim());
    formData.append("html", emailBody);

    attachments.forEach((file) => formData.append("attachments", file));

    try {
      await axiosInstance.post("/email/send-welcome", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      success("Email sent successfully 🚀");
      setShowEmailModal(false);
    } catch (err) {
      error("Failed to send email");
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
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = (id) => {
    confirmDelete({
      message: "Are you sure you want to delete this client?",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/client/${id}`);
          setClients((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
          console.error(err);
          error("Failed to delete client");
        }
      },
    });
  };

  const filteredClients = useMemo(() => {
    const trimmed = search.trim().replace(/\s+/g, " ").toLowerCase();
    if (!trimmed) return clients;
    return clients.filter((c) => {
      const searchableText = [
        c.name,
        c.contactPerson,
        c.email,
        c.contactNumber,
        c.businessUnit,
        c.site,
      ]
        .filter(Boolean)
        .map((v) => v.toString().trim().replace(/\s+/g, " ").toLowerCase())
        .join(" ");
      return searchableText.includes(trimmed);
    });
  }, [clients, search]);

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

  const exportPDF = () => {
    if (!filteredClients.length) {
      error("No clients to export");
      return;
    }

    const doc = new jsPDF();

    doc.text("Client Management Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    const tableColumn = [
      "Name",
      "Contact Person",
      "Email",
      "Phone",
      "Assigned To",
      "Start Period",
    ];

    const tableRows = filteredClients.map((c) => {
      const assignedEmp = employees.find((e) => e._id === c.assignedTo);

      return [
        c.name || "-",
        c.contactPerson || "-",
        c.email || "-",
        c.contactNumber || "-",
        assignedEmp?.name || "-",
        `${months[Number(c.startMonth) - 1] || "-"} ${c.startYear || ""}`,
      ];
    });

    autoTable(doc, {
      startY: 28,
      head: [tableColumn],
      body: tableRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    doc.save("Clients_Report.pdf");
  };

  const exportExcel = () => {
    if (!filteredClients.length) {
      error("No clients to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      filteredClients.map((c) => {
        const assignedEmp = employees.find((e) => e._id === c.assignedTo);

        return {
          Name: c.name || "-",
          "Contact Person": c.contactPerson || "-",
          Email: c.email || "-",
          Phone: c.contactNumber || "-",
          "Assigned To": assignedEmp?.name || "-",
          "Start Period": `${months[Number(c.startMonth) - 1] || "-"} ${
            c.startYear || ""
          }`,
          Status: c.status || "Active",
        };
      }),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "Clients_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 transition cursor-pointer"
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
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <UserPlus size={18} /> Add Client
          </button>
          <button
            onClick={openEmailModal}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition cursor-pointer"
          >
            <Paperclip size={18} /> Send Welcome Email
          </button>
          <button
            onClick={exportPDF}
            disabled={!filteredClients.length}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm
                ${
                  !filteredClients.length
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-md cursor-pointer"
                }
              `}
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            disabled={!filteredClients.length}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition shadow-sm
                ${
                  !filteredClients.length
                    ? "bg-gray-300 cursor-not-allowed text-gray-500"
                    : "bg-teal-600 hover:bg-teal-700 text-white hover:shadow-md cursor-pointer"
                }
              `}
          >
            Export Excel
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
                        className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition cursor-pointer"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition cursor-pointer"
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
                className="text-gray-500 hover:text-red-500 cursor-pointer"
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
                        const val = e.target.value;
                        setForm({ ...form, [f.key]: val });
                        validateField(f.key, val);
                      }}
                    />
                  ))}

                  {/* Assign To */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Assign To <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={form.assignedTo}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, assignedTo: val });
                        validateField("assignedTo", val);
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none transition shadow-sm hover:shadow-md
                      ${errors.assignedTo ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    >
                      <option value="">Select Employee</option>
                      {employees.map((emp) => (
                        <option key={emp._id} value={emp._id}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    {errors.assignedTo && <span className="text-xs text-red-500 mt-1">{errors.assignedTo}</span>}
                  </div>

                  {/* Start Year */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Start Year <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="number"
                      value={form.startYear}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, startYear: val });
                        validateField("startYear", val);
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none transition shadow-sm hover:shadow-md
                      ${errors.startYear ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    />
                    {errors.startYear && <span className="text-xs text-red-500 mt-1">{errors.startYear}</span>}
                  </div>

                  {/* Start Month */}
                  <div className="flex flex-col">
                    <label className="text-sm font-medium text-gray-700 mb-1">
                      Start Month <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={form.startMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        setForm({ ...form, startMonth: val });
                        validateField("startMonth", val);
                      }}
                      className={`w-full p-2 border rounded-lg focus:ring-2 focus:outline-none transition shadow-sm hover:shadow-md
                      ${errors.startMonth ? "border-red-500 focus:ring-red-400" : "border-gray-300 focus:ring-blue-400"}`}
                    >
                      <option value="">Select Month</option>
                      {months.map((m, i) => (
                        <option key={i} value={i}>
                          {m}
                        </option>
                      ))}
                    </select>
                    {errors.startMonth && <span className="text-xs text-red-500 mt-1">{errors.startMonth}</span>}
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
                        className={`relative w-14 h-7 rounded-full transition cursor-pointer ${
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
                </div>
              </div>

              {/* Footer Buttons (Sticky Bottom) */}
              <div className="border-t p-4 flex justify-end bg-white">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg font-medium transition bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
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
                className="text-gray-500 hover:text-red-500 cursor-pointer"
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
                    className={`w-full border p-2 rounded-lg ${
                      selectedClientId ? "appearance-none pr-8" : "pr-10"
                    }`}
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 cursor-pointer"
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
                  onBlur={(e) => setEmailSubject(e.target.value.trim())}
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
                          className="text-red-500 hover:text-red-700 text-xs font-semibold cursor-pointer"
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
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg cursor-pointer"
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
