import axios from "../../api/axiosInstance"; // your axios instance

export const updateUserApi = async (userId, payload) => {
  const { currentPassword, newPassword, name, email } = payload;

  // Construct the base update payload
  const updateData = { name, email };

  // If user wants to change password
  if (currentPassword && newPassword) {
    // Verify current password
    const verify = await axios.put(`/user/${userId}`, {
      password: currentPassword,
    });

    if (!verify.data.valid) {
      throw new Error("Current password is incorrect");
    }

    // Add newPassword to payload
    updateData.password = newPassword;
  }

  // Update user
  const res = await axios.put(`/user/${userId}`, updateData);
  return res.data;
};
