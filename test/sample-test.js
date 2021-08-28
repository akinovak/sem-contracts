const { expect } = require("chai");

describe("Greeter", function () {
  it.skip("Should return the new greeting once it's changed", async function () {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    await greeter.deployed();

    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    // The way to increment without observing the event
    // const receipt = await greeter.setGreeting();
    // console.log(greeter);
    // console.log(greeter);

    // Increment while observing the event
    // await expect(greeter.greet())
    //   .to.emit(counter, 'ValueChanged')
    //   .withArgs(0, 1);

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
