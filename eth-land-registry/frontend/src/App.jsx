import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useUser } from "./context/UserContext";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RegisterProperty from "./pages/RegisterProperty";
import ViewLands from "./pages/ViewLands";
import ReportPage from "./pages/ReportPage";

export default function App() {
  const { role } = useUser();

  if (!role) return <Login />; // if not logged in → login page

  return (
    <BrowserRouter>
      <div className="flex">
        <Sidebar />
        <div className="flex-1">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register-property" element={<RegisterProperty />} />
            <Route path="/view-lands" element={<ViewLands />} />
            <Route path="/reports" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
