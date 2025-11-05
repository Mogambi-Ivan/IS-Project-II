import { useState } from "react";
import { ethers } from "ethers";
import contractABI from "../../../artifacts/contracts/LandRegistry.sol/LandRegistry.json";




export default function RegisterProperty() {
  const [landId, setLandId] = useState("");
  const [location, setLocation] = useState("");
  const [size, setSize] = useState("");
  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // replace with your deployed address

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!window.ethereum) {
        setStatus("❌ MetaMask not found");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI.abi,
        signer
      );

      const tx = await contract.registerLand(
        parseInt(landId),
        location,
        parseInt(size),
        owner
      );

      setStatus("⏳ Transaction submitted...");
      await tx.wait();

      setStatus("✅ Land registered successfully!");
      setLandId("");
      setLocation("");
      setSize("");
      setOwner("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Transaction failed");
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Register New Property</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="number"
          placeholder="Land ID"
          value={landId}
          onChange={(e) => setLandId(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="number"
          placeholder="Size (sqm)"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Owner Address"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
        >
          Register
        </button>
      </form>

      {status && <p className="mt-4 text-center text-gray-700">{status}</p>}
    </div>
  );
}
