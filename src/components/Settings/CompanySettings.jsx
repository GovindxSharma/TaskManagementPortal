const CompanySettings = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Company Settings</h2>

      <form className="space-y-4 max-w-md">
        <input
          type="text"
          placeholder="Company Name"
          className="border w-full p-3 rounded"
        />
        <input
          type="text"
          placeholder="GST / Tax ID"
          className="border w-full p-3 rounded"
        />
        <button className="bg-black text-white px-5 py-2 rounded hover:bg-gray-900 transition">
          Save
        </button>
      </form>
    </div>
  );
};

export default CompanySettings;
