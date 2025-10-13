const { ethers } = require("ethers");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying LandRegistry...");

  // Load ABI + Bytecode
 const abi = JSON.parse(fs.readFileSync("./artifacts/LandRegistry.abi", "utf8"));
 const bytecode = fs.readFileSync("./artifacts/LandRegistry.bin", "utf8");


  // Connect to local Hardhat node
  const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = provider.getSigner(0);

  // Deploy contract
  const factory = new ethers.ContractFactory(abi, bytecode, signer);
  const contract = await factory.deploy();

  console.log("✅ Transaction hash:", contract.deployTransaction.hash);
  await contract.deployTransaction.wait();

  console.log("✅ Deployed at:", contract.address);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
