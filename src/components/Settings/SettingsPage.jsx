import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Layers,
  X,
  Trash2,
  Plus,
  Tags,
  ChevronRight,
  GitBranch,
} from "lucide-react";
import { useToast } from "../layout/ToastProvider.jsx";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const getUserFromLS = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {description && (
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition";

function SaveButton({ onClick, loading, label, color = "blue" }) {
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-600",
    green: "bg-green-500 hover:bg-green-600",
    teal: "bg-teal-600 hover:bg-teal-700",
    orange: "bg-orange-500 hover:bg-orange-600",
  };
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`mt-5 ${colors[color]} text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50`}
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Tab: Account
// ---------------------------------------------------------------------------

function AccountTab({ userLS, toast }) {
  const [account, setAccount] = useState({
    name: userLS.name || "",
    email: userLS.email || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setAccount((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (
      account.newPassword &&
      account.newPassword !== account.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }
    try {
      setLoading(true);
      await updateUserApi(userLS._id, {
        name: account.name,
        email: account.email,
        ...(account.newPassword ? { password: account.newPassword } : {}),
      });
      toast.success("Account updated successfully");
      setAccount((prev) => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      toast.error(err?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SectionHeader title="Account settings" />
      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Name">
          <input
            type="text"
            name="name"
            value={account.name}
            onChange={handleChange}
            className={inputCls}
          />
        </FormField>
        <FormField label="Email">
          <input
            type="email"
            name="email"
            value={account.email}
            onChange={handleChange}
            className={inputCls}
          />
        </FormField>
        <FormField label="New password">
          <input
            type="password"
            name="newPassword"
            value={account.newPassword}
            onChange={handleChange}
            placeholder="Leave blank to keep current"
            className={inputCls}
          />
        </FormField>
        <FormField label="Confirm password">
          <input
            type="password"
            name="confirmPassword"
            value={account.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            className={inputCls}
          />
        </FormField>
      </div>
      <SaveButton
        onClick={handleSave}
        loading={loading}
        label="Update account"
        color="blue"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Company
// ---------------------------------------------------------------------------

function CompanyTab({ userLS, toast }) {
  const [company, setCompany] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLS.company_id) return;
    setLoading(true);
    getCompanyById(userLS.company_id)
      .then((data) =>
        setCompany({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: data.location || "",
        }),
      )
      .catch(() => toast.error("Failed to fetch company info"))
      .finally(() => setLoading(false));
  }, [userLS.company_id]);

  const handleChange = (e) =>
    setCompany((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateCompanyApi(userLS.company_id, company);
      toast.success("Company updated successfully");
    } catch (err) {
      toast.error("Failed to update company");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !company.name)
    return <p className="text-gray-500 text-sm">Loading…</p>;

  return (
    <div>
      <SectionHeader title="Company settings" />
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { label: "Company name", name: "name", type: "text" },
          { label: "Email", name: "email", type: "email" },
          { label: "Phone", name: "phone", type: "text" },
          { label: "Location", name: "location", type: "text" },
        ].map(({ label, name, type }) => (
          <FormField key={name} label={label}>
            <input
              type={type}
              name={name}
              value={company[name]}
              onChange={handleChange}
              className={inputCls}
            />
          </FormField>
        ))}
      </div>
      <SaveButton
        onClick={handleSave}
        loading={loading}
        label="Update company"
        color="green"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Fees (categories)
// ---------------------------------------------------------------------------

function FeesTab({ toast }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to fetch fee categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handlePriceChange = (index, value) =>
    setCategories((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], price: value };
      return updated;
    });

  const handleAdd = async () => {
    try {
      const created = await createCategory({ name: "New range", price: 0 });
      setCategories((prev) => [...prev, created]);
      toast.success("Category added");
    } catch {
      toast.error("Failed to add category");
    }
  };

  const handleDelete = (id) => {
    toast.confirmDelete({
      message: "Delete this fee category?",
      onConfirm: async () => {
        try {
          await deleteCategory(id);
          setCategories((prev) => prev.filter((c) => c._id !== id));
          toast.success("Category deleted");
        } catch {
          toast.error("Failed to delete category");
        }
      },
    });
  };

  const handleSave = async () => {
    // Validate: prices must be valid non-negative numbers
    const invalid = categories.some(
      (c) => c.price === "" || isNaN(Number(c.price)) || Number(c.price) < 0,
    );
    if (invalid) {
      toast.error("All prices must be valid non-negative numbers");
      return;
    }
    try {
      setLoading(true);
      await Promise.all(
        categories.map((c) =>
          updateCategory(c._id, { price: Number(c.price), name: c.name }),
        ),
      );
      toast.success("Fees updated successfully");
      fetch();
    } catch {
      toast.error("Failed to update fees");
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0)
    return <p className="text-gray-500 text-sm">Loading…</p>;

  return (
    <div>
      <SectionHeader
        title="Fees"
        description="Set price ranges for each category."
      />
      {categories.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No fee categories yet.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((cat, i) => (
            <div
              key={cat._id}
              className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-3 rounded-lg"
            >
              <span className="flex-1 text-sm font-medium text-gray-700 truncate">
                {cat.name}
              </span>
              <input
                type="number"
                min="0"
                value={cat.price}
                onChange={(e) => handlePriceChange(i, e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 w-28 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <button
                onClick={() => handleDelete(cat._id)}
                className="text-gray-400 hover:text-red-600 transition"
                aria-label={`Delete ${cat.name}`}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-3 mt-5">
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 bg-teal-50 border border-teal-300 text-teal-700 text-sm px-4 py-2 rounded-lg hover:bg-teal-100 transition"
        >
          <Plus size={16} /> Add category
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-teal-600 text-white text-sm px-5 py-2 rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save fees"}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: License & Password dropdowns
// ---------------------------------------------------------------------------

function DropdownGroup({
  title,
  color,
  items,
  onAdd,
  onDelete,
  onSave,
  onItemChange,
}) {
  const accent = {
    blue: {
      addBtn: "bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100",
      saveBtn: "bg-blue-600 hover:bg-blue-700",
    },
    green: {
      addBtn: "bg-green-50 border-green-300 text-green-700 hover:bg-green-100",
      saveBtn: "bg-green-600 hover:bg-green-700",
    },
  }[color];

  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-base text-gray-800">{title}</h3>
        <button
          onClick={onAdd}
          className={`flex items-center gap-1.5 border text-sm px-3 py-1.5 rounded-lg transition ${accent.addBtn}`}
        >
          <Plus size={15} /> Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-400 italic text-center py-4">
          No items yet. Click "Add" to create one.
        </p>
      ) : (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={item._id} className="flex gap-2">
              <input
                value={item.name}
                onChange={(e) => onItemChange(index, e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-offset-0"
              />
              <button
                onClick={() => onDelete(item._id)}
                className="text-gray-400 hover:text-red-600 transition"
                aria-label={`Delete ${item.name}`}
              >
                <Trash2 size={17} />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <button
          onClick={onSave}
          className={`w-full text-white text-sm py-2 rounded-lg transition ${accent.saveBtn}`}
        >
          Save {title.toLowerCase()}
        </button>
      )}
    </div>
  );
}

function DropdownsTab({ toast }) {
  const [licenseItems, setLicenseItems] = useState([]);
  const [passwordItems, setPasswordItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([getDropdowns("license"), getDropdowns("password")])
      .then(([lic, pass]) => {
        setLicenseItems(lic || []);
        setPasswordItems(pass || []);
      })
      .catch(() => toast.error("Failed to fetch dropdown categories"))
      .finally(() => setLoading(false));
  }, []);

  const mutateList = (setter, index, value) =>
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: value };
      return updated;
    });

  const handleAdd = async (type, setter, list) => {
    try {
      const created = await createDropdown({ name: "New category", type });
      setter([...list, created]);
      toast.success("Item added");
    } catch {
      toast.error("Failed to add item");
    }
  };

  const handleDelete = (id, setter) => {
    toast.confirmDelete({
      message: "Delete this category?",
      onConfirm: async () => {
        try {
          await deleteDropdown(id);
          setter((prev) => prev.filter((x) => x._id !== id));
          toast.success("Deleted successfully");
        } catch {
          toast.error("Failed to delete");
        }
      },
    });
  };

  const handleSave = async (list, label) => {
    if (list.some((x) => !x.name.trim())) {
      toast.error("Category names cannot be empty");
      return;
    }
    try {
      await Promise.all(
        list.map((x) => updateDropdown(x._id, { name: x.name.trim() })),
      );
      toast.success(`${label} saved successfully`);
    } catch {
      toast.error("Failed to save");
    }
  };

  if (loading) return <p className="text-gray-500 text-sm">Loading…</p>;

  return (
    <div>
      <SectionHeader
        title="License & password categories"
        description="Manage dropdown options used during client registration."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DropdownGroup
          title="License categories"
          color="blue"
          items={licenseItems}
          onAdd={() => handleAdd("license", setLicenseItems, licenseItems)}
          onDelete={(id) => handleDelete(id, setLicenseItems)}
          onSave={() => handleSave(licenseItems, "License categories")}
          onItemChange={(i, val) => mutateList(setLicenseItems, i, val)}
        />
        <DropdownGroup
          title="Password categories"
          color="green"
          items={passwordItems}
          onAdd={() => handleAdd("password", setPasswordItems, passwordItems)}
          onDelete={(id) => handleDelete(id, setPasswordItems)}
          onSave={() => handleSave(passwordItems, "Password categories")}
          onItemChange={(i, val) => mutateList(setPasswordItems, i, val)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Company & Business Units (improved UI)
// ---------------------------------------------------------------------------

function CompanyBUTab({ toast }) {
  const [companies, setCompanies] = useState([]);
  const [buMap, setBuMap] = useState({}); // { companyId: [bu, ...] }
  const [selectedId, setSelectedId] = useState(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [loadingBUs, setLoadingBUs] = useState(false);
  const [savingCompanies, setSavingCompanies] = useState(false);
  const [savingBUs, setSavingBUs] = useState(false);

  // ---- Fetch companies + all their BUs in parallel on mount ----
  useEffect(() => {
    setLoadingCompanies(true);
    getDropdowns("companyName")
      .then(async (data) => {
        const list = data || [];
        setCompanies(list);
        if (list.length === 0) return;

        setSelectedId(list[0]._id);

        // Fetch BUs for every company in parallel so counts are correct immediately
        setLoadingBUs(true);
        try {
          const results = await Promise.all(
            list.map((c) =>
              getDropdowns("businessUnit", c._id)
                .then((bus) => ({ id: c._id, bus: bus || [] }))
                .catch(() => ({ id: c._id, bus: [] })),
            ),
          );
          const map = {};
          results.forEach(({ id, bus }) => {
            map[id] = bus;
          });
          setBuMap(map);
        } finally {
          setLoadingBUs(false);
        }
      })
      .catch(() => toast.error("Failed to fetch companies"))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const fetchBUs = useCallback((companyId) => {
    setLoadingBUs(true);
    getDropdowns("businessUnit", companyId)
      .then((data) =>
        setBuMap((prev) => ({ ...prev, [companyId]: data || [] })),
      )
      .catch(() => toast.error("Failed to fetch business units"))
      .finally(() => setLoadingBUs(false));
  }, []);

  const selectCompany = (id) => {
    setSelectedId(id);
    if (!buMap[id]) fetchBUs(id);
  };

  // ---- Company CRUD ----
  const handleAddCompany = async () => {
    try {
      const created = await createDropdown({
        name: "New company",
        type: "companyName",
      });
      setCompanies((prev) => [...prev, created]);
      setSelectedId(created._id);
      setBuMap((prev) => ({ ...prev, [created._id]: [] }));
      toast.success("Company added");
      // auto-focus the new input
      setTimeout(() => {
        document.getElementById(`company-input-${created._id}`)?.focus();
        document.getElementById(`company-input-${created._id}`)?.select();
      }, 60);
    } catch {
      toast.error("Failed to add company");
    }
  };

  const handleDeleteCompany = (id) => {
    toast.confirmDelete({
      message:
        "Delete this company? All its business units will become unlinked.",
      onConfirm: async () => {
        try {
          await deleteDropdown(id);
          setCompanies((prev) => {
            const updated = prev.filter((c) => c._id !== id);
            // pick next selected
            if (selectedId === id) {
              const next = updated[0]?._id ?? null;
              setSelectedId(next);
              if (next && !buMap[next]) fetchBUs(next);
            }
            return updated;
          });
          setBuMap((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
          toast.success("Company deleted");
        } catch {
          toast.error("Failed to delete company");
        }
      },
    });
  };

  const handleSaveCompanies = async () => {
    const invalid = companies.some((c) => !c.name.trim());
    if (invalid) {
      toast.error("Company names cannot be empty");
      return;
    }
    try {
      setSavingCompanies(true);
      await Promise.all(
        companies.map((c) => updateDropdown(c._id, { name: c.name.trim() })),
      );
      toast.success("Company names saved");
    } catch {
      toast.error("Failed to save company names");
    } finally {
      setSavingCompanies(false);
    }
  };

  const updateCompanyName = (id, value) =>
    setCompanies((prev) =>
      prev.map((c) => (c._id === id ? { ...c, name: value } : c)),
    );

  // ---- BU CRUD ----
  const currentBUs = buMap[selectedId] || [];

  const handleAddBU = async () => {
    if (!selectedId) return;
    try {
      const created = await createDropdown({
        name: "New business unit",
        type: "businessUnit",
        parent_id: selectedId,
      });
      setBuMap((prev) => ({
        ...prev,
        [selectedId]: [...(prev[selectedId] || []), created],
      }));
      toast.success("Business unit added");
      setTimeout(() => {
        document.getElementById(`bu-input-${created._id}`)?.focus();
        document.getElementById(`bu-input-${created._id}`)?.select();
      }, 60);
    } catch {
      toast.error("Failed to add business unit");
    }
  };

  const handleDeleteBU = (id) => {
    toast.confirmDelete({
      message: "Delete this business unit?",
      onConfirm: async () => {
        try {
          await deleteDropdown(id);
          setBuMap((prev) => ({
            ...prev,
            [selectedId]: (prev[selectedId] || []).filter((x) => x._id !== id),
          }));
          toast.success("Business unit deleted");
        } catch {
          toast.error("Failed to delete business unit");
        }
      },
    });
  };

  const handleSaveBUs = async () => {
    const invalid = currentBUs.some((b) => !b.name.trim());
    if (invalid) {
      toast.error("Business unit names cannot be empty");
      return;
    }
    try {
      setSavingBUs(true);
      await Promise.all(
        currentBUs.map((b) => updateDropdown(b._id, { name: b.name.trim() })),
      );
      toast.success("Business units saved");
    } catch {
      toast.error("Failed to save business units");
    } finally {
      setSavingBUs(false);
    }
  };

  const updateBUName = (id, value) =>
    setBuMap((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] || []).map((b) =>
        b._id === id ? { ...b, name: value } : b,
      ),
    }));

  // ---- Helpers ----
  const selectedCompany = companies.find((c) => c._id === selectedId);

  return (
    <div>
      <SectionHeader
        title="Company & business units"
        description="Manage company names and their business units for client registration."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ---- LEFT: Company Names ---- */}
        <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-800">
                Company names
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Click a row to manage its BUs
              </p>
            </div>
            <button
              onClick={handleAddCompany}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
            >
              <Plus size={14} /> Add company
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[380px] p-3 space-y-1.5">
            {loadingCompanies ? (
              <p className="text-sm text-gray-400 italic text-center py-8">
                Loading…
              </p>
            ) : companies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-gray-400">
                <Building size={28} className="opacity-40" />
                <p className="text-sm italic">
                  No companies yet. Add one to get started.
                </p>
              </div>
            ) : (
              companies.map((company) => {
                const isSelected = selectedId === company._id;
                const buCount = (buMap[company._id] || []).length;
                return (
                  <div
                    key={company._id}
                    onClick={() => selectCompany(company._id)}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition ${
                      isSelected
                        ? "border-orange-400 bg-orange-50"
                        : "border-transparent hover:border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 transition ${
                        isSelected
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      <Building size={15} />
                    </div>

                    {/* Editable name */}
                    <input
                      id={`company-input-${company._id}`}
                      value={company.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateCompanyName(company._id, e.target.value)
                      }
                      className="flex-1 text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-300 min-w-0"
                      placeholder="Company name"
                    />

                    {/* BU count badge / selected label */}
                    {isSelected ? (
                      <span className="text-[10px] font-semibold text-orange-500 uppercase tracking-wide flex-shrink-0">
                        selected
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full flex-shrink-0">
                        {buCount} BU{buCount !== 1 ? "s" : ""}
                      </span>
                    )}

                    <ChevronRight
                      size={14}
                      className={`flex-shrink-0 transition ${
                        isSelected ? "text-orange-400" : "text-gray-300"
                      }`}
                    />

                    {/* Delete */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCompany(company._id);
                      }}
                      className="flex-shrink-0 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                      aria-label={`Delete ${company.name}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Panel footer */}
          {companies.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleSaveCompanies}
                disabled={savingCompanies}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                {savingCompanies ? "Saving…" : "Save company names"}
              </button>
            </div>
          )}
        </div>

        {/* ---- RIGHT: Business Units ---- */}
        <div className="flex flex-col border border-gray-200 rounded-xl overflow-hidden bg-white">
          {/* Panel header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {selectedCompany ? selectedCompany.name : "Business units"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selectedCompany
                  ? `${currentBUs.length} business unit${currentBUs.length !== 1 ? "s" : ""}`
                  : "Select a company to manage BUs"}
              </p>
            </div>
            <button
              onClick={handleAddBU}
              disabled={!selectedId}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition flex-shrink-0 ${
                selectedId
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              <Plus size={14} /> Add BU
            </button>
          </div>

          {/* Panel body */}
          <div className="flex-1 overflow-y-auto min-h-[260px] max-h-[380px] p-3 space-y-1.5">
            {!selectedId ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-gray-400">
                <GitBranch size={28} className="opacity-40" />
                <p className="text-sm italic text-center">
                  Select a company on the left to view and manage its business
                  units
                </p>
              </div>
            ) : loadingBUs ? (
              <p className="text-sm text-gray-400 italic text-center py-8">
                Loading…
              </p>
            ) : currentBUs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-gray-400">
                <GitBranch size={28} className="opacity-40" />
                <p className="text-sm italic text-center">
                  No business units yet. Click "+ Add BU" to create one.
                </p>
              </div>
            ) : (
              currentBUs.map((bu) => (
                <div
                  key={bu._id}
                  className="group flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50 hover:border-blue-200 hover:bg-blue-50 transition"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                  <input
                    id={`bu-input-${bu._id}`}
                    value={bu.name}
                    onChange={(e) => updateBUName(bu._id, e.target.value)}
                    className="flex-1 text-sm bg-transparent border-none outline-none text-gray-800 min-w-0"
                    placeholder="Business unit name"
                  />
                  <button
                    onClick={() => handleDeleteBU(bu._id)}
                    className="flex-shrink-0 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    aria-label={`Delete ${bu.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Panel footer */}
          {selectedId && currentBUs.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
              <button
                onClick={handleSaveBUs}
                disabled={savingBUs}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
              >
                {savingBUs ? "Saving…" : "Save business units"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sidebar nav item
// ---------------------------------------------------------------------------

function NavItem({ label, icon: Icon, tab, activeTab, setActiveTab, color }) {
  const colors = {
    blue: "hover:bg-blue-50 data-[active=true]:bg-blue-100 data-[active=true]:text-blue-700",
    green:
      "hover:bg-green-50 data-[active=true]:bg-green-100 data-[active=true]:text-green-700",
    teal: "hover:bg-teal-50 data-[active=true]:bg-teal-100 data-[active=true]:text-teal-700",
    purple:
      "hover:bg-purple-50 data-[active=true]:bg-purple-100 data-[active=true]:text-purple-700",
    orange:
      "hover:bg-orange-50 data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700",
  };
  const iconColors = {
    blue: "text-blue-500",
    green: "text-green-500",
    teal: "text-teal-500",
    purple: "text-purple-500",
    orange: "text-orange-500",
  };

  return (
    <button
      data-active={activeTab === tab}
      onClick={() => setActiveTab(tab)}
      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-left transition text-gray-700 font-medium ${colors[color]}`}
    >
      <Icon size={18} className={iconColors[color]} />
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function SettingsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("account");

  const userLS = getUserFromLS();
  const isAdmin = userLS.role === "Admin";

  const tabs = [
    {
      tab: "account",
      label: "Account settings",
      icon: User,
      color: "blue",
      adminOnly: false,
    },
    {
      tab: "company",
      label: "Company settings",
      icon: Building,
      color: "green",
      adminOnly: true,
    },
    {
      tab: "categories",
      label: "Fees",
      icon: Layers,
      color: "teal",
      adminOnly: true,
    },
    {
      tab: "dropdowns",
      label: "License & password categories",
      icon: Tags,
      color: "purple",
      adminOnly: true,
    },
    {
      tab: "company_dropdowns",
      label: "Company & BU settings",
      icon: Building,
      color: "orange",
      adminOnly: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      {/* Page header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition"
          aria-label="Go back"
        >
          <X size={18} className="text-gray-700" />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <nav className="w-full md:w-56 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex flex-col gap-1 h-fit">
          {tabs
            .filter((t) => !t.adminOnly || isAdmin)
            .map((t) => (
              <NavItem
                key={t.tab}
                {...t}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ))}
        </nav>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {activeTab === "account" && (
            <AccountTab userLS={userLS} toast={toast} />
          )}
          {isAdmin && activeTab === "company" && (
            <CompanyTab userLS={userLS} toast={toast} />
          )}
          {isAdmin && activeTab === "categories" && <FeesTab toast={toast} />}
          {isAdmin && activeTab === "dropdowns" && (
            <DropdownsTab toast={toast} />
          )}
          {isAdmin && activeTab === "company_dropdowns" && (
            <CompanyBUTab toast={toast} />
          )}
        </div>
      </div>
    </div>
  );
}
