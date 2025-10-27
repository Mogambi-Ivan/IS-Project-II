import { useState } from "react";

export default function Sidebar({ currentPage, setPage }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <aside
      className={`bg-gray-900 text-gray-100 h-screen ${
        isOpen ? "w-64" : "w-20"
      } transition-all duration-300 flex flex-col`}
    >
      <button
        className="p-3 text-gray-400 hover:text-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>
      <ul className="mt-4">
        <li
          onClick={() => setPage("dashboard")}
          className={`p-3 cursor-pointer ${
            currentPage === "dashboard" ? "bg-gray-700" : ""
          } hover:bg-gray-700`}
        >
          Dashboard
        </li>
        <li
          onClick={() => setPage("register")}
          className={`p-3 cursor-pointer ${
            currentPage === "register" ? "bg-gray-700" : ""
          } hover:bg-gray-700`}
        >
          Register Property
        </li>
      </ul>
    </aside>
  );
}
