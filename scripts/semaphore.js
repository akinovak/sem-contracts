const hre = require("hardhat");

async function main() {
  const Semaphore = await hre.ethers.getContractFactory("Semaphore", {
    libraries: {
      PoseidonT3: "0x13891a98b65bBD1258Aa82c7193f31494eaff324",
      PoseidonT6: "0xF5052aE52aF3985278dCeCB11355d82F374f1F23",
    },
  });
  const semaphore = await Semaphore.deploy(
    20,
    "0x000000b9149e8059fc0ad21c44ee22661e2ed79d8f856dde346dcd9e316ee9e7"
  );
  await semaphore.deployed();
  await semaphore.setPermissioning(false);

  console.log("Semaphore deployed to: ", semaphore.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
