// frontend/src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";

const MENU = {
  owner: [
    { to: "/", label: "Dashboard" },
    { to: "/register-property", label: "Register Property" },
    { to: "/view-lands", label: "My Lands" },
  ],
  admin: [
    { to: "/", label: "Dashboard" },
    { to: "/view-lands", label: "Registered Lands" },
    { to: "/reports", label: "Reports" },
  ],
  government: [
    { to: "/", label: "Dashboard" },
    { to: "/view-lands", label: "Registered Lands" },
    { to: "/reports", label: "Reports" },
  ],
};

export default function Sidebar() {
  const { role, logout } = useUser();
  const location = useLocation();

  const items = MENU[role] || [];

  return (
    <aside className="w-56 md:w-64 bg-[#00331f] text-white min-h-screen flex flex-col">
      <div className="px-4 py-4 border-b border-green-900">
        <p className="text-sm font-semibold">Govt Land Portal</p>
        <p className="text-xs text-green-200 mt-1">
          Logged in as{" "}
          <span className="font-bold capitalize">
            {role || "Guest"}
          </span>
        </p>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block px-3 py-2 rounded-md text-sm font-medium ${
              location.pathname === item.to
                ? "bg-green-700 text-white"
                : "text-green-100 hover:bg-green-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <button
        onClick={logout}
        className="m-3 mt-auto bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-3 py-2 rounded-md"
      >
        Logout
      </button>
    </aside>
  );
}

