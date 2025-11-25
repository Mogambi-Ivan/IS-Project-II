// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getContractReadOnly,
  getContractWithSigner,
} from "../utils/ethereum";

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    // One-time cleanup of legacy mock data
    try {
      localStorage.removeItem("landRequests");
      localStorage.removeItem("registeredLands");
    } catch (e) {
      // ignore if not available
    }
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

      // All requested land IDs (both pending + registered)
      const ids = await contract.getRequestedLandIds();

      const allLands = await Promise.all(
        ids.map(async (idBN) => {
          const id = idBN.toNumber();
          const land = await contract.landRecords(id);

          return {
            landId: land.landId.toNumber(),
            ownerName: land.ownerName,
            nationalId: land.nationalId,
            titleNumber: land.titleNumber,
            location: land.location,
            size: land.size,
            landType: land.landType,
            currentOwner: land.currentOwner,
            isRegistered: land.isRegistered,
            approvedAt: land.approvedAt.toNumber(),
          };
        })
      );

      const pendingList = allLands.filter((l) => !l.isRegistered);
      const registeredList = allLands.filter((l) => l.isRegistered);

      setPending(pendingList);
      setRegistered(registeredList);
    } catch (err) {
      console.error("Failed to load lands:", err);
      alert(
        "Could not load land data from the blockchain. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(landId) {
    setActingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider");

      const tx = await contract.approveLand(landId);
      await tx.wait();

      alert("Land approved on-chain ✅");
      await loadAll();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Approve failed. No local fallback has been used.");
    } finally {
      setActingId(null);
    }
  }

  function formatApprovedAt(value) {
    if (!value) return "-";

    // on-chain: seconds
    if (typeof value === "number") {
      return new Date(value * 1000).toLocaleString();
    }

    // legacy string (if ever)
    return new Date(value).toLocaleString();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Government / Admin Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Registered Lands</p>
          <p className="text-2xl font-bold">{registered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold">
            {pending.length + registered.length}
          </p>
        </div>
      </div>

      {/* Pending requests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Pending Registration Requests</h2>
        {loading ? (
          <p>Loading from blockchain...</p>
        ) : pending.length === 0 ? (
          <p className="text-gray-600">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">Land ID</th>
                  <th className="px-2">Owner Name</th>
                  <th className="px-2">National ID</th>
                  <th className="px-2">Title #</th>
                  <th className="px-2">Location</th>
                  <th className="px-2">Size</th>
                  <th className="px-2">Type</th>
                  <th className="px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((r) => (
                  <tr key={r.landId} className="border-b last:border-b-0">
                    <td className="py-2 px-2">{r.landId}</td>
                    <td className="px-2">{r.ownerName}</td>
                    <td className="px-2">{r.nationalId}</td>
                    <td className="px-2">{r.titleNumber}</td>
                    <td className="px-2">{r.location}</td>
                    <td className="px-2">{r.size}</td>
                    <td className="px-2">{r.landType}</td>
                    <td className="px-2 text-right">
                      <button
                        onClick={() => handleApprove(r.landId)}
                        disabled={actingId === r.landId}
                        className="bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 disabled:opacity-60"
                      >
                        {actingId === r.landId ? "Approving..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Registered lands */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Registered Lands</h2>
        {loading ? (
          <p>Loading from blockchain...</p>
        ) : registered.length === 0 ? (
          <p className="text-gray-600">No registered lands yet.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">Land ID</th>
                  <th className="px-2">Owner Name</th>
                  <th className="px-2">National ID</th>
                  <th className="px-2">Title #</th>
                  <th className="px-2">Location</th>
                  <th className="px-2">Size</th>
                  <th className="px-2">Type</th>
                  <th className="px-2">Approved At</th>
                </tr>
              </thead>
              <tbody>
                {registered.map((r) => (
                  <tr key={r.landId} className="border-b last:border-b-0">
                    <td className="py-2 px-2">{r.landId}</td>
                    <td className="px-2">{r.ownerName}</td>
                    <td className="px-2">{r.nationalId}</td>
                    <td className="px-2">{r.titleNumber}</td>
                    <td className="px-2">{r.location}</td>
                    <td className="px-2">{r.size}</td>
                    <td className="px-2">{r.landType}</td>
                    <td className="px-2">{formatApprovedAt(r.approvedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
