// frontend/src/pages/ReportPage.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getContractReadOnly } from "../utils/ethereum";

const ReportPage = () => {
  const [registered, setRegistered] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // clear any legacy mock
    try {
      localStorage.removeItem("registeredLands");
    } catch (e) {}
    loadRegistered();
  }, []);

  async function loadRegistered() {
    setLoading(true);
    try {
      const contract = await getContractReadOnly();
      if (!contract) throw new Error("No provider");

      const ids = await contract.getRequestedLandIds();

      const all = await Promise.all(
        ids.map(async (idBN) => {
          const id = idBN.toNumber();

          const land = await contract.landRecords(id);
          const tr = await contract.transferRequests(id);

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
            ownerName: displayOwnerName,
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

      const reg = all.filter((l) => l.isRegistered);
      setRegistered(reg);
    } catch (err) {
      console.error("Failed to load report data:", err);
      alert(
        "Could not load report data from the blockchain. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  }

  function exportPDF() {
    if (registered.length === 0) {
      alert("No registered lands to export.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(
      "Kenya Blockchain Land Registry - Registered Lands Report",
      14,
      16
    );

    const rows = registered.map((r) => [
      r.landId,
      r.ownerName,
      r.nationalId,
      r.titleNumber,
      r.location,
      r.size,
      r.landType,
      r.currentOwner.slice(0, 10) + "...",
      r.approvedAt ? new Date(r.approvedAt * 1000).toLocaleString() : "-",
    ]);

    autoTable(doc, {
      startY: 24,
      head: [
        [
          "Land ID",
          "Owner",
          "National ID",
          "Title #",
          "Location",
          "Size",
          "Type",
          "Wallet",
          "Approved At",
        ],
      ],
      body: rows,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 80, 40] },
    });

    doc.save("registered-lands-report.pdf");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">
        Registered Lands Report (On-chain)
      </h1>

      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={loadRegistered}
          className="bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800"
        >
          Refresh from Blockchain
        </button>

        <button
          onClick={exportPDF}
          disabled={registered.length === 0}
          className="bg-blue-700 text-white px-3 py-2 rounded-lg hover:bg-blue-800 disabled:opacity-60"
        >
          Export PDF
        </button>
      </div>

      {loading ? (
        <p>Loading report data from blockchain...</p>
      ) : registered.length === 0 ? (
        <p className="text-gray-600">No registered lands yet.</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 px-2">Land ID</th>
                <th className="px-2">Owner</th>
                <th className="px-2">National ID</th>
                <th className="px-2">Title #</th>
                <th className="px-2">Location</th>
                <th className="px-2">Size</th>
                <th className="px-2">Type</th>
                <th className="px-2">Wallet</th>
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
                  <td className="px-2 font-mono text-xs">
                    {r.currentOwner.slice(0, 10)}...
                  </td>
                  <td className="px-2">
                    {r.approvedAt
                      ? new Date(r.approvedAt * 1000).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
