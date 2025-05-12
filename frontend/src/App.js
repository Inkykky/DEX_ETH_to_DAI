import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import ConnectWallet from './components/ConnectWallet';
import PoolInfo from './components/PoolInfo';
import AddLiquidity from './components/AddLiquidity';
import RemoveLiquidity from './components/RemoveLiquidity';
import SwapTokens from './components/SwapTokens';
import { LiquidityPoolABI } from './contracts/LiquidityPoolABI';
import { ERC20ABI } from './contracts/ERC20ABI';

function App() {
  // Contract addresses
  const DEX_CONTRACT_ADDRESS = "0x44FDc2403008169cd51BeA4B2Dd4D836fFFF94Ae"; // Replace with your deployed contract address
  const DAI_CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Sepolia Testnet DAI
  
  // State variables
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [dexContract, setDexContract] = useState(null);
  const [daiContract, setDaiContract] = useState(null);
  const [poolInfo, setPoolInfo] = useState({
    token0Symbol: '',
    token1Address: '',
    ethReserve: ethers.BigNumber.from(0),
    token1Reserve: ethers.BigNumber.from(0),
    totalLiquidity: ethers.BigNumber.from(0)
  });
  const [userBalances, setUserBalances] = useState({
    eth: ethers.BigNumber.from(0),
    dai: ethers.BigNumber.from(0),
    lpTokens: ethers.BigNumber.from(0)
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add-liquidity');

  // Initialize the app when provider changes
  useEffect(() => {
    const init = async () => {
      if (provider && account) {
        try {
          // Get signer for transactions
          const signer = provider.getSigner();
          setSigner(signer);
          
          // Initialize contracts
          const dex = new ethers.Contract(DEX_CONTRACT_ADDRESS, LiquidityPoolABI, signer);
          setDexContract(dex);
          
          const dai = new ethers.Contract(DAI_CONTRACT_ADDRESS, ERC20ABI, signer);
          setDaiContract(dai);
          
          // Load initial data
          await loadPoolInfo(dex);
          await loadUserBalances(signer, dai, dex);
        } catch (error) {
          console.error("Initialization error:", error);
        }
      }
    };
    
    init();
  }, [provider, account]);
  
  // Function to reload data after operations
  const reloadData = async () => {
    if (dexContract && daiContract && signer) {
      await loadPoolInfo(dexContract);
      await loadUserBalances(signer, daiContract, dexContract);
    }
  };
  
  // Load pool information
  const loadPoolInfo = async (dex) => {
    try {
      const info = await dex.getPoolInfo();
      setPoolInfo({
        token0Symbol: info.token0Symbol,
        token1Address: info.token1Address,
        ethReserve: info.ethReserve,
        token1Reserve: info.token1Reserve,
        totalLiquidity: info.totalLiquidity
      });
    } catch (error) {
      console.error("Error loading pool info:", error);
    }
  };
  
  // Load user balances
  const loadUserBalances = async (signer, dai, dex) => {
    try {
      const address = await signer.getAddress();
      
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      
      // Get DAI balance
      const daiBalance = await dai.balanceOf(address);
      
      // Get LP tokens balance
      const lpBalance = await dex.balanceOf(address);
      
      setUserBalances({
        eth: ethBalance,
        dai: daiBalance,
        lpTokens: lpBalance
      });
    } catch (error) {
      console.error("Error loading user balances:", error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>DEX v2</h1>
        <ConnectWallet 
          account={account} 
          setAccount={setAccount} 
          setProvider={setProvider} 
        />
      </header>
      
      {account ? (
        <main className="App-main">
          <PoolInfo poolInfo={poolInfo} userBalances={userBalances} />
          
          <div className="tabs">
            <button 
              className={activeTab === 'add-liquidity' ? 'active' : ''} 
              onClick={() => setActiveTab('add-liquidity')}
            >
              Add Liquidity
            </button>
            <button 
              className={activeTab === 'remove-liquidity' ? 'active' : ''} 
              onClick={() => setActiveTab('remove-liquidity')}
            >
              Remove Liquidity
            </button>
            <button 
              className={activeTab === 'swap' ? 'active' : ''} 
              onClick={() => setActiveTab('swap')}
            >
              Swap Tokens
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'add-liquidity' && (
              <AddLiquidity 
                dexContract={dexContract}
                daiContract={daiContract}
                userBalances={userBalances}
                reloadData={reloadData}
                setLoading={setLoading}
              />
            )}
            
            {activeTab === 'remove-liquidity' && (
              <RemoveLiquidity 
                dexContract={dexContract}
                userBalances={userBalances}
                reloadData={reloadData}
                setLoading={setLoading}
              />
            )}
            
            {activeTab === 'swap' && (
              <SwapTokens 
                dexContract={dexContract}
                daiContract={daiContract}
                userBalances={userBalances}
                reloadData={reloadData}
                setLoading={setLoading}
              />
            )}
          </div>
          
          {loading && <div className="loading-overlay">Processing transaction...</div>}
        </main>
      ) : (
        <div className="connect-prompt">
          Please connect your wallet to use the DEX
        </div>
      )}
    </div>
  );
}

export default App;
