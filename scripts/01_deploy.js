const { ethers } = require("@nomiclabs/hardhat-ethers");
module.exports = async ({ deployments, getNamedAccounts }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const CarSellingShop = await deploy("CarSellingShop", {
    from: deployer,
    log: true,
  });
  log(`CarSellingShop contract deployed to ${CarSellingShop.address}`);
  const carSellingShopContract = await ethers.getContractFactory(
    "CarSellingShop"
  );
  const accounts = await ethers.getSigners();
  const signer = accounts[0];
  const carSellingShop = new ethers.Contract(
    CarSellingShop.address,
    carSellingShopContract.interface,
    signer
  );
  log(
    `Verify with:\n npx hardhat verify --network kovan ${carSellingShop.address}`
  );
};

module.exports.tags = ["all", "car"];
