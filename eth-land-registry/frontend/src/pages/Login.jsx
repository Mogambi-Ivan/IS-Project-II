import { useState } from "react";
import { useUser } from "../context/UserContext.jsx";

export default function Login() {
  const { login } = useUser();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  function handleLogin(e) {
    e.preventDefault();
    if (!name.trim() || !role) {
      alert("Please enter a name and select a role.");
      return;
    }

    login(name, role);
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form className="bg-white p-6 rounded shadow-lg w-80" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4 text-center">Land Registry Login</h2>

        <label className="block mb-2 text-sm font-semibold">Full Name</label>
        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name"
        />

        <label className="block mb-2 text-sm font-semibold">Select Role</label>
        <select
          className="border p-2 w-full mb-4 rounded"
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          <option value="admin">Government Officer</option>
          <option value="owner">Land Owner</option>
        </select>

        <button
          type="submit"
          className="bg-green-600 text-white w-full py-2 mt-2 rounded hover:bg-green-700"
        >
          Login
        </button>
      </form>
    </div>
  );
}
