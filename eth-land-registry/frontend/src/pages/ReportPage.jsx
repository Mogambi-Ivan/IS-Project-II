// frontend/src/pages/ReportPage.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getContractReadOnly } from "../utils/ethereum";


const ReportPage = () => {
  const [registeredLands, setRegisteredLands] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRegisteredLands();
  }, []);

  // -----------------------------
  // ON-CHAIN FIRST: Load registered lands
  // -----------------------------
  async function loadRegisteredLands() {
    setLoading(true);
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

      setLoading(false);
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

      setLoading(false);
    }
  }

  // -----------------------------
  // Export PDF Report
  // -----------------------------
  function exportToPDF() {
    if (!registeredLands || registeredLands.length === 0) {
      alert("No registered lands to export.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Land Registry Report (Registered Lands)", 14, 15);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 22);

    const tableData = registeredLands.map((l, i) => [
      i + 1,
      l.landId,
      l.ownerName,
      l.nationalId,
      l.titleNumber,
      l.location,
      l.size,
      l.landType,
      l.currentOwner ? l.currentOwner.slice(0, 10) + "..." : "N/A",
      l.approvedAt
        ? new Date(l.approvedAt * 1000).toLocaleDateString()
        : "N/A",
    ]);

    autoTable(doc, {
      head: [
        [
          "#",
          "Land ID",
          "Owner Name",
          "National ID",
          "Title Number",
          "Location",
          "Size",
          "Type",
          "Owner Wallet",
          "Approved Date",
        ],
      ],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [0, 102, 51] }, // deep green Kenyan gov vibe
    });

    doc.save("Land_Registry_Report.pdf");
  }

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <h1 className="text-2xl font-semibold">
          Registered Lands Report
        </h1>

        <div className="flex gap-2">
          <button
            onClick={loadRegisteredLands}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Refresh
          </button>

          <button
            onClick={exportToPDF}
            className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
          >
            Export PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-gray-600">Loading registered lands...</p>
        ) : registeredLands.length === 0 ? (
          <p className="text-gray-600">No registered lands found.</p>
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
                  <th>Owner Wallet</th>
                  <th>Approved At</th>
                </tr>
              </thead>
              <tbody>
                {registeredLands.map((l, idx) => (
                  <tr key={idx} className="border-b last:border-b-0">
                    <td className="py-2">{l.landId}</td>
                    <td>{l.ownerName}</td>
                    <td>{l.nationalId}</td>
                    <td>{l.titleNumber}</td>
                    <td>{l.location}</td>
                    <td>{l.size}</td>
                    <td>{l.landType}</td>
                    <td className="font-mono text-xs">
                      {l.currentOwner
                        ? l.currentOwner.slice(0, 10) + "..."
                        : "N/A"}
                    </td>
                    <td>
                      {l.approvedAt
                        ? new Date(l.approvedAt * 1000).toLocaleString()
                        : "N/A"}
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

export default ReportPage;
