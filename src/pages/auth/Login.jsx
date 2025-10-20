import React, { useState } from "react";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  // Dummy users list
  const dummyUsers = [
    { email: "admin@taskflow.com", password: "admin123", role: "admin" },
    { email: "account@taskflow.com", password: "account123", role: "accountant" },
    { email: "employee@taskflow.com", password: "employee123", role: "employee" },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const user = dummyUsers.find(
        (u) => u.email === formData.email && u.password === formData.password
      );

      if (!user) {
        alert("Invalid email or password");
        setLoading(false);
        return;
      }

      // Simulate login success and redirect
      if (user.role === "admin") window.location.href = "/admin/dashboard";
      else if (user.role === "accountant") window.location.href = "/accountant/dashboard";
      else window.location.href = "/employee/dashboard";

      setLoading(false);
    }, 1000); // simulate small delay
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#004c80] via-[#016DB6] to-[#0088d8]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-2xl rounded-2xl w-full max-w-md p-8"
      >
        {/* Header / Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <LogIn className="text-[#016DB6]" size={40} />
          </div>
          <h1 className="text-2xl font-semibold text-gray-800">Task Management Portal</h1>
          <p className="text-gray-500 text-sm mt-1">Login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#016DB6]"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-600 mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              name="password"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-[#016DB6]"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#016DB6] hover:bg-[#015d9c] text-white rounded-lg py-2.5 transition font-medium"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Dummy Info */}
        <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
          <p className="font-semibold mb-1 text-gray-600">💡 Demo Accounts:</p>
          <ul className="space-y-1">
            <li>👑 Admin → admin@taskflow.com / admin123</li>
            <li>💼 Accountant → account@taskflow.com / account123</li>
            <li>👷 Employee → employee@taskflow.com / employee123</li>
          </ul>
        </div>

        <p className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} TaskFlow Internal Suite
        </p>
      </motion.div>
    </div>
  );
}
