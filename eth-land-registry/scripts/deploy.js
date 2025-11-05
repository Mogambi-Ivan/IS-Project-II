const fs = require("fs");
const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying LandRegistry...");

  const contractJson = JSON.parse(
    fs.readFileSync("./artifacts/contracts/LandRegistry.sol/LandRegistry.json")
  );

  const factory = new ethers.ContractFactory(
    contractJson.abi,
    contractJson.bytecode,
    (await ethers.getSigners())[0]
  );

  const contract = await factory.deploy();
  await contract.deployed();

  console.log("✅ Contract deployed to:", contract.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
