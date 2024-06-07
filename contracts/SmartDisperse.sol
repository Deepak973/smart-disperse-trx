// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./ITRC20.sol";
import "./ISunswapV2Router01.sol";

/**
 * @title SmartDisperse
 * @dev A contract to disperse TRX and ERC20 tokens to multiple recipients and swap tokens using Sunswap.
 */
contract SmartDisperse  {
    ISunswapV2Router01 public sunSwapRouter;
    address public owner;

    /**
     * @dev Sets the owner as the account that deploys the contract.
     */
    constructor()  {
       owner = msg.sender;
    }
    
    modifier onlyOwner {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    event TrxDispersed(address payable[] indexed recipients, uint256[] indexed values);
    event ERC20TokenDispersed(ITRC20 indexed token, address[] indexed recipients, uint256[] values);

    /**
     * @dev Sets the address of the Sunswap router.
     * @param _sunSwapRouter The address of the Sunswap router contract.
     */
    function setSunSwapRouter(address _sunSwapRouter) external onlyOwner {
        sunSwapRouter = ISunswapV2Router01(_sunSwapRouter);
    }

    /**
     * @dev Withdraws ERC20 tokens from the contract.
     * @param _token The address of the ERC20 token.
     * @param _amount The amount of tokens to withdraw.
     */
    function withdrawERC20Tokens(ITRC20 _token, uint256 _amount) external onlyOwner {
        require(_token.balanceOf(address(this)) >= _amount, "Contract has insufficient balance");
        require(_token.transfer(owner, _amount), "Transfer failed");
    }

    /**
     * @dev Disperses TRX to multiple recipients.
     * @param _recipients The addresses of the recipients.
     * @param _values The amounts of TRX to send to each recipient.
     */
    function disperseTrx(address payable[] memory _recipients, uint256[] memory _values) public payable {
        for (uint256 i = 0; i < _recipients.length; i++) {
            _recipients[i].transfer(_values[i]);
        }
        emit TrxDispersed(_recipients, _values);

        uint256 balance = address(this).balance;
        if (balance > 0) {
            payable(msg.sender).transfer(balance);
        }
    }

    /**
     * @dev Disperses ERC20 tokens to multiple recipients.
     * @param _token The address of the ERC20 token.
     * @param _recipients The addresses of the recipients.
     * @param _values The amounts of tokens to send to each recipient.
     */
    function disperseToken(ITRC20 _token, address[] memory _recipients, uint256[] memory _values) external {
        uint256 total = 0;
        for (uint256 i = 0; i < _recipients.length; i++) {
            total += _values[i];
        }
        require(_token.transferFrom(msg.sender, address(this), total), "Transfer failed");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_token.transfer(_recipients[i], _values[i]), "Transfer failed");
        }
        
        emit ERC20TokenDispersed(_token, _recipients, _values);
    }

    /**
     * @dev Internal function to disperse ERC20 tokens after swapping.
     * @param _token The address of the ERC20 token.
     * @param _recipients The addresses of the recipients.
     * @param _values The amounts of tokens to send to each recipient.
     */
    function disperseTokenAfterSwap(ITRC20 _token, address[] memory _recipients, uint256[] memory _values) internal {
        uint256 total = 0;
        for (uint256 i = 0; i < _recipients.length; i++) {
            total += _values[i];
        }
        require(_token.balanceOf(address(this)) >= total, "Insufficient tokens for dispersement");
        
        for (uint256 i = 0; i < _recipients.length; i++) {
            require(_token.transfer(_recipients[i], _values[i]), "Transfer failed to the recipients");
        }
        
        emit ERC20TokenDispersed(_token, _recipients, _values);
    }

    /**
     * @dev Swaps tokens for tokens using the Sunswap router.
     * @param _tokenAmount The amount of tokens to receive.
     * @param _path The swap path.
     * @param _amountInMax The maximum amount of input tokens to be swapped.
     * @return The amounts of tokens swapped.
     */
    function swapTokensForTokens(uint256 _tokenAmount, address[] memory _path, uint256 _amountInMax) private returns (uint256[] memory) {
        require(_path.length >= 2, "Invalid path");
        
        address fromToken = _path[0];
        
        uint256 initialBalance = ITRC20(fromToken).balanceOf(address(this));
        ITRC20(fromToken).transferFrom(msg.sender, address(this), _amountInMax);
        
        ITRC20(fromToken).approve(address(sunSwapRouter), _amountInMax);
        
        uint256[] memory amounts = sunSwapRouter.swapTokensForExactTokens(
            _tokenAmount,
            _amountInMax,
            _path,
            address(this),
            block.timestamp
        );
        
        uint256 finalBalance = ITRC20(fromToken).balanceOf(address(this));
        uint256 remainingBalance = finalBalance - initialBalance;
        
        if (remainingBalance > 0) {
            ITRC20(fromToken).transfer(msg.sender, remainingBalance);
        }
        
        uint256 receivedTokens = ITRC20(_path[_path.length - 1]).balanceOf(address(this));
        require(receivedTokens >= _tokenAmount, "Swap did not result in enough tokens");
        
        return amounts;
    }

    /**
     * @dev Swaps tokens for other tokens and then disperses them to multiple recipients.
     * @param _tokenAmount The amount of tokens to receive from the swap.
     * @param _path The swap path.
     * @param _amountInMax The maximum amount of input tokens to be swapped.
     * @param _recipients The addresses of the recipients.
     * @param _values The amounts of tokens to send to each recipient.
     */
    function swapAndDisperseTokenToToken(uint256 _tokenAmount, address[] memory _path, uint256 _amountInMax, address[] memory _recipients, uint256[] memory _values) external {
        swapTokensForTokens(_tokenAmount, _path, _amountInMax);
        disperseTokenAfterSwap(ITRC20(_path[_path.length - 1]), _recipients, _values);
    }
}
