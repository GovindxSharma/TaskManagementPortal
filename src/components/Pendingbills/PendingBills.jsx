import React, { useEffect, useState } from "react";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PendingBills = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch from API (replace with your backend URL)
  useEffect(() => {
    const fetchPendingBills = async () => {
      try {
        const res = await fetch("/api/billing/pending-bills");
        const data = await res.json();
        setClients(data.clients || []);
      } catch (error) {
        console.error("Error fetching pending bills:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingBills();
  }, []);

  // 🧩 Mock data for fallback
  const mockData = [
    {
      name: "Amit Verma",
      contact: "amit@example.com",
      totalAmount: 4500,
      dueDate: "2025-11-20",
    },
    {
      name: "Riya Sharma",
      contact: "riya@example.com",
      totalAmount: 3200,
      dueDate: "2025-11-25",
    },
    {
      name: "ZenTax Advisors",
      contact: "contact@zentax.com",
      totalAmount: 12000,
      dueDate: "2025-11-22",
    },
  ];

  const displayedClients = clients.length > 0 ? clients : mockData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-yellow-50 text-gray-700 font-medium transition"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span>
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="text-yellow-600" />
          Pending Bills — Clients with Complete Data
        </h2>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading pending bills...
          </div>
        ) : displayedClients.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            🎉 All bills are cleared!
          </p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b text-gray-700">
              <tr>
                <th className="p-3 text-left">Client Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Total Amount</th>
                <th className="p-3 text-left">Due Date</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedClients.map((client, index) => (
                <tr
                  key={index}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium text-gray-800">
                    {client.name}
                  </td>
                  <td className="p-3 text-gray-600">{client.contact}</td>
                  <td className="p-3 text-green-700 font-medium">
                    ₹{client.totalAmount.toLocaleString()}
                  </td>
                  <td className="p-3 text-gray-600">{client.dueDate}</td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 text-xs font-semibold bg-yellow-100 text-yellow-700 rounded-full">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PendingBills;
