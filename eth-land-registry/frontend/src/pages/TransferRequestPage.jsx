// frontend/src/pages/TransferRequest.jsx
import React, { useEffect, useState } from "react";
import {
  getCurrentWallet,
  getContractReadOnly,
  getContractWithSigner,
} from "../utils/ethereum";

const TransferRequest = () => {
  const [wallet, setWallet] = useState("");
  const [registeredLands, setRegisteredLands] = useState([]);

  const [selectedLandId, setSelectedLandId] = useState("");
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerNationalId, setNewOwnerNationalId] = useState("");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyRegisteredLands();
  }, []);

  async function loadMyRegisteredLands() {
    setLoading(true);
    setError("");
    try {
      const w = await getCurrentWallet();
      const contract = await getContractReadOnly();

      if (!w || !contract) {
        throw new Error("Missing wallet or contract");
      }

      setWallet(w);
      const lower = w.toLowerCase();

      const ids = await contract.getRequestedLandIds();

      const all = await Promise.all(
        ids.map(async (idBN) => {
          const id = idBN.toNumber();

          const land = await contract.landRecords(id);
          const tr = await contract.transferRequests(id); // may be empty

          const landId = land.landId.toNumber();

          const hasApprovedTransfer = tr.approved;
          const displayOwnerName = hasApprovedTransfer
            ? tr.proposedNewOwnerName
            : land.ownerName;

          return {
            landId,
            ownerName: land.ownerName,
            displayOwnerName,
            nationalId: land.nationalId,
            titleNumber: land.titleNumber,
            location: land.location,
            size: land.size,
            landType: land.landType,
            currentOwner: land.currentOwner,
            isRegistered: land.isRegistered,
          };
        })
      );

      // Only lands that are registered AND currently owned by this wallet
      const myRegistered = all.filter(
        (l) =>
          l.isRegistered &&
          l.currentOwner.toLowerCase() === lower
      );

      setRegisteredLands(myRegistered);

      // Default selection if none chosen
      if (myRegistered.length > 0 && !selectedLandId) {
        setSelectedLandId(String(myRegistered[0].landId));
      }
    } catch (err) {
      console.error("Failed to load registered lands:", err);
      setError(
        "Could not load your registered lands from the blockchain. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!selectedLandId) {
      setError("Please select a land to transfer.");
      return;
    }

    if (!newOwnerNationalId.trim()) {
      setError("Please enter the new owner's National ID.");
      return;
    }

    setSubmitting(true);
    try {
      const contract = await getContractWithSigner();
      if (!contract) {
        throw new Error("No signer / provider");
      }

      const landIdNum = parseInt(selectedLandId, 10);

      // Contract expects: requestTransfer(uint256 landId, string newOwnerNationalId)
      const tx = await contract.requestTransfer(
        landIdNum,
        newOwnerNationalId.trim()
      );
      await tx.wait();

      alert(
        "Transfer request submitted on-chain ✅\n\nThe smart contract will look up the new owner's wallet and name using this National ID."
      );

      // Reset form and reload data
      setNewOwnerName("");
      setNewOwnerNationalId("");
      await loadMyRegisteredLands();
    } catch (err) {
      console.error("Transfer request failed:", err);
      setError(
        "Transfer request transaction failed. Ensure the new owner is registered with that National ID."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Request Land Transfer
      </h1>

      {wallet && (
        <p className="text-xs text-gray-600 mb-4">
          Connected wallet: <span className="font-mono">{wallet}</span>
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Create Transfer Request */}
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            Create Transfer Request
          </h2>

          {loading ? (
            <p>Loading your registered lands...</p>
          ) : registeredLands.length === 0 ? (
            <p className="text-gray-600">
              You currently have no registered lands under this wallet.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select land */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Select Land to Transfer
                </label>
                <select
                  value={selectedLandId}
                  onChange={(e) => setSelectedLandId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                >
                  {registeredLands.map((land) => (
                    <option
                      key={land.landId}
                      value={land.landId}
                    >
                      {land.landId} - {land.titleNumber} (
                      {land.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* New owner name (for display only) */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Owner Name
                </label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="e.g. Brian Kiptoo"
                />
                <p className="text-xs text-gray-500 mt-1">
                  
                </p>
              </div>

              {/* New owner National ID */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Owner National ID (must be already registered)
                </label>
                <input
                  type="text"
                  value={newOwnerNationalId}
                  onChange={(e) => setNewOwnerNationalId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="e.g. 31590287"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-700 hover:bg-green-800 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-60"
              >
                {submitting
                  ? "Submitting transfer request..."
                  : "Submit Transfer Request"}
              </button>

              {error && (
                <p className="text-sm text-red-600 mt-2">
                  {error}
                </p>
              )}
            </form>
          )}
        </section>

        {/* Right: My Registered Lands */}
        <section className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">
            My Registered Lands
          </h2>
          {loading ? (
            <p>Loading...</p>
          ) : registeredLands.length === 0 ? (
            <p className="text-gray-600">
              No registered lands found under this wallet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 px-2">Land ID</th>
                    <th className="px-2">Title #</th>
                    <th className="px-2">Location</th>
                    <th className="px-2">Size</th>
                    <th className="px-2">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {registeredLands.map((land) => (
                    <tr
                      key={land.landId}
                      className="border-b last:border-b-0"
                    >
                      <td className="py-2 px-2">{land.landId}</td>
                      <td className="px-2">{land.titleNumber}</td>
                      <td className="px-2">{land.location}</td>
                      <td className="px-2">{land.size}</td>
                      <td className="px-2">{land.landType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransferRequest;
