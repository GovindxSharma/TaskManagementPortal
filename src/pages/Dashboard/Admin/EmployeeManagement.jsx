import React, { useEffect, useState } from "react";
import {
  Pencil,
  Trash2,
  UserPlus,
  ArrowLeft,
  Search,
  X,
  Eye,
  EyeOff,
  ClipboardCopy,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/layout/Loader";
import axiosInstance from "../../../api/axiosInstance";
import { useToast } from "../../../components/layout/ToastProvider.jsx";

const Employees = () => {
  const navigate = useNavigate();
  const { success, error, confirmDelete } = useToast();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_id: "",
    role: "Employee",
    user_id: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // FETCH EMPLOYEES
  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get("/user/employees");

      const employeesList =
        res.data.employees ||
        res.data.data?.employees ||
        res.data.data ||
        res.data.users ||
        [];

      setEmployees(employeesList);
    } catch (err) {
      console.error(err);
      error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ADD / UPDATE EMPLOYEE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...form };

      if (editingId) {
        if (!payload.password) delete payload.password;
        await axiosInstance.put(`/user/${editingId}`, payload);
        success("Employee updated");
      } else {
        if (!payload.password) return error("Password is required");
        await axiosInstance.post(`/user`, payload);
        success("Employee added");
      }

      fetchEmployees();
      closeModal();
    } catch (err) {
      console.error(err);
      error(err.response?.data?.message || "Failed to save employee");
    }
  };

  // DELETE
  const handleDelete = (id) => {
    confirmDelete({
      message: "Are you sure you want to delete this employee?",
      onConfirm: async () => {
        try {
          await axiosInstance.delete(`/user/${id}`);
          fetchEmployees();
        } catch (err) {
          console.error(err);
          error("Failed to delete employee");
        }
      },
    });
  };

  // OPEN ADD MODAL
  const openAddModal = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");

    setForm({
      name: "",
      email: "",
      password: "",
      company_id: userData?.company_id || "",
      user_id: "",
      role: "Employee",
    });

    setEditingId(null);
    setIsModalOpen(true);
  };

  // OPEN EDIT MODAL
  const handleEdit = (emp) => {
    setForm({
      name: emp.name,
      email: emp.email,
      password: "",
      company_id: emp.company_id,
      user_id: emp.user_id,
      role: emp.role || "Employee",
    });

    setEditingId(emp._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setShowPassword(false);
  };

  // SEARCH
  const filteredEmployees = employees.filter((emp) => {
    const s = search.toLowerCase();
    return (
      emp.name?.toLowerCase().includes(s) ||
      emp.email?.toLowerCase().includes(s) ||
      emp.user_id?.toLowerCase().includes(s)
    );
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 transition"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:block">Back</span>
          </button>

          <h2 className="text-2xl font-semibold text-gray-800">
            Employee Management
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center bg-white shadow-sm border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72">
            <Search size={18} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="ml-2 flex-1 outline-none text-gray-700 bg-transparent"
            />
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition w-full sm:w-auto"
          >
            <UserPlus size={18} />
            Add Employee
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr className="text-gray-700">
              <th className="p-3 text-left">User ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp._id}
                className="border-b last:border-0 hover:bg-gray-50 transition group"
              >
                <td className="p-3 font-medium text-gray-800 relative">
                  {emp.user_id || "—"}

                  {emp.user_id && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(emp.user_id);
                        success("Copied!");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100
                        p-1 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
                    >
                      <ClipboardCopy size={16} />
                    </button>
                  )}
                </td>

                <td className="p-3 font-medium text-gray-800">{emp.name}</td>
                <td className="p-3 text-gray-700">{emp.email}</td>
                <td className="p-3 text-gray-700">{emp.role}</td>

                <td className="p-3 flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(emp)}
                    className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg transition"
                  >
                    <Pencil size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(emp._id)}
                    className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}

            {filteredEmployees.length === 0 && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h3>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
              {editingId && (
                <div>
                  <label className="text-sm text-gray-600">User ID</label>
                  <input
                    type="text"
                    value={form.user_id}
                    disabled
                    className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                  />
                </div>
              )}

              <div>
                <label className="text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {/* ROLE */}
              <div>
                <label className="text-sm text-gray-600">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
                >
                  <option value="Employee">Employee</option>
                  <option value="Accountant">Accountant</option>
                </select>
              </div>

              {editingId ? (
                <div>
                  <label className="text-sm text-gray-600">
                    New Password (optional)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-sm text-gray-600">Password</label>
                  <input
                    type="password"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
                >
                  {editingId ? "Update Employee" : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
