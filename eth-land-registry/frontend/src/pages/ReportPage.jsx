export default function ReportPage() {
  const mockData = [
    { id: 1, owner: "John Doe", location: "Nairobi", size: "200 sqm" },
    { id: 2, owner: "Jane Waweru", location: "Mombasa", size: "300 sqm" }
  ];

  const downloadPDF = () => {
    alert("PDF Export Coming Soon ✅");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Land Registry Reports</h2>

      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Property ID</th>
            <th className="border p-2">Owner</th>
            <th className="border p-2">Location</th>
            <th className="border p-2">Size</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((row) => (
            <tr key={row.id}>
              <td className="border p-2">{row.id}</td>
              <td className="border p-2">{row.owner}</td>
              <td className="border p-2">{row.location}</td>
              <td className="border p-2">{row.size}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button 
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        onClick={downloadPDF}
      >
        Export to PDF
      </button>
    </div>
  );
}
