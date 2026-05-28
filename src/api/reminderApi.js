import axiosInstance from "./axiosInstance";

export const createReminder = (data) => axiosInstance.post("/reminder", data);

export const getReminders = () => axiosInstance.get("/reminder");

export const getActiveReminders = () => axiosInstance.get("/reminder/active");

export const updateReminder = (id, data) =>
  axiosInstance.put(`/reminder/${id}`, data);

export const snoozeReminder = (id, minutes) =>
  axiosInstance.put(`/reminder/${id}/snooze`, { minutes });

export const dismissReminder = (id) =>
  axiosInstance.put(`/reminder/${id}/dismiss`);

export const deleteReminderApi = (id) =>
  axiosInstance.delete(`/reminder/${id}`);
