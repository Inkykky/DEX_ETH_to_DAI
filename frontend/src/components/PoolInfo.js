import React from 'react';
import { ethers } from 'ethers';

function PoolInfo({ poolInfo, userBalances }) {
  const formatEther = (value) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatEther(value)).toFixed(4);
  };
  
  const formatToken = (value, decimals = 18) => {
    if (!value) return '0';
    return parseFloat(ethers.utils.formatUnits(value, decimals)).toFixed(4);
  };

  return (
    <div className="pool-info">
      <h2>Pool Information</h2>
      <div className="info-grid">
        <div className="info-item">
          <h3>ETH Reserve</h3>
          <p>{formatEther(poolInfo.ethReserve)} ETH</p>
        </div>
        <div className="info-item">
          <h3>DAI Reserve</h3>
          <p>{formatToken(poolInfo.token1Reserve)} DAI</p>
        </div>
        <div className="info-item">
          <h3>Total Liquidity</h3>
          <p>{formatToken(poolInfo.totalLiquidity)} LP</p>
        </div>
        <div className="info-item">
          <h3>Your Balances</h3>
          <p>ETH: {formatEther(userBalances.eth)}</p>
          <p>DAI: {formatToken(userBalances.dai)}</p>
          <p>LP Tokens: {formatToken(userBalances.lpTokens)}</p>
        </div>
      </div>
    </div>
  );
}

export default PoolInfo;
