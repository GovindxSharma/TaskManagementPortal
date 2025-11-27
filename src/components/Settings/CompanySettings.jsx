import axios from "../../api/axiosInstance"; // your axios instance

export const getCompanyById = async (companyId) => {
  const res = await axios.get(`/company/${companyId}`);
  return res.data.company;
};

export const updateCompanyApi = async (companyId, data) => {
  const payload = {
    name: data.name,
    email: data.email,
    phone: data.phone,
    location: data.location,
  };
  const res = await axios.put(`/company/${companyId}`, payload);
  return res.data.company;
};
