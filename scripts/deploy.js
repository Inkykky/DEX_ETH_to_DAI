const hre = require("hardhat");

async function main() {
  // Sepolia Testnet DAI address
  const DAI_ADDRESS = "0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357";
  
  console.log("Deploying LiquidityPool with DAI as token1...");
  
  // Get the contract factory
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  
  // Deploy with constructor arguments (ethers v6 syntax)
  const liquidityPool = await LiquidityPool.deploy(DAI_ADDRESS);

  // Wait for deployment (v6 syntax)
  // The deployed() method is replaced with waitForDeployment()
  await liquidityPool.waitForDeployment();

  // Get contract address (v6 syntax)
  const liquidityPoolAddress = await liquidityPool.getAddress();

  console.log("LiquidityPool deployed to:", liquidityPoolAddress);
  console.log("Token1 (DAI) address:", DAI_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
