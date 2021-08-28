const { expect } = require('chai');
const Web3 = require('web3');

describe("Signal manipulation", () => {
    it("Should be able to hexify signal and retrieve original value", async () => {
        const signal = 'yes';
        const toHex = Web3.utils.utf8ToHex(signal);
        const hexified = ethers.utils.hexlify(ethers.utils.toUtf8Bytes(toHex))
        const dehexified = ethers.utils.toUtf8String(hexified);
        const raw = Web3.utils.hexToUtf8(dehexified);
        expect(signal).to.equal(raw)
        // expect(signal.to.equal(raw));
    });
});