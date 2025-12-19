import axios from "../../api/axiosInstance";

export const updateUserApi = async (userId, payload) => {
  const res = await axios.put(`/user/${userId}`, payload);
  return res.data;
};
