import { useUser } from "../context/UserContext";
import { useState } from "react";

export default function Login() {
  const { login } = useUser();
  const [role, setRole] = useState("owner");
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return alert("Enter your full name");
    login(role, name);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      {/* Gov top strip */}
      <div className="fixed top-0 left-0 w-full h-2 bg-gradient-to-r from-green-700 via-red-600 to-black"></div>

      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-gray-200">

        <h2 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Kenya Digital Land Registry
        </h2>
        <p className="text-center text-gray-500 mb-8 text-sm">Secure Access Portal</p>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="block text-sm mb-1 font-medium">Full Name</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm mb-1 font-medium">Select Role</label>
            <select
              className="w-full border px-3 py-2 rounded"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="owner">Land Owner</option>
              <option value="admin">Government Officer</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 text-white py-2 rounded hover:bg-green-800 transition"
          >
            Access System
          </button>
        </form>

        <p className="mt-6 text-xs text-gray-400 text-center">
          Government of Kenya • Ministry of Lands
        </p>
      </div>
    </div>
  );
}
