import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Layers, X, Trash2, Plus } from "lucide-react";
import { useToast } from "../layout/ToastProvider.jsx";

// API imports
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./CategorySettings.jsx";
import { updateUserApi } from "./AccountSettings.jsx";
import { getCompanyById, updateCompanyApi } from "./CompanySettings.jsx";

export default function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("account");

  // --- account info from localStorage ---
  const userLS = JSON.parse(localStorage.getItem("user") || "{}");
  const role = userLS.role;
  const isAdmin = role === "Admin";

  const [account, setAccount] = useState({
    name: userLS.name || "",
    email: userLS.email || "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- company info ---
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });

  // --- categories ---
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);

  const handleAccountChange = (e) =>
    setAccount({ ...account, [e.target.name]: e.target.value });
  const handleCompanyChange = (e) =>
    setCompany({ ...company, [e.target.name]: e.target.value });

  // --- admin-only API calls ---
  const fetchCategories = async () => {
    if (!isAdmin) return;
    try {
      setLoadingCategories(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchCompany = async () => {
    if (!isAdmin || !userLS.company_id) return;
    try {
      setLoadingCompany(true);
      const data = await getCompanyById(userLS.company_id);
      setCompany({
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: data.location || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch company info");
    } finally {
      setLoadingCompany(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchCategories();
      fetchCompany();
    }
  }, [isAdmin]);

  // --- category handlers ---
  const handleCategoryChange = (index, value) => {
    const updated = [...categories];
    updated[index].price = Number(value);
    setCategories(updated);
  };

  const handleUpdateCategories = async () => {
    if (!isAdmin) return;
    try {
      setLoadingCategories(true);
      await Promise.all(
        categories.map((cat) =>
          updateCategory(cat._id, { price: cat.price, name: cat.name })
        )
      );
      toast.success("Categories updated successfully");
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update categories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const handleAddCategory = async () => {
    if (!isAdmin) return;
    try {
      const newCat = { name: "New Range", price: 0 };
      const created = await createCategory(newCat);
      setCategories([...categories, created]);
      toast.success("Category added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!isAdmin) return;
    toast.confirmDelete({
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          setCategories(categories.filter((c) => c._id !== id));
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete category");
        }
      },
    });
  };

  // --- account update (everyone can do this) ---
  const handleUpdateAccount = async () => {
    try {
      setLoadingAccount(true);

      if (
        account.newPassword &&
        account.newPassword !== account.confirmPassword
      ) {
        toast.error("Passwords do not match");
        return;
      }

      const payload = {
        name: account.name,
        email: account.email,
        password: account.newPassword || undefined,
      };

      await updateUserApi(userLS._id, payload);

      toast.success("Account updated successfully!");
      setAccount({
        ...account,
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to update account");
    } finally {
      setLoadingAccount(false);
    }
  };

  // --- company update (admin only) ---
  const handleUpdateCompany = async () => {
    if (!isAdmin) return;
    try {
      setLoadingCompany(true);
      await updateCompanyApi(userLS.company_id, company);
      toast.success("Company updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update company");
    } finally {
      setLoadingCompany(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
        <button
          className="bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition"
          onClick={() => navigate(-1)}
        >
          <X className="text-gray-700" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white rounded-xl shadow-md p-4 flex flex-col gap-2">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 p-3 rounded-lg hover:bg-blue-100 transition ${
              activeTab === "account" ? "bg-blue-100 font-semibold" : ""
            }`}
          >
            <User className="text-blue-500" /> Account Settings
          </button>

          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab("company")}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-green-100 transition ${
                  activeTab === "company" ? "bg-green-100 font-semibold" : ""
                }`}
              >
                <Building className="text-green-500" /> Company Settings
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-teal-100 transition ${
                  activeTab === "categories" ? "bg-teal-100 font-semibold" : ""
                }`}
              >
                <Layers className="text-teal-500" /> Categories
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6 space-y-6">
          {/* Account */}
          {activeTab === "account" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Account Settings
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={account.name}
                    onChange={handleAccountChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={account.email}
                    onChange={handleAccountChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={account.newPassword}
                    onChange={handleAccountChange}
                    placeholder="Enter new password"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">
                    Re-enter Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={account.confirmPassword}
                    onChange={handleAccountChange}
                    placeholder="Re-enter new password"
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <button
                onClick={handleUpdateAccount}
                disabled={loadingAccount}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              >
                {loadingAccount ? "Updating..." : "Update Account"}
              </button>
            </div>
          )}

          {/* Company */}
          {isAdmin && activeTab === "company" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Company Settings
              </h2>
              {loadingCompany ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={company.name}
                      onChange={handleCompanyChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={company.email}
                      onChange={handleCompanyChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={company.phone}
                      onChange={handleCompanyChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-600 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={company.location}
                      onChange={handleCompanyChange}
                      className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={handleUpdateCompany}
                disabled={loadingCompany}
                className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              >
                {loadingCompany ? "Updating..." : "Update Company"}
              </button>
            </div>
          )}

          {/* Categories */}
          {isAdmin && activeTab === "categories" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Categories
              </h2>
              {loadingCategories ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : categories.length === 0 ? (
                <p className="text-gray-500">No categories available.</p>
              ) : (
                <div className="space-y-4">
                  {categories.map((cat, i) => (
                    <div
                      key={cat._id}
                      className="flex items-center gap-4 md:gap-6 bg-gray-50 p-3 rounded-lg shadow-sm"
                    >
                      <span className="w-48 font-medium text-gray-700">
                        {cat.name}
                      </span>
                      <input
                        type="number"
                        value={cat.price}
                        onChange={(e) =>
                          handleCategoryChange(i, e.target.value)
                        }
                        className="border border-gray-300 rounded-lg p-2 w-32 focus:ring-2 focus:ring-teal-400"
                      />
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddCategory}
                  className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition flex items-center gap-2"
                >
                  <Plus size={18} /> Add Category
                </button>
                <button
                  onClick={handleUpdateCategories}
                  className="bg-teal-700 text-white px-6 py-2 rounded-lg hover:bg-teal-800 transition"
                >
                  Update Categories
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
