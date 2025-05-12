import React, { useState } from 'react';
import { ethers } from 'ethers';

function SwapTokens({ dexContract, daiContract, userBalances, reloadData, setLoading }) {
  const [swapDirection, setSwapDirection] = useState('ethToDai'); // or 'daiToEth'
  const [amount, setAmount] = useState('');

  const handleSwap = async (e) => {
    e.preventDefault();
    
    if (!amount) {
      alert('Please enter an amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert input amount to wei
      const amountWei = ethers.utils.parseEther(amount);
      
      if (swapDirection === 'ethToDai') {
        // ETH to DAI swap
        if (amountWei.gt(userBalances.eth)) {
          alert('Insufficient ETH balance');
          setLoading(false);
          return;
        }
        
        const tx = await dexContract.swapETHForToken1(
          await dexContract.signer.getAddress(),
          { 
            value: amountWei,
            gasLimit: 300000
          }
        );
        
        await tx.wait();
        alert('Swap from ETH to DAI completed successfully!');
      } else {
        // DAI to ETH swap
        if (amountWei.gt(userBalances.dai)) {
          alert('Insufficient DAI balance');
          setLoading(false);
          return;
        }
        
        // First approve DAI transfer
        const approveTx = await daiContract.approve(dexContract.address, amountWei);
        await approveTx.wait();
        
        const tx = await dexContract.swapToken1ForETH(
          amountWei,
          await dexContract.signer.getAddress(),
          { gasLimit: 300000 }
        );
        
        await tx.wait();
        alert('Swap from DAI to ETH completed successfully!');
      }
      
      // Clear input
      setAmount('');
      
      // Reload data
      await reloadData();
    } catch (error) {
      console.error('Error swapping tokens:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    if (swapDirection === 'ethToDai' && userBalances.eth) {
      // Leave some ETH for gas
      const ethValue = ethers.utils.formatEther(userBalances.eth);
      const maxAmount = parseFloat(ethValue) - 0.01; // Reserve 0.01 ETH for gas
      setAmount(maxAmount > 0 ? maxAmount.toString() : '0');
    } else if (swapDirection === 'daiToEth' && userBalances.dai) {
      setAmount(ethers.utils.formatEther(userBalances.dai));
    }
  };

  return (
    <div className="swap-tokens">
      <h2>Swap Tokens</h2>
      
      <div className="swap-direction">
        <button
          className={swapDirection === 'ethToDai' ? 'active' : ''}
          onClick={() => setSwapDirection('ethToDai')}
        >
          ETH to DAI
        </button>
        <button
          className={swapDirection === 'daiToEth' ? 'active' : ''}
          onClick={() => setSwapDirection('daiToEth')}
        >
          DAI to ETH
        </button>
      </div>
      
      <form onSubmit={handleSwap}>
        <div className="field-group">
          <div className="field-with-max">
            <label>
              {swapDirection === 'ethToDai' ? 'ETH Amount' : 'DAI Amount'}
            </label>
            <button 
              type="button" 
              className="max-button"
              onClick={handleMaxClick}
            >
              MAX
            </button>
          </div>
          <input
            type="number"
            step="0.000000000000000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={`Enter ${swapDirection === 'ethToDai' ? 'ETH' : 'DAI'} amount`}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!amount || parseFloat(amount) === 0}
        >
          Swap
        </button>
      </form>
    </div>
  );
}

export default SwapTokens;
