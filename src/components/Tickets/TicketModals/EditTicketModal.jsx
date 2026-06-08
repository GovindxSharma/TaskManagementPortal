// components/Tickets/TicketModals/EditTicketModal.jsx
import React, { useState, useEffect, useRef } from "react";
import { X, Search } from "lucide-react";

/**
 * Clients are passed as a prop from the parent (already fetched in Tickets.jsx)
 * — no redundant fetch inside this modal.
 *
 * Bug fixed: assignedTo was not being sent correctly because selectedEmp._id
 * was only set when the user interacted with the dropdown. Now the form is
 * initialised from selectedTicket with the correct _id so existing assignments
 * are preserved on save without requiring re-selection.
 */
const EditTicketModal = ({
  show,
  setShow,
  selectedTicket,
  employees = [],
  clients = [],
  isAdmin,
  handleUpdateTicket,
}) => {
  const [form, setForm] = useState({
    priority: "",
    title: "",
    description: "",
    status: "Open",
  });
  const [selectedEmp, setSelectedEmp] = useState({ _id: null, name: "" });
  const [selectedClient, setSelectedClient] = useState({ _id: null, name: "" });
  const [empDropdownOpen, setEmpDropdownOpen] = useState(false);
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  const empRef = useRef(null);
  const clientRef = useRef(null);

  // Populate form when ticket changes
  useEffect(() => {
    if (!selectedTicket) return;
    setForm({
      priority: selectedTicket.priority || "",
      title: selectedTicket.title || "",
      description: selectedTicket.description || "",
      status: selectedTicket.status || "Open",
    });
    setSelectedEmp({
      _id: selectedTicket.assignedTo?._id || null,
      name: selectedTicket.assignedTo?.name || "",
    });
    setSelectedClient({
      _id: selectedTicket.relatedClient?._id || null,
      name: selectedTicket.relatedClient?.name || "",
    });
  }, [selectedTicket]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (empRef.current && !empRef.current.contains(e.target))
        setEmpDropdownOpen(false);
      if (clientRef.current && !clientRef.current.contains(e.target))
        setClientDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!show || !selectedTicket) return null;

  const filteredEmps = employees.filter((e) =>
    e.name.toLowerCase().includes((selectedEmp.name || "").toLowerCase()),
  );
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes((selectedClient.name || "").toLowerCase()),
  );

  const handleSave = () => {
    handleUpdateTicket(selectedTicket._id, {
      ...form,
      title: form.title.trim(),
      description: form.description.trim(),
      relatedClient: selectedClient._id,
      assignedTo: selectedEmp._id,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-sm bg-black/40">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-semibold text-gray-800">
              Edit ticket
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[320px]">
              {selectedTicket.title}
            </p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-5 flex flex-col gap-4">
          {/* Client */}
          <Field label="Client">
            <div className="relative" ref={clientRef}>
              <SearchInput
                value={selectedClient.name}
                placeholder="Search client…"
                onChange={(val) => {
                  setSelectedClient({ _id: null, name: val });
                  setClientDropdownOpen(true);
                }}
                onFocus={() => setClientDropdownOpen(true)}
                onClear={() => setSelectedClient({ _id: null, name: "" })}
                hasValue={!!selectedClient._id}
              />
              {clientDropdownOpen && (
                <Dropdown
                  items={filteredClients}
                  selected={selectedClient._id}
                  onSelect={(c) => {
                    setSelectedClient({ _id: c._id, name: c.name });
                    setClientDropdownOpen(false);
                  }}
                  emptyMsg="No clients found"
                />
              )}
            </div>
          </Field>

          {/* Title */}
          <Field label="Title" required>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className={inputCls}
              placeholder="Ticket title"
            />
          </Field>

          {/* Description */}
          <Field label="Description" required>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
              className={inputCls + " resize-none"}
              placeholder="Describe the issue…"
            />
          </Field>

          {/* Priority */}
          <Field label="Priority" required>
            <div className="flex gap-2">
              {["Low", "Medium", "High"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setForm({ ...form, priority: p })}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg border transition ${
                    form.priority === p
                      ? PRIORITY_ACTIVE[p]
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </Field>

          {/* Status */}
          <Field label="Status">
            <div className="flex flex-wrap gap-2">
              {["Open", "In Progress", "Resolved", "Closed"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm({ ...form, status: s })}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition ${
                    form.status === s
                      ? STATUS_ACTIVE[s]
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>

          {/* Assign to (admin only) */}
          {isAdmin && (
            <Field label="Assigned to">
              <div className="relative" ref={empRef}>
                <SearchInput
                  value={selectedEmp.name}
                  placeholder="Search employee…"
                  onChange={(val) => {
                    setSelectedEmp({ _id: null, name: val });
                    setEmpDropdownOpen(true);
                  }}
                  onFocus={() => setEmpDropdownOpen(true)}
                  onClear={() => setSelectedEmp({ _id: null, name: "" })}
                  hasValue={!!selectedEmp._id}
                />
                {empDropdownOpen && (
                  <Dropdown
                    items={filteredEmps}
                    selected={selectedEmp._id}
                    onSelect={(e) => {
                      setSelectedEmp({ _id: e._id, name: e.name });
                      setEmpDropdownOpen(false);
                    }}
                    emptyMsg="No employees found"
                  />
                )}
              </div>
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-gray-100">
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
};

// ---- Shared sub-components ----

function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function SearchInput({
  value,
  placeholder,
  onChange,
  onFocus,
  onClear,
  hasValue,
}) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 gap-2 focus-within:ring-2 focus-within:ring-indigo-300 transition">
      <Search size={14} className="text-gray-400 flex-shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      {hasValue && (
        <button onClick={onClear} className="text-gray-300 hover:text-gray-500">
          <X size={13} />
        </button>
      )}
    </div>
  );
}

function Dropdown({ items, selected, onSelect, emptyMsg }) {
  return (
    <ul className="absolute z-50 bg-white left-0 right-0 mt-1 border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
      {items.length === 0 ? (
        <li className="px-3 py-2 text-sm text-gray-400 text-center">
          {emptyMsg}
        </li>
      ) : (
        items.map((item) => (
          <li
            key={item._id}
            onClick={() => onSelect(item)}
            className={`px-3 py-2 text-sm cursor-pointer transition ${
              selected === item._id
                ? "bg-indigo-50 text-indigo-700 font-medium"
                : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            {item.name}
          </li>
        ))
      )}
    </ul>
  );
}

// ---- Styles ----
const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition";

const PRIORITY_ACTIVE = {
  Low: "border-green-400 bg-green-50 text-green-700",
  Medium: "border-amber-400 bg-amber-50 text-amber-700",
  High: "border-red-400 bg-red-50 text-red-700",
};

const STATUS_ACTIVE = {
  Open: "border-blue-400 bg-blue-50 text-blue-700",
  "In Progress": "border-purple-400 bg-purple-50 text-purple-700",
  Resolved: "border-green-400 bg-green-50 text-green-700",
  Closed: "border-gray-400 bg-gray-100 text-gray-700",
};

export default EditTicketModal;
