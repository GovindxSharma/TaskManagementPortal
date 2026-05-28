import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Clock,
  X,
  Timer,
  ChevronDown,
  AlarmClockOff,
  Bell,
  Plus,
  Minus,
} from "lucide-react";
import {
  getActiveReminders,
  snoozeReminder as snoozeApi,
  dismissReminder as dismissApi,
} from "../../api/reminderApi";
import { useToast } from "../layout/ToastProvider";
import { useAuth } from "../../hooks/useAuth";
import { useLocation } from "react-router-dom";

const ReminderToastContext = createContext();

export const useReminderToast = () => useContext(ReminderToastContext);

export const ReminderToastProvider = ({ children }) => {
  const toast = useToast();
  const [reminders, setReminders] = useState([]);
  const [firedReminders, setFiredReminders] = useState([]);
  const [snoozeDropdownId, setSnoozeDropdownId] = useState(null);
  const [customSnoozeId, setCustomSnoozeId] = useState(null);
  const [customTime, setCustomTime] = useState("");
  const [snoozeCounter, setSnoozeCounter] = useState(10);
  const { token, user } = useAuth();
  const currentUserId = user?._id || null;
  const prevUserIdRef = useRef(currentUserId);

  const intervalRef = useRef(null);
  const snoozeDropdownRef = useRef(null);
  const location = useLocation();

  // Fetch active reminders from API and sync firedReminders
  const fetchReminders = useCallback(async () => {
    if (!token) return;

    try {
      const res = await getActiveReminders();
      const active = res.data?.data || [];
      
      const now = new Date();
      const due = [];
      const remaining = [];
      
      active.forEach((r) => {
        const reminderTime = new Date(r.reminderTime);
        if (reminderTime <= now && !r.isDismissed) {
          due.push(r);
        } else {
          remaining.push(r);
        }
      });
      
      setReminders(remaining);
      
      // Sync firedReminders so they stay on screen until snoozed/deleted
      setFiredReminders((prevFired) => {
        const dueIds = new Set(due.map((d) => d._id));
        const stillFired = prevFired.filter((f) => dueIds.has(f._id));
        
        // Add new due ones that aren't already fired
        const existingIds = new Set(stillFired.map((f) => f._id));
        const newFired = due.filter(
          (d) => !existingIds.has(d._id)
        );
        
        return [...stillFired, ...newFired];
      });
    } catch (err) {
      console.error("Failed to fetch reminders:", err);
    }
  }, [token]);

  // Check if reminders are due
  const checkReminders = useCallback(() => {
    const now = new Date();

    setReminders((prev) => {
      const due = [];
      const remaining = [];

      prev.forEach((r) => {
        const reminderTime = new Date(r.reminderTime);

        if (reminderTime <= now && !r.isDismissed) {
          due.push(r);
        } else {
          remaining.push(r);
        }
      });

      if (due.length > 0) {
        setFiredReminders((prevFired) => {
          const existingIds = new Set(prevFired.map((f) => f._id));

          const newFired = due.filter(
            (d) => !existingIds.has(d._id)
          );

          return [...prevFired, ...newFired];
        });
      }

      return remaining;
    });
  }, []);

  // Clear reminders when user changes or logs out
  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    prevUserIdRef.current = currentUserId;

    if (!token || !currentUserId) {
      // User logged out — clear everything
      setReminders([]);
      setFiredReminders([]);
      setSnoozeDropdownId(null);
      setCustomSnoozeId(null);
      setCustomTime("");
      return;
    }

    if (prevUserId !== currentUserId) {
      // Different user logged in — clear old data, fetch fresh
      setReminders([]);
      setFiredReminders([]);
      setSnoozeDropdownId(null);
      setCustomSnoozeId(null);
      setCustomTime("");
    }

    fetchReminders();
  }, [token, currentUserId, fetchReminders]);

  // Immediately clear reminders when navigating to login page
  // This handles the case where dashboards do direct localStorage.removeItem
  // instead of calling useAuth().logout()
  useEffect(() => {
    if (location.pathname === "/") {
      setReminders([]);
      setFiredReminders([]);
      setSnoozeDropdownId(null);
      setCustomSnoozeId(null);
      setCustomTime("");
    }
  }, [location.pathname]);

  // Reminder checking interval + fallback localStorage check
  // (dashboards use direct localStorage.removeItem instead of auth context logout)
  useEffect(() => {
    if (!token || !currentUserId) return;

    // immediate check
    checkReminders();

    intervalRef.current = setInterval(() => {
      // Fallback: check if token was removed directly from localStorage
      const lsToken = localStorage.getItem("token");
      if (!lsToken) {
        setReminders([]);
        setFiredReminders([]);
        return;
      }
      checkReminders();
    }, 30000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [token, currentUserId, checkReminders]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        snoozeDropdownRef.current &&
        !snoozeDropdownRef.current.contains(e.target)
      ) {
        setSnoozeDropdownId(null);
        setCustomSnoozeId(null);
        setCustomTime("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // Snooze reminder
  const handleSnooze = async (reminderId, minutes) => {
    try {
      await snoozeApi(reminderId, minutes);

      setFiredReminders((prev) =>
        prev.filter((r) => r._id !== reminderId)
      );

      setSnoozeDropdownId(null);
      setCustomSnoozeId(null);
      setCustomTime("");

      fetchReminders();
      window.dispatchEvent(new CustomEvent("reminders-changed"));
    } catch (err) {
      console.error("Failed to snooze reminder:", err);
    }
  };

  const openCustomSnooze = (reminderId) => {
    setCustomSnoozeId(reminderId);
    const now = new Date();
    const defaultFuture = new Date(now.getTime() + 30 * 60 * 1000);
    const hh = String(defaultFuture.getHours()).padStart(2, '0');
    const min = String(defaultFuture.getMinutes()).padStart(2, '0');
    
    setCustomTime(`${hh}:${min}`);
  };

  const handleCustomTimeSnooze = async (reminderId) => {
    if (!customTime) {
      toast.warning("Please specify a time");
      return;
    }
    
    const [hours, minutes] = customTime.split(":").map(Number);
    const target = new Date();
    target.setHours(hours, minutes, 0, 0);
    
    if (target.getTime() <= Date.now()) {
      toast.warning("Snooze time must be in the future");
      return;
    }
    
    const diffMs = target.getTime() - Date.now();
    const diffMinutes = Math.max(1, Math.round(diffMs / 60000));
    
    await handleSnooze(reminderId, diffMinutes);
  };

  // Dismiss reminder
  const handleDismiss = async (reminderId) => {
    try {
      await dismissApi(reminderId);

      setFiredReminders((prev) =>
        prev.filter((r) => r._id !== reminderId)
      );

      fetchReminders();
      window.dispatchEvent(new CustomEvent("reminders-changed"));
    } catch (err) {
      console.error("Failed to dismiss reminder:", err);
    }
  };

  // Expose refresh function
  const refreshReminders = useCallback(() => {
    fetchReminders();
  }, [fetchReminders]);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);

    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ReminderToastContext.Provider
      value={{ refreshReminders }}
    >
      {children}

      {/* Reminder Toasts */}
      {firedReminders.length > 0 && (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-3 max-w-sm w-full">
          {firedReminders.map((reminder) => (
            <div
              key={reminder._id}
              className="bg-white rounded-2xl shadow-2xl border border-indigo-100 animate-slide-in-left"
              style={{
                animation:
                  "slideInLeft 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            >
              {/* Top Gradient */}
              <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-start gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                      <Bell
                        size={16}
                        className="text-indigo-600"
                      />
                    </div>

                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Reminder
                    </span>
                  </div>
                </div>

                {/* Message */}
                <p className="text-sm font-medium text-gray-800 mb-1.5 leading-relaxed">
                  {reminder.message}
                </p>

                {/* Time */}
                <p className="text-xs text-gray-400 mb-3 flex items-center gap-1">
                  <Clock size={12} />
                  {formatTime(reminder.reminderTime)}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Snooze */}
                  <div
                    className="relative"
                    ref={snoozeDropdownRef}
                  >
                    <button
                      onClick={() => {
                        const isOpen = snoozeDropdownId === reminder._id;
                        setSnoozeDropdownId(isOpen ? null : reminder._id);
                        if (!isOpen) {
                          setSnoozeCounter(10);
                          setCustomSnoozeId(null);
                          setCustomTime("");
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors cursor-pointer"
                    >
                      <Timer size={14} />
                      Snooze
                      <ChevronDown size={12} />
                    </button>

                    {snoozeDropdownId === reminder._id && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-52 z-50 animate-fade-in">
                        {customSnoozeId === reminder._id ? (
                          <>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                              Custom Time
                            </div>
                            <div className="space-y-2 mt-1">
                              <div>
                                <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Snooze Time</label>
                                <input
                                  type="time"
                                  value={customTime}
                                  onChange={(e) => setCustomTime(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-300 font-medium text-gray-700 bg-gray-50"
                                />
                              </div>
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => setCustomSnoozeId(null)}
                                  className="flex-1 py-1.5 px-2 border border-gray-200 hover:bg-gray-50 text-gray-500 text-xs font-semibold rounded-lg transition-colors active:scale-95 text-center cursor-pointer"
                                >
                                  Back
                                </button>
                                <button
                                  onClick={() => handleCustomTimeSnooze(reminder._id)}
                                  className="flex-1 py-1.5 px-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-semibold rounded-lg transition-all shadow-md shadow-indigo-100 active:scale-95 text-center cursor-pointer"
                                >
                                  Snooze
                                </button>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 select-none">
                              Snooze Duration
                            </div>

                            {/* +/- Interactive Counter */}
                            <div className="flex items-center justify-between bg-gray-50 rounded-xl p-1 mb-2.5 border border-gray-100">
                              <button
                                onClick={() =>
                                  setSnoozeCounter((prev) =>
                                    Math.max(1, prev > 5 ? prev - 5 : prev - 1)
                                  )
                                }
                                className="p-1 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-all active:scale-90 cursor-pointer"
                                title="Decrease time"
                              >
                                <Minus size={12} />
                              </button>
                              
                              <span className="text-xs font-semibold text-gray-800 select-none">
                                {snoozeCounter} mins
                              </span>

                              <button
                                onClick={() =>
                                  setSnoozeCounter((prev) =>
                                    prev === 1 ? 5 : prev + 5
                                  )
                                }
                                className="p-1 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-indigo-600 transition-all active:scale-90 cursor-pointer"
                                title="Increase time"
                              >
                                <Plus size={12} />
                              </button>
                            </div>

                            {/* Snooze Trigger Button */}
                            <button
                              onClick={() =>
                                handleSnooze(reminder._id, snoozeCounter)
                              }
                              className="w-full py-1.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition-all active:scale-[0.98] mb-1.5 cursor-pointer"
                            >
                              Snooze for {snoozeCounter}m
                            </button>

                            <div className="border-t border-gray-100 my-2" />

                            <button
                              onClick={() => openCustomSnooze(reminder._id)}
                              className="w-full text-left px-2 py-1.5 text-xs text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <Timer size={12} />
                              Custom time...
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() =>
                      handleDismiss(reminder._id)
                    }
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <AlarmClockOff size={14} />
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Animation */}
      <style>{`
        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-100%);
          }

          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </ReminderToastContext.Provider>
  );
};