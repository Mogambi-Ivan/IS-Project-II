// frontend/src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import {
  getContractReadOnly,
  getCurrentWallet,
} from "../utils/ethereum";

const OwnerDashboard = () => {
  const [wallet, setWallet] = useState(null);
  const [pending, setPending] = useState([]);
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMyLands();
  }, []);

  async function loadMyLands() {
    setLoading(true);
    try {
      const w = await getCurrentWallet();
      const contract = await getContractReadOnly();

      if (!w || !contract) throw new Error("No wallet / provider");

      setWallet(w);

      // 1. Get ALL land IDs ever requested
      const ids = await contract.getRequestedLandIds();

      const all = await Promise.all(
        ids.map(async (idBN) => {
          const id = idBN.toNumber();

          const land = await contract.landRecords(id);
          const tr = await contract.transferRequests(id); // may be empty struct

          const landId = land.landId.toNumber();
          const isRegistered = land.isRegistered;
          const approvedAt = land.approvedAt.toNumber();
          const currentOwner = land.currentOwner;

          const hasApprovedTransfer = tr.approved;
          const displayOwnerName = hasApprovedTransfer
            ? tr.proposedNewOwnerName
            : land.ownerName;

          return {
            landId,
            originalOwnerName: land.ownerName,
            displayOwnerName,
            nationalId: land.nationalId,
            titleNumber: land.titleNumber,
            location: land.location,
            size: land.size,
            landType: land.landType,
            currentOwner,
            isRegistered,
            approvedAt,
          };
        })
      );

      // 2. Filter by TRUE owner (currentOwner)
      const my = all.filter(
        (l) =>
          l.currentOwner.toLowerCase() === w.toLowerCase()
      );

      const myPending = my.filter((l) => !l.isRegistered);
      const myRegistered = my.filter((l) => l.isRegistered);

      setPending(myPending);
      setRegistered(myRegistered);
    } catch (err) {
      console.error("Failed to load owner lands:", err);
      alert(
        "Could not load your lands from the blockchain. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(sec) {
    if (!sec) return "-";
    return new Date(sec * 1000).toLocaleString();
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Landowner Dashboard</h1>

      {wallet && (
        <p className="text-xs text-gray-600 mb-4">
          Connected wallet: <span className="font-mono">{wallet}</span>
        </p>
      )}

      <button
        onClick={loadMyLands}
        className="mb-4 bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800"
      >
        Refresh
      </button>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">My Pending Requests</p>
          <p className="text-2xl font-bold">{pending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">My Registered Lands</p>
          <p className="text-2xl font-bold">{registered.length}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading from blockchain...</p>
      ) : (
        <>
          {/* Pending */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">My Pending Requests</h2>
            {pending.length === 0 ? (
              <p className="text-gray-600">You have no pending requests.</p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 px-2">Land ID</th>
                      <th className="px-2">Owner Name</th>
                      <th className="px-2">Title #</th>
                      <th className="px-2">Location</th>
                      <th className="px-2">Size</th>
                      <th className="px-2">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pending.map((r) => (
                      <tr key={r.landId} className="border-b last:border-b-0">
                        <td className="py-2 px-2">{r.landId}</td>
                        <td className="px-2">{r.displayOwnerName}</td>
                        <td className="px-2">{r.titleNumber}</td>
                        <td className="px-2">{r.location}</td>
                        <td className="px-2">{r.size}</td>
                        <td className="px-2">{r.landType}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Registered */}
          <section>
            <h2 className="text-xl font-semibold mb-2">My Registered Lands</h2>
            {registered.length === 0 ? (
              <p className="text-gray-600">
                You have no registered lands under your wallet.
              </p>
            ) : (
              <div className="overflow-x-auto bg-white rounded-xl shadow">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 px-2">Land ID</th>
                      <th className="px-2">Owner Name</th>
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
                        <td className="px-2">{r.displayOwnerName}</td>
                        <td className="px-2">{r.titleNumber}</td>
                        <td className="px-2">{r.location}</td>
                        <td className="px-2">{r.size}</td>
                        <td className="px-2">{r.landType}</td>
                        <td className="px-2">{formatDate(r.approvedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default OwnerDashboard;
