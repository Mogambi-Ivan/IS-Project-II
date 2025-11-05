import { ethers } from "ethers";

// Initialize MetaMask connection
export async function connectWallet() {
  if (typeof window.ethereum === "undefined") {
    alert("MetaMask is not installed!");
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    console.log("✅ Connected wallet:", address);
    return { provider, signer, address };
  } catch (error) {
    console.error("❌ MetaMask connection failed:", error);
    return null;
  }
}

// Function to check if already connected
export async function getCurrentWallet() {
  if (typeof window.ethereum === "undefined") return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  if (accounts.length > 0) {
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
  }

  return null;
}
