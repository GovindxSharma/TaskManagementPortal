import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2, Workflow } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InProgress = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Fetch from backend (replace with actual route)
  useEffect(() => {
    const fetchInProgressClients = async () => {
      try {
        const res = await fetch("/api/clients/in-progress");
        const data = await res.json();
        setClients(data.clients || []);
      } catch (error) {
        console.error("Error fetching in-progress clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInProgressClients();
  }, []);

  // 🧩 Mock data
  const mockData = [
    {
      name: "Aarav Enterprises",
      contact: "aarav@enterprises.com",
      dateReceived: "2025-11-10",
      assignedTo: "Team A",
      remarks: "Data cleaning in progress",
      expectedCompletion: "2025-11-15",
    },
    {
      name: "BlueOcean Pvt Ltd",
      contact: "info@blueocean.com",
      dateReceived: "2025-11-09",
      assignedTo: "Team B",
      remarks: "Report generation ongoing",
      expectedCompletion: "2025-11-16",
    },
    {
      name: "Sunrise Distributors",
      contact: "sunrise@distributors.com",
      dateReceived: "2025-11-11",
      assignedTo: "Team C",
      remarks: "Validation and review phase",
      expectedCompletion: "2025-11-17",
    },
  ];

  const displayedClients = clients.length > 0 ? clients : mockData;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-white shadow px-3 py-1.5 rounded-lg hover:bg-blue-50 text-gray-700 font-medium transition"
        >
          <ArrowLeft size={18} /> <span className="hidden sm:block">Back</span>
        </button>

        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Workflow className="text-blue-600" />
          In Progress Clients
        </h2>
      </div>

      {/* Table Section */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10 text-gray-500">
            <Loader2 className="animate-spin mr-2" size={20} /> Loading in-progress data...
          </div>
        ) : displayedClients.length === 0 ? (
          <p className="text-gray-500 text-center py-10">✅ No clients currently in progress!</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr className="text-gray-700">
                <th className="p-3 text-left">Client Name</th>
                <th className="p-3 text-left">Contact</th>
                <th className="p-3 text-left">Date Received</th>
                <th className="p-3 text-left">Assigned To</th>
                <th className="p-3 text-left">Remarks</th>
                <th className="p-3 text-left">Expected Completion</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {displayedClients.map((client, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="p-3 font-medium text-gray-800">{client.name}</td>
                  <td className="p-3 text-gray-600">{client.contact}</td>
                  <td className="p-3 text-gray-600">{client.dateReceived}</td>
                  <td className="p-3 text-gray-600">{client.assignedTo}</td>
                  <td className="p-3 text-gray-600">{client.remarks}</td>
                  <td className="p-3 text-gray-600">{client.expectedCompletion}</td>
                  <td className="p-3 text-center">
                    <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full animate-pulse">
                      In Progress
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

export default InProgress;
