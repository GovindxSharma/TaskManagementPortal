import { useNavigate } from "react-router-dom";
import { Users, Layers } from "lucide-react";

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
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Reports</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <div
            key={index}
            onClick={() => navigate(report.path)}
            className="
              cursor-pointer
              bg-white
              p-6
              rounded-2xl
              shadow-sm
              hover:shadow-md
              transition
              border
              hover:border-blue-500
            "
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                {report.icon}
              </div>

              <h2 className="text-lg font-medium text-gray-800">
                {report.title}
              </h2>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
