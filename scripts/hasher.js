const hre = require("hardhat");
const poseidonGenContract = require("circomlib/src/poseidon_gencontract.js");

async function main() {
  const Hasher = await hre.ethers.getContractFactory("Hasher", {
    libraries: {
      PoseidonT3: "0x13891a98b65bBD1258Aa82c7193f31494eaff324",
      PoseidonT6: "0xF5052aE52aF3985278dCeCB11355d82F374f1F23",
    },
  });
  const hasher = await Hasher.deploy();
  await hasher.deployed();

  console.log("Hasher deployed to: ", hasher.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
