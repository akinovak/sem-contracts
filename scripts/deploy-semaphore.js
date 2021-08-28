const hre = require("hardhat");
const poseidonGenContract = require('circomlib/src/poseidon_gencontract.js');

const { genExternalNullifier } = require('../../lib/dist/index.js');

async function main() {
    const PoseidonT3 = await hre.ethers.getContractFactory(
        poseidonGenContract.generateABI(2),
        poseidonGenContract.createCode(2)
    )
    const poseidonT3 = await PoseidonT3.deploy();
    await poseidonT3.deployed();


    const PoseidonT6 = await hre.ethers.getContractFactory(
        poseidonGenContract.generateABI(5),
        poseidonGenContract.createCode(5)
    );
    const poseidonT6 = await PoseidonT6.deploy();
    await poseidonT6.deployed();

    const Hasher = await hre.ethers.getContractFactory("Hasher", {
        libraries: {
            PoseidonT3: poseidonT3.address,
            PoseidonT6: poseidonT6.address,
        },
      });
    const hasher = await Hasher.deploy();
    await hasher.deployed();

    const externalNullifier = genExternalNullifier("voting-1");
    const Semaphore = await hre.ethers.getContractFactory("Semaphore", {
        libraries: {
            PoseidonT3: poseidonT3.address,
            PoseidonT6: poseidonT6.address,
        }
    });
    const semaphore = await Semaphore.deploy(20, externalNullifier);
    await semaphore.deployed();

    console.log('Semaphore deployed to: ', semaphore.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
