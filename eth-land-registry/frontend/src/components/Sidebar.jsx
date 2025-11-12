import { Link } from "react-router-dom";

export default function Sidebar() {
  const menu = [
    { path: "/", label: "Dashboard", icon: "📊" },
    { path: "/register-property", label: "Register Property", icon: "📝" },
    { path: "/view-lands", label: "View Lands", icon: "🏡" },
    { path: "/reports", label: "Reports", icon: "📑" },
  ];

  return (
  <aside className="bg-[#004225] text-white w-64 min-h-screen p-4">
      {/* Logo */}
      <div className="text-center mb-6">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Coat_of_arms_of_Kenya_%28Official%29.svg"
          className="w-14 mx-auto"
          alt="Kenya Coat of Arms"
        />
        <h2 className="mt-2 font-bold text-lg tracking-wide">
          Govt Land Portal
        </h2>
      </div>

      {/* Menu */}
      <nav className="space-y-2">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="block py-2 px-3 rounded hover:bg-green-700"
          >
            <span>{item.icon}</span> {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
