// frontend/src/utils/ethereum.js

import { ethers } from "ethers";

import { contractABI, contractAddress } from "./contractConfig";

export async function getCurrentWallet() {
  if (!window.ethereum) {
    console.log("No Ethereum wallet detected.");
    return null;
  }

  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum); // ✅ Ethers v5 syntax
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch (err) {
    console.error("Wallet connection error:", err);
    return null;
  }
}

export async function connectWallet() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    return accounts[0];
  } catch (err) {
    console.error("Connect wallet error:", err);
    return null;
  }
}

// --- Helper functions ---
export function getProvider() {
  if (!window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function getContractWithSigner() {
  const provider = getProvider();
  if (!provider) return null;
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
}

export async function getContractReadOnly() {
  const provider = getProvider();
  if (!provider) return null;
  return new ethers.Contract(contractAddress, contractABI, provider);
}
