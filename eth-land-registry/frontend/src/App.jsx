import { useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import RegisterProperty from "./pages/RegisterProperty";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="flex h-screen">
      <Sidebar currentPage={page} setPage={setPage} />
      <div className="flex flex-col flex-1">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {page === "dashboard" && <Dashboard />}
          {page === "register" && <RegisterProperty />}
        </main>
      </div>
    </div>
  );
}
