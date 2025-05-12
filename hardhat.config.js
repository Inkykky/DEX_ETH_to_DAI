require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // This line loads the .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      chainId: 31337, // Default Hardhat network
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Fallback to empty string if not set
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [], // Only use if PRIVATE_KEY is set
    },
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  },
  etherscan: {
    // Optional: Add your Etherscan API key for contract verification
    // apiKey: process.env.ETHERSCAN_API_KEY
  }
};
