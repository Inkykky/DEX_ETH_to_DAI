import React, { useState } from 'react';
import { ethers } from 'ethers';

function RemoveLiquidity({ dexContract, userBalances, reloadData, setLoading }) {
  const [lpAmount, setLpAmount] = useState('');

  const handleRemoveLiquidity = async (e) => {
    e.preventDefault();
    
    if (!lpAmount) {
      alert('Please enter LP token amount');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert input amount to wei
      const lpToRemove = ethers.utils.parseEther(lpAmount);
      
      // Check if user has enough LP tokens
      if (lpToRemove.gt(userBalances.lpTokens)) {
        alert('Insufficient LP tokens balance');
        setLoading(false);
        return;
      }
      
      // Remove liquidity
      const tx = await dexContract.removeLiquidity(lpToRemove, {
        gasLimit: 300000
      });
      
      await tx.wait();
      
      alert('Liquidity removed successfully!');
      
      // Clear input
      setLpAmount('');
      
      // Reload data
      await reloadData();
    } catch (error) {
      console.error('Error removing liquidity:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMaxClick = () => {
    if (userBalances.lpTokens) {
      setLpAmount(ethers.utils.formatEther(userBalances.lpTokens));
    }
  };

  return (
    <div className="remove-liquidity">
      <h2>Remove Liquidity</h2>
      <form onSubmit={handleRemoveLiquidity}>
        <div className="field-group">
          <div className="field-with-max">
            <label>LP Token Amount</label>
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
            value={lpAmount}
            onChange={(e) => setLpAmount(e.target.value)}
            placeholder="Enter LP token amount"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!lpAmount || parseFloat(lpAmount) === 0}
        >
          Remove Liquidity
        </button>
      </form>
    </div>
  );
}

export default RemoveLiquidity;
