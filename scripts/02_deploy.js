const { ethers } = require("@nomiclabs/hardhat-ethers");

async function main() {
  const accounts = await ethers.getSigners();

  const ERC20Logic = await ethers.getContractFactory("ERC20Logic");
  const erc20Logic = await ERC20Logic.deploy("ERC20Logic", "ERCL");

  await erc20Logic.deployed();

  console.log("ERC20Logic deployed to:", erc20Logic.address);

  const TransparentUpgradeableERC20 = await ethers.getContractFactory(
    "TransparentUpgradeableERC20"
  );
  const transparentUpgradeableERC20 = await TransparentUpgradeableERC20.deploy(
    erc20Logic.address,
    accounts[0],
    ""
  );

  await transparentUpgradeableERC20.deployed();

  console.log(
    "TransparentUpgradeableERC20 deployed to:",
    transparentUpgradeableERC20.address
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

module.exports.tags = ["all", "erc20"];
