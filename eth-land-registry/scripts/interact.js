import fs from "fs";
import { ethers } from "ethers";

// ✅ Path to the ABI JSON file (matches your artifacts folder)
const abi = JSON.parse(fs.readFileSync("./artifacts/LandRegistry.abi", "utf8"));
const bytecode = fs.readFileSync("./artifacts/LandRegistry.bin", "utf8");


// ✅ Connect to local Hardhat network
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = provider.getSigner();

// ✅ Use the address printed in your deploy.js
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// ✅ Initialize contract
const contract = new ethers.Contract(contractAddress, abi, signer);

async function main() {
  console.log("✅ Connected to contract at:", contractAddress);

  // Example: read the government official
  const official = await contract.governmentOfficial();
  console.log("👤 Government official:", official);
}

main().catch(console.error);
