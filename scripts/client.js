const hre = require("hardhat");

async function main() {
  const SemaphoreClient = await ethers.getContractFactory("SemaphoreClient");
  const semaphoreClient = await SemaphoreClient.deploy(
    "0x97cB381139CE1ac36D24cc7c0D07adBD877B169B");

  await semaphoreClient.deployed();
  console.log("Semaphore Client deployed to: ", semaphoreClient.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
