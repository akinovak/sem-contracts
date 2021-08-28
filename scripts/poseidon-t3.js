const hre = require("hardhat");
const poseidonGenContract = require("circomlib/src/poseidon_gencontract.js");

async function main() {
  const PoseidonT3 = await hre.ethers.getContractFactory(
    poseidonGenContract.generateABI(2),
    poseidonGenContract.createCode(2)
  );
  const poseidonT3 = await PoseidonT3.deploy();
  await poseidonT3.deployed();

  console.log("PoseidonT3 deployed to:", poseidonT3.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
