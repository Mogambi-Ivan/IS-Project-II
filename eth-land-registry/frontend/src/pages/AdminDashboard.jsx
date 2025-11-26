// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getContractReadOnly,
  getContractWithSigner,
} from "../utils/ethereum";

const AdminDashboard = () => {
  const [pending, setPending] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

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
            isRejected: land.isRejected,
            rejectionReason: land.rejectionReason,
          };
        })
      );

      const pendingList = allLands.filter(
        (l) => !l.isRegistered && !l.isRejected
      );
      const registeredList = allLands.filter((l) => l.isRegistered);
      const rejectedList = allLands.filter((l) => l.isRejected);

      setPending(pendingList);
      setRegistered(registeredList);
      setRejected(rejectedList);
    } catch (err) {
      console.error("Failed to load lands:", err);
      alert(
        "Could not load land data from the blockchain. Confirm your network connection and check console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(landId) {
    setApprovingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider");

      const tx = await contract.approveLand(landId);
      await tx.wait();

      alert("Land approved on-chain ✅");
      await loadAll();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Approve failed. See console for details.");
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(landId) {
    const reason = window.prompt(
      "Enter reason for rejecting this land registration"
    );
    if (!reason || !reason.trim()) return;

    setRejectingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider");

      const tx = await contract.rejectLand(landId, reason.trim());
      await tx.wait();

      alert("Land registration rejected on-chain ✅");
      await loadAll();
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Reject failed. See console for details.");
    } finally {
      setRejectingId(null);
    }
  }

  function formatApprovedAt(value) {
    if (!value) return "-";
    return new Date(value * 1000).toLocaleString();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Government / Admin Dashboard
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Registered Lands</p>
          <p className="text-2xl font-bold">{registered.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Rejected Requests</p>
          <p className="text-2xl font-bold">{rejected.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Records</p>
          <p className="text-2xl font-bold">
            {pending.length + registered.length + rejected.length}
          </p>
        </div>
      </div>

      {/* Pending requests */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">
          Pending Registration Requests
        </h2>
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
                    <td className="px-2 text-right space-x-2">
                      <button
                        onClick={() => handleApprove(r.landId)}
                        disabled={approvingId === r.landId}
                        className="bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 disabled:opacity-60"
                      >
                        {approvingId === r.landId ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(r.landId)}
                        disabled={rejectingId === r.landId}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60"
                      >
                        {rejectingId === r.landId ? "Rejecting..." : "Reject"}
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
      <section className="mb-8">
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
                    <td className="px-2">
                      {formatApprovedAt(r.approvedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Rejected requests */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Rejected Requests</h2>
        {loading ? (
          <p>Loading from blockchain...</p>
        ) : rejected.length === 0 ? (
          <p className="text-gray-600">No rejected requests.</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-xl shadow">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 px-2">Land ID</th>
                  <th className="px-2">Owner Name</th>
                  <th className="px-2">Title #</th>
                  <th className="px-2">Location</th>
                  <th className="px-2">Reason</th>
                </tr>
              </thead>
              <tbody>
                {rejected.map((r) => (
                  <tr key={r.landId} className="border-b last:border-b-0">
                    <td className="py-2 px-2">{r.landId}</td>
                    <td className="px-2">{r.ownerName}</td>
                    <td className="px-2">{r.titleNumber}</td>
                    <td className="px-2">{r.location}</td>
                    <td className="px-2">{r.rejectionReason || "-"}</td>
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
