import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Building,
  Building2,
  Layers,
  X,
  Trash2,
  Plus,
  Tags,
  Search,
  Pencil,
  Check,
  AlertTriangle,
  Loader2,
  Save,
  ChevronRight,
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
// Shared helpers
// ---------------------------------------------------------------------------

const getUserFromLS = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
};

const extractErrorMessage = (err, fallback = "An error occurred") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const sortByName = (arr) =>
  [...arr].sort((a, b) => (a.name || "").localeCompare(b.name || ""));

const normalize = (s) => (s || "").trim().toLowerCase();

const formatDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

function Spinner({ size = 16 }) {
  return <Loader2 size={size} className="animate-spin" />;
}

function Badge({ children, color = "gray" }) {
  const map = {
    gray: "bg-gray-100 text-gray-500",
    green: "bg-green-50 text-green-600 border border-green-200",
    amber: "bg-amber-50 text-amber-600 border border-amber-200",
    red: "bg-red-50 text-red-600 border border-red-200",
    blue: "bg-blue-50 text-blue-600 border border-blue-200",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`}
    >
      {children}
    </span>
  );
}

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
// Tab: Company & Business Units — improved
// ---------------------------------------------------------------------------

// ── Add-Company Modal ────────────────────────────────────────────────────────

function AddCompanyModal({ existingNames, onConfirm, onCancel, loading }) {
  const [name, setName] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  const isDuplicate =
    name.trim() && existingNames.some((n) => normalize(n) === normalize(name));

  const handleSubmit = () => {
    if (!name.trim() || isDuplicate) return;
    onConfirm(name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-orange-100 flex items-center justify-center">
            <Building2 size={18} className="text-orange-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Add company</h2>
            <p className="text-xs text-gray-500">
              Enter a name to create the record
            </p>
          </div>
        </div>

        <label className="block text-xs font-medium text-gray-600 mb-1">
          Company name
        </label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="e.g. Acme Corp"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
        />
        {isDuplicate && (
          <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
            <AlertTriangle size={12} /> A company with this name already exists.
          </p>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || isDuplicate || loading}
            className="px-5 py-2 text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition disabled:opacity-40 flex items-center gap-2"
          >
            {loading && <Spinner size={14} />}
            Create company
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Modal ────────────────────────────────────────────────

function DeleteConfirmModal({ company, buList, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Delete company</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5">
          <p className="text-sm font-semibold text-gray-800 mb-2">
            {company.name || "(Unnamed company)"}
          </p>
          {buList.length > 0 ? (
            <>
              <p className="text-xs text-gray-500 mb-2">
                The following {buList.length} business unit
                {buList.length !== 1 ? "s" : ""} will also be deleted:
              </p>
              <ul className="space-y-1">
                {buList.map((bu) => (
                  <li
                    key={bu._id}
                    className="flex items-center gap-1.5 text-xs text-gray-700"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {bu.name || "(Unnamed)"}
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-xs text-gray-500">No business units.</p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition disabled:opacity-40 flex items-center gap-2"
          >
            {loading && <Spinner size={14} />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Drawer ──────────────────────────────────────────────────────────────

function EditDrawer({
  company,
  initialBUs,
  allCompanyNames,
  onClose,
  onSaved,
  toast,
}) {
  const [companyName, setCompanyName] = useState(company.name || "");
  const [buRows, setBuRows] = useState(
    (initialBUs || []).map((b) => ({ ...b, _local: false })),
  );

  const [savingName, setSavingName] = useState(false);
  const [savingBUs, setSavingBUs] = useState(false);
  const [nameSaveState, setNameSaveState] = useState("idle"); // idle | saved | dirty
  const [buSaveState, setBuSaveState] = useState("idle");

  // Track name dirty state
  useEffect(() => {
    setNameSaveState(companyName !== company.name ? "dirty" : "idle");
  }, [companyName, company.name]);

  // Dirty check for BUs
  const buDirty =
    buRows.some((b) => b._local) ||
    buRows.some((b) => {
      const orig = initialBUs.find((x) => x._id === b._id);
      return orig && orig.name !== b.name;
    });

  // Duplicate detection
  const otherCompanyNames = allCompanyNames.filter(
    (n) => normalize(n) !== normalize(company.name),
  );
  const companyNameDuplicate =
    companyName.trim() !== "" &&
    companyName.trim() !== company.name &&
    otherCompanyNames.some((n) => normalize(n) === normalize(companyName));

  const buNameList = buRows.map((b) => normalize(b.name));
  const buDuplicateSet = new Set(
    buNameList.filter((n, i) => n && buNameList.indexOf(n) !== i),
  );

  // Save company name
  const handleSaveName = async () => {
    if (!companyName.trim()) {
      toast.error("Company name cannot be empty");
      return;
    }
    if (companyNameDuplicate) {
      toast.error("A company with this name already exists");
      return;
    }
    try {
      setSavingName(true);
      await updateDropdown(company._id, { name: companyName.trim() });
      setNameSaveState("saved");
      onSaved({ ...company, name: companyName.trim() }, null);
      setTimeout(() => setNameSaveState("idle"), 3000);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to save company name"));
    } finally {
      setSavingName(false);
    }
  };

  // Add a local-only BU row
  const handleAddBU = () => {
    setBuRows((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, name: "", _local: true },
    ]);
    setBuSaveState("dirty");
  };

  const handleBUChange = (id, value) => {
    setBuRows((prev) =>
      prev.map((b) => (b._id === id ? { ...b, name: value } : b)),
    );
    setBuSaveState("dirty");
  };

  // Delete BU — local rows just removed; persisted rows call API
  const handleDeleteBU = (id) => {
    const bu = buRows.find((b) => b._id === id);
    if (!bu) return;
    if (bu._local) {
      setBuRows((prev) => prev.filter((b) => b._id !== id));
      return;
    }
    deleteDropdown(id)
      .then(() => {
        setBuRows((prev) => prev.filter((b) => b._id !== id));
        toast.success("Business unit deleted");
        onSaved(null, { companyId: company._id, deletedBuId: id });
      })
      .catch((err) =>
        toast.error(extractErrorMessage(err, "Failed to delete business unit")),
      );
  };

  // Save BUs: create local ones, update changed existing ones
  const handleSaveBUs = async () => {
    if (buRows.some((b) => !b.name.trim())) {
      toast.error("All business unit names must be filled in");
      return;
    }
    if (buDuplicateSet.size > 0) {
      toast.error("Duplicate business unit names detected");
      return;
    }
    try {
      setSavingBUs(true);
      const results = await Promise.all(
        buRows.map((b) =>
          b._local
            ? createDropdown({
                name: b.name.trim(),
                type: "businessUnit",
                parent_id: company._id,
              })
            : updateDropdown(b._id, { name: b.name.trim() }),
        ),
      );
      const saved = results.map((r) => ({ ...r, _local: false }));
      setBuRows(saved);
      setBuSaveState("saved");
      onSaved(null, { companyId: company._id, buList: saved });
      setTimeout(() => setBuSaveState("idle"), 3000);
      toast.success("Business units saved");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to save business units"));
    } finally {
      setSavingBUs(false);
    }
  };

  const companyIsSaved = !!company.name;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <Building2 size={16} className="text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm leading-tight">
                  {company.name || "New company"}
                </h2>
                <p className="text-xs text-gray-400">Company settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-8">
            {/* ── Company Name section ── */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Company name
                </h3>
                {nameSaveState === "saved" && (
                  <Badge color="green">
                    <Check size={10} /> Saved
                  </Badge>
                )}
                {nameSaveState === "dirty" && (
                  <Badge color="amber">Unsaved changes</Badge>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveName()}
                  placeholder="Enter company name…"
                  className={`flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 transition ${
                    companyNameDuplicate
                      ? "border-red-300 focus:ring-red-300"
                      : "border-gray-300 focus:ring-orange-400"
                  }`}
                />
                <button
                  onClick={handleSaveName}
                  disabled={
                    savingName ||
                    !companyName.trim() ||
                    companyName === company.name ||
                    companyNameDuplicate
                  }
                  className="flex items-center gap-1.5 px-4 py-2 text-sm bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition disabled:opacity-40"
                >
                  {savingName ? <Spinner size={14} /> : <Save size={14} />}
                  Save
                </button>
              </div>
              {companyNameDuplicate && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle size={12} /> Name already in use.
                </p>
              )}
            </section>

            {/* ── Business Units section ── */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Business units
                </h3>
                {buSaveState === "saved" && (
                  <Badge color="green">
                    <Check size={10} /> Saved
                  </Badge>
                )}
                {(buSaveState === "dirty" || buDirty) &&
                  buSaveState !== "saved" && (
                    <Badge color="amber">Unsaved changes</Badge>
                  )}
              </div>

              {!companyIsSaved ? (
                <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <AlertTriangle size={16} className="flex-shrink-0" />
                  Save the company name first before adding business units.
                </div>
              ) : (
                <>
                  {buRows.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm italic border border-dashed border-gray-200 rounded-xl">
                      No business units yet.
                    </div>
                  ) : (
                    <div className="space-y-2 mb-3">
                      {buRows.map((bu) => {
                        const isDupe =
                          bu.name.trim() &&
                          buDuplicateSet.has(normalize(bu.name));
                        return (
                          <div key={bu._id}>
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 flex-shrink-0" />
                              <input
                                value={bu.name}
                                onChange={(e) =>
                                  handleBUChange(bu._id, e.target.value)
                                }
                                placeholder="Business unit name…"
                                className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 transition ${
                                  isDupe
                                    ? "border-red-300 focus:ring-red-300"
                                    : "border-gray-200 focus:ring-orange-300 bg-gray-50 focus:bg-white"
                                }`}
                              />
                              {bu._local && <Badge color="blue">New</Badge>}
                              <button
                                onClick={() => handleDeleteBU(bu._id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition flex-shrink-0"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                            {isDupe && (
                              <p className="mt-1 ml-5 text-xs text-red-500">
                                Duplicate name.
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleAddBU}
                      className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition"
                    >
                      <Plus size={14} /> Add business unit
                    </button>
                    {buRows.length > 0 &&
                      (buDirty || buSaveState === "dirty") && (
                        <button
                          onClick={handleSaveBUs}
                          disabled={savingBUs}
                          className="flex items-center gap-1.5 text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-lg font-medium transition disabled:opacity-40"
                        >
                          {savingBUs ? (
                            <Spinner size={14} />
                          ) : (
                            <Save size={14} />
                          )}
                          Save changes
                        </button>
                      )}
                  </div>
                </>
              )}
            </section>

            {/* ── Metadata section ── */}
            <section className="border-t border-gray-100 pt-5">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Metadata
              </h3>
              <dl className="space-y-2">
                {company.createdAt && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-400">Created</dt>
                    <dd className="text-gray-600">
                      {formatDate(company.createdAt)}
                    </dd>
                  </div>
                )}
                {company.updatedAt && (
                  <div className="flex justify-between text-xs">
                    <dt className="text-gray-400">Last updated</dt>
                    <dd className="text-gray-600">
                      {formatDate(company.updatedAt)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <dt className="text-gray-400">Business units</dt>
                  <dd className="text-gray-600">{buRows.length}</dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-6 py-4 flex-shrink-0">
            <button
              onClick={onClose}
              className="w-full py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Main CompanyBUTab ────────────────────────────────────────────────────────

function CompanyBUTab({ toast }) {
  const [companies, setCompanies] = useState([]);
  const [buMap, setBuMap] = useState({});
  const [loadingInit, setLoadingInit] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addingCompany, setAddingCompany] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null); // { company, buList }
  const [deletingCompany, setDeletingCompany] = useState(false);

  const [drawerCompany, setDrawerCompany] = useState(null);

  const [search, setSearch] = useState("");

  // Load
  useEffect(() => {
    setLoadingInit(true);
    getDropdowns("companyName")
      .then(async (list) => {
        list = list || [];
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

  // Add company — DB record created only after a valid name is entered
  const handleAddCompany = async (name) => {
    setAddingCompany(true);
    try {
      const created = await createDropdown({ name, type: "companyName" });
      setCompanies((prev) => sortByName([...prev, created]));
      setBuMap((prev) => ({ ...prev, [created._id]: [] }));
      setShowAddModal(false);
      setDrawerCompany(created); // open drawer immediately
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to create company"));
    } finally {
      setAddingCompany(false);
    }
  };

  // Delete company
  const handleDeleteCompany = async () => {
    if (!deleteTarget) return;
    setDeletingCompany(true);
    try {
      await deleteDropdown(deleteTarget.company._id);
      setCompanies((prev) =>
        prev.filter((c) => c._id !== deleteTarget.company._id),
      );
      setBuMap((prev) => {
        const copy = { ...prev };
        delete copy[deleteTarget.company._id];
        return copy;
      });
      if (drawerCompany?._id === deleteTarget.company._id)
        setDrawerCompany(null);
      toast.success("Company deleted");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Failed to delete company"));
    } finally {
      setDeletingCompany(false);
      setDeleteTarget(null);
    }
  };

  // Drawer save callback — keeps table in sync
  const handleDrawerSaved = (updatedCompany, buUpdate) => {
    if (updatedCompany) {
      setCompanies((prev) =>
        sortByName(
          prev.map((c) => (c._id === updatedCompany._id ? updatedCompany : c)),
        ),
      );
      setDrawerCompany((prev) =>
        prev?._id === updatedCompany._id ? updatedCompany : prev,
      );
    }
    if (buUpdate) {
      if (buUpdate.buList) {
        setBuMap((prev) => ({
          ...prev,
          [buUpdate.companyId]: buUpdate.buList,
        }));
      }
      if (buUpdate.deletedBuId) {
        setBuMap((prev) => ({
          ...prev,
          [buUpdate.companyId]: (prev[buUpdate.companyId] || []).filter(
            (b) => b._id !== buUpdate.deletedBuId,
          ),
        }));
      }
    }
  };

  // Search: matches company name OR any BU name
  const filteredCompanies = companies.filter((c) => {
    const q = normalize(search);
    if (!q) return true;
    if (normalize(c.name).includes(q)) return true;
    return (buMap[c._id] || []).some((b) => normalize(b.name).includes(q));
  });

  if (loadingInit) {
    return (
      <div className="flex items-center gap-2 text-gray-400 text-sm py-10 justify-center">
        <Spinner /> Loading…
      </div>
    );
  }

  const allCompanyNames = companies.map((c) => c.name);

  return (
    <div>
      <SectionHeader
        title="Company & business units"
        description="Manage companies and their business units used during client registration."
      />

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies or business units…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:border-orange-400 focus:outline-none transition"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition flex-shrink-0"
        >
          <Plus size={15} /> Add company
        </button>
      </div>

      {/* Empty states */}
      {companies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 border border-dashed border-gray-200 rounded-xl">
          <Building2 size={32} className="opacity-40" />
          <p className="text-sm italic">
            No companies yet. Add one to get started.
          </p>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
          <Search size={28} className="opacity-40" />
          <p className="text-sm italic">No results for "{search}"</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {/* Table head — desktop only */}
          <div className="hidden md:grid grid-cols-[1fr_130px_160px_120px] gap-4 px-4 py-2.5 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <span>Company</span>
            <span>Business units</span>
            <span>Last updated</span>
            <span className="text-right">Actions</span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-100">
            {filteredCompanies.map((company) => {
              const bus = buMap[company._id] || [];
              const updated = company.updatedAt || company.createdAt;

              return (
                <div
                  key={company._id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_130px_160px_120px] gap-2 md:gap-4 px-4 py-3.5 hover:bg-gray-50/70 transition items-center"
                >
                  {/* Name + BU preview */}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {company.name || (
                        <span className="text-gray-400 italic">Unnamed</span>
                      )}
                    </p>
                    {bus.length > 0 && (
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {bus
                          .slice(0, 3)
                          .map((b) => b.name)
                          .join(", ")}
                        {bus.length > 3 && ` +${bus.length - 3} more`}
                      </p>
                    )}
                  </div>

                  {/* BU count */}
                  <div className="hidden md:block">
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                      {bus.length} BU{bus.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* Last updated */}
                  <div className="hidden md:block text-xs text-gray-400">
                    {formatDate(updated) || "—"}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 md:justify-end">
                    <button
                      onClick={() => setDrawerCompany(company)}
                      className="flex items-center gap-1.5 text-xs font-medium border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                    >
                      <Pencil size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ company, buList: bus })}
                      className="flex items-center gap-1 text-xs font-medium border border-gray-200 text-gray-400 px-2.5 py-1.5 rounded-lg hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition"
                      aria-label={`Delete ${company.name}`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary */}
      {companies.length > 0 && (
        <p className="text-xs text-gray-400 mt-3">
          {companies.length} {companies.length === 1 ? "company" : "companies"}{" "}
          total
          {search &&
            filteredCompanies.length !== companies.length &&
            ` · ${filteredCompanies.length} shown`}
        </p>
      )}

      {/* Modals & Drawer */}
      {showAddModal && (
        <AddCompanyModal
          existingNames={allCompanyNames}
          onConfirm={handleAddCompany}
          onCancel={() => setShowAddModal(false)}
          loading={addingCompany}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          company={deleteTarget.company}
          buList={deleteTarget.buList}
          onConfirm={handleDeleteCompany}
          onCancel={() => setDeleteTarget(null)}
          loading={deletingCompany}
        />
      )}

      {drawerCompany && (
        <EditDrawer
          company={drawerCompany}
          initialBUs={buMap[drawerCompany._id] || []}
          allCompanyNames={allCompanyNames}
          onClose={() => setDrawerCompany(null)}
          onSaved={handleDrawerSaved}
          toast={toast}
        />
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
// Main SettingsPage
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
      icon: Building2,
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
