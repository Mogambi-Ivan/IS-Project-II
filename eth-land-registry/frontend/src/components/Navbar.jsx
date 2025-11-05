import { useEffect, useState } from "react";
import { connectWallet, getCurrentWallet } from "../utils/ethereum";

export default function Navbar() {
  const [wallet, setWallet] = useState("");

  async function handleConnect() {
    const connection = await connectWallet();
    if (connection) setWallet(connection.address);
  }

  useEffect(() => {
    (async () => {
      const existing = await getCurrentWallet();
      if (existing) setWallet(existing.address);
    })();
  }, []);

  return (
    <nav className="bg-white shadow-sm h-16 flex items-center px-6 justify-between">
      <h1 className="text-xl font-semibold text-gray-800">
        Land Registry System
      </h1>
      {wallet ? (
        <span className="text-gray-600 text-sm">
          Connected: {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </span>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
}
