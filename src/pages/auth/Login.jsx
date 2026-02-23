import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn, Eye, EyeOff } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { loadDashboardStats } from "../../data/dashboardStats";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const brandName =
    import.meta.env.VITE_APP_NAME?.trim() || "Compliance Portal";

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL?.trim() ||
    "https://customercompliance.onrender.com";

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Using API base URL:", baseUrl);

      const { data } = await axios.post(`${baseUrl}/auth/login`, formData);

      // Save auth globally
      login(data.user, data.token);

      // Preload dashboard stats
      await loadDashboardStats();

      // Role-based navigation
      const role = data.user.role.toLowerCase();

      if (role === "admin") navigate("/admin/dashboard");
      else if (role === "accountant") navigate("/accountant/dashboard");
      else navigate("/employee/dashboard");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#004c80] via-[#016DB6] to-[#0088d8]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <LogIn className="text-[#016DB6]" size={40} />
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">{brandName}</h1>

          <p className="text-gray-500 text-sm mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">
              Email
            </label>

            <input
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#016DB6]"
              placeholder="Enter your email"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-[#016DB6]"
                placeholder="Enter your password"
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#016DB6] hover:bg-[#015d9c] text-white rounded-lg py-2.5 transition font-medium disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 mt-6 space-y-2">
          <p>
            © {new Date().getFullYear()} {brandName}. All rights reserved.
          </p>

          <p className="text-xs text-gray-400">
            Crafted with precision by{" "}
            <span className="font-medium text-gray-600">Vision Infotech</span>
          </p>

          <div className="flex justify-center gap-2 text-xs">
            <a
              href="https://trusha-jadeja.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#016DB6] hover:underline"
            >
              Trusha Jadeja
            </a>

            <span className="text-gray-400">•</span>

            <a
              href="https://govind-sharma.onrender.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#016DB6] hover:underline"
            >
              Govind Sharma
            </a>

            <span className="text-gray-400">•</span>

            <a
              href="https://www.linkedin.com/in/saim-khoja/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#016DB6] hover:underline"
            >
              Saim Khoja
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
