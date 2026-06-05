import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Layers, X, Trash2, Plus, Tags } from "lucide-react";
import { useToast } from "../layout/ToastProvider.jsx";

// API imports
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./CategorySettings.jsx";
import {
  getDropdowns,
  createDropdown,
  updateDropdown,
  deleteDropdown,
} from "./DropdownSettings.jsx";
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
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);
  const [licenseCategories, setLicenseCategories] = useState([]);
  const [passwordCategories, setPasswordCategories] = useState([]);

  // --- company dropdown & business units state ---
  const [companyDropdowns, setCompanyDropdowns] = useState([]);
  const [selectedCompanyDropdown, setSelectedCompanyDropdown] = useState(null);
  const [buDropdowns, setBuDropdowns] = useState([]);
  const [loadingCompanyDropdowns, setLoadingCompanyDropdowns] = useState(false);
  const [loadingBuDropdowns, setLoadingBuDropdowns] = useState(false);

  const fetchCompanyDropdowns = async () => {
    try {
      setLoadingCompanyDropdowns(true);
      const data = await getDropdowns("companyName");
      setCompanyDropdowns(data || []);
      if (data && data.length > 0) {
        const first = data[0];
        setSelectedCompanyDropdown(first);
        fetchBuDropdowns(first._id);
      } else {
        setSelectedCompanyDropdown(null);
        setBuDropdowns([]);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch company names");
    } finally {
      setLoadingCompanyDropdowns(false);
    }
  };

  const fetchBuDropdowns = async (companyDropdownId) => {
    try {
      setLoadingBuDropdowns(true);
      const data = await getDropdowns("businessUnit", companyDropdownId);
      setBuDropdowns(data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch business units");
    } finally {
      setLoadingBuDropdowns(false);
    }
  };

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

  const fetchDropdowns = async () => {
    try {
      setLoadingDropdowns(true);

      const [licenses, passwords] = await Promise.all([
        getDropdowns("license"),
        getDropdowns("password"),
      ]);

      setLicenseCategories(licenses || []);
      setPasswordCategories(passwords || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch categories");
    } finally {
      setLoadingDropdowns(false);
    }
  };

useEffect(() => {
  if (isAdmin) {
    fetchCategories();
    fetchCompany();
    fetchDropdowns();
  }
}, [isAdmin]);

useEffect(() => {
  if (activeTab === "company_dropdowns" && isAdmin) {
    fetchCompanyDropdowns();
  }
}, [activeTab, isAdmin]);

const handleAddCompanyDropdown = async () => {
  try {
    const created = await createDropdown({
      name: "New Company",
      type: "companyName",
    });
    setCompanyDropdowns([...companyDropdowns, created]);
    setSelectedCompanyDropdown(created);
    setBuDropdowns([]);
    toast.success("Company name added");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add company name");
  }
};

const handleDeleteCompanyDropdown = async (id) => {
  toast.confirmDelete({
    message: "Are you sure you want to delete this company name? All its business units will become unlinked.",
    onConfirm: async () => {
      try {
        await deleteDropdown(id);
        const updatedList = companyDropdowns.filter((x) => x._id !== id);
        setCompanyDropdowns(updatedList);
        if (selectedCompanyDropdown?._id === id) {
          if (updatedList.length > 0) {
            setSelectedCompanyDropdown(updatedList[0]);
            fetchBuDropdowns(updatedList[0]._id);
          } else {
            setSelectedCompanyDropdown(null);
            setBuDropdowns([]);
          }
        }
        toast.success("Company name deleted");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete company name");
      }
    },
  });
};

const handleUpdateCompanyDropdowns = async () => {
  try {
    await Promise.all(
      companyDropdowns.map((item) =>
        updateDropdown(item._id, {
          name: item.name,
        }),
      ),
    );
    toast.success("Company names updated successfully");
    fetchCompanyDropdowns();
  } catch (err) {
    console.error(err);
    toast.error("Failed to update company names");
  }
};

const handleAddBuDropdown = async () => {
  if (!selectedCompanyDropdown) {
    toast.warning("Please select a Company Name first");
    return;
  }
  try {
    const created = await createDropdown({
      name: "New Business Unit",
      type: "businessUnit",
      parent_id: selectedCompanyDropdown._id,
    });
    setBuDropdowns([...buDropdowns, created]);
    toast.success("Business unit added");
  } catch (err) {
    console.error(err);
    toast.error("Failed to add business unit");
  }
};

const handleDeleteBuDropdown = async (id) => {
  toast.confirmDelete({
    message: "Are you sure you want to delete this business unit?",
    onConfirm: async () => {
      try {
        await deleteDropdown(id);
        setBuDropdowns(buDropdowns.filter((x) => x._id !== id));
        toast.success("Business unit deleted");
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete business unit");
      }
    },
  });
};

const handleUpdateBuDropdowns = async () => {
  try {
    await Promise.all(
      buDropdowns.map((item) =>
        updateDropdown(item._id, {
          name: item.name,
        }),
      ),
    );
    toast.success("Business units updated successfully");
    if (selectedCompanyDropdown) {
      fetchBuDropdowns(selectedCompanyDropdown._id);
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to update business units");
  }
};

  // --- category handlers ---
const handleCategoryChange = (index, value) => {
  const updated = [...categories];

  // allow empty input while typing
  updated[index].price = value === "" ? "" : value;

  setCategories(updated);
  };
  
  const handleDropdownChange = (setter, list, index, value) => {
    const updated = [...list];
    updated[index].name = value;
    setter(updated);
  };

  const handleUpdateDropdowns = async (list) => {
    try {
      await Promise.all(
        list.map((item) =>
          updateDropdown(item._id, {
            name: item.name,
          }),
        ),
      );

      toast.success("Updated successfully");
      fetchDropdowns();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    }
  };

  const handleAddDropdown = async (type) => {
    try {
      const created = await createDropdown({
        name: "New Category",
        type,
      });

      if (type === "license") {
        setLicenseCategories([...licenseCategories, created]);
      } else {
        setPasswordCategories([...passwordCategories, created]);
      }

      toast.success("Category added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  const handleDeleteDropdown = async (id) => {
    toast.confirmDelete({
      message: "Are you sure you want to delete this category?",
      onConfirm: async () => {
        try {
          await deleteDropdown(id);

          setLicenseCategories(licenseCategories.filter((x) => x._id !== id));

          setPasswordCategories(passwordCategories.filter((x) => x._id !== id));

          toast.success("Category deleted successfully");
        } catch (err) {
          console.error(err);
          toast.error("Failed to delete category");
        }
      },
    });
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
                <Layers className="text-teal-500" /> Fees
              </button>
              <button
                onClick={() => setActiveTab("dropdowns")}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-purple-100 transition ${
                  activeTab === "dropdowns" ? "bg-purple-100 font-semibold" : ""
                }`}
              >
                <Tags size={20} className="text-purple-500 flex-shrink-0" />
                <span className="text-left">License & Password Categories</span>
              </button>
              <button
                onClick={() => setActiveTab("company_dropdowns")}
                className={`flex items-center gap-2 p-3 rounded-lg hover:bg-orange-100 transition ${
                  activeTab === "company_dropdowns" ? "bg-orange-100 font-semibold" : ""
                }`}
              >
                <Building size={20} className="text-orange-500 flex-shrink-0" />
                <span className="text-left">Company & BUs Settings</span>
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
                Fees
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

          {isAdmin && activeTab === "dropdowns" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                License & Password Categories
              </h2>

              {loadingDropdowns ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* LICENSE */}
                  <div className="border rounded-xl p-5 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        License Categories
                      </h3>

                      <button
                        onClick={() => handleAddDropdown("license")}
                        className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {licenseCategories.map((item, index) => (
                        <div key={item._id} className="flex gap-2">
                          <input
                            value={item.name}
                            onChange={(e) =>
                              handleDropdownChange(
                                setLicenseCategories,
                                licenseCategories,
                                index,
                                e.target.value,
                              )
                            }
                            className="flex-1 border rounded-lg p-2"
                          />

                          <button
                            onClick={() => handleDeleteDropdown(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateDropdowns(licenseCategories)}
                      className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
                    >
                      Save License Categories
                    </button>
                  </div>

                  {/* PASSWORD */}
                  <div className="border rounded-xl p-5 bg-gray-50">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-semibold text-lg">
                        Password Categories
                      </h3>

                      <button
                        onClick={() => handleAddDropdown("password")}
                        className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                    </div>

                    <div className="space-y-3">
                      {passwordCategories.map((item, index) => (
                        <div key={item._id} className="flex gap-2">
                          <input
                            value={item.name}
                            onChange={(e) =>
                              handleDropdownChange(
                                setPasswordCategories,
                                passwordCategories,
                                index,
                                e.target.value,
                              )
                            }
                            className="flex-1 border rounded-lg p-2"
                          />

                          <button
                            onClick={() => handleDeleteDropdown(item._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleUpdateDropdowns(passwordCategories)}
                      className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg"
                    >
                      Save Password Categories
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAdmin && activeTab === "company_dropdowns" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Company & Business Units Settings
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Configure Company Names and their corresponding Business Units for client registration.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* COMPANY NAMES PANEL */}
                <div className="border rounded-xl p-5 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">Company Names</h3>
                    <button
                      onClick={handleAddCompanyDropdown}
                      className="bg-orange-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold hover:bg-orange-600 transition cursor-pointer"
                    >
                      <Plus size={16} /> Add Company
                    </button>
                  </div>

                  {loadingCompanyDropdowns ? (
                    <p className="text-gray-500 text-sm">Loading companies...</p>
                  ) : companyDropdowns.length === 0 ? (
                    <p className="text-gray-400 text-sm italic py-4 text-center">No companies added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {companyDropdowns.map((item, index) => (
                        <div
                          key={item._id}
                          onClick={() => {
                            setSelectedCompanyDropdown(item);
                            fetchBuDropdowns(item._id);
                          }}
                          className={`flex gap-2 p-2 rounded-lg border transition cursor-pointer ${
                            selectedCompanyDropdown?._id === item._id
                              ? "border-orange-500 bg-orange-50/50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >
                          <input
                            value={item.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) =>
                              handleDropdownChange(
                                setCompanyDropdowns,
                                companyDropdowns,
                                index,
                                e.target.value,
                              )
                            }
                            className="flex-1 border rounded-lg p-2 text-sm focus:outline-orange-500 bg-transparent border-none focus:ring-0"
                          />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCompanyDropdown(item._id);
                            }}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {companyDropdowns.length > 0 && (
                    <button
                      onClick={handleUpdateCompanyDropdowns}
                      className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg font-semibold text-sm transition cursor-pointer"
                    >
                      Save Company Names
                    </button>
                  )}
                </div>

                {/* BUSINESS UNITS PANEL */}
                <div className="border rounded-xl p-5 bg-gray-50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-lg">
                      {selectedCompanyDropdown
                        ? `BUs for: ${selectedCompanyDropdown.name}`
                        : "Business Units"}
                    </h3>
                    <button
                      onClick={handleAddBuDropdown}
                      disabled={!selectedCompanyDropdown}
                      className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition cursor-pointer ${
                        selectedCompanyDropdown
                          ? "bg-blue-500 hover:bg-blue-600 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <Plus size={16} /> Add BU
                    </button>
                  </div>

                  {!selectedCompanyDropdown ? (
                    <p className="text-gray-400 text-sm italic py-8 text-center">
                      Select a Company Name to manage its Business Units
                    </p>
                  ) : loadingBuDropdowns ? (
                    <p className="text-gray-500 text-sm">Loading BUs...</p>
                  ) : buDropdowns.length === 0 ? (
                    <p className="text-gray-400 text-sm italic py-4 text-center">
                      No business units added for this company yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {buDropdowns.map((item, index) => (
                        <div key={item._id} className="flex gap-2">
                          <input
                            value={item.name}
                            onChange={(e) =>
                              handleDropdownChange(
                                setBuDropdowns,
                                buDropdowns,
                                index,
                                e.target.value,
                              )
                            }
                            className="flex-1 border rounded-lg p-2 text-sm bg-white border-gray-200 focus:outline-blue-500"
                          />

                          <button
                            onClick={() => handleDeleteBuDropdown(item._id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedCompanyDropdown && buDropdowns.length > 0 && (
                    <button
                      onClick={handleUpdateBuDropdowns}
                      className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold text-sm transition cursor-pointer"
                    >
                      Save Business Units
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
