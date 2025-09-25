import fs from "fs";
import { ethers } from "ethers";

// Load ABI and BIN with correct names
const abi = JSON.parse(
  fs.readFileSync("./artifacts/contracts_LandRegistry_sol_LandRegistry.abi", "utf8")
);

const bytecode = fs.readFileSync(
  "./artifacts/contracts_LandRegistry_sol_LandRegistry.bin",
  "utf8"
);

// Connect to local Hardhat node
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Replace with account from Hardhat (first account by default)
const signer = await provider.getSigner();

// Deployed contract address (from deploy.js output)
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Create contract instance
const contract = new ethers.Contract(contractAddress, abi, signer);

async function main() {
  console.log("✅ Connected to contract at:", contractAddress);

  // Example: Register land
  const tx = await contract.registerLand(1, "Nairobi", 500, signer.address);
  await tx.wait();
  console.log("🏡 Land registered!");

  // Example: Fetch land details
  const land = await contract.getLandDetails(1);
  console.log("📜 Land details:", land);
}

main().catch(console.error);
