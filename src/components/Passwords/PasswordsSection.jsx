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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance"; // your axios instance
import Loader from "../../components/layout/Loader";
import { useToast } from "../../components/layout/ToastProvider.jsx";

export default function PasswordsSection() {
  const navigate = useNavigate();
  const toast = useToast();
  // support different toast API names used around the app
  const confirmFn = toast?.confirmDelete || toast?.confirmAction || null;
  const success = toast?.success || ((m) => console.log("SUCCESS:", m));
  const error = toast?.error || ((m) => console.error("ERROR:", m));

  const [loading, setLoading] = useState(true);
  const [passwords, setPasswords] = useState([]);
  const [clients, setClients] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [categories, setCategories] = useState([]);

  // UI state
  const [search, setSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [filterClientId, setFilterClientId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newData, setNewData] = useState({
    client_id: "",
    category: "",
    username: "",
    password: "",
    remarks: "",
  });
  const [deleteId, setDeleteId] = useState(null);

  // Map for revealed decrypted passwords { id: decryptedString }
  const [revealed, setRevealed] = useState({});
  const revealLoadingRef = useRef({}); // track per-row reveal loading

  // fetch user/company from localStorage for company_id
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.company_id) setCompanyId(user.company_id);
  }, []);

  // Fetch clients & passwords
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem("token");
      // assuming your client endpoint as discussed earlier
      const res = await axiosInstance.get(`/client?company_id=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(res.data.clients || []);
    } catch (err) {
      console.error("Failed to fetch clients", err);
      error("Failed to fetch clients");
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axiosInstance.get(
        `/dropdown?company_id=${companyId}&type=password`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setCategories(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch categories", err);
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
      // normalize - backend should return array of password docs with client_id populated
      setPasswords(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch passwords", err);
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
  
  // derived filtered list
  const filteredPasswords = useMemo(() => {
    const s = search.trim().toLowerCase();
    return passwords
      .filter((p) =>
        filterClientId ? p.client_id?._id === filterClientId : true
      )
      .filter((p) => {
        if (!s) return true;
        return (
          (p.client_id?.name || "").toLowerCase().includes(s) ||
          (p.category?.name || "")
            .toLowerCase()
            .includes(s) ||
          (p.username || "")
            .toLowerCase()
            .includes(s) ||
          (p.remarks || "").toLowerCase().includes(s)
        );
      });
  }, [passwords, search, filterClientId]);

  // open add modal
  const openAddModal = () => {
    setEditingId(null);
    setNewData({
      client_id: "",
      category: "",
      username: "",
      password: "",
      remarks: "",
    });
    setModalOpen(true);
  };

  // open edit
  const handleEdit = (p) => {
    setEditingId(p._id);
    setNewData({
      client_id: p.client_id?._id || "",
      category: p.category?._id || "",
      username: p.username || "",
      password: "", // leave blank, only send if user sets a new password
      remarks: p.remarks || "",
    });
    setModalOpen(true);
  };

  // save add or update
  const handleSave = async () => {
   if (!newData.client_id || !newData.category || !newData.username)
     return error("Client, category, and username required");
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (editingId) {
        // update
        const payload = {
          category: newData.category,
          username: newData.username,
          remarks: newData.remarks,
        };
        // only send password if user wrote a new one
        if (newData.password) payload.password = newData.password;
        await axiosInstance.put(`/password/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        success("Password updated");
      } else {
        // create
        const payload = {
          company_id: companyId,
          client_id: newData.client_id,
          category: newData.category,
          username: newData.username,
          password: newData.password,
          remarks: newData.remarks,
        };
        await axiosInstance.post("/password", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        success("Password added");
      }
      setModalOpen(false);
      fetchPasswords();
    } catch (err) {
      console.error("Save error:", err);
      error(err.response?.data?.message || "Failed to save password");
    } finally {
      setLoading(false);
    }
  };

  // delete handler uses toast confirm (robust to either API)
  const handleDelete = (id) => {
    const doDelete = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axiosInstance.delete(`/password/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        success("Deleted");
        fetchPasswords();
      } catch (err) {
        console.error("Delete error:", err);
        error("Failed to delete password");
      } finally {
        setLoading(false);
      }
    };

    // use whichever confirm method is available, otherwise fallback to window.confirm
    if (confirmFn) {
      // confirmFn signature in various files: either ({ message, onConfirm }) or confirmDelete({ message, onConfirm })
      try {
        confirmFn({
          message: "Delete this password?",
          onConfirm: doDelete,
          type: "delete",
        });
      } catch (e) {
        // fallback
        if (window.confirm("Delete this password?")) doDelete();
      }
    } else {
      if (window.confirm("Delete this password?")) doDelete();
    }
  };

  // decrypt/show password (calls backend)
  const toggleReveal = async (id, encrypted) => {
    // if already revealed, hide it
    if (revealed[id]) {
      setRevealed((r) => {
        const copy = { ...r };
        delete copy[id];
        return copy;
      });
      return;
    }

    // avoid duplicate requests
    if (revealLoadingRef.current[id]) return;

    try {
      revealLoadingRef.current[id] = true;
      setRevealed((r) => ({ ...r, [id]: "..." })); // show placeholder/loading

      const token = localStorage.getItem("token");
      const res = await axiosInstance.post(
        `/password/decrypt/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const dec = res.data.decrypted || res.data.data?.decrypted || "";
      setRevealed((r) => ({ ...r, [id]: dec || "<empty>" }));
    } catch (err) {
      console.error("Decrypt error:", err);
      error("Failed to reveal password");
      setRevealed((r) => {
        const copy = { ...r };
        delete copy[id];
        return copy;
      });
    } finally {
      revealLoadingRef.current[id] = false;
    }
  };

  // client selection helper for datalist
  const clientOptions = useMemo(
    () =>
      clients.map((c) => ({
        label: c.name,
        id: c._id,
      })),
    [clients]
  );

  // helper to pick client id by typed name (datalist input returns client name)
  const getClientIdByName = (name) => {
    const found = clients.find(
      (c) =>
        c.name === name || c.name.toLowerCase() === String(name).toLowerCase()
    );
    return found?._id || "";
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 font-medium px-3 py-2 bg-white rounded-lg shadow-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <h2 className="text-2xl font-semibold text-gray-800">Passwords</h2>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              className="pl-10 pr-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none w-64"
              placeholder="Search clients / username / category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              list="client-filter-list"
              placeholder="Filter by client..."
              value={clients.find((c) => c._id === filterClientId)?.name || ""}
              onChange={(e) => {
                // if user types, try to find id; if typed value equals known name, set id, else empty
                const id = getClientIdByName(e.target.value);
                setFilterClientId(id || "");
              }}
              className="px-3 py-2 border rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 outline-none w-56"
            />
            <datalist id="client-filter-list">
              {clientOptions.map((c) => (
                <option key={c.id} value={c.label} />
              ))}
            </datalist>
          </div>

          <button
            onClick={openAddModal}
            className="ml-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-base border-collapse">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">Client</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Username</th>
              <th className="p-3 text-left">Password</th>
              <th className="p-3 text-left">Remarks</th>
              <th className="p-3 text-left">Last Updated</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPasswords.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No passwords found.
                </td>
              </tr>
            )}

            {filteredPasswords.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50 transition">
                <td className="p-3 font-medium">{p.client_id?.name || "-"}</td>
                <td className="p-3">{p.category?.name || "-"}</td>{" "}
                <td className="p-3">{p.username || "-"}</td>
                <td className="p-3 flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm select-all">
                      {revealed[p._id] ? revealed[p._id] : "••••••••"}
                    </span>
                  </div>
                </td>
                <td className="p-3">{p.remarks || "-"}</td>
                <td className="p-3">
                  {p.lastUpdated
                    ? new Date(p.lastUpdated).toLocaleString()
                    : "-"}
                </td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => toggleReveal(p._id, p.password)}
                    className="p-2 bg-gray-100 hover:bg-gray-200 rounded"
                    title={revealed[p._id] ? "Hide" : "Reveal"}
                  >
                    {revealed[p._id] ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>

                  <button
                    onClick={() => handleEdit(p)}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 rounded"
                    title="Edit"
                  >
                    <Edit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 rounded"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-start md:items-center z-50 p-4 overflow-auto">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl relative mt-20 md:mt-0">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
              onClick={() => setModalOpen(false)}
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              {editingId ? "Edit Password" : "Add Password"}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Client</label>
                <input
                  list="clients-list"
                  value={
                    clients.find((c) => c._id === newData.client_id)?.name || ""
                  }
                  onChange={(e) => {
                    // set by typed name -> find id
                    const id = getClientIdByName(e.target.value);
                    setNewData((s) => ({ ...s, client_id: id || "" }));
                    setClientSearch(e.target.value);
                  }}
                  placeholder="Select client"
                  className="border px-3 py-2 rounded w-full"
                />
                <datalist id="clients-list">
                  {clients.map((c) => (
                    <option key={c._id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-sm text-gray-600">Category</label>

                <select
                  value={newData.category}
                  onChange={(e) =>
                    setNewData((s) => ({
                      ...s,
                      category: e.target.value,
                    }))
                  }
                  className="border px-3 py-2 rounded w-full"
                >
                  <option value="">Select Category</option>

                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm text-gray-600">Username</label>
                <input
                  value={newData.username}
                  onChange={(e) =>
                    setNewData((s) => ({ ...s, username: e.target.value }))
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">
                  {editingId
                    ? "New Password (leave blank to keep existing)"
                    : "Password"}
                </label>
                <input
                  type="password"
                  value={newData.password}
                  onChange={(e) =>
                    setNewData((s) => ({ ...s, password: e.target.value }))
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Remarks</label>
                <input
                  value={newData.remarks}
                  onChange={(e) =>
                    setNewData((s) => ({ ...s, remarks: e.target.value }))
                  }
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
              >
                {editingId ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation fallback modal (optional) */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="font-semibold text-lg mb-2">Confirm Delete</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this entry?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
