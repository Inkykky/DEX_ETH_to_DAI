// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LiquidityPool is ERC20, ReentrancyGuard {

    // 交易对的代币 - token0 is ETH (represented by address(0)), token1 is a configurable ERC20
    address constant public WETH = address(0); // Using address(0) to represent ETH
    IERC20 public immutable token1; // Configurable ERC20 token address (e.g., DAI)
    
    // Example Mainnet DAI address (no longer hardcoded for contract logic)
    // address constant public DAI_ADDRESS_MAINNET = 0x6B175474E89094C44Da98b954EedeAC495271d0F;

    // 池子中的代币储备量
    uint256 public reserve0; // ETH reserve
    uint256 public reserve1; // Token1 reserve

    // 交易费用（0.3% = 30个基点）
    uint256 public constant FEE = 30;
    uint256 public constant FEE_DENOMINATOR = 10000;

    // 最小流动性
    uint256 private constant MINIMUM_LIQUIDITY = 10;
    
    // 已锁定的最小流动性
    bool private mintedMinimumLiquidity;

    // 死亡地址 - 用于锁定最小流动性
    address constant public DEAD_ADDRESS = address(0x000000000000000000000000000000000000dEaD);

    // Owner of the pool (the deployer)
    address public owner;

    // track how much each address actually provided
    mapping(address => uint256) private liquidityProvided;

    // 事件
    event LiquidityAdded(address indexed provider, uint256 amountETH, uint256 amountToken1, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 amountETH, uint256 amountToken1, uint256 liquidity);
    event Swap(address indexed sender, uint256 amountETHIn, uint256 amountToken1In, uint256 amountETHOut, uint256 amountToken1Out);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    // Allow contract to receive ETH
    receive() external payable {}
    fallback() external payable {}

    constructor(address _token1Address) ERC20("ETH-ERC20-LP", "LP-Token") {
        require(_token1Address != address(0), "Token1 address cannot be zero");
        token1 = IERC20(_token1Address);
        mintedMinimumLiquidity = false;
        owner = msg.sender;
    }

    // 添加流动性 - Modified to handle ETH-Token1 pair
    function addLiquidity(uint256 amountToken1Desired)
        external
        payable
        nonReentrant
        returns (uint256 liquidity)
    {
        uint256 amountETH = msg.value;
        require(amountETH > 0 && amountToken1Desired > 0, "Invalid amounts");

        // Check allowance for Token1
        uint256 allowance = token1.allowance(msg.sender, address(this));
        require(allowance >= amountToken1Desired, "Insufficient allowance for Token1");
        
        // ETH is already transferred with the transaction
        
        uint256 balanceBefore = token1.balanceOf(address(this));
        require(token1.transferFrom(msg.sender, address(this), amountToken1Desired), "Token1 transfer failed");
        uint256 amountToken1Actual = token1.balanceOf(address(this)) - balanceBefore;

        // Calculate LP tokens to mint
        if (totalSupply() == 0) {
            // Initial liquidity - use geometric mean of amounts
            liquidity = sqrt(amountETH * amountToken1Actual);
            
            // Only check and mint minimum liquidity if it hasn't been done before
            if (!mintedMinimumLiquidity) {
                require(liquidity > MINIMUM_LIQUIDITY, "Insufficient initial liquidity");
                _mint(DEAD_ADDRESS, MINIMUM_LIQUIDITY);
                mintedMinimumLiquidity = true;
                liquidity -= MINIMUM_LIQUIDITY;
            }
        } else {
            liquidity = min(
                amountETH * totalSupply() / reserve0,
                amountToken1Actual * totalSupply() / reserve1
            );
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        // Update reserves
        reserve0 = address(this).balance;
        reserve1 = token1.balanceOf(address(this));

        // Mint LP tokens
        _mint(msg.sender, liquidity);

        // record that this address provided exactly this much liquidity
        liquidityProvided[msg.sender] += liquidity;

        emit LiquidityAdded(msg.sender, amountETH, amountToken1Actual, liquidity);
        return liquidity;
    }

    // 移除流动性 - Modified for ETH-Token1
    function removeLiquidity(uint256 liquidity) external nonReentrant returns (uint256 amountETH, uint256 amountToken1) {
        require(liquidity > 0, "Invalid liquidity amount");
        require(balanceOf(msg.sender) >= liquidity, "Insufficient LP tokens");
        
        uint256 userProvided = liquidityProvided[msg.sender];
        require(userProvided >= liquidity, "Insufficient LP tokens");
        
        // Calculate token amounts to return
        uint256 currentTotalSupply = totalSupply(); // Use a local variable for totalSupply
        amountETH = liquidity * reserve0 / currentTotalSupply;
        amountToken1 = liquidity * reserve1 / currentTotalSupply;
        require(amountETH > 0 && amountToken1 > 0, "Insufficient amounts to remove");
        
        // Update the user's provided amount before burning tokens
        liquidityProvided[msg.sender] -= liquidity;
        
        // Burn LP tokens
        _burn(msg.sender, liquidity);
        
        // Transfer tokens to the user
        require(token1.transfer(msg.sender, amountToken1), "Token1 transfer failed");
        
        // Transfer ETH to user
        (bool sent, ) = payable(msg.sender).call{value: amountETH}("");
        require(sent, "ETH transfer failed");
        
        // Update reserves
        reserve0 = address(this).balance;
        reserve1 = token1.balanceOf(address(this));
        
        emit LiquidityRemoved(msg.sender, amountETH, amountToken1, liquidity);
        return (amountETH, amountToken1);
    }

    // 交换ETH为Token1
    function swapETHForToken1(address to) external payable nonReentrant {
        uint256 amountETHIn = msg.value;
        require(amountETHIn > 0, "Invalid input amount");
        require(to != address(0), "Cannot swap to zero address");
        require(to != address(this), "Cannot swap to pool");

        // ETH is already transferred with the transaction
        
        // Apply the swap fee (0.3%)
        uint256 amountETHInWithFee = amountETHIn * (FEE_DENOMINATOR - FEE) / FEE_DENOMINATOR;
        
        // Calculate output amount based on constant product formula
        uint256 amountToken1Out = getAmountOut(amountETHInWithFee, reserve0, reserve1);
        require(amountToken1Out > 0, "Insufficient output amount");
        require(amountToken1Out <= reserve1, "Insufficient reserve for Token1");
        
        // Send Token1 to recipient
        require(token1.transfer(to, amountToken1Out), "Token1 transfer failed");

        // Update reserves
        reserve0 = address(this).balance;
        reserve1 = token1.balanceOf(address(this));

        emit Swap(msg.sender, amountETHIn, 0, 0, amountToken1Out);
    }

    // 交换Token1为ETH
    function swapToken1ForETH(uint256 amountToken1In, address to) external nonReentrant {
        require(amountToken1In > 0, "Invalid input amount");
        require(to != address(0), "Cannot swap to zero address");
        require(to != address(this), "Cannot swap to pool");

        // Check sender has sufficient balance and allowance
        uint256 userBalance = token1.balanceOf(msg.sender);
        require(userBalance >= amountToken1In, "Insufficient Token1 balance");
        uint256 allowance = token1.allowance(msg.sender, address(this));
        require(allowance >= amountToken1In, "Insufficient Token1 allowance");


        // Transfer tokens first
        uint256 balanceBefore = token1.balanceOf(address(this));
        
        // Transfer Token1 from sender to the pool
        bool success = token1.transferFrom(msg.sender, address(this), amountToken1In);
        require(success, "Token1 transfer failed");
        
        // Calculate actual amount received (handles fee-on-transfer tokens)
        uint256 actualAmountIn = token1.balanceOf(address(this)) - balanceBefore;
        require(actualAmountIn > 0, "No tokens received");
        // Consider if fee-on-transfer tokens for Token1 should be fully supported or restricted
        // For now, we use actualAmountIn for calculations.
        // require(actualAmountIn == amountToken1In, "Fee on transfer tokens not supported explicitly here, use actualAmountIn"); 
        
        // Apply the swap fee (0.3%)
        uint256 amountToken1InWithFee = actualAmountIn * (FEE_DENOMINATOR - FEE) / FEE_DENOMINATOR;
        
        // Calculate output amount based on constant product formula
        uint256 amountETHOut = getAmountOut(amountToken1InWithFee, reserve1, reserve0);
        require(amountETHOut > 0, "Insufficient output amount");
        require(amountETHOut <= reserve0, "Insufficient reserve for ETH");
        
        // Send ETH to recipient
        (bool sent, ) = payable(to).call{value: amountETHOut}("");
        require(sent, "ETH transfer failed");

        // Update reserves
        reserve0 = address(this).balance;
        reserve1 = token1.balanceOf(address(this));

        emit Swap(msg.sender, 0, actualAmountIn, amountETHOut, 0);
    }

    // 计算输出量
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut)
        public
        pure
        returns (uint256 amountOut)
    {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity to calculate output");
        
        // Pure constant product formula xy=k
        // (reserveIn + amountIn) * (reserveOut - amountOut) = reserveIn * reserveOut
        // amountOut = reserveOut - (reserveIn * reserveOut) / (reserveIn + amountIn)
        // amountOut = reserveOut * amountIn / (reserveIn + amountIn) is an approximation, use full formula
        uint256 numerator = amountIn * reserveOut;
        uint256 denominator = reserveIn + amountIn;
        amountOut = numerator / denominator;

        // Original formula:
        // uint256 k = reserveIn * reserveOut;
        // uint256 reserveInAfter = reserveIn + amountIn;
        // uint256 reserveOutAfter = k / reserveInAfter;
        // amountOut = reserveOut - reserveOutAfter;
        // The simplified one above is common: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
        // Let's use the more robust one to avoid potential precision loss with intermediate k if numbers are huge,
        // though for typical values the simplified one is fine.
        // The Uniswap V2 formula is:
        // uint amountInWithFee = amountIn.mul(997);
        // uint numerator = amountInWithFee.mul(reserveOut);
        // uint denominator = reserveIn.mul(1000).add(amountInWithFee);
        // amountOut = numerator / denominator;
        // The fee is applied outside this getAmountOut function in this contract.
        // So, amountOut = (amountIn * reserveOut) / (reserveIn + amountIn) is correct here.
    }

    // Helper functions
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
        // if y == 0, z is 0 (default)
    }

    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }

    function getReserves() public view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }

    function getPoolInfo() public view returns (
        string memory token0Symbol, 
        address token1Address, 
        uint256 ethReserve, 
        uint256 token1Reserve, 
        uint256 totalLiquidity
    ) {
        return (
            "ETH",
            address(token1),
            reserve0,
            reserve1,
            totalSupply()
        );
    }
    
    // Get the user's LP token balance
    function getUserLiquidity(address user) public view returns (uint256) {
        return balanceOf(user);
    }
    
    // Get estimated output amount for UI displays
    function getEstimatedTokenOutput(uint256 inputAmount, bool isEthToToken) public view returns (uint256) {
        if (reserve0 == 0 || reserve1 == 0) return 0;
        
        uint256 inputWithFee = inputAmount * (FEE_DENOMINATOR - FEE) / FEE_DENOMINATOR;
        
        if (isEthToToken) {
            return getAmountOut(inputWithFee, reserve0, reserve1);
        } else {
            return getAmountOut(inputWithFee, reserve1, reserve0);
        }
    }
}