# DEX v2 - Decentralized Exchange

A simple decentralized exchange (DEX) implementation with a frontend interface. Sepolia testnet is used in this case.

## Live Demo

You can access a live demonstration of the deployed front-end here:
[DEX v2 on GitHub Pages](https://Inkykky.github.io/DEX_ETH_to_DAI)
However, since the pool is not initialized, it cannot be used to swap tokens. The reason it is not initialized is that I set the minimum liquidity to 10, which means it requires amountETH * amountDAI = 100. I don’t have that many tokens in Sepolia, so I couldn't initialize it. However, I recorded a video to demonstrate the functionality on localhost.


## Smart Contract

### Contract Details
- The LiquidityPool contract creates a trading pair between ETH and a specified ERC20 token (DAI in this implementation)
- Contract implements swap functionality, liquidity provision and removal
- Includes a 0.3% swap fee
- Token1 is set to Sepolia Testnet DAI: `0x68194a729C2450ad26072b3D33ADaCbcef39D574`

### Deployment Steps

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with your private key and Infura/Alchemy API key:
   ```
   PRIVATE_KEY=your_private_key_here
   INFURA_API_KEY=your_infura_api_key_here
   ```

3. Deploy the contract to Sepolia testnet:
   ```
   npx hardhat run --network sepolia scripts/deploy.js
   ```

4. Update the contract address in the frontend code.

## Frontend

### Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the contract address in `src/App.js` with your deployed contract address:
   ```javascript
   const DEX_CONTRACT_ADDRESS = "YOUR_DEPLOYED_CONTRACT_ADDRESS";
   ```

4. Start the development server:
   ```
   npm start
   ```

5. Access the application at `http://localhost:3000`

### Using the Frontend

1. Connect your MetaMask wallet (make sure you're on Sepolia testnet)
2. Add liquidity by providing both ETH and DAI
3. Swap tokens between ETH and DAI
4. Remove liquidity to get back your ETH and DAI

## Getting Testnet Tokens

To get Sepolia testnet tokens:
- ETH: Use the Sepolia testnet faucet at https://sepoliafaucet.com/
- DAI: Use the contract address `0x68194a729C2450ad26072b3D33ADaCbcef39D574` and interact with its faucet function or ask for some from a community member.

## Testing

You can test the contracts using Hardhat:
```
npx hardhat test
```

## License

MIT
