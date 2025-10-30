export default function AdminDashboard() {
  const pendingProperties = [
    { id: 1, owner: "0x789...", location: "Kisumu", status: "Pending" },
    { id: 2, owner: "0xABC...", location: "Nakuru", status: "Pending" },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Pending Approvals</h2>
      <table className="min-w-full bg-white rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-200">
          <tr>
            <th className="text-left p-3">Owner</th>
            <th className="text-left p-3">Location</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingProperties.map((prop) => (
            <tr key={prop.id} className="border-b">
              <td className="p-3">{prop.owner}</td>
              <td className="p-3">{prop.location}</td>
              <td className="p-3">{prop.status}</td>
              <td className="p-3">
                <button className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">
                  Approve
                </button>
                <button className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
