import React, { useEffect, useState, useRef } from "react";
import { Search, Plus, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Dropdown from "../layout/Dropdown";
import Loader from "../layout/Loader";
import { useToast } from "../layout/ToastProvider.jsx";

const OverdueClients = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [allClients, setAllClients] = useState([]);
  const [overdueClients, setOverdueClients] = useState([]);
  const [tableSearch, setTableSearch] = useState(""); // main table search
  const [addSearch, setAddSearch] = useState(""); // add-overdue dropdown search
  const [filters, setFilters] = useState({ status: "All", sort: "Newest" });
  const [addOverdueOpen, setAddOverdueOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState({ client: null, amount: "" }); // modal state

  const dropdownRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = user?.company_id;

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAddOverdueOpen(false);
        setAddSearch("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch clients
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllClients(res.data.clients || []);
    } catch (err) {
      toast.error("Failed to fetch clients");
      console.error(err);
    }
  };

  const fetchOverdueClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/client/overdue", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOverdueClients(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch overdue clients");
      console.error(err);
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchClients(), fetchOverdueClients()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  const addOverdueClient = async () => {
    if (
      !modalData.amount ||
      isNaN(modalData.amount) ||
      Number(modalData.amount) <= 0
    ) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/client/${modalData.client._id}`,
        { isOverdue: true, overdueAmount: Number(modalData.amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state locally
      setOverdueClients((prev) => [
        ...prev,
        {
          ...modalData.client,
          isOverdue: true,
          overdueAmount: Number(modalData.amount),
        },
      ]);

      setAllClients((prev) =>
        prev.map((c) =>
          c._id === modalData.client._id ? { ...c, isOverdue: true } : c
        )
      );

      setModalData({ client: null, amount: "" });
      setAddOverdueOpen(false);
      setAddSearch("");
      toast.success("Client added to overdue list");
    } catch (err) {
      toast.error("Failed to add overdue client");
      console.error(err);
    }
  };

  const removeOverdueClient = (client) => {
    toast.confirmAction({
      type: "delete",
      message: `Are you sure you want to remove ${client.name} from overdue?`,
      onConfirm: async () => {
        try {
          const token = localStorage.getItem("token");
          await axios.put(
            `/client/${client._id}`,
            { isOverdue: false, overdueAmount: 0 },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          setOverdueClients((prev) => prev.filter((c) => c._id !== client._id));
          setAllClients((prev) =>
            prev.map((c) =>
              c._id === client._id
                ? { ...c, isOverdue: false, overdueAmount: 0 }
                : c
            )
          );

          toast.success("Client removed from overdue");
        } catch (err) {
          toast.error("Failed to remove overdue client");
          console.error(err);
        }
      },
    });
  };

  const availableClients = allClients.filter((c) => !c.isOverdue);

  const filteredOverdue = overdueClients
    .filter((client) =>
      client.name.toLowerCase().includes(tableSearch.toLowerCase())
    )
    .filter((c) =>
      filters.status === "All" ? true : c.status === filters.status
    )
    .sort((a, b) => {
      if (filters.sort === "Newest")
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow-md px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <ArrowLeft size={18} /> Back
        </button>
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Overdue Clients
        </h2>
      </div>

      {/* FILTERS + ADD */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Main table search */}
          <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2 w-full sm:w-80 transition hover:shadow-md">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              className="ml-3 flex-1 outline-none text-gray-700 bg-transparent"
            />
          </div>

          <Dropdown
            label="Sort"
            value={filters.sort}
            onChange={(val) => setFilters({ ...filters, sort: val })}
            options={["Newest"]}
            placeholder="Sort By"
          />
        </div>

        {/* ADD OVERDUE CLIENT BUTTON */}
        {user.role !== "Employee" && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setAddOverdueOpen(!addOverdueOpen)}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
            >
              <Plus size={16} /> Add Overdue Client
            </button>

            {addOverdueOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-w-xs w-full z-10">
                <div className="p-2 border-b border-gray-200">
                  <input
                    type="text"
                    placeholder="Search clients..."
                    value={addSearch}
                    onChange={(e) => setAddSearch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                  />
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {availableClients
                    .filter((c) =>
                      c.name.toLowerCase().includes(addSearch.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c._id}
                        className="px-4 py-2 cursor-pointer hover:bg-red-50 flex justify-between items-center transition"
                        onClick={() => setModalData({ client: c, amount: "" })}
                      >
                        <span className="text-gray-800 font-medium">
                          {c.name}
                        </span>
                        <Plus size={14} className="text-red-600" />
                      </div>
                    ))}
                  {availableClients.filter((c) =>
                    c.name.toLowerCase().includes(addSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-2 text-gray-500 italic">
                      No clients found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* OVERDUE TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-left">Overdue Amount</th>
              <th className="p-4 text-left">Updated</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredOverdue.length > 0 ? (
              filteredOverdue.map((client) => (
                <tr
                  key={client._id}
                  className="border-b hover:bg-gray-50 transition cursor-pointer"
                >
                  <td className="p-4 font-medium text-gray-800">
                    {client.name}
                  </td>
                  <td className="p-4 text-red-600 font-semibold">Overdue</td>
                  <td className="p-4 text-gray-700 font-medium">
                    {client.overdueAmount || "-"}
                  </td>
                  <td className="p-4 text-gray-600">
                    {new Date(client.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeOverdueClient(client)}
                      className="flex items-center gap-1 text-red-600 hover:underline mx-auto"
                    >
                      <X size={14} /> Remove
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No overdue clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD OVERDUE MODAL */}
      {modalData.client && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999]">
          <div className="bg-white p-6 rounded-xl w-80 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add {modalData.client.name} to Overdue
            </h3>
            <input
              type="number"
              placeholder="Enter overdue amount"
              value={modalData.amount}
              onChange={(e) =>
                setModalData({ ...modalData, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalData({ client: null, amount: "" })}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={addOverdueClient}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverdueClients;
