export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
      <h1 className="text-xl font-semibold text-gray-800">Land Registry System</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
        Connect Wallet
      </button>
    </nav>
  );
}
