import React, { useEffect, useState, useCallback, useRef } from "react";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../components/layout/ToastProvider.jsx";
import WelcomeEmailEditor from "../../../commons/WelcomeEmailEditor.jsx";
import { dynamicClientEmail } from "../../../commons/dynamicEmailTemplate";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader, Search, X, Check, UploadCloud, FileText, Send } from "lucide-react";

const SendEmail = () => {
  const toast = useToast();
  const navigate = useNavigate();

  const [clients, setClients] = useState([]);
  const [selectedClientIds, setSelectedClientIds] = useState([]);
  const [clientSearch, setClientSearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");

  const [attachments, setAttachments] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 });

  const fetchClients = useCallback(async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const endpoint =
        user.role === "Admin"
          ? `/client?company_id=${user.company_id}`
          : `/client?company_id=${user.company_id}&assignedTo=${user._id}`;
      
      const { data } = await axiosInstance.get(endpoint);
      setClients(data.clients || data.data || []);
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

  // Handle outside click for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (isSending) return;
    if (!selectedClientIds.length) {
      toast.error("Select at least one client");
      return;
    }
    if (!emailSubject.trim()) {
      toast.error("Please enter a valid subject");
      return;
    }

    setIsSending(true);
    setSendProgress({ sent: 0, total: selectedClientIds.length });

    let successCount = 0;
    let failCount = 0;

    try {
      const BATCH_SIZE = 5;
      for (let i = 0; i < selectedClientIds.length; i += BATCH_SIZE) {
        const batch = selectedClientIds.slice(i, i + BATCH_SIZE);
        const results = await Promise.allSettled(
          batch.map(async (clientId) => {
            const client = clients.find((c) => c._id === clientId);
            if (!client) return;

            const personalizedContent = replaceVariables(emailBody, client);
            const finalHtml = dynamicClientEmail(
              client.contactPerson,
              client.name,
              personalizedContent
            );

            const formData = new FormData();
            formData.append("to", client.email);
            formData.append("subject", emailSubject.trim());
            formData.append("html", finalHtml);
            attachments.forEach((file) => formData.append("attachments", file));

            await axiosInstance.post("/email/send-welcome", formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
          })
        );

        results.forEach((r) => {
          if (r.status === "fulfilled") successCount++;
          else failCount++;
        });

        setSendProgress((prev) => ({
          ...prev,
          sent: Math.min(i + BATCH_SIZE, selectedClientIds.length),
        }));
      }

      if (failCount === 0) {
        toast.success(`Email${successCount > 1 ? "s" : ""} sent to ${successCount} client${successCount > 1 ? "s" : ""} 🚀`);
      } else {
        toast.error(`${successCount} sent, ${failCount} failed. Please retry the failed ones.`);
      }

      setSelectedClientIds([]);
      setAttachments([]);
      setEmailSubject("");
    } catch (err) {
      toast.error("Failed to send emails. Please try again.");
    } finally {
      setIsSending(false);
      setSendProgress({ sent: 0, total: 0 });
    }
  };

  const handleSelectClient = (clientId) => {
    if (!selectedClientIds.includes(clientId)) {
      setSelectedClientIds((prev) => [...prev, clientId]);
    }
    setClientSearch("");
  };

  const handleRemoveClient = (clientId, e) => {
    e.stopPropagation();
    setSelectedClientIds((prev) => prev.filter((id) => id !== clientId));
  };

  const handleSelectAll = (e) => {
    e.preventDefault();
    setSelectedClientIds(clients.map((c) => c._id));
    setIsDropdownOpen(false);
  };

  const handleClearAll = (e) => {
    e.preventDefault();
    setSelectedClientIds([]);
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setAttachments((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...selectedFiles]);
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const trimmedSearch = clientSearch.trim().toLowerCase();
  const unselectedClients = clients.filter((c) => !selectedClientIds.includes(c._id));
  const filteredDropdownClients = unselectedClients.filter(
    (c) => trimmedSearch === "" || `${c.name} ${c.email}`.toLowerCase().includes(trimmedSearch)
  );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto min-h-screen bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center mb-8 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-200 bg-gray-100 rounded-full transition-colors duration-200 text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Compose Email</h1>
          <p className="text-sm text-gray-500 mt-1">Send personalized updates and information to your clients</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Main Form Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-8">
          
          {/* Recipients Section */}
          <div className="space-y-3 relative" ref={dropdownRef}>
            <div className="flex justify-between items-end">
              <label className="block text-sm font-semibold text-gray-700">Recipients</label>
              <div className="text-sm space-x-3">
                {clients.length > 0 && selectedClientIds.length !== clients.length && (
                  <button onClick={handleSelectAll} type="button" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Select All
                  </button>
                )}
                {selectedClientIds.length > 0 && (
                  <button onClick={handleClearAll} type="button" className="text-red-500 hover:text-red-700 font-medium transition-colors">
                    Clear All
                  </button>
                )}
              </div>
            </div>

            <div 
              className={`min-h-[52px] border rounded-xl flex flex-wrap gap-2 p-2 items-center bg-white transition-all duration-200 ${
                isDropdownOpen ? "border-blue-500 ring-4 ring-blue-50" : "border-gray-200 hover:border-gray-300"
              }`}
              onClick={() => setIsDropdownOpen(true)}
            >
              {selectedClientIds.map((id) => {
                const client = clients.find((c) => c._id === id);
                if (!client) return null;
                return (
                  <span
                    key={id}
                    className="bg-blue-50 border border-blue-100 text-blue-800 px-3 py-1.5 rounded-lg text-sm flex items-center gap-2 font-medium animate-in fade-in zoom-in-95 duration-200"
                  >
                    {client.name}
                    <button
                      type="button"
                      onClick={(e) => handleRemoveClient(id, e)}
                      className="hover:bg-blue-200 p-0.5 rounded-md transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                );
              })}
              
              <div className="flex-1 min-w-[200px] flex items-center gap-2 px-2">
                <Search size={18} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={selectedClientIds.length === 0 ? "Search and select clients..." : "Add more clients..."}
                  value={clientSearch}
                  onChange={(e) => {
                    setClientSearch(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-transparent border-none outline-none text-sm text-gray-700 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Dropdown Suggestions */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-72 overflow-y-auto z-50 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                {filteredDropdownClients.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-500">
                    {unselectedClients.length === 0 ? "All clients selected" : "No clients found matching your search"}
                  </div>
                ) : (
                  filteredDropdownClients.map((client) => (
                    <div
                      key={client._id}
                      onClick={() => handleSelectClient(client._id)}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="font-medium text-gray-800 group-hover:text-blue-900">{client.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{client.email}</div>
                      </div>
                      <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Check size={18} />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Subject Section */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Subject</label>
            <input
              type="text"
              placeholder="Enter email subject"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
              className="w-full border border-gray-200 p-3.5 rounded-xl outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all text-gray-800"
            />
          </div>

          {/* Editor Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="block text-sm font-semibold text-gray-700">Message</label>
              <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full font-medium">
                Variables: <code className="text-blue-600">{"{{companyName}}"}</code>, <code className="text-blue-600">{"{{contactPerson}}"}</code>
              </span>
            </div>
            <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-50 transition-all">
              <WelcomeEmailEditor emailBody={emailBody} setEmailBody={setEmailBody} />
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Attachments</label>
            
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleFileDrop}
              className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-gray-50/50 hover:bg-blue-50/50 rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center cursor-pointer group relative"
            >
              <div className="bg-white p-3 rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform duration-200">
                <UploadCloud size={24} className="text-blue-500" />
              </div>
              <p className="text-sm font-medium text-gray-700 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG, DOCX (Max 10MB)</p>
              <input
                type="file"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileSelect}
              />
            </div>

            {/* Selected Files List */}
            {attachments.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                {attachments.map((file, i) => (
                  <div key={i} className="flex items-center p-3 bg-white border border-gray-100 shadow-sm rounded-xl gap-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                      <FileText size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-md transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSendEmail}
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl cursor-pointer flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all font-semibold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-[0.98]"
          >
            {isSending ? (
              <>
                <Loader size={18} className="animate-spin" />
                <span>
                  {sendProgress.total > 0
                    ? `Sending ${sendProgress.sent}/${sendProgress.total}...`
                    : "Sending..."}
                </span>
              </>
            ) : (
              <>
                <Send size={18} />
                <span>Send Email</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SendEmail;
