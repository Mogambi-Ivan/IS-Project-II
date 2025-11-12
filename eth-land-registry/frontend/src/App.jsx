import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext.jsx";

import Login from "./pages/Login.jsx";
import Sidebar from "./components/Sidebar.jsx";
import Navbar from "./components/Navbar.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import RegisterProperty from "./pages/RegisterProperty.jsx";
import ViewLands from "./pages/ViewLands.jsx";
import ReportPage from "./pages/ReportPage.jsx";

import AdminDashboard from "./pages/AdminDashboard.jsx";
import OwnerDashboard from "./pages/OwnerDashboard.jsx";

export default function App() {
  const { user } = useUser(); // ✅ Correct

  if (!user) return <Login />; // ✅ Show Login if no user logged in

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />

          <Routes>
            {/* Dashboard Redirects by role */}
            <Route
              path="/"
              element={user.role === "admin" ? <AdminDashboard /> : <OwnerDashboard />}
            />

            <Route path="/register-property" element={<RegisterProperty />} />
            <Route path="/view-lands" element={<ViewLands />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
