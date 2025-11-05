// components/Dropdown.jsx
import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const Dropdown = ({ options = [], value, onChange, icon, width = "w-40", placeholder }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative ${width}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-700 text-sm w-full"
      >
        {icon && <span className="text-indigo-500">{icon}</span>}
        <span className="truncate text-gray-400">
          {value || placeholder || "Select..."}
        </span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                value === opt ? "bg-indigo-100 text-indigo-700 font-medium" : ""
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
