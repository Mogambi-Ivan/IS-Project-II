export default function RegisterProperty() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Register New Property</h2>
      <form className="space-y-4 max-w-md">
        <input type="text" placeholder="Owner Address" className="w-full p-2 border rounded" />
        <input type="text" placeholder="Location" className="w-full p-2 border rounded" />
        <input type="text" placeholder="Size (sqm)" className="w-full p-2 border rounded" />
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Register
        </button>
      </form>
    </div>
  );
}
