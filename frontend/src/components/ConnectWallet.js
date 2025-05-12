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
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(provider);
      setAccount(accounts[0]);

      const network = await provider.getNetwork();
      const sepoliaChainId = 11155111; // Sepolia Chain ID
      const sepoliaChainIdHex = '0xaa36a7'; // Sepolia Chain ID in hexadecimal

      if (network.chainId !== sepoliaChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: sepoliaChainIdHex }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: sepoliaChainIdHex,
                    chainName: 'Sepolia Testnet',
                    rpcUrls: ['https://rpc.sepolia.org', 'https://rpc2.sepolia.org'], // Official public RPCs
                    nativeCurrency: {
                      name: 'Sepolia ETH',
                      symbol: 'SEP',
                      decimals: 18,
                    },
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                  },
                ],
              });
            } catch (addError) {
              console.error("Failed to add Sepolia network to MetaMask", addError);
              alert('Failed to add the Sepolia network to MetaMask. Please add it manually and connect.');
            }
          } else {
            console.error("Failed to switch to Sepolia network", switchError);
            alert('Please switch to the Sepolia Testnet in MetaMask.');
          }
        }
      }
    } catch (error) {
      console.error(error);
      alert('Failed to connect wallet. See console for details.');
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
