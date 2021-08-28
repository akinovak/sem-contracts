const hre = require("hardhat");
const poseidonGenContract = require("circomlib/src/poseidon_gencontract.js");

async function main() {
  const PoseidonT6 = await hre.ethers.getContractFactory(
    poseidonGenContract.generateABI(5),
    poseidonGenContract.createCode(5)
  );
  const poseidonT6 = await PoseidonT6.deploy();
  await poseidonT6.deployed();

  console.log("PoseidonT6 deployed to:", poseidonT6.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
