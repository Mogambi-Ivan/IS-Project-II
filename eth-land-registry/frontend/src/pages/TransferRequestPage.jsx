// frontend/src/pages/TransferRequestPage.jsx
import React, { useEffect, useState } from "react";
import {
  getContractReadOnly,
  getContractWithSigner,
  getCurrentWallet,
} from "../utils/ethereum";

const TransferRequestPage = () => {
  const [myLands, setMyLands] = useState([]);
  const [loadingLands, setLoadingLands] = useState(false);

  const [form, setForm] = useState({
    landId: "",
    newOwnerAddress: "",
    newOwnerName: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadMyRegisteredLands();
  }, []);

  async function loadMyRegisteredLands() {
    setLoadingLands(true);
    try {
      const wallet = await getCurrentWallet();
      const contract = await getContractReadOnly();
      if (!wallet || !contract) throw new Error("No wallet/provider");

      const ids = await contract.getLandsByOwner(wallet);

      const lands = await Promise.all(
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
            approvedAt: land.approvedAt.toNumber(),
          };
        })
      );

      setMyLands(lands);
    } catch (err) {
      console.error("Failed to load my lands for transfer:", err);
      alert("Could not load your registered lands. Check console for details.");
    } finally {
      setLoadingLands(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const landIdNum = Number(form.landId);

      if (!landIdNum) {
        alert("Please select a land to transfer.");
        setSubmitting(false);
        return;
      }

      if (!form.newOwnerAddress || !form.newOwnerName.trim()) {
        alert("Please provide the new owner's wallet address and name.");
        setSubmitting(false);
        return;
      }

      const wallet = await getCurrentWallet();
      if (
        wallet &&
        wallet.toLowerCase() === form.newOwnerAddress.trim().toLowerCase()
      ) {
        alert("New owner address cannot be the same as your own address.");
        setSubmitting(false);
        return;
      }

      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet/provider for transfer.");

      const tx = await contract.requestTransfer(
        landIdNum,
        form.newOwnerAddress.trim(),
        form.newOwnerName.trim()
      );

      await tx.wait();

      alert("Transfer request submitted on-chain ✅");
      setForm({
        landId: "",
        newOwnerAddress: "",
        newOwnerName: "",
      });
    } catch (err) {
      console.error("Transfer request failed:", err);
      alert("Transfer request failed. See console for details.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Request Land Transfer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">Create Transfer Request</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select land */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Select Land to Transfer
              </label>
              <select
                name="landId"
                value={form.landId}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
              >
                <option value="">-- Choose one of your registered lands --</option>
                {myLands.map((land) => (
                  <option key={land.landId} value={land.landId}>
                    {land.landId} - {land.titleNumber} ({land.location})
                  </option>
                ))}
              </select>
            </div>

            {/* New owner address */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Owner Wallet Address
              </label>
              <input
                type="text"
                name="newOwnerAddress"
                value={form.newOwnerAddress}
                onChange={handleChange}
                className="w-full border rounded-lg p-2 font-mono text-xs"
                placeholder="0x..."
              />
              <p className="text-xs text-gray-500 mt-1">
                For testing on Hardhat, you can use another test account address
                (e.g. Account #2).
              </p>
            </div>

            {/* New owner name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                New Owner Name
              </label>
              <input
                type="text"
                name="newOwnerName"
                value={form.newOwnerName}
                onChange={handleChange}
                className="w-full border rounded-lg p-2"
                placeholder="Full name of the new owner"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-700 text-white py-2 rounded-lg hover:bg-green-800 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit Transfer Request"}
            </button>
          </form>
        </div>

        {/* Right: My registered lands */}
        <div className="bg-white rounded-xl shadow p-4">
          <h2 className="text-lg font-semibold mb-3">My Registered Lands</h2>
          {loadingLands ? (
            <p className="text-gray-600">Loading your lands...</p>
          ) : myLands.length === 0 ? (
            <p className="text-gray-600">
              You currently have no registered lands available for transfer.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2">Land ID</th>
                    <th>Title #</th>
                    <th>Location</th>
                    <th>Size</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {myLands.map((l, idx) => (
                    <tr key={idx} className="border-b last:border-b-0">
                      <td className="py-2">{l.landId}</td>
                      <td>{l.titleNumber}</td>
                      <td>{l.location}</td>
                      <td>{l.size}</td>
                      <td>{l.landType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferRequestPage;
