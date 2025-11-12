import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const { logout } = useUser();

  const [registeredLands, setRegisteredLands] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const lands = JSON.parse(localStorage.getItem("registeredLands") || "[]");
    const pending = JSON.parse(localStorage.getItem("pendingLands") || "[]");

    setRegisteredLands(lands);
    setPendingRequests(pending);
  }, []);

  const approveLand = (index) => {
    const selected = pendingRequests[index];
    const updatedPending = [...pendingRequests];
    updatedPending.splice(index, 1);

    const updatedRegistered = [...registeredLands, selected];

    localStorage.setItem("pendingLands", JSON.stringify(updatedPending));
    localStorage.setItem("registeredLands", JSON.stringify(updatedRegistered));

    setPendingRequests(updatedPending);
    setRegisteredLands(updatedRegistered);

    alert("✅ Land approved & added to Registry.");
  };

  const totalOwners = new Set(registeredLands.map((l) => l.nationalId)).size;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <h2 className="text-2xl font-bold text-[#004225] mb-6">
        Government Land Registry Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 border rounded shadow text-center">
          <h3 className="font-bold">Total Registered Lands</h3>
          <p className="text-2xl font-bold text-green-700">{registeredLands.length}</p>
        </div>

        <div className="bg-white p-4 border rounded shadow text-center">
          <h3 className="font-bold">Pending Requests</h3>
          <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
        </div>

        <div className="bg-white p-4 border rounded shadow text-center">
          <h3 className="font-bold">Registered Owners</h3>
          <p className="text-2xl font-bold text-blue-700">{totalOwners}</p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <Link to="/reports" className="text-blue-700 underline font-semibold">
          📄 View Reports
        </Link>

        <button 
          onClick={logout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Pending table */}
      <h3 className="text-xl font-semibold mb-2 text-[#004225]">Pending Land Requests</h3>

      {pendingRequests.length === 0 ? (
        <p className="italic text-gray-600">No pending requests.</p>
      ) : (
        <table className="w-full bg-white shadow border">
          <thead className="bg-green-900 text-white">
            <tr>
              <th className="p-2 border">Owner</th>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Title No.</th>
              <th className="p-2 border">Location</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>

          <tbody>
            {pendingRequests.map((req, i) => (
              <tr key={i} className="text-center border">
                <td className="p-2 border">{req.ownerName}</td>
                <td className="p-2 border">{req.nationalId}</td>
                <td className="p-2 border">{req.titleNumber}</td>
                <td className="p-2 border">{req.location}</td>
                <td className="p-2 border">
                  <button
                    onClick={() => approveLand(i)}
                    className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800"
                  >
                    ✅ Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
