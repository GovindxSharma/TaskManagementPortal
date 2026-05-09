import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { CheckCircle, XCircle, AlertTriangle, Trash2 } from "lucide-react";

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmData, setConfirmData] = useState(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addToast = useCallback((type, message) => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  const toast = useMemo(() => ({
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg),
    warning: (msg) => addToast("warning", msg),

    confirmAction: ({ message, onConfirm, type = "default" }) =>
      setConfirmData({ message, onConfirm, type }),

    confirmDelete: ({ message, onConfirm }) =>
      setConfirmData({ message, onConfirm, type: "delete" }),
  }), [addToast]);

  const handleConfirm = () => {
    const { onConfirm, type } = confirmData || {};
    // Call the user-provided confirm function first
    if (onConfirm) onConfirm();

    // Close the modal
    setConfirmData(null);

    // Auto-toast for delete AFTER closing modal
    if (type === "delete") addToast("success", "Deleted successfully");
  };

  const handleCancel = () => setConfirmData(null);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-[9999]">
        {toasts.map((t) => (
          <ToastItem key={t.id} type={t.type} message={t.message} />
        ))}
      </div>

      {/* Confirmation Modal */}
      {confirmData && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[9999] backdrop-blur-sm">
          <div
            className={`bg-white p-6 rounded-xl w-80 shadow-xl ${
              confirmData.type === "delete" ? "" : "border border-blue-300"
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              {confirmData.type === "delete" ? (
                <Trash2 className="text-red-600" />
              ) : (
                <CheckCircle className="text-blue-600" />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {confirmData.type === "delete"
                  ? "Confirm Delete"
                  : "Confirm Action"}
              </h3>
            </div>

            <p className="text-gray-600 mb-5">{confirmData.message}</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmData.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const ToastItem = ({ type, message }) => {
  const style = {
    success: "bg-green-100 text-green-700 border-green-300",
    error: "bg-red-100 text-red-700 border-red-300",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  const icons = {
    success: <CheckCircle size={20} />,
    error: <XCircle size={20} />,
    warning: <AlertTriangle size={20} />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg border shadow ${style[type]}`}
    >
      {icons[type]}
      <span className="font-medium">{message}</span>
    </div>
  );
};
