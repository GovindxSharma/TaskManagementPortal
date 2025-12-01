// components/Tickets/Tickets.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
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

const Tickets = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
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
    category: "",
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showResolvedModal, setShowResolvedModal] = useState(false);
const [showEditModal, setShowEditModal] = useState(false);


  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedEmp, setSelectedEmp] = useState({ _id: null, name: "" });
  const [newTicket, setNewTicket] = useState({
    clientId: "",
    category: "",
    priority: "",
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
  });

  const fetchAll = async () => {
    try {
      setLoading(true);
      const tReq = axios.get("/ticket");
      const cReq = axios.get(`/client?company_id=${user.company_id}`);
      const eReq = isAdmin ? axios.get("/user/employees") : null;

      const [tRes, cRes, eRes] = await Promise.all([tReq, cReq, eReq]);
      setTickets(tRes.data.tickets || []);
      setClients(cRes.data.clients || []);
      if (isAdmin) setEmployees(eRes?.data?.employees || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load ticket data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.relatedClient?.name || "")
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchStatus = !filters.status || t.status === filters.status;
    const matchPriority = !filters.priority || t.priority === filters.priority;
    const matchEmployee =
      !filters.employee || t.assignedTo?.name === filters.employee;
    const matchClient =
      !filters.client || t.relatedClient?.name === filters.client;
    const matchCategory =
      !filters.category ||
      (t.category || "").toLowerCase() === filters.category.toLowerCase();
    const matchResolved = t.status !== "Resolved";
    return (
      matchSearch &&
      matchStatus &&
      matchPriority &&
      matchEmployee &&
      matchClient &&
      matchCategory &&
      matchResolved
    );
  });

  const resolvedTickets = tickets.filter((t) => t.status === "Resolved");

  // CRUD Handlers
  const handleDelete = async (id) => {
    toast.confirmDelete({
      message: "Delete this ticket?",
      onConfirm: async () => {
        try {
          setLoading(true);
          await axios.delete(`/ticket/${id}`);
          await fetchAll();
          toast.success("Ticket deleted!");
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
      toast.success(`Status changed to ${newStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedEmp._id) return;
    try {
      setLoading(true);
      await axios.put(`/ticket/${selectedTicket._id}`, {
        assignedTo: selectedEmp._id,
      });
      setShowAssignModal(false);
      await fetchAll();
      toast.success("Assigned successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async (id, payload) => {
    try {
      setLoading(true);
      await axios.put(`/ticket/${id}`, payload);
      setShowEditModal(false);
      await fetchAll();
      toast.success("Ticket updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTicket = async () => {
    if (!newTicket.clientId || !newTicket.title) {
      toast.error("Client & Title required");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        ...newTicket,
        raisedBy: user._id,
        relatedClient: newTicket.clientId,
      };
      if (!isAdmin) delete payload.assignedTo;
      else if (selectedEmp._id) payload.assignedTo = selectedEmp._id;
      await axios.post("/ticket", payload);
      setShowAddModal(false);
      setNewTicket({
        clientId: "",
        category: "",
        priority: "",
        title: "",
        description: "",
        dueDate: "",
        assignedTo: "",
      });
      setSelectedEmp({ _id: null, name: "" });
      await fetchAll();
      toast.success("Ticket added!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add ticket");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:block">Back</span>
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">
            Ticket Management
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowResolvedModal(true)}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Resolved Tickets
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700"
          >
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
        setSelectedTicket={setSelectedTicket}
        setSelectedEmp={setSelectedEmp}
        setShowAssignModal={setShowAssignModal}
        setShowEditModal={setShowEditModal} // <--- Pass the prop
      />

      <EditTicketModal
        show={showEditModal}
        setShow={setShowEditModal}
        selectedTicket={selectedTicket}
        employees={employees}
        isAdmin={isAdmin}
        handleUpdateTicket={handleUpdateTicket}
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
