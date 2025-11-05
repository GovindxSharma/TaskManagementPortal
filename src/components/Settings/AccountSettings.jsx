import React from "react";

const AccountSettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

      <form className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Full Name"
          className="border w-full p-3 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          className="border w-full p-3 rounded"
        />
        <input
          type="password"
          placeholder="New Password"
          className="border w-full p-3 rounded"
        />

        <button className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 transition">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default AccountSettings;
