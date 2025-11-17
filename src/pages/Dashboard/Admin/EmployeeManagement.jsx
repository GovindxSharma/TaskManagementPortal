import React, { useState, useEffect } from "react";
import { Pencil, Trash2, UserPlus, ArrowLeft, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Loader from "../../../components/layout/Loader";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000/user";

const Employees = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    role: "",
    email: "",
    phone: "",
    department: "",
    joiningDate: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // -----------------------------------------
  // 📌 FETCH EMPLOYEES
  // -----------------------------------------
  const fetchEmployees = async () => {
    try {
      const res = await axios.get(`${API}/employees`, { withCredentials: true });
      setEmployees(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch employees:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // -----------------------------------------
  // 📌 ADD or UPDATE EMPLOYEE
  // -----------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `${API}/employees/${editingId}`,
          form,
          { withCredentials: true }
        );
      } else {
        await axios.post(`${API}/employees`, form, { withCredentials: true });
      }

      fetchEmployees();
      closeModal();
    } catch (err) {
      console.error("Error saving employee:", err);
    }
  };

  // -----------------------------------------
  // 📌 DELETE EMPLOYEE
  // -----------------------------------------
  const handleDelete = async (id) => {
    if (!confirm("Delete this employee?")) return;

    try {
      await axios.delete(`${API}/employees/${id}`, { withCredentials: true });
      fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
    }
  };

  const openAddModal = () => {
    setForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      department: "",
      joiningDate: "",
    });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (emp) => {
    setForm(emp);
    setEditingId(emp._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({
      name: "",
      role: "",
      email: "",
      phone: "",
      department: "",
      joiningDate: "",
    });
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.role.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.department.toLowerCase().includes(search.toLowerCase())
  );

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

        {/* Search + Add */}
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
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Role</th>
              <th className="p-3 text-left hidden md:table-cell">Department</th>
              <th className="p-3 text-left hidden md:table-cell">Email</th>
              <th className="p-3 text-left hidden md:table-cell">Phone</th>
              <th className="p-3 text-left hidden lg:table-cell">
                Joining Date
              </th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredEmployees.map((emp) => (
              <tr
                key={emp._id}
                className="border-b last:border-0 hover:bg-gray-50 transition"
              >
                <td className="p-3 font-medium text-gray-800">{emp.name}</td>
                <td className="p-3 text-gray-700">{emp.role}</td>
                <td className="p-3 text-gray-700 hidden md:table-cell">
                  {emp.department}
                </td>
                <td className="p-3 text-gray-600 hidden md:table-cell">
                  {emp.email}
                </td>
                <td className="p-3 text-gray-600 hidden md:table-cell">
                  {emp.phone}
                </td>
                <td className="p-3 text-gray-600 hidden lg:table-cell">
                  {emp.joiningDate?.slice(0, 10)}
                </td>
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
                  colSpan="7"
                  className="text-center py-6 text-gray-400 italic"
                >
                  No employees found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
              {editingId ? "Edit Employee" : "Add New Employee"}
            </h3>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {/* Inputs */}
              {["name", "role", "department", "email", "phone", "joiningDate"].map(
                (key) => (
                  <div key={key}>
                    <label className="text-sm text-gray-600">
                      {key === "name"
                        ? "Full Name"
                        : key === "joiningDate"
                        ? "Joining Date"
                        : key.charAt(0).toUpperCase() + key.slice(1)}
                    </label>

                    <input
                      type={key === "joiningDate" ? "date" : "text"}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none"
                      value={form[key]}
                      onChange={(e) =>
                        setForm({ ...form, [key]: e.target.value })
                      }
                      required={key === "name" || key === "email" || key === "role"}
                    />
                  </div>
                )
              )}

              <div className="sm:col-span-2 flex justify-end">
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
