import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Sidebar() {
  const { role, logout } = useUser();

  return (
    <div className="bg-white w-64 h-screen shadow-md px-5 py-4 flex flex-col">
      <h2 className="text-xl font-semibold text-green-700 mb-6">Land Registry</h2>

      <nav className="flex-1 space-y-2">
        <Link to="/" className="block p-2 rounded hover:bg-gray-200">Dashboard</Link>
        {/* Admin ONLY */}
        {role === "admin" && (
          <>
            <Link to="/register-property" className="block p-2 rounded hover:bg-gray-200">
              Register Property
            </Link>
            <Link to="/reports" className="block p-2 rounded hover:bg-gray-200">
              Reports
            </Link>
          </>
        )}
        {/* Land Owner ONLY */}
        {role === "owner" && (
          <Link to="/view-lands" className="block p-2 rounded hover:bg-gray-200">
            My Lands
          </Link>
        )}
      </nav>

      <button 
        onClick={logout}
        className="bg-red-500 hover:bg-red-600 text-white py-2 rounded mt-4"
      >
        Logout
      </button>
    </div>
  );
}
