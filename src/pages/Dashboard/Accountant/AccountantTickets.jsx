import React, { useState } from "react";

const AccountantTickets = () => {
  const [tickets, setTickets] = useState([
    { id: 1, title: "Payment discrepancy with VisionTech", status: "Open" },
  ]);
  const [newTicket, setNewTicket] = useState("");

  const handleRaiseTicket = () => {
    if (!newTicket) return;
    setTickets([...tickets, { id: tickets.length + 1, title: newTicket, status: "Open" }]);
    setNewTicket("");
  };

  const updateStatus = (id, status) => {
    setTickets(tickets.map(t => (t.id === id ? { ...t, status } : t)));
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800">Tickets</h1>

      {/* Raise Ticket */}
      <div className="mb-6 bg-white p-5 rounded-xl shadow flex gap-3">
        <input
          type="text"
          placeholder="Raise a new ticket..."
          className="flex-1 border rounded px-3 py-2"
          value={newTicket}
          onChange={(e) => setNewTicket(e.target.value)}
        />
        <button
          onClick={handleRaiseTicket}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Raise
        </button>
      </div>

      {/* Ticket List */}
      <div className="bg-white p-5 rounded-xl shadow">
        <table className="w-full border-collapse">
          <thead>
            <tr className="text-left border-b text-gray-600">
              <th className="p-3">Title</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b last:border-none hover:bg-gray-50 transition">
                <td className="p-3">{t.title}</td>
                <td className="p-3">{t.status}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => updateStatus(t.id, "Open")}
                    className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded"
                  >
                    Open
                  </button>
                  <button
                    onClick={() => updateStatus(t.id, "Closed")}
                    className="px-2 py-1 bg-green-100 text-green-700 rounded"
                  >
                    Close
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountantTickets;
