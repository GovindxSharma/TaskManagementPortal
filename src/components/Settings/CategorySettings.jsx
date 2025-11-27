import axios from "../../api/axiosInstance"; // adjust path if needed

// Fetch all categories
export const getCategories = async () => {
  const { data } = await axios.get("/category");
  return data.categories;
};

// Create new category
export const createCategory = async (category) => {
  const { data } = await axios.post("/category", category);
  return data;
};

// Update existing category
export const updateCategory = async (id, category) => {
  const { data } = await axios.put(`/category/${id}`, category);
  return data;
};

// Delete category
export const deleteCategory = async (id) => {
  const { data } = await axios.delete(`/category/${id}`);
  return data;
};
