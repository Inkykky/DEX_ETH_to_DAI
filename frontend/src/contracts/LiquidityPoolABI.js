export const LiquidityPoolABI = [
  // Define getPoolInfo function
  {
    "inputs": [],
    "name": "getPoolInfo",
    "outputs": [
      {
        "internalType": "string",
        "name": "token0Symbol",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "token1Address",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "ethReserve",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "token1Reserve",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalLiquidity",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Define getReserves function
  {
    "inputs": [],
    "name": "getReserves",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "_reserve0",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_reserve1",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  // Define addLiquidity function
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountToken1Desired",
        "type": "uint256"
      }
    ],
    "name": "addLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  // Define removeLiquidity function
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "liquidity",
        "type": "uint256"
      }
    ],
    "name": "removeLiquidity",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "amountETH",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amountToken1",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // Define swapETHForToken1 function
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "swapETHForToken1",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  // Define swapToken1ForETH function
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "amountToken1In",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      }
    ],
    "name": "swapToken1ForETH",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  // ERC20 functions for LP tokens
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
