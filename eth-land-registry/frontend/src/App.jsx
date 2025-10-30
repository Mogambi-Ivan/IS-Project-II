import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterProperty from "./pages/RegisterProperty";

function Navbar() {
  return (
    <nav className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
      <h1 className="text-xl font-semibold text-gray-800">
        Land Registry System
      </h1>
      <div className="space-x-4">
        <Link to="/owner" className="text-gray-700 hover:text-blue-600">
          Owner Dashboard
        </Link>
        <Link to="/admin" className="text-gray-700 hover:text-blue-600">
          Admin Dashboard
        </Link>
        <Link to="/register" className="text-gray-700 hover:text-blue-600">
          Register Property
        </Link>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="max-w-7xl mx-auto p-6">
          <Routes>
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/register" element={<RegisterProperty />} />
            <Route path="*" element={<OwnerDashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
