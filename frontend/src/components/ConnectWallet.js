import React, { useEffect } from 'react';
import { ethers } from 'ethers';

function ConnectWallet({ account, setAccount, setProvider }) {
  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to use this app.');
      return;
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      // Get provider and signer
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      
      // Set the account
      setAccount(accounts[0]);
      
      // Make sure we're on the local Hardhat network
      const network = await provider.getNetwork();
      if (network.chainId !== 31337) {  // Hardhat local chain ID
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x7A69' }], // 0x7A69 is 31337 in hexadecimal
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x7A69',
                    chainName: 'Hardhat Local',
                    rpcUrls: ['http://localhost:8545'],
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add Hardhat network to MetaMask", addError);
              alert('Failed to add the Hardhat network to MetaMask. Please add it manually.');
            }
          } else {
            console.error("Failed to switch to Hardhat network", switchError);
            alert('Please switch to the Hardhat Local network in MetaMask.');
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // User disconnected their wallet
          disconnectWallet();
        } else {
          // User switched accounts
          setAccount(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        // Reload the page when network changes
        window.location.reload();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="wallet-connect">
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div className="account-info">
          <span className="account-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default ConnectWallet;
