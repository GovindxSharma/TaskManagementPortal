import React, { useEffect, useState } from "react";
import { getCategories } from "../Settings/CategorySettings.jsx";
import Dropdown from "../layout/Dropdown";
import { useNavigate } from "react-router-dom";
import { useToast } from "../layout/ToastProvider.jsx";
import { ArrowLeft } from "lucide-react";

export default function CategoryReport() {
    const navigate = useNavigate();
    const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getCategories();
        setCategories(data.filter((c) => c.isActive));
      } catch (err) {
        console.error(err);
        alert("Failed to fetch categories");
      }
    };
    fetch();
  }, []);

  const isDisabled = !monthFilter || !yearFilter;

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-800">
      {/* 🔥 Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/reports")}
          className="flex items-center gap-2 bg-white shadow-sm border px-3 py-1.5 rounded-xl hover:bg-gray-100 text-gray-600 text-sm font-medium transition mb-2 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Reports
        </button>
        <h1 className="text-3xl font-bold text-gray-800">
          Category Wise Report
        </h1>
      </div>

      {/* 🔥 Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-wrap gap-4 mb-6">
        <Dropdown
          label="Month"
          options={monthNames}
          value={monthFilter}
          onChange={setMonthFilter}
          placeholder="Select Month"
        />

        <Dropdown
          label="Year"
          options={["2024", "2025", "2026"]}
          value={yearFilter}
          onChange={setYearFilter}
          placeholder="Select Year"
        />
        {isDisabled && (
          <p className="text-yellow-600 text-sm mt-2">
            ⚠️ Please select both Month and Year to enable categories
          </p>
        )}
      </div>

      {/* 🔥 Category Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {categories.map((cat) => (
          <div
            key={cat._id}
            onClick={() => {
              if (isDisabled) {
                toast.warning("Select Month & Year to continue");
                return;
              }

              navigate(`/admin/reports/category/${cat._id}`, {
                state: {
                  monthFilter,
                  yearFilter,
                  categoryName: cat.name,
                },
              });
            }}
            className={`
              p-6 rounded-2xl shadow-sm text-center transition
              ${
                isDisabled
                  ? "bg-gray-200 cursor-not-allowed opacity-60"
                  : "bg-white hover:bg-blue-50 cursor-pointer hover:scale-105"
              }
            `}
          >
            <h2 className="text-2xl font-bold text-gray-800">{cat.name}</h2>

            <p className="text-sm text-gray-500 mt-2">₹ {cat.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
