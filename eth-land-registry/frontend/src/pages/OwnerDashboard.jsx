// frontend/src/pages/OwnerDashboard.jsx
import React, { useEffect, useState } from "react";
import { getContractReadOnly, getCurrentWallet } from "../utils/ethereum";


const OwnerDashboard = () => {
  const [myPending, setMyPending] = useState([]);
  const [myLands, setMyLands] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingLands, setLoadingLands] = useState(false);

  useEffect(() => {
    loadMyPendingRequests();
    loadMyRegisteredLands();
  }, []);

  // Try to find current user (for MOCK fallback filtering)
  function getMockUserNationalId() {
    try {
      const keysToTry = ["currentUser", "user", "selectedUser", "loggedInUser"];
      for (const k of keysToTry) {
        const val = localStorage.getItem(k);
        if (!val) continue;
        const parsed = JSON.parse(val);
        if (parsed?.nationalId) return parsed.nationalId;
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  // -----------------------------
  // ON-CHAIN FIRST: My pending requests
  // -----------------------------
  async function loadMyPendingRequests() {
    setLoadingPending(true);
    try {
      const wallet = await getCurrentWallet();
      const contract = await getContractReadOnly();
      if (!wallet || !contract) throw new Error("No wallet/provider");

      const ids = await contract.getRequestedLandIds();

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
            isRegistered: land.isRegistered,
          };
        })
      );

      const pendingMine = lands.filter(
        (l) => !l.isRegistered && l.currentOwner.toLowerCase() === wallet.toLowerCase()
      );

      setMyPending(pendingMine);
      setLoadingPending(false);
      return;
    } catch (err) {
      console.log("On-chain pending fetch failed, using mock:", err);

      // -----------------------------
      // MOCK FALLBACK
      // -----------------------------
      try {
        const nationalId = getMockUserNationalId();
        const stored = JSON.parse(localStorage.getItem("landRequests")) || [];

        const pendingMine = stored.filter((r) => {
          const isPending = r.status === "Pending";
          if (!nationalId) return isPending;
          return isPending && String(r.nationalId) === String(nationalId);
        });

        setMyPending(pendingMine);
      } catch (mockErr) {
        console.error("Mock pending fetch failed:", mockErr);
      }

      setLoadingPending(false);
    }
  }

  // -----------------------------
  // ON-CHAIN FIRST: My registered lands
  // -----------------------------
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
      setLoadingLands(false);
      return;
    } catch (err) {
      console.log("On-chain lands fetch failed, using mock:", err);

      // -----------------------------
      // MOCK FALLBACK
      // -----------------------------
      try {
        const nationalId = getMockUserNationalId();
        const stored = JSON.parse(localStorage.getItem("registeredLands")) || [];

        const mine = stored.filter((l) => {
          if (!nationalId) return true;
          return String(l.nationalId) === String(nationalId);
        });

        setMyLands(mine);
      } catch (mockErr) {
        console.error("Mock lands fetch failed:", mockErr);
      }

      setLoadingLands(false);
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5">
        <h1 className="text-2xl font-semibold">Landowner Dashboard</h1>

        <button
          onClick={() => {
            loadMyPendingRequests();
            loadMyRegisteredLands();
          }}
          className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
        >
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">My Pending Requests</p>
          <p className="text-2xl font-bold">{myPending.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">My Registered Lands</p>
          <p className="text-2xl font-bold">{myLands.length}</p>
        </div>
      </div>

      {/* Pending requests section */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">My Pending Requests</h2>

        {loadingPending ? (
          <p className="text-gray-600">Loading pending requests...</p>
        ) : myPending.length === 0 ? (
          <p className="text-gray-600">You have no pending requests.</p>
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
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {myPending.map((r, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{r.landId}</td>
                    <td>{r.titleNumber}</td>
                    <td>{r.location}</td>
                    <td>{r.size}</td>
                    <td>{r.landType}</td>
                    <td className="text-orange-700 font-medium">Pending</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered lands section */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">My Registered Lands</h2>

        {loadingLands ? (
          <p className="text-gray-600">Loading registered lands...</p>
        ) : myLands.length === 0 ? (
          <p className="text-gray-600">You have no registered lands yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Land ID</th>
                  <th>Owner Name</th>
                  <th>National ID</th>
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
                    <td>{l.ownerName}</td>
                    <td>{l.nationalId}</td>
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
  );
};

export default OwnerDashboard;
