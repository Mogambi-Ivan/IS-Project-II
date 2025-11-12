import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { userName } = useUser();

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Government Land Registry</h2>
        <p className="text-gray-600 text-sm">Logged in as: {userName} (Gov Officer)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <div className="bg-white border p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Total Registered Lands</h3>
          <p className="text-3xl font-bold text-green-700 mt-2">0</p>
        </div>

        <div className="bg-white border p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Pending Transfers</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>

        <div className="bg-white border p-4 rounded shadow-sm">
          <h3 className="text-lg font-semibold text-gray-700">Verified Owners</h3>
          <p className="text-3xl font-bold text-blue-700 mt-2">0</p>
        </div>

      </div>

      {/* Shortcuts */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Link to="/register-property" className="bg-green-700 text-white p-4 rounded text-center hover:bg-green-800">
          Register New Land
        </Link>

        <Link to="/view-lands" className="bg-blue-700 text-white p-4 rounded text-center hover:bg-blue-800">
          View All Lands
        </Link>

        <Link to="/reports" className="bg-gray-700 text-white p-4 rounded text-center hover:bg-gray-800">
          Generate Reports
        </Link>
      </div>

      {/* Data Table Placeholder */}
      <div className="bg-white border rounded shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Recent Land Records</h3>
        <p className="text-gray-500 text-sm">No data yet — will load from blockchain</p>
      </div>

    </div>
  );
}
