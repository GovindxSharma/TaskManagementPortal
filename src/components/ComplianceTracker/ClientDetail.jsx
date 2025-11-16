import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonthCard from "./components/MonthCard.jsx";
import { ChevronLeft } from "lucide-react";
import axios from "../../api/axiosInstance";

export default function CustomerDetails() {
  const { id } = useParams(); // client _id
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/client/${id}`); // fetch client info
        setClient(data.client);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch client details");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id]);

  if (loading)
    return <div className="p-6 text-gray-600">Loading client...</div>;
  if (!client) return <p className="text-gray-500">Client not found</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium transition"
      >
        <ChevronLeft size={18} />
        Back to Compliance
      </button>

      {/* Client Info */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{client.name}</h1>

      {/* Month Cards */}
      <MonthCard clientId={id} />
    </div>
  );
}
