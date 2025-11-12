import { useState } from "react";
import { useUser } from "../context/UserContext";

export default function Login() {
  const { login } = useUser();

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleLogin = () => {
    if (!email || !role) return alert("Enter email & select role");

    login(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F2F6F2]">
      <div className="bg-white shadow-lg border border-green-700 rounded-lg p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center text-[#004225] mb-6">
          Kenya Land Registry Portal
        </h2>

        <label className="block font-semibold mb-1">Email</label>
        <input
          type="email"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <label className="block font-semibold mb-1">Select Role</label>
        <select
          className="w-full mb-6 p-2 border rounded"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">-- Select Role --</option>
          <option value="admin">Government Official</option>
          <option value="owner">Land Owner</option>
        </select>

        <button
          className="w-full bg-[#006A4E] text-white py-2 rounded hover:bg-green-800"
          onClick={handleLogin}
        >
          Login
        </button>

        <p className="text-center text-sm mt-4">
          Don't have an account?{" "}
          <a href="/register" className="text-blue-700 underline">Register here</a>
        </p>
      </div>
    </div>
  );
}
