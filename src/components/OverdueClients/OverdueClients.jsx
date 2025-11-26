import React, { useEffect, useState } from "react";
import { Search, Plus, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosInstance";
import Dropdown from "../layout/Dropdown";
import Loader from "../layout/Loader"; // ⭐ CENTRAL LOADER

const OverdueClients = () => {
  const navigate = useNavigate();

  const [allClients, setAllClients] = useState([]);
  const [overdueClients, setOverdueClients] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "All", sort: "Newest" });
  const [addOverdueOpen, setAddOverdueOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ⭐ LOADING STATE

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const companyId = user?.company_id;

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllClients(res.data.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients:", err);
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
      console.error("Failed to fetch overdue:", err);
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

  const addOverdueClient = async (clientId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/client/${clientId}`,
        { isOverdue: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOverdueClients();
      setAddOverdueOpen(false);
    } catch (err) {
      console.error("Failed to add overdue:", err);
    }
  };

  const removeOverdueClient = async (clientId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/client/${clientId}`,
        { isOverdue: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOverdueClients();
    } catch (err) {
      console.error("Failed to remove overdue:", err);
    }
  };

  const availableClients = allClients.filter((c) => !c.isOverdue);

  const filteredOverdue = overdueClients
    .filter((client) =>
      client.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((c) =>
      filters.status === "All" ? true : c.status === filters.status
    )
    .sort((a, b) => {
      if (filters.sort === "Newest")
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      return 0;
    });

  // ⭐ LOADER UI
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow-md px-3 py-2 rounded-lg hover:bg-blue-50 transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          Overdue Clients
        </h2>
      </div>

      {/* FILTERS + ADD */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4 mb-6">
        {/* Search + Sort */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-4 py-2 w-full sm:w-80 transition hover:shadow-md">
            <Search size={18} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search clients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        {/* ADD OVERDUE */}
        <div className="relative">
          <button
            onClick={() => setAddOverdueOpen(!addOverdueOpen)}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-md"
          >
            <Plus size={16} /> Add Overdue Client
          </button>

          {addOverdueOpen && (
            <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-w-xs w-full z-10">
              {/* SEARCH INPUT */}
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400"
                />
              </div>

              {/* CLIENT LIST */}
              <div className="max-h-64 overflow-y-auto">
                {availableClients
                  .filter((c) =>
                    c.name.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((c) => (
                    <div
                      key={c._id}
                      className="px-4 py-2 cursor-pointer hover:bg-red-50 flex justify-between items-center transition"
                      onClick={() => addOverdueClient(c._id)}
                    >
                      <span className="text-gray-800 font-medium">
                        {c.name}
                      </span>
                      <Plus size={14} className="text-red-600" />
                    </div>
                  ))}
                {availableClients.filter((c) =>
                  c.name.toLowerCase().includes(search.toLowerCase())
                ).length === 0 && (
                  <div className="px-4 py-2 text-gray-500 italic">
                    No clients found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* OVERDUE TABLE */}
      <div className="bg-white shadow-md rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-4 text-left">Client</th>
              <th className="p-4 text-left">Status</th>
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
                  <td className="p-4 text-gray-600">
                    {new Date(client.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => removeOverdueClient(client._id)}
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
                  colSpan="4"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No overdue clients found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverdueClients;
