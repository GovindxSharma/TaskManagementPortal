// src/pages/Passwords/Passwords.jsx
import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  X,
  Edit,
  Plus,
  Search,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
  KeyRound,
  Filter,
  ChevronDown,
  Copy,
  Check,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import Loader from "../../components/layout/Loader";
import { useToast } from "../../components/layout/ToastProvider.jsx";
import Dropdown from "../layout/Dropdown";

export default function PasswordsSection() {
  const navigate = useNavigate();
  const toast = useToast();
  const confirmFn = toast?.confirmDelete || toast?.confirmAction || null;
  const success = toast?.success || ((m) => console.log("SUCCESS:", m));
  const error = toast?.error || ((m) => console.error("ERROR:", m));

  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState([]);
  const [clients, setClients] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [categories, setCategories] = useState([]);

  const clientDropdownRef = useRef(null);
  const [clientSearch, setClientSearch] = useState("");
  const [clientDropdownOpen, setClientDropdownOpen] = useState(false);

  // UI state
  const [search, setSearch] = useState("");
  const [filterClientId, setFilterClientId] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDateRange, setFilterDateRange] = useState("all"); // all | today | week | month
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newData, setNewData] = useState({
    client_id: "",
    category: "",
    username: "",
    password: "",
    remarks: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [copied, setCopied] = useState({});

  const [revealed, setRevealed] = useState({});
  const revealLoadingRef = useRef({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.company_id) setCompanyId(user.company_id);
  }, []);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.clients || []);
    } catch (err) {
      error("Failed to fetch clients");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(
        `/dropdown?company_id=${companyId}&type=password`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setCategories(res.data.data || []);
    } catch (err) {
      error("Failed to fetch categories");
    }
  };

  const fetchPasswords = async () => {
    if (!companyId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axiosInstance.get(`/password?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswords(res.data.data || []);
    } catch (err) {
      error("Failed to fetch passwords");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId) return;
    fetchClients();
    fetchPasswords();
    fetchCategories();
  }, [companyId]);

  // Date range helper
  const isInDateRange = (dateStr, range) => {
    if (range === "all" || !dateStr) return true;
    const date = new Date(dateStr);
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    if (range === "today") return date >= startOfDay;
    if (range === "week") {
      const weekAgo = new Date(startOfDay);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return date >= weekAgo;
    }
    if (range === "month") {
      const monthAgo = new Date(startOfDay);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return date >= monthAgo;
    }
    return true;
  };

  const filteredPasswords = useMemo(() => {
    const s = search.trim().toLowerCase();
    return passwords
      .filter((p) =>
        filterClientId ? p.client_id?._id === filterClientId : true,
      )
      .filter((p) =>
        filterCategory ? p.category?._id === filterCategory : true,
      )
      .filter((p) => isInDateRange(p.lastUpdated, filterDateRange))
      .filter((p) => {
        if (!s) return true;
        return (
          (p.client_id?.name || "").toLowerCase().includes(s) ||
          (p.category?.name || "").toLowerCase().includes(s) ||
          (p.username || "").toLowerCase().includes(s) ||
          (p.remarks || "").toLowerCase().includes(s)
        );
      });
  }, [passwords, search, filterClientId, filterCategory, filterDateRange]);

  const activeFilterCount = [
    filterClientId,
    filterCategory,
    filterDateRange !== "all" ? filterDateRange : "",
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setFilterClientId("");
    setFilterCategory("");
    setFilterDateRange("all");
    setSearch("");
  };

const openAddModal = () => {
  setEditingId(null);
  setShowPassword(false);
  setClientSearch("");
  setNewData({
    client_id: "",
    category: "",
    username: "",
    password: "",
    remarks: "",
  });
  setModalOpen(true);
};

const handleEdit = (p) => {
  setEditingId(p._id);
  setShowPassword(false);
  setClientSearch(p.client_id?.name || "");

  setNewData({
    client_id: p.client_id?._id || "",
    category: p.category?._id || "",
    username: p.username || "",
    password: "",
    remarks: p.remarks || "",
  });

  setModalOpen(true);
};

  const handleSave = async () => {
    if (!newData.client_id || !newData.category || !newData.username)
      return error("Client, category, and username are required");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (editingId) {
        const payload = {
          category: newData.category,
          username: newData.username,
          remarks: newData.remarks,
        };
        if (newData.password) payload.password = newData.password;
        await axiosInstance.put(`/password/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        success("Password updated");
      } else {
        await axiosInstance.post(
          "/password",
          { company_id: companyId, ...newData },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        success("Password added");
      }
      setModalOpen(false);
      setClientDropdownOpen(false);
      setClientSearch("");
      fetchPasswords();
    } catch (err) {
      error(err.response?.data?.message || "Failed to save password");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(clientSearch.toLowerCase()),
  );

useEffect(() => {
  const handleOutsideClick = (e) => {
    if (
      clientDropdownRef.current &&
      !clientDropdownRef.current.contains(e.target)
    ) {
      setClientDropdownOpen(false);
    }
  };

  document.addEventListener("mousedown", handleOutsideClick);

  return () => {
    document.removeEventListener("mousedown", handleOutsideClick);
  };
}, []);


  const handleDelete = (id) => {
    const doDelete = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`/password/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        success("Deleted successfully");
        fetchPasswords();
      } catch (err) {
        error("Failed to delete password");
      } finally {
        setLoading(false);
      }
    };
    if (confirmFn) {
      try {
        confirmFn({
          message: "Delete this password entry?",
          onConfirm: doDelete,
          type: "delete",
        });
      } catch {
        if (window.confirm("Delete this password?")) doDelete();
      }
    } else {
      if (window.confirm("Delete this password?")) doDelete();
    }
  };

  const toggleReveal = async (id) => {
    if (revealed[id]) {
      setRevealed((r) => {
        const c = { ...r };
        delete c[id];
        return c;
      });
      return;
    }
    if (revealLoadingRef.current[id]) return;
    try {
      revealLoadingRef.current[id] = true;
      setRevealed((r) => ({ ...r, [id]: "..." }));
      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/password/decrypt/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const dec = res.data.decrypted || res.data.data?.decrypted || "";
      setRevealed((r) => ({ ...r, [id]: dec || "<empty>" }));
    } catch {
      error("Failed to reveal password");
      setRevealed((r) => {
        const c = { ...r };
        delete c[id];
        return c;
      });
    } finally {
      revealLoadingRef.current[id] = false;
    }
  };

  const handleCopy = async (id, text) => {
    try {
      let textToCopy = text;
      if (!textToCopy || textToCopy === "••••••••") {
        // fetch if not revealed
        const token = localStorage.getItem("token");
        const res = await axiosInstance.post(
          `/password/decrypt/${id}`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        textToCopy = res.data.decrypted || res.data.data?.decrypted || "";
      }
      await navigator.clipboard.writeText(textToCopy);
      setCopied((c) => ({ ...c, [id]: true }));
      setTimeout(() => setCopied((c) => ({ ...c, [id]: false })), 2000);
    } catch {
      error("Failed to copy password");
    }
  };

  const getClientIdByName = (name) => {
    const found = clients.find(
      (c) =>
        c.name === name || c.name.toLowerCase() === String(name).toLowerCase(),
    );
    return found?._id || "";
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 text-sm font-medium px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={15} /> Back
              </button>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <KeyRound size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 leading-tight">
                    Passwords
                  </h2>
                  <p className="text-xs text-gray-400 leading-tight">
                    {passwords.length} entries stored
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm shadow-indigo-200"
            >
              <Plus size={16} /> Add Password
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all placeholder-gray-400"
                placeholder="Search by client, username, category, remarks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={15} />
                </button>
              )}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                filtersOpen || activeFilterCount > 0
                  ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <SlidersHorizontal size={15} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center leading-none">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
              >
                <XCircle size={15} /> Clear all
              </button>
            )}
          </div>

          {/* Expanded Filters */}
          {filtersOpen && (
            <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Client filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Client
                </label>
                <div className="relative">
                  <select
                    value={filterClientId}
                    onChange={(e) => setFilterClientId(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none text-gray-700"
                  >
                    <option value="">All Clients</option>
                    {clients.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Category filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Category
                </label>
                <div className="relative">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full appearance-none pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none text-gray-700"
                  >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* Date range filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">
                  Last Updated
                </label>
                <div className="flex gap-1.5">
                  {[
                    { label: "All", value: "all" },
                    { label: "Today", value: "today" },
                    { label: "Week", value: "week" },
                    { label: "Month", value: "month" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFilterDateRange(opt.value)}
                      className={`flex-1 py-2 text-xs font-medium rounded-lg border transition-colors ${
                        filterDateRange === opt.value
                          ? "bg-indigo-600 border-indigo-600 text-white"
                          : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Active filter pills */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {filterClientId && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                Client: {clients.find((c) => c._id === filterClientId)?.name}
                <button onClick={() => setFilterClientId("")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filterCategory && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                Category:{" "}
                {categories.find((c) => c._id === filterCategory)?.name}
                <button onClick={() => setFilterCategory("")}>
                  <X size={12} />
                </button>
              </span>
            )}
            {filterDateRange !== "all" && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1.5 rounded-full border border-indigo-200">
                Updated: {filterDateRange}
                <button onClick={() => setFilterDateRange("all")}>
                  <X size={12} />
                </button>
              </span>
            )}
            <span className="text-xs text-gray-400 self-center ml-1">
              {filteredPasswords.length} of {passwords.length} results
            </span>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Password
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPasswords.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-16">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <KeyRound size={20} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-600 font-medium">
                            No passwords found
                          </p>
                          <p className="text-gray-400 text-xs mt-0.5">
                            {activeFilterCount > 0 || search
                              ? "Try adjusting your filters"
                              : "Add your first password entry"}
                          </p>
                        </div>
                        {(activeFilterCount > 0 || search) && (
                          <button
                            onClick={clearAllFilters}
                            className="text-indigo-600 text-xs font-medium hover:underline"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredPasswords.map((p) => (
                    <tr
                      key={p._id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <span className="font-medium text-gray-800">
                          {p.client_id?.name || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {p.category?.name ? (
                          <span className="inline-flex items-center bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-md">
                            {p.category.name}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-700 font-mono text-sm">
                          {p.username || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-gray-700 select-all min-w-[80px]">
                            {revealed[p._id] ? revealed[p._id] : "••••••••"}
                          </span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => toggleReveal(p._id)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title={revealed[p._id] ? "Hide" : "Reveal"}
                            >
                              {revealed[p._id] ? (
                                <EyeOff size={13} />
                              ) : (
                                <Eye size={13} />
                              )}
                            </button>
                            <button
                              onClick={() => handleCopy(p._id, revealed[p._id])}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Copy password"
                            >
                              {copied[p._id] ? (
                                <Check size={13} className="text-green-500" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-500 text-sm truncate max-w-[150px] block">
                          {p.remarks || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-gray-400 text-xs whitespace-nowrap">
                          {p.lastUpdated
                            ? new Date(p.lastUpdated).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(p)}
                            className="p-2 text-amber-500 hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table footer */}
          {filteredPasswords.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Showing{" "}
                <span className="font-medium text-gray-600">
                  {filteredPasswords.length}
                </span>{" "}
                of{" "}
                <span className="font-medium text-gray-600">
                  {passwords.length}
                </span>{" "}
                entries
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <KeyRound size={16} className="text-indigo-600" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  {editingId ? "Edit Password Entry" : "Add New Password"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Client <span className="text-red-400">*</span>
                </label>
                <div className="relative" ref={clientDropdownRef}>
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />

                    <input
                      value={clientSearch}
                      onChange={(e) => {
                        setClientSearch(e.target.value);
                        setClientDropdownOpen(true);
                        setNewData((s) => ({
                          ...s,
                          client_id: "",
                        }));
                      }}
                      onClick={() => setClientDropdownOpen(true)}
                      placeholder="Search client..."
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 bg-gray-50 rounded-xl text-sm"
                    />
                  </div>
                  {clientDropdownOpen && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {filteredClients.length > 0 ? (
                        filteredClients.map((client) => (
                          <button
                            key={client._id}
                            type="button"
                            onClick={() => {
                              setClientSearch(client.name);

                              setNewData((s) => ({
                                ...s,
                                client_id: client._id,
                              }));

                              setClientDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors ${
                              newData.client_id === client._id
                                ? "bg-indigo-50 text-indigo-700"
                                : "text-gray-700"
                            }`}
                          >
                            <div className="font-medium">{client.name}</div>

                            {client.mobile && (
                              <div className="text-xs text-gray-400 mt-0.5">
                                {client.mobile}
                              </div>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400">
                          No clients found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Category <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={newData.category}
                    onChange={(e) =>
                      setNewData((s) => ({ ...s, category: e.target.value }))
                    }
                    className="w-full appearance-none border border-gray-200 bg-gray-50 px-3 py-2.5 pr-8 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all text-gray-700"
                  >
                    <option value="">Select category…</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={14}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Username <span className="text-red-400">*</span>
                </label>
                <input
                  value={newData.username}
                  onChange={(e) =>
                    setNewData((s) => ({ ...s, username: e.target.value }))
                  }
                  placeholder="Enter username or email"
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all placeholder-gray-400"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {editingId ? "New Password" : "Password"}{" "}
                  {editingId && (
                    <span className="text-gray-400 font-normal">
                      (leave blank to keep)
                    </span>
                  )}
                  {!editingId && <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newData.password}
                    onChange={(e) =>
                      setNewData((s) => ({ ...s, password: e.target.value }))
                    }
                    placeholder={
                      editingId ? "Enter new password…" : "Enter password"
                    }
                    className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 pr-10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Remarks
                </label>
                <input
                  value={newData.remarks}
                  onChange={(e) =>
                    setNewData((s) => ({ ...s, remarks: e.target.value }))
                  }
                  placeholder="Optional notes or context…"
                  className="w-full border border-gray-200 bg-gray-50 px-3 py-2.5 rounded-xl text-sm focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 outline-none transition-all placeholder-gray-400"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex justify-end gap-2.5 px-6 pb-5">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm shadow-indigo-200"
              >
                {editingId ? "Save Changes" : "Add Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
