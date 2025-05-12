const hre = require("hardhat");

async function main() {
  // Get signers
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  
  // Deploy MockERC20 (DAI)
  console.log("Deploying MockERC20 token...");
  const MockERC20 = await hre.ethers.getContractFactory("MockERC20");
  const mockDAI = await MockERC20.deploy("Mock DAI", "DAI", 18);
  await mockDAI.waitForDeployment();
  const mockDAIAddress = await mockDAI.getAddress();
  console.log("MockERC20 (DAI) deployed to:", mockDAIAddress);
  
  // Mint some tokens to the deployer for testing
  const mintAmount = hre.ethers.parseEther("10000"); // 10,000 DAI
  await mockDAI.mint(deployer.address, mintAmount);
  console.log(`Minted ${hre.ethers.formatEther(mintAmount)} DAI to ${deployer.address}`);
  
  // Deploy LiquidityPool with MockDAI as token1
  console.log("Deploying LiquidityPool with MockDAI as token1...");
  const LiquidityPool = await hre.ethers.getContractFactory("LiquidityPool");
  
  // Fix: Deploy with correct constructor arguments
  // This uses the standard ethers v6 format
  const liquidityPool = await LiquidityPool.deploy(mockDAIAddress);
  
  await liquidityPool.waitForDeployment();
  const liquidityPoolAddress = await liquidityPool.getAddress();
  console.log("LiquidityPool deployed to:", liquidityPoolAddress);
  
  // Log the addresses for easy access
  console.log("\n--- Contract Addresses for Frontend Configuration ---");
  console.log(`DEX_CONTRACT_ADDRESS: "${liquidityPoolAddress}"`);
  console.log(`DAI_CONTRACT_ADDRESS: "${mockDAIAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });