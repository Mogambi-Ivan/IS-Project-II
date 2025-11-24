// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { getContractReadOnly, getContractWithSigner } from "../utils/ethereum";


const AdminDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [registeredLands, setRegisteredLands] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [loadingRegistered, setLoadingRegistered] = useState(false);
  const [approvingId, setApprovingId] = useState(null);

  useEffect(() => {
    loadPendingRequests();
    loadRegisteredLands();
  }, []);

  // -----------------------------
  // ON-CHAIN: Load pending requests
  // -----------------------------
  async function loadPendingRequests() {
    setLoadingPending(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

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
            approvedAt: land.approvedAt.toNumber(),
          };
        })
      );

      const pending = lands.filter((l) => !l.isRegistered);
      setPendingRequests(pending);

      setLoadingPending(false);
      return;
    } catch (err) {
      console.log("On-chain pending fetch failed, using mock:", err);

      // -----------------------------
      // MOCK FALLBACK (localStorage)
      // -----------------------------
      try {
        const stored = JSON.parse(localStorage.getItem("landRequests")) || [];
        const pendingMock = stored.filter((r) => r.status === "Pending");
        setPendingRequests(pendingMock);
      } catch (mockErr) {
        console.error("Mock pending fetch failed:", mockErr);
      }

      setLoadingPending(false);
    }
  }

  // -----------------------------
  // ON-CHAIN: Load registered lands
  // -----------------------------
  async function loadRegisteredLands() {
    setLoadingRegistered(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

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
            approvedAt: land.approvedAt.toNumber(),
          };
        })
      );

      const registered = lands.filter((l) => l.isRegistered);
      setRegisteredLands(registered);

      setLoadingRegistered(false);
      return;
    } catch (err) {
      console.log("On-chain registered fetch failed, using mock:", err);

      // -----------------------------
      // MOCK FALLBACK (localStorage)
      // -----------------------------
      try {
        const stored = JSON.parse(localStorage.getItem("registeredLands")) || [];
        setRegisteredLands(stored);
      } catch (mockErr) {
        console.error("Mock registered fetch failed:", mockErr);
      }

      setLoadingRegistered(false);
    }
  }

  // -----------------------------
  // APPROVE LAND
  // -----------------------------
  async function handleApprove(landId) {
    setApprovingId(landId);
    try {
      const contract = await getContractWithSigner();
      if (!contract) throw new Error("No wallet");

      const tx = await contract.approveLand(landId);
      await tx.wait();

      alert("Land approved on-chain ✅");
      await loadPendingRequests();
      await loadRegisteredLands();

      setApprovingId(null);
      return;
    } catch (err) {
      console.log("On-chain approve failed, using mock:", err);

      // -----------------------------
      // MOCK FALLBACK (localStorage approve)
      // -----------------------------
      try {
        const requests = JSON.parse(localStorage.getItem("landRequests")) || [];
        const registered = JSON.parse(localStorage.getItem("registeredLands")) || [];

        const updatedRequests = requests.map((r) => {
          if (Number(r.landId) === Number(landId)) {
            return { ...r, status: "Approved", approvedAt: new Date().toISOString() };
          }
          return r;
        });

        const approvedItem = updatedRequests.find(
          (r) => Number(r.landId) === Number(landId)
        );

        if (approvedItem) {
          localStorage.setItem("registeredLands", JSON.stringify([...registered, approvedItem]));
        }

        localStorage.setItem("landRequests", JSON.stringify(updatedRequests));

        alert("Wallet issue — approved locally (mock) ✅");
        await loadPendingRequests();
        await loadRegisteredLands();
      } catch (mockErr) {
        console.error("Mock approve failed:", mockErr);
        alert("Approve failed. Check console.");
      }

      setApprovingId(null);
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Government / Admin Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Pending Requests</p>
          <p className="text-2xl font-bold">{pendingRequests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Registered Lands</p>
          <p className="text-2xl font-bold">{registeredLands.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-4">
          <p className="text-sm text-gray-500">Total Requests</p>
          <p className="text-2xl font-bold">
            {pendingRequests.length + registeredLands.length}
          </p>
        </div>
      </div>

      {/* Pending Requests Table */}
      <div className="bg-white rounded-xl shadow p-4 mb-8">
        <h2 className="text-lg font-semibold mb-3">Pending Registration Requests</h2>

        {loadingPending ? (
          <p className="text-gray-600">Loading pending requests...</p>
        ) : pendingRequests.length === 0 ? (
          <p className="text-gray-600">No pending requests.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Land ID</th>
                  <th>Owner</th>
                  <th>National ID</th>
                  <th>Title #</th>
                  <th>Location</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingRequests.map((r, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{r.landId}</td>
                    <td>{r.ownerName}</td>
                    <td>{r.nationalId}</td>
                    <td>{r.titleNumber}</td>
                    <td>{r.location}</td>
                    <td>{r.size}</td>
                    <td>{r.landType}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleApprove(r.landId)}
                        disabled={approvingId === r.landId}
                        className="bg-green-700 text-white px-3 py-1 rounded-lg hover:bg-green-800 disabled:opacity-60"
                      >
                        {approvingId === r.landId ? "Approving..." : "Approve"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registered Lands Table */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-lg font-semibold mb-3">Registered Lands</h2>
        {loadingRegistered ? (
          <p className="text-gray-600">Loading registered lands...</p>
        ) : registeredLands.length === 0 ? (
          <p className="text-gray-600">No registered lands.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Land ID</th>
                  <th>Owner</th>
                  <th>National ID</th>
                  <th>Title #</th>
                  <th>Location</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Approved At</th>
                </tr>
              </thead>
              <tbody>
                {registeredLands.map((r, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{r.landId}</td>
                    <td>{r.ownerName}</td>
                    <td>{r.nationalId}</td>
                    <td>{r.titleNumber}</td>
                    <td>{r.location}</td>
                    <td>{r.size}</td>
                    <td>{r.landType}</td>
                    <td>
  {r.approvedAt
    ? new Date(
        typeof r.approvedAt === "string"
          ? r.approvedAt                      // mock ISO string
          : r.approvedAt * 1000               // on-chain seconds → ms
      ).toLocaleString()
    : "-"}
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

export default AdminDashboard;
