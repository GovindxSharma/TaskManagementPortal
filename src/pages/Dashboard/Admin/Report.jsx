import { useNavigate } from "react-router-dom";
import { Users, Layers, FileText, ArrowLeft } from "lucide-react";

export default function Reports() {
  const navigate = useNavigate();

  const reports = [
    {
      title: "No Of Workers Report",
      icon: <Users size={22} />,
      path: "/admin/reports/workers",
    },
    {
      title: "Category Wise Report",
      icon: <Layers size={22} />,
      path: "/admin/reports/category",
    },
    {
      title: "Data Pending Report",
      icon: <FileText size={22} />,
      path: "/admin/reports/pending-data",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="
            inline-flex items-center gap-2
            px-4 py-2
            bg-white
            border border-gray-200
            rounded-xl
            text-gray-600
            hover:text-blue-600
            hover:border-blue-200
            hover:bg-blue-50
            transition-all duration-200
            shadow-sm
            mb-4
          "
        >
          <ArrowLeft size={18} />
          <span className="font-medium">Back</span>
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">
            View and generate business reports.
          </p>
        </div>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <div
            key={index}
            onClick={() => navigate(report.path)}
            className="
              group
              cursor-pointer
              bg-white
              p-6
              rounded-2xl
              border border-gray-200
              shadow-sm
              hover:shadow-lg
              hover:border-blue-300
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            <div className="flex items-start justify-between">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
                {report.icon}
              </div>

              <div className="text-gray-300 group-hover:text-blue-500 transition">
                →
              </div>
            </div>

            <h2 className="mt-5 text-lg font-semibold text-gray-800">
              {report.title}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              View detailed report information and analytics.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}