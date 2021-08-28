const poseidonGenContract = require('circomlib/src/poseidon_gencontract.js');
const path = require('path');
const fs = require('fs');
const Web3 = require('web3');

const ZERO_VALUE = BigInt(ethers.utils.solidityKeccak256(['bytes'], [ethers.utils.toUtf8Bytes('Semaphore')]))

const { genExternalNullifier, genIdentity, genSignalHash, genMsg, 
  signMsg, genNullifierHash, verifySignature, genIdentityCommitment, genProof, packToSolidityProof, serialiseIdentity } = require('../../lib/dist/index.js');
const { expect } = require('chai');

describe("SemaphoreClient", function () {
    it("Should return the new semaphore client", async function () {
        const PoseidonT3 = await ethers.getContractFactory(
            poseidonGenContract.generateABI(2),
            poseidonGenContract.createCode(2)
        )
        const poseidonT3 = await PoseidonT3.deploy();
        await poseidonT3.deployed();


        const PoseidonT6 = await ethers.getContractFactory(
            poseidonGenContract.generateABI(5),
            poseidonGenContract.createCode(5)
        );
        const poseidonT6 = await PoseidonT6.deploy();
        await poseidonT6.deployed();

        const Hasher = await ethers.getContractFactory("Hasher", {
            libraries: {
                PoseidonT3: poseidonT3.address,
                PoseidonT6: poseidonT6.address,
            },
        });
        const hasher = await Hasher.deploy();
        await hasher.deployed();

        const externalNullifier = genExternalNullifier("voting-1");

        const Semaphore = await ethers.getContractFactory("Semaphore", {
            libraries: {
                PoseidonT3: poseidonT3.address,
                PoseidonT6: poseidonT6.address,
            }
        });
        const semaphore = await Semaphore.deploy(20, externalNullifier);
        await semaphore.deployed();

        await semaphore.setPermissioning(false);

        const SemaphoreClient = await ethers.getContractFactory("SemaphoreClient");
        const semaphoreClient = await SemaphoreClient.deploy(semaphore.address);

        await semaphoreClient.deployed();

        const leafIndex = 4;

        const idCommitments = [];

        for (let i=0; i<leafIndex;i++) {
        const tmpIdentity = genIdentity();
        const tmpCommitment = genIdentityCommitment(tmpIdentity);
        idCommitments.push(tmpCommitment);
        }

        const promises = idCommitments.map(async (id) => {
        const index = await semaphore.insertIdentity(id);
        return index;
        });

        await Promise.all(promises);


        const identity = genIdentity();
        const serialised = serialiseIdentity(identity);
        const rawSignal = 'yes';
        const signal = Web3.utils.utf8ToHex(rawSignal);
        const signalHash = genSignalHash(signal);
        const msg = genMsg(externalNullifier, signalHash);
        const signature = signMsg(identity.keypair.privKey, msg);
        const nullifiersHash = genNullifierHash(externalNullifier, identity, 20);
        const verified = verifySignature(msg, signature, identity.keypair.pubKey);
        const identityCommitment = genIdentityCommitment(identity);

        await semaphore.insertIdentity(identityCommitment);

        const wasmFilePath =  path.join('./zkeyFiles', 'semaphore.wasm');
        const finalZkeyPath = path.join('./zkeyFiles', 'semaphore_final.zkey');

        idCommitments.push(identityCommitment);
        
        const witnessData = await genProof(identity, signature, signalHash, 
        idCommitments, externalNullifier, 20, ZERO_VALUE, 5, wasmFilePath, finalZkeyPath);

        const { fullProof, root } = witnessData;
        const solidityProof = packToSolidityProof(fullProof);


        const packedProof = await semaphore.packProof(
            solidityProof.a, 
            solidityProof.b, 
            solidityProof.c,
        );

        const res = await semaphoreClient.broadcastSignal(
            ethers.utils.hexlify(ethers.utils.toUtf8Bytes(signal)),
            packedProof,
            root,
            nullifiersHash,
            externalNullifier
        )

        const returnedExternalNullifier = await semaphoreClient.getExternalNullifierBySignalIndex(BigInt(0));
        //   console.log(returnedExternalNullifier.toString(), externalNullifier.toString());
        
        const signals = [];
        const nextSignalIndex = (await semaphoreClient.nextSignalIndex()).toNumber() 

        for (let i=0; i < nextSignalIndex; i++) {
            const signal = await semaphoreClient.getSignalBySignalIndex(i)
            const en = await semaphoreClient.getExternalNullifierBySignalIndex(i)

            signals.push({ signal, en })
        }

        console.log(signals);

        const dehexified = ethers.utils.toUtf8String(signals[0].signal);
        const raw = Web3.utils.hexToUtf8(dehexified);
        expect(rawSignal).to.equal(raw)

        expect(res.hash).to.be.an('string');
  
    });
  });