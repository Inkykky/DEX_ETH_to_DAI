import React, { useState } from 'react';
import { ethers } from 'ethers';

function AddLiquidity({ dexContract, daiContract, userBalances, reloadData, setLoading }) {
  const [ethAmount, setEthAmount] = useState('');
  const [daiAmount, setDaiAmount] = useState('');

  const handleAddLiquidity = async (e) => {
    e.preventDefault();
    
    if (!ethAmount || !daiAmount) {
      alert('Please enter both ETH and DAI amounts');
      return;
    }
    
    try {
      setLoading(true);
      
      // Convert input amounts to wei
      const ethToSend = ethers.utils.parseEther(ethAmount);
      const daiToSend = ethers.utils.parseEther(daiAmount);
      
      // First approve DAI transfer
      const approveTx = await daiContract.approve(dexContract.address, daiToSend);
      await approveTx.wait();
      
      // Add liquidity
      const tx = await dexContract.addLiquidity(daiToSend, {
        value: ethToSend,
        gasLimit: 300000
      });
      
      await tx.wait();
      
      alert('Liquidity added successfully!');
      
      // Clear inputs
      setEthAmount('');
      setDaiAmount('');
      
      // Reload data
      await reloadData();
    } catch (error) {
      console.error('Error adding liquidity:', error);
      alert(`Error: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-liquidity">
      <h2>Add Liquidity</h2>
      <form onSubmit={handleAddLiquidity}>
        <div className="field-group">
          <label>ETH Amount</label>
          <input
            type="number"
            step="0.000000000000000001"
            value={ethAmount}
            onChange={(e) => setEthAmount(e.target.value)}
            placeholder="Enter ETH amount"
          />
        </div>
        
        <div className="field-group">
          <label>DAI Amount</label>
          <input
            type="number"
            step="0.000000000000000001"
            value={daiAmount}
            onChange={(e) => setDaiAmount(e.target.value)}
            placeholder="Enter DAI amount"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!ethAmount || !daiAmount}
        >
          Add Liquidity
        </button>
      </form>
    </div>
  );
}

export default AddLiquidity;
