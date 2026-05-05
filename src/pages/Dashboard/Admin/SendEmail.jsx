import React, { useEffect, useState, useCallback } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../components/layout/ToastProvider.jsx";
import WelcomeEmailEditor from "../../../commons/WelcomeEmailEditor.jsx";
import { dynamicClientEmail } from "../../../commons/dynamicEmailTemplate";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { text } from "framer-motion/client";

const SendEmail = () => {
  const toast = useToast();

  const [clients, setClients] = useState([]);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [clientSearch, setClientSearch] = useState("");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [attachments, setAttachments] = useState([]);
  const navigate = useNavigate();

  // Fetch Clients
  const fetchClients = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const { data } = await axiosInstance.get(
        `/client?company_id=${user.company_id}`,
      );
      setClients(data.clients);
    } catch (err) {
      toast.error("Failed to fetch clients");
    }
  }, [toast]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setEmailBody(`
      <p>We hope you are doing well.</p>
      <p>Please find the details below.</p>
    `);
  }, []);

  const replaceVariables = (template, client) => {
    const variables = {
      contactPerson: client.contactPerson || "Sir/Madam",
      companyName: client.name,
      email: client.email,
    };

    return template.replace(/{{(.*?)}}/g, (_, key) => {
      return variables[key.trim()] ?? "";
    });
  };

  const handleSendEmail = async () => {
    if (!selectedClientIds.length) {
      toast.error("Select at least one client");
      return;
    }

    try {
      for (const clientId of selectedClientIds) {
        const client = clients.find((c) => c._id === clientId);
        if (!client) continue;

        const personalizedContent = replaceVariables(emailBody, client);

        const finalHtml = dynamicClientEmail(
          client.contactPerson,
          client.name,
          personalizedContent,
        );

        const formData = new FormData();
        formData.append("to", client.email);
        formData.append("subject", emailSubject);
        formData.append("html", finalHtml);

        attachments.forEach((file) => formData.append("attachments", file));

        await axiosInstance.post("/email/send-welcome", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      toast.success("Emails sent 🚀");
      setSelectedClientIds([]);
      setAttachments([]);
      navigate("/admin/dashboard");
    } catch (err) {
      toast.error("Failed to send emails");
    }
  };

  const filteredClients = clients.filter((c) =>
    `${c.name} ${c.email}`.toLowerCase().includes(clientSearch.toLowerCase()),
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div style={{ position: "relative", width: "100%" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            position: "absolute",
            right: "120%",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            color: "#4B5563",
            cursor: "pointer",
            fontSize: "18px",
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <h2
          style={{
            // textAlign: "center",
            right: "100%",
            fontSize: "26px",
            fontWeight: "bold",
            color: "#1F2937",
          }}
        >
          Send Email
        </h2>
      </div>

      {/* ================= CLIENT SELECT ================= */}
      <div className="bg-white rounded-xl shadow p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700">Recipients</h3>
          <span className="text-sm text-gray-500">
            {selectedClientIds.length} selected
          </span>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search clients..."
          value={clientSearch}
          onChange={(e) => setClientSearch(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />

        {/* Select All */}
        <div className="flex justify-between items-center text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={
                selectedClientIds.length === clients.length &&
                clients.length > 0
              }
              onChange={(e) => {
                if (e.target.checked) {
                  setSelectedClientIds(clients.map((c) => c._id));
                } else {
                  setSelectedClientIds([]);
                }
              }}
            />
            Select All
          </label>

          {selectedClientIds.length > 0 && (
            <button
              onClick={() => setSelectedClientIds([])}
              className="text-red-500 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* List */}
        <div className="border rounded-lg max-h-60 overflow-y-auto">
          {filteredClients.map((client) => {
            const isChecked = selectedClientIds.includes(client._id);

            return (
              <label
                key={client._id}
                className="flex items-center gap-3 px-3 py-2 border-b hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    if (isChecked) {
                      setSelectedClientIds((prev) =>
                        prev.filter((id) => id !== client._id),
                      );
                    } else {
                      setSelectedClientIds((prev) => [...prev, client._id]);
                    }
                  }}
                />

                <div>
                  <div className="font-medium text-gray-800">{client.name}</div>
                  <div className="text-xs text-gray-500">{client.email}</div>
                </div>
              </label>
            );
          })}
        </div>

        {/* Selected Chips */}
        {selectedClientIds.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedClientIds.map((id) => {
              const client = clients.find((c) => c._id === id);
              return (
                <span
                  key={id}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                >
                  {client?.name}
                  <button
                    onClick={() =>
                      setSelectedClientIds((prev) =>
                        prev.filter((cId) => cId !== id),
                      )
                    }
                  >
                    ✕
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= SUBJECT ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <input
          type="text"
          placeholder="Email Subject"
          value={emailSubject}
          onChange={(e) => setEmailSubject(e.target.value)}
          className="w-full border p-2 rounded-lg"
        />
      </div>

      {/* ================= EDITOR ================= */}
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <p className="text-xs text-gray-500">
          Use variables like <b>{"{{companyName}}"}</b> for Company Name and{" "}
          <b>{"{{contactPerson}}"}</b> for Contact Person. They will be replaced
          with actual values for each client.
        </p>

        <WelcomeEmailEditor emailBody={emailBody} setEmailBody={setEmailBody} />
      </div>

      {/* ================= ATTACHMENTS ================= */}
      <div className="bg-white rounded-xl shadow p-4">
        <label className="block font-medium mb-2">Attachments</label>

        <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-400 rounded-lg p-6 cursor-pointer hover:bg-blue-50">
          <span className="text-sm text-gray-600">
            Click or drag files to upload
          </span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) =>
              setAttachments((prev) => [
                ...prev,
                ...Array.from(e.target.files || []),
              ])
            }
          />
        </label>

        {/* File List */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex justify-between items-center bg-gray-100 px-3 py-2 rounded"
              >
                <div className="text-sm">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>

                <button
                  onClick={() =>
                    setAttachments((prev) =>
                      prev.filter((_, index) => index !== i),
                    )
                  }
                  className="text-red-500 text-xs"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SEND ================= */}
      <div className="flex justify-end">
        <button
          onClick={handleSendEmail}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg"
        >
          Send Email
        </button>
      </div>
    </div>
  );
};

export default SendEmail;
