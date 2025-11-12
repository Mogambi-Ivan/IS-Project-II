import { useUser } from "../context/UserContext";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function AdminDashboard() {
  const { logout } = useUser();
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("landRequests") || "[]");
    setRequests(data);
  }, []);

  const approveRequest = (index) => {
    const data = [...requests];
    const approved = data.splice(index, 1);

    let registered = JSON.parse(localStorage.getItem("registeredLands") || "[]");
    registered.push(approved[0]);

    localStorage.setItem("registeredLands", JSON.stringify(registered));
    localStorage.setItem("landRequests", JSON.stringify(data));

    setRequests(data);
    alert("✅ Land approved & added to registry");
  };

  // Stats
  const stats = {
    totalProperties: JSON.parse(localStorage.getItem("registeredLands") || "[]").length,
    pendingRequests: requests.length,
    registeredOwners: 30,
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4 text-[#003366]">
        Government Land Registry Dashboard
      </h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-white shadow rounded border">
          <h3 className="font-bold text-gray-600">Total Registered</h3>
          <p className="text-2xl font-bold">{stats.totalProperties}</p>
        </div>

        <div className="p-4 bg-white shadow rounded border">
          <h3 className="font-bold text-gray-600">Pending Requests</h3>
          <p className="text-2xl font-bold">{stats.pendingRequests}</p>
        </div>

        <div className="p-4 bg-white shadow rounded border">
          <h3 className="font-bold text-gray-600">Registered Owners</h3>
          <p className="text-2xl font-bold">{stats.registeredOwners}</p>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2">Pending Land Requests</h3>
      <table className="w-full border mb-4">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Owner</th>
            <th className="border p-2">ID</th>
            <th className="border p-2">Title No.</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Approve</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, i) => (
            <tr key={i}>
              <td className="border p-2">{r.ownerName}</td>
              <td className="border p-2">{r.nationalId}</td>
              <td className="border p-2">{r.titleNumber}</td>
              <td className="border p-2">{r.location}</td>
              <td className="border p-2">
                <button className="bg-blue-600 text-white px-2 py-1 rounded"
                  onClick={() => approveRequest(i)}>
                  ✅ Approve
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Link to="/reports" className="px-4 py-2 bg-[#003366] text-white rounded shadow">
        View Reports
      </Link>

      <button onClick={logout}
        className="ml-4 px-4 py-2 bg-red-600 text-white rounded">
        Logout
      </button>
    </div>
  );
}
