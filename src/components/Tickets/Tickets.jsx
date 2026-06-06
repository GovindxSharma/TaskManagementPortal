// components/Tickets/Tickets.jsx
import React, { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Loader from "../layout/Loader";
import { useToast } from "../layout/ToastProvider.jsx";

import TicketFilters from "./TicketFilters";
import TicketsTable from "./TicketsTable";
import AddTicketModal from "./TicketModals/AddTicketModal";
import AssignTicketModal from "./TicketModals/AssignTicketModal";
import ResolvedTicketsModal from "./TicketModals/ResolvedTicketsModal";
import EditTicketModal from "./TicketModals/EditTicketModal.jsx";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const getUserFromLS = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const EMPTY_TICKET = {
  clientId: "",
  priority: "",
  title: "",
  description: "",
  assignedTo: "",
};

const EMPTY_EMP = { _id: null, name: "" };

// ---------------------------------------------------------------------------
const Tickets = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const user = getUserFromLS();
  const isAdmin = user.role === "Admin";

  const [tickets, setTickets] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    priority: "",
    employee: "",
    client: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolvedModal, setShowResolvedModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState(EMPTY_EMP);
  const [newTicket, setNewTicket] = useState(EMPTY_TICKET);

  // ---- Data fetching ----
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const requests = [
        axios.get("/ticket"),
        axios.get(`/client?company_id=${user.company_id}`),
        ...(isAdmin ? [axios.get("/user/employees")] : []),
      ];
      const [tRes, cRes, eRes] = await Promise.all(requests);
      setTickets(tRes.data.tickets || []);
      setClients(cRes.data.clients || []);
      if (isAdmin) setEmployees(eRes?.data?.employees || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ticket data");
    } finally {
      setLoading(false);
    }
  }, [user.company_id, isAdmin]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ---- Filtering ----
  // "Resolved" tickets are excluded from the main table and shown in their own modal.
  // The status filter intentionally does NOT include "Resolved" as an option in the
  // main table — resolved tickets live in the separate modal.
  const filteredTickets = tickets.filter((t) => {
    // Always exclude resolved from main table
    if (t.status === "Resolved") return false;

    const s = search.trim().toLowerCase();
    const matchSearch =
      !s ||
      (t.title || "").toLowerCase().includes(s) ||
      (t.relatedClient?.name || "").toLowerCase().includes(s) ||
      (t.raisedBy?.name || "").toLowerCase().includes(s) ||
      (t.assignedTo?.name || "").toLowerCase().includes(s);

    const matchStatus = !filters.status || t.status === filters.status;
    const matchPriority = !filters.priority || t.priority === filters.priority;
    // Compare by _id for accuracy, not by name string
    const matchEmployee =
      !filters.employee || t.assignedTo?._id === filters.employee;
    const matchClient =
      !filters.client || t.relatedClient?._id === filters.client;

    return (
      matchSearch &&
      matchStatus &&
      matchPriority &&
      matchEmployee &&
      matchClient
    );
  });

  const resolvedTickets = tickets.filter((t) => t.status === "Resolved");

  // ---- CRUD handlers ----
  const handleDelete = (id) => {
    toast.confirmDelete({
      message: "Delete this ticket? This cannot be undone.",
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(`/ticket/${id}`);
          // Close edit modal if the deleted ticket was open
          if (id === selectedTicket?._id) {
            setShowEditModal(false);
            setSelectedTicket(null);
          }
          await fetchAll();
          toast.success("Ticket deleted");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete ticket");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleStatusChange = async (ticket, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/ticket/${ticket._id}`, { status: newStatus });
      await fetchAll();
      toast.success(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmp._id) {
      toast.error("Please select an employee to assign");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/ticket/${selectedTicket._id}`, {
        assignedTo: selectedEmp._id,
      });
      setShowAssignModal(false);
      await fetchAll();
      toast.success("Ticket assigned successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (id, payload) => {
    if (!payload.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!payload.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!payload.priority) {
      toast.error("Priority is required");
      return;
    }
    try {
      setLoading(true);
      await axios.put(`/ticket/${id}`, payload);
      setShowEditModal(false);
      await fetchAll();
      toast.success("Ticket updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = async () => {
    if (!newTicket.clientId) {
      toast.error("Client is required");
      return;
    }
    if (!newTicket.title?.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!newTicket.description?.trim()) {
      toast.error("Description is required");
      return;
    }
    if (!newTicket.priority) {
      toast.error("Priority is required");
      return;
    }
    if (isAdmin && !selectedEmp._id) {
      toast.error("Please assign to an employee");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...newTicket,
        raisedBy: user._id,
        relatedClient: newTicket.clientId,
      };
      if (isAdmin && selectedEmp._id) payload.assignedTo = selectedEmp._id;
      else delete payload.assignedTo;

      await axios.post("/ticket", payload);
      setShowAddModal(false);
      setNewTicket(EMPTY_TICKET);
      setSelectedEmp(EMPTY_EMP);
      await fetchAll();
      toast.success("Ticket created successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create ticket");
    } finally {
      setLoading(false);
    }
  };

  // ---- Modal openers (clean, centralised) ----
  const openAssignModal = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedEmp({
      _id: ticket.assignedTo?._id || null,
      name: ticket.assignedTo?.name || "",
    });
    setShowAssignModal(true);
  };

  const openEditModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowEditModal(true);
  };

  const openAddModal = () => {
    setNewTicket(EMPTY_TICKET);
    setSelectedEmp(EMPTY_EMP);
    setShowAddModal(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );

  const exportPDF = () => {
    if (!filteredTickets.length) {
      toast.error("No tickets to export");
      return;
    }

    const doc = new jsPDF();
    doc.text("Ticket Management Report", 14, 15);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

    autoTable(doc, {
      startY: 28,
      head: [
        ["Title", "Client", "Priority", "Status", "Raised By", "Assigned To"],
      ],
      body: filteredTickets.map((t) => [
        t.title || "-",
        t.relatedClient?.name || "-",
        t.priority || "-",
        t.status || "-",
        t.raisedBy?.name || "-",
        t.assignedTo?.name || "-",
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [79, 70, 229] }, // indigo to match ticket UI
    });

    doc.save("Tickets_Report.pdf");
  };

  const exportExcel = () => {
    if (!filteredTickets.length) {
      toast.error("No tickets to export");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(
      filteredTickets.map((t) => ({
        Title: t.title || "-",
        Client: t.relatedClient?.name || "-",
        Priority: t.priority || "-",
        Status: t.status || "-",
        "Raised By": t.raisedBy?.name || "-",
        "Assigned To": t.assignedTo?.name || "-",
      })),
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
    XLSX.writeFile(workbook, "Tickets_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 text-sm font-medium transition"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:block">Back</span>
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Ticket Management
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {filteredTickets.length} active ticket
              {filteredTickets.length !== 1 ? "s" : ""}
              {resolvedTickets.length > 0 &&
                ` · ${resolvedTickets.length} resolved`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowResolvedModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-green-200 text-green-700 text-sm font-medium rounded-lg hover:bg-green-50 transition"
          >
            <CheckCircle size={16} />
            <span className="hidden sm:inline">Resolved</span>
            {resolvedTickets.length > 0 && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {resolvedTickets.length}
              </span>
            )}
          </button>

          <button
            onClick={exportPDF}
            disabled={!filteredTickets.length}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition shadow-sm
      ${
        !filteredTickets.length
          ? "bg-gray-300 cursor-not-allowed text-gray-500"
          : "bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
      }`}
          >
            Export PDF
          </button>

          <button
            onClick={exportExcel}
            disabled={!filteredTickets.length}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition shadow-sm
      ${
        !filteredTickets.length
          ? "bg-gray-300 cursor-not-allowed text-gray-500"
          : "bg-teal-100 hover:bg-teal-200 text-teal-700"
      }`}
          >
            Export Excel
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-medium px-3 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Add Ticket
          </button>
        </div>
      </div>

      <TicketFilters
        filters={filters}
        setFilters={setFilters}
        search={search}
        setSearch={setSearch}
        employees={employees}
        clients={clients}
      />

      <TicketsTable
        filteredTickets={filteredTickets}
        isAdmin={isAdmin}
        handleDelete={handleDelete}
        handleStatusChange={handleStatusChange}
        openAssignModal={openAssignModal}
        openEditModal={openEditModal}
      />

      <AddTicketModal
        show={showAddModal}
        setShow={setShowAddModal}
        newTicket={newTicket}
        setNewTicket={setNewTicket}
        clients={clients}
        isAdmin={isAdmin}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
        employees={employees}
        handleAddTicket={handleAddTicket}
      />

      <EditTicketModal
        show={showEditModal}
        setShow={setShowEditModal}
        selectedTicket={selectedTicket}
        employees={employees}
        clients={clients}
        isAdmin={isAdmin}
        handleUpdateTicket={handleUpdateTicket}
      />

      <AssignTicketModal
        show={showAssignModal}
        setShow={setShowAssignModal}
        selectedTicket={selectedTicket}
        selectedEmp={selectedEmp}
        setSelectedEmp={setSelectedEmp}
        employees={employees}
        handleAssign={handleAssign}
        isAdmin={isAdmin}
      />

      <ResolvedTicketsModal
        show={showResolvedModal}
        setShow={setShowResolvedModal}
        resolvedTickets={resolvedTickets}
      />
    </div>
  );
};

export default Tickets;
