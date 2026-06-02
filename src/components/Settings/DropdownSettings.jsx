import axios from "../../api/axiosInstance";

// Fetch dropdowns by type
export const getDropdowns = async (type) => {
  const { data } = await axios.get(`/dropdown?type=${type}`);
  return data.data;
};

// Create dropdown
export const createDropdown = async (dropdown) => {
  const { data } = await axios.post("/dropdown", dropdown);
  return data.data;
};

// Update dropdown
export const updateDropdown = async (id, dropdown) => {
  const { data } = await axios.put(`/dropdown/${id}`, dropdown);
  return data.data;
};

// Delete dropdown
export const deleteDropdown = async (id) => {
  const { data } = await axios.delete(`/dropdown/${id}`);
  return data;
};
