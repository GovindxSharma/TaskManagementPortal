// components/Dropdown.jsx
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// 🔒 shared reference to track currently open dropdown
let activeDropdown = null;

const Dropdown = ({
  options = [],
  value,
  onChange,
  icon,
  width = "w-40",
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    // close previously open dropdown
    if (activeDropdown && activeDropdown !== setOpen) {
      activeDropdown(false);
    }

    setOpen((prev) => {
      const next = !prev;
      activeDropdown = next ? setOpen : null;
      return next;
    });
  };

  // ✅ close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        if (activeDropdown === setOpen) {
          activeDropdown = null;
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative ${width}`}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex items-center justify-between gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md text-gray-700 text-sm w-full"
      >
        {icon && <span className="text-indigo-500">{icon}</span>}

        <span className={`truncate ${value ? "text-gray-700" : "text-gray-400"}`}>
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
                activeDropdown = null;
              }}
              className={`px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 ${
                value === opt
                  ? "bg-indigo-100 text-indigo-700 font-medium"
                  : ""
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
