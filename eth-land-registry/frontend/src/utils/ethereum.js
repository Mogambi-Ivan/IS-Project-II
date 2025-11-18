// frontend/src/utils/ethereum.js

import { ethers } from "ethers";

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
