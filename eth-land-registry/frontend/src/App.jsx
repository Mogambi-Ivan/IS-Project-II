// frontend/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";

import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegisterProperty from "./pages/RegisterProperty";
import ViewLands from "./pages/ViewLands";
import ReportPage from "./pages/ReportPage";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  const { role } = useUser();

  // If not logged in → just show login
  if (!role) {
    return <Login />;
  }

  const isGov =
    role === "admin" ||
    role === "government" ||
    role === "gov"; // in case of label differences

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#f3faf5]">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Navbar />
          <main className="flex-1 p-6">
            <Routes>
              {isGov ? (
                <>
                  {/* Government / Admin dashboard with stats & approvals */}
                  <Route path="/" element={<AdminDashboard />} />
                  <Route path="/view-lands" element={<ViewLands />} />
                  <Route path="/reports" element={<ReportPage />} />
                </>
              ) : (
                <>
                  {/* Land owner experience */}
                  <Route path="/" element={<Dashboard />} />
                  <Route
                    path="/register-property"
                    element={<RegisterProperty />}
                  />
                  <Route path="/view-lands" element={<ViewLands />} />
                </>
              )}
            </Routes>
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}
