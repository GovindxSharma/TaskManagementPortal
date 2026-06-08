import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Search,
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

/** Extract the most meaningful error message from various error shapes */
const extractErrorMessage = (err, fallback = "An error occurred") => {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
};

const sortByName = (arr) =>
  [...arr].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

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
      toast.error(extractErrorMessage(err, "Failed to update account"));
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
      .catch((err) =>
        toast.error(extractErrorMessage(err, "Failed to fetch company info")),
      )
      .finally(() => setLoading(false));
  }, [userLS.company_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e) =>
    setCompany((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateCompanyApi(userLS.company_id, company);
      toast.success("Company updated successfully");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update company"));
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

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to fetch fee categories"));
    } finally {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

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
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add category"));
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
        } catch (err) {
          toast.error(extractErrorMessage(err, "Failed to delete category"));
        }
      },
    });
  };

  const handleSave = async () => {
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
      fetchCategories();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to update fees"));
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
      .catch((err) =>
        toast.error(
          extractErrorMessage(err, "Failed to fetch dropdown categories"),
        ),
      )
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const mutateList = (setter, index, value) =>
    setter((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], name: value };
      return updated;
    });

  const handleAdd = async (type, setter) => {
    try {
      const created = await createDropdown({ name: "New category", type });
      // Use functional updater to avoid stale closure on `list`
      setter((prev) => [...prev, created]);
      toast.success("Item added");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add item"));
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
        } catch (err) {
          toast.error(extractErrorMessage(err, "Failed to delete"));
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
    } catch (err) {
      // FIX: extract structured error message from response body
      toast.error(extractErrorMessage(err, `Failed to save ${label}`));
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
          onAdd={() => handleAdd("license", setLicenseItems)}
          onDelete={(id) => handleDelete(id, setLicenseItems)}
          onSave={() => handleSave(licenseItems, "License categories")}
          onItemChange={(i, val) => mutateList(setLicenseItems, i, val)}
        />
        <DropdownGroup
          title="Password categories"
          color="green"
          items={passwordItems}
          onAdd={() => handleAdd("password", setPasswordItems)}
          onDelete={(id) => handleDelete(id, setPasswordItems)}
          onSave={() => handleSave(passwordItems, "Password categories")}
          onItemChange={(i, val) => mutateList(setPasswordItems, i, val)}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab: Company & Business Units
// ---------------------------------------------------------------------------

function CompanyBUTab({ toast }) {
  const [companies, setCompanies] = useState([]);
  const [buMap, setBuMap] = useState({});
  const [openId, setOpenId] = useState(null);
  const [loadingInit, setLoadingInit] = useState(false);
  const [savingCompany, setSavingCompany] = useState(null);
  const [savingBUs, setSavingBUs] = useState(null);
  const [search, setSearch] = useState("");

  // Refs to prevent double-firing from Enter + button click both triggering save
  const savingCompanyRef = useRef(false);
  const savingBUsRef = useRef(false);

  // ---- Initial load ----
  useEffect(() => {
    setLoadingInit(true);
    getDropdowns("companyName")
      .then(async (list) => {
        list = list || [];
        // Sort alphabetically on initial load
        const sorted = sortByName(list);
        setCompanies(sorted);
        const results = await Promise.all(
          sorted.map((c) =>
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
      })
      .catch((err) =>
        toast.error(extractErrorMessage(err, "Failed to fetch companies")),
      )
      .finally(() => setLoadingInit(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  // ---- Search filter — still searched against sorted list ----
  const filteredCompanies = companies.filter((c) =>
    (c.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  // ---- Company CRUD ----
  const handleAddCompany = async () => {
    try {
      const created = await createDropdown({ name: "", type: "companyName" });
      // FIX: prepend new company so it appears at the top, then open it
      setCompanies((prev) => [created, ...prev]);
      setBuMap((prev) => ({ ...prev, [created._id]: [] }));
      setOpenId(created._id);
      setTimeout(() => {
        document.getElementById(`cname-${created._id}`)?.focus();
      }, 60);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add company"));
    }
  };

  const handleDeleteCompany = (id) => {
    toast.confirmDelete({
      message: "Delete this company? All its business units will be removed.",
      onConfirm: async () => {
        try {
          await deleteDropdown(id);
          setCompanies((prev) => prev.filter((c) => c._id !== id));
          setBuMap((prev) => {
            const copy = { ...prev };
            delete copy[id];
            return copy;
          });
          if (openId === id) setOpenId(null);
          toast.success("Company deleted");
        } catch (err) {
          toast.error(extractErrorMessage(err, "Failed to delete company"));
        }
      },
    });
  };

  // Guard with ref so Enter keydown + button click can't both fire
  const handleSaveCompanyName = async (company) => {
    if (savingCompanyRef.current) return;
    if (!company.name.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }
    savingCompanyRef.current = true;
    try {
      setSavingCompany(company._id);
      await updateDropdown(company._id, { name: company.name.trim() });
      // Re-sort list alphabetically after a name is saved
      setCompanies((prev) => sortByName(prev));
      toast.success("Company name saved");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Failed to save company name"),
      );
    } finally {
      setSavingCompany(null);
      setTimeout(() => {
        savingCompanyRef.current = false;
      }, 300);
    }
  };

  const updateCompanyName = (id, value) =>
    setCompanies((prev) =>
      prev.map((c) => (c._id === id ? { ...c, name: value } : c)),
    );

  // ---- BU CRUD ----
  const handleAddBU = async (companyId) => {
    try {
      const created = await createDropdown({
        name: "",
        type: "businessUnit",
        parent_id: companyId,
      });
      setBuMap((prev) => ({
        ...prev,
        [companyId]: [...(prev[companyId] || []), created],
      }));
      setTimeout(() => {
        document.getElementById(`bu-${created._id}`)?.focus();
      }, 60);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to add business unit"));
    }
  };

  const handleDeleteBU = (companyId, buId) => {
    toast.confirmDelete({
      message: "Delete this business unit?",
      onConfirm: async () => {
        try {
          await deleteDropdown(buId);
          setBuMap((prev) => ({
            ...prev,
            [companyId]: (prev[companyId] || []).filter((b) => b._id !== buId),
          }));
          toast.success("Business unit deleted");
        } catch (err) {
          toast.error(extractErrorMessage(err, "Failed to delete business unit"));
        }
      },
    });
  };

  // Guard with ref so button click can't double-fire
  const handleSaveBUs = async (companyId) => {
    if (savingBUsRef.current) return;
    const bus = buMap[companyId] || [];
    if (bus.some((b) => !b.name.trim())) {
      toast.error("All business unit names must be filled before saving");
      return;
    }
    savingBUsRef.current = true;
    try {
      setSavingBUs(companyId);
      await Promise.all(
        bus.map((b) => updateDropdown(b._id, { name: b.name.trim() })),
      );
      toast.success("Business units saved");
    } catch (err) {
      // FIX: extract structured error message from response body
      toast.error(extractErrorMessage(err, "Failed to save business units"));
    } finally {
      setSavingBUs(null);
      setTimeout(() => {
        savingBUsRef.current = false;
      }, 300);
    }
  };

  const updateBUName = (companyId, buId, value) =>
    setBuMap((prev) => ({
      ...prev,
      [companyId]: (prev[companyId] || []).map((b) =>
        b._id === buId ? { ...b, name: value } : b,
      ),
    }));

  if (loadingInit) return <p className="text-sm text-gray-400">Loading…</p>;

  return (
    <div>
      <SectionHeader
        title="Company & business units"
        description="Expand a company to view and manage its business units."
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-blue-400 focus:outline-none transition"
          />
        </div>

        <button
          onClick={handleAddCompany}
          className="flex items-center gap-2 border border-gray-300 text-sm font-medium text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition flex-shrink-0"
        >
          <Plus size={15} /> Add company
        </button>
      </div>

      {/* Empty states */}
      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <Building size={32} className="opacity-40" />
          <p className="text-sm italic">
            No companies yet. Add one to get started.
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Search size={28} className="opacity-40" />
          <p className="text-sm italic">No companies match "{search}"</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredCompanies.map((company) => {
            const isOpen = openId === company._id;
            const bus = buMap[company._id] || [];

            return (
              <div
                key={company._id}
                className={`border rounded-xl overflow-hidden transition-colors ${
                  isOpen ? "border-gray-300" : "border-gray-200"
                }`}
              >
                {/* Company header row */}
                <div
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer bg-white hover:bg-gray-50 transition"
                  onClick={() => toggle(company._id)}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition ${
                      isOpen
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Building size={15} />
                  </div>

                  {/* Editable name */}
                  <input
                    id={`cname-${company._id}`}
                    value={company.name}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      updateCompanyName(company._id, e.target.value)
                    }
                    onKeyDown={(e) => {
                      // blur on Enter so the button click handler fires instead — avoids double toast
                      if (e.key === "Enter") e.target.blur();
                    }}
                    placeholder="Enter company name…"
                    className={`flex-1 text-sm font-medium bg-transparent border-none outline-none min-w-0 ${
                      !company.name.trim()
                        ? "text-gray-400 italic"
                        : "text-gray-800"
                    }`}
                  />

                  {/* BU count / Save name btn */}
                  {isOpen ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSaveCompanyName(company);
                      }}
                      disabled={savingCompany === company._id}
                      className="text-xs font-medium border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50 flex-shrink-0"
                    >
                      {savingCompany === company._id ? "Saving…" : "Save name"}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full flex-shrink-0">
                      {!company.name.trim()
                        ? "unsaved"
                        : `${bus.length} BU${bus.length !== 1 ? "s" : ""}`}
                    </span>
                  )}

                  <ChevronRight
                    size={15}
                    className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                  />

                  {/* Delete company */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCompany(company._id);
                    }}
                    className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                    aria-label={`Delete ${company.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* BU body (expanded) */}
                {isOpen && (
                  <div className="border-t border-gray-100 px-4 py-4 bg-gray-50">
                    {bus.length === 0 ? (
                      <p className="text-sm text-gray-400 italic text-center py-4">
                        No business units yet.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-2 mb-4">
                        {bus.map((bu) => (
                          <div key={bu._id} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                            <input
                              id={`bu-${bu._id}`}
                              value={bu.name}
                              onChange={(e) =>
                                updateBUName(
                                  company._id,
                                  bu._id,
                                  e.target.value,
                                )
                              }
                              placeholder="Enter business unit name…"
                              className={`flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition ${
                                !bu.name.trim()
                                  ? "italic text-gray-400"
                                  : "text-gray-800"
                              }`}
                            />
                            <button
                              onClick={() =>
                                handleDeleteBU(company._id, bu._id)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                              aria-label={`Delete ${bu.name}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleAddBU(company._id)}
                        className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-white hover:text-gray-900 transition"
                      >
                        <Plus size={14} /> Add business unit
                      </button>
                      {bus.length > 0 && (
                        <button
                          onClick={() => handleSaveBUs(company._id)}
                          disabled={savingBUs === company._id}
                          className="flex items-center gap-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          {savingBUs === company._id
                            ? "Saving…"
                            : "Save business units"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
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