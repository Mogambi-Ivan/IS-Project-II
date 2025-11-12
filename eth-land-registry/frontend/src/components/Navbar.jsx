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
    <nav className="bg-[#0C4B33] text-white shadow-md h-16 flex items-center px-6 justify-between border-b border-green-900">
      {/* Left: Title */}
      <h1 className="text-xl font-bold tracking-wide flex items-center gap-2">
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Coat_of_arms_of_Kenya_%28Official%29.svg/1200px-Coat_of_arms_of_Kenya_%28Official%29.svg.png" 
          alt="Kenya Logo" 
          className="h-8 w-8"
        />
        Kenya Land Registry
      </h1>

      {/* Right: Wallet Button */}
      {wallet ? (
        <span className="bg-white text-green-800 font-semibold px-3 py-1 rounded-md border border-green-900 shadow-sm text-sm">
          {wallet.slice(0, 6)}...{wallet.slice(-4)}
        </span>
      ) : (
        <button
          onClick={handleConnect}
          className="bg-[#D4AF37] text-black font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 transition shadow"
        >
          Connect Wallet
        </button>
      )}
    </nav>
  );
}
