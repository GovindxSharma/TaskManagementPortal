import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building, Layers, X } from "lucide-react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");

  // Account state
  const [account, setAccount] = useState({
    name: "Admin User",
    email: "admin@example.com",
    password: "",
    newPassword: "",
  });

  // Company state
  const [company, setCompany] = useState({
    name: "My Company Pvt Ltd",
    email: "info@company.com",
    phone: "+91 9876543210",
    address: "123, Corporate Street, Mumbai",
  });

  // Categories state
  const [categories, setCategories] = useState([
    { label: "1 - 20 Clients", price: 3000 },
    { label: "21 - 50 Clients", price: 7000 },
    { label: "51 - 150 Clients", price: 15000 },
  ]);

  const handleAccountChange = (e) => {
    setAccount({ ...account, [e.target.name]: e.target.value });
  };

  const handleCompanyChange = (e) => {
    setCompany({ ...company, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (index, value) => {
    const updated = [...categories];
    updated[index].price = value;
    setCategories(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Header */}
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
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-md p-6 space-y-6">
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
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={account.password}
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
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>
              <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                Update Account
              </button>
            </div>
          )}

          {activeTab === "company" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Company Settings
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-gray-600 mb-1">
                    Company Name
                  </label>
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
                  <label className="block text-gray-600 mb-1">Address</label>
                  <input
                    type="text"
                    name="address"
                    value={company.address}
                    onChange={handleCompanyChange}
                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
              <button className="mt-4 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition">
                Update Company
              </button>
            </div>
          )}

          {activeTab === "categories" && (
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Categories
              </h2>
              <div className="space-y-4">
                {categories.map((cat, i) => (
                  <div key={i} className="flex items-center gap-4 md:gap-6">
                    <span className="w-48 font-medium text-gray-700">
                      {cat.label}
                    </span>
                    <input
                      type="number"
                      value={cat.price}
                      onChange={(e) => handleCategoryChange(i, e.target.value)}
                      className="border border-gray-300 rounded-lg p-2 w-32 focus:ring-2 focus:ring-teal-400"
                    />
                  </div>
                ))}
              </div>
              <button className="mt-4 bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition">
                Update Categories
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
