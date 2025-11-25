// frontend/src/pages/AdminTransfersPage.jsx
import React, { useEffect, useState } from "react";
import { getContractReadOnly, getContractWithSigner } from "../utils/ethereum";

const AdminTransfersPage = () => {
  const [pendingTransfers, setPendingTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState(null);

  useEffect(() => {
    loadPendingTransfers();
  }, []);

  async function loadPendingTransfers() {
    setLoading(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

      const ids = await contract.getPendingTransferIds();

      const transfers = await Promise.all(
        ids.map(async (idBN) => {
          const id = idBN.toNumber();
          const req = await contract.transferRequests(id);
          const land = await contract.landRecords(id);

          // Skip if no request or already decided
          if (
            req.fromOwner === "0x0000000000000000000000000000000000000000" ||
            req.approved ||
            req.rejected
          ) {
            return null;
          }

          return {
            landId: id,
            fromOwner: req.fromOwner,
            toOwner: req.toOwner,
            proposedNewOwnerName: req.proposedNewOwnerName,
            approved: req.approved,
            rejected: req.rejected,
            decidedAt: req.decidedAt.toNumber(),
            titleNumber: land.titleNumber,
            location: land.location,
            size: land.size,
            landType: land.landType,
          };
        })
      );

      const filtered = transfers.filter((t) => t !== null);
      setPendingTransfers(filtered);
    } catch (err) {
      console.error("Failed to load pending transfers:", err);
      alert("Could not load transfer requests. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(landId) {
    setActingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider");

      const tx = await contract.approveTransfer(landId);
      await tx.wait();

      alert("Transfer approved on-chain ✅");
      await loadPendingTransfers();
    } catch (err) {
      console.error("Approve transfer failed:", err);
      alert("Approve failed. Check console for details.");
    } finally {
      setActingId(null);
    }
  }

  async function handleReject(landId) {
    setActingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider");

      const tx = await contract.rejectTransfer(landId);
      await tx.wait();

      alert("Transfer rejected on-chain ✅");
      await loadPendingTransfers();
    } catch (err) {
      console.error("Reject transfer failed:", err);
      alert("Reject failed. Check console for details.");
    } finally {
      setActingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Transfer Requests</h1>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-gray-600">Loading pending transfer requests...</p>
        ) : pendingTransfers.length === 0 ? (
          <p className="text-gray-600">No pending transfer requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Land ID</th>
                  <th>Title #</th>
                  <th>Location</th>
                  <th>From Owner</th>
                  <th>To Owner</th>
                  <th>New Owner Name</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransfers.map((t, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{t.landId}</td>
                    <td>{t.titleNumber}</td>
                    <td>{t.location}</td>
                    <td className="font-mono text-xs">
                      {t.fromOwner.slice(0, 10)}...
                    </td>
                    <td className="font-mono text-xs">
                      {t.toOwner.slice(0, 10)}...
                    </td>
                    <td>{t.proposedNewOwnerName}</td>
                    <td className="text-right space-x-2">
                      <button
                        onClick={() => handleApprove(t.landId)}
                        disabled={actingId === t.landId}
                        className="bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 disabled:opacity-60"
                      >
                        {actingId === t.landId ? "Approving..." : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(t.landId)}
                        disabled={actingId === t.landId}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 disabled:opacity-60"
                      >
                        {actingId === t.landId ? "Rejecting..." : "Reject"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransfersPage;
