const { BigNumber } = require("ethers");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");
const { expect } = require("chai");
const { expectRevert } = require("@openzeppelin/test-helpers");
const { ethers } = require("hardhat");
const { toWei } = require("web3-utils");

function toBN(number) {
  return BigNumber.from(number.toString());
}

describe("CarSellingShop", function () {
  before(async function () {
    this.signers = await ethers.getSigners();
    this.charlesAccount = this.signers[0];
    this.charles = this.charlesAccount.address;
    this.aliceAccount = this.signers[1];
    this.alice = this.aliceAccount.address;
    this.bobAccount = this.signers[2];
    this.bob = this.bobAccount.address;

    const CarSellingShop = await ethers.getContractFactory("CarSellingShop");
    this.carSellingShop = await CarSellingShop.deploy();
    await this.carSellingShop.deployed();
  });
  it("should correctly add new car for sale", async function () {
    const id = 1001;
    const price = toWei("1", "ether");
    const addNewCarForSaleTx = await this.carSellingShop.addNewCarForSale(
      id,
      price
    );

    // wait until the transaction is mined
    await addNewCarForSaleTx.wait();
    const carId = await this.carSellingShop.cars(0);
    const car = await this.carSellingShop.carsForSale(carId);
    expect(carId.toNumber()).to.equal(id);
    expect(toBN(car.price).toString()).to.equal(price);
    expect(car.seller).to.equal(this.charles);
    expect(car.buyer).to.equal(ZERO_ADDRESS);
    expect(car.numSales.toNumber()).to.equal(0);
    expect(car.forSale.toString()).to.equal("true");
  });

  it("should not add car for sale if it is already listed", async function () {
    const id = 1001;
    const price = toWei("1", "ether");
    expectRevert(
      this.carSellingShop.addNewCarForSale(id, price),
      "already for sale"
    );
  });

  it("should only add new car for sale if called by owner", async function () {
    const id = 1002;
    const price = toWei("1", "ether");
    expectRevert(
      this.carSellingShop
        .connect(this.aliceAccount)
        .addNewCarForSale(id, price),
      "Ownable: caller is not the owner"
    );
  });

  it("should correctly record new car sale", async function () {
    const id = 1001;
    const price = toWei("1", "ether");
    const carBefore = await this.carSellingShop.carsForSale(id);
    const recordNewCarSaleTx = await this.carSellingShop.recordNewCarSale(
      id,
      this.bob,
      price
    );

    await recordNewCarSaleTx.wait();
    const car = await this.carSellingShop.carsForSale(id);
    expect(toBN(car.price).toString() <= toBN(price).toString());
    expect(car.seller).to.equal(this.charles);
    expect(car.buyer).to.equal(this.bob);
    expect(toBN(car.numSales).toString()).to.equal(
      toBN(carBefore.numSales).add(1).toString()
    );
    expect(car.forSale.toString()).to.equal("false");
  });

  it("should not record new car sale if it is not for sale", async function () {
    const id = 1001;
    const price = toWei("1", "ether");
    expectRevert(
      this.carSellingShop.recordNewCarSale(id, this.bob, price),
      "not for sale"
    );
  });

  it("should not record car sale if price is too low", async function () {
    const id = 1002;
    const price = toWei("2", "ether");
    const addNewCarForSaleTx = await this.carSellingShop.addNewCarForSale(
      id,
      price
    );

    await addNewCarForSaleTx.wait();

    expectRevert(
      this.carSellingShop.recordNewCarSale(id, this.bob, toBN(price).div(2)),
      "insufficient ether"
    );
  });

  it("should only record new car sale if called by owner", async function () {
    const id = 1002;
    const price = toWei("2", "ether");

    expectRevert(
      this.carSellingShop
        .connect(this.aliceAccount)
        .recordNewCarSale(id, this.bob, toBN(price).div(2)),
      "Ownable: caller is not the owner"
    );
  });

  it("should not purchase car if not for sale", async function () {
    const id = 1001;
    const price = toWei("1", "ether");
    expectRevert(
      this.carSellingShop.purchaseCar(id, { value: price }),
      "not for sale"
    );
  });

  it("should not purchase car if called by owner", async function () {
    const id = 1002;
    const price = toWei("2", "ether");
    expectRevert(
      this.carSellingShop.purchaseCar(id, { value: price }),
      "bad buyer address"
    );
  });

  it("should not purchase car if sent insufficient ether", async function () {
    const id = 1002;
    const price = toWei("1", "ether");
    expectRevert(
      this.carSellingShop
        .connect(this.aliceAccount)
        .purchaseCar(id, { value: price }),
      "insufficient ether"
    );
  });

  it("should correctly purchase car if called by non-owner", async function () {
    const id = 1002;
    const price = toWei("2", "ether");
    const carBefore = await this.carSellingShop.carsForSale(id);
    const purchaseCarTx = await this.carSellingShop
      .connect(this.aliceAccount)
      .purchaseCar(id, { value: price });

    await purchaseCarTx.wait();
    const car = await this.carSellingShop.carsForSale(id);
    expect(toBN(car.price).toString()).to.equal(price);
    expect(car.seller).to.equal(this.charles);
    expect(car.buyer).to.equal(this.alice);
    expect(toBN(car.numSales).toString()).to.equal(
      toBN(carBefore.numSales).add(1).toString()
    );
    expect(car.forSale.toString()).to.equal("false");
  });

  it("should not list car if called by non-owner", async function () {
    const id = 1001;
    const price = toWei("1.5", "ether");
    expectRevert(
      this.carSellingShop.connect(this.aliceAccount).listCarForSale(id, price),
      "only owner"
    );
  });

  it("should correctly list car for sale", async function () {
    const id = 1001;
    const price = toWei("1.5", "ether");
    const carBefore = await this.carSellingShop.carsForSale(id);
    const listCarForSaleTx = await this.carSellingShop
      .connect(this.bobAccount)
      .listCarForSale(id, price);

    await listCarForSaleTx.wait();
    const car = await this.carSellingShop.carsForSale(id);
    expect(toBN(car.price).toString()).to.equal(price);
    expect(car.seller).to.equal(this.bob);
    expect(car.buyer).to.equal(ZERO_ADDRESS);
    expect(car.numSales.toNumber()).to.equal(carBefore.numSales.toNumber());
    expect(car.forSale.toString()).to.equal("true");
  });

  it("should update listing price if called by owner", async function () {
    const id = 1001;
    const price = toWei("2", "ether");
    const updateListingPriceTx = await this.carSellingShop
      .connect(this.bobAccount)
      .updateListingPrice(id, price);

    await updateListingPriceTx.wait();
    const car = await this.carSellingShop.carsForSale(id);
    expect(toBN(car.price).toString()).to.equal(price);
  });

  it("should update listing status if called by owner", async function () {
    const id = 1001;
    const forSale = false;
    const updateListingStatusTx = await this.carSellingShop
      .connect(this.bobAccount)
      .updateListingStatus(id, forSale);

    await updateListingStatusTx.wait();
    const car = await this.carSellingShop.carsForSale(id);
    expect(car.forSale.toString()).to.equal(forSale.toString());
  });

  it("should not update listing price if not for sale", async function () {
    const id = 1001;
    const price = toWei("2", "ether");
    expectRevert(
      this.carSellingShop
        .connect(this.bobAccount)
        .updateListingPrice(id, price),
      "not for sale"
    );
  });
});
