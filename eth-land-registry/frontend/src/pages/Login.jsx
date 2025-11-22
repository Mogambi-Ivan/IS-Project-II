// frontend/src/pages/Login.jsx
import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { login } = useUser();
  const [role, setRole] = useState("owner");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!role) {
      alert("Please select a role.");
      return;
    }
    login(role);        // 🔑 this is what unlocks the dashboards
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f3faf5]">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md border border-green-100">
        <h1 className="text-2xl font-bold text-center text-[#003366] mb-2">
          Kenya Land Registry
        </h1>
        <p className="text-sm text-gray-600 text-center mb-6">
          Choose a role to access the system.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border rounded px-3 py-2 text-sm"
            >
              <option value="owner">Land Owner</option>
              <option value="government">Government Official</option>
              
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-[#004225] text-white py-2 rounded-md font-semibold hover:bg-green-900"
          >
            Access System
          </button>
        </form>
      </div>
    </div>
  );
}
