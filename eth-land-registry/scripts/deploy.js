import fs from "fs";
import { ethers } from "ethers";

async function main() {
  console.log("🚀 Deploying LandRegistry...");

  // ✅ Load ABI and BIN from artifacts
  const abi = JSON.parse(
    fs.readFileSync("./artifacts/contracts_LandRegistry_sol_LandRegistry.abi", "utf8")
  );
  const bytecode = fs.readFileSync(
    "./artifacts/contracts_LandRegistry_sol_LandRegistry.bin", "utf8"
  );

  // ✅ Connect to Hardhat local network
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  // ✅ Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  console.log("✅ Deployed at:", await contract.getAddress());
}

main().catch(console.error);
