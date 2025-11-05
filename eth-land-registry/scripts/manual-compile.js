const fs = require("fs");
const solc = require("solc");

const source = fs.readFileSync("./contracts/LandRegistry.sol", "utf8");

const input = {
  language: "Solidity",
  sources: {
    "LandRegistry.sol": { content: source }
  },
  settings: {
    outputSelection: {
      "*": { "*": ["abi", "evm.bytecode"] }
    }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const contract = output.contracts["LandRegistry.sol"]["LandRegistry"];

if (!fs.existsSync("./artifacts/contracts/LandRegistry.sol")) {
  fs.mkdirSync("./artifacts/contracts/LandRegistry.sol", { recursive: true });
}

// Save ABI
fs.writeFileSync(
  "./artifacts/contracts/LandRegistry.sol/LandRegistry.json",
  JSON.stringify({
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  }, null, 2)
);

console.log("✅ ABI and bytecode manually generated!");
