import fs from "fs";
import { ethers } from "ethers";

// ✅ Path to the LandRegistry.json file (matches your artifacts folder)
const contractJson = JSON.parse(fs.readFileSync("./artifacts/contracts/LandRegistry.sol/LandRegistry.json", "utf8"));
const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

// ✅ Connect to local Hardhat network
const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
const signer = provider.getSigner();

// ✅ Use the address printed in your deploy.js
const contractAddress = "0x9A676e781A523b5d0C0e43731313A708CB607508";

// ✅ Initialize contract
const contract = new ethers.Contract(contractAddress, abi, signer);

async function main() {
  console.log("✅ Connected to contract at:", contractAddress);

  // Example: read the government official
  const official = await contract.governmentOfficial();
  console.log("👤 Government official:", official);
}

main().catch(console.error);
