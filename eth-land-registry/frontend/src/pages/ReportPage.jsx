// frontend/src/pages/ReportPage.jsx

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";   // ✅ Correct import
import { useEffect, useState } from "react";

export default function ReportPage() {
  const [lands, setLands] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("registeredLands") || "[]");
    setLands(data);
  }, []);

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();

      doc.setFontSize(16);
      doc.text("Government Land Registry Report", 14, 14);

      autoTable(doc, {
        head: [[
          "Owner Name",
          "National ID",
          "Title Number",
          "Location",
          "Size (sqm)",
          "Land Type",
          "Proposed New Owner"
        ]],
        body: lands.map((l) => [
          l.ownerName || "-",
          l.nationalId || "-",
          l.titleNumber || "-",
          l.location || "-",
          l.size || "-",
          l.landType || "-",
          l.proposedNewOwner || "-"
        ]),
        startY: 22,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [0, 66, 37] }, // gov green
      });

      doc.save("land_registry_report.pdf");

    } catch (err) {
      console.error("PDF Download Error:", err);
      alert("❌ Could not generate PDF — check console for details.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-[#003366] mb-4">Land Registry Reports</h2>

      <button
        onClick={downloadPDF}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
      >
        ⬇ Download PDF Report
      </button>

      <table className="w-full bg-white shadow border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Owner</th>
            <th className="border p-2">ID</th>
            <th className="border p-2">Title No.</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Size</th>
            <th className="border p-2">Type</th>
            <th className="border p-2">Proposed New Owner</th>
          </tr>
        </thead>

        <tbody>
          {lands.map((l, i) => (
            <tr key={i}>
              <td className="border p-2">{l.ownerName}</td>
              <td className="border p-2">{l.nationalId}</td>
              <td className="border p-2">{l.titleNumber}</td>
              <td className="border p-2">{l.location}</td>
              <td className="border p-2">{l.size}</td>
              <td className="border p-2">{l.landType}</td>
              <td className="border p-2">{l.proposedNewOwner || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
