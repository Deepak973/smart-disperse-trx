//SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./ITRC20.sol";

import "./ISunswapV2Router01.sol";

contract SmartDisperse  {
    ISunswapV2Router01 public sunSwapRouter;
    
    address public owner;

    constructor()  {
       owner =msg.sender;
    }
    
    modifier onlyOwner{
        require(msg.sender ==owner);
        _;
    }

    event TrxDispersed(address payable[] indexed _recipients, uint256[] indexed _values);
    event ERC20TokenDispersed(ITRC20 indexed _token, address[] indexed _recipients, uint256[] _values);
    

    function setSunSwapRouter(address _sunSwapRouter) external onlyOwner {
        sunSwapRouter = ISunswapV2Router01(_sunSwapRouter);
    }


    function withdrawERC20Tokens(ITRC20 _token, uint256 _amount) external onlyOwner {
        require(_token.balanceOf(address(this)) >= _amount, "Contract has insufficient balance");
        require(_token.transfer(owner, _amount), "Transfer failed");
    }

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

    function disperseToken(ITRC20 _token, address[] memory _recipients, uint256[] memory _values ) external {
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
    
     function disperseTokenAfterSwap(ITRC20 _token, address[] memory _recipients, uint256[] memory _values ) internal {
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
    
    
   
    function swapTokensForTokens(uint256 _tokenAmount, address[] memory _path, uint256 _amountInMax) private returns (uint256[] memory) {
       
        require(_path.length >= 2, "Invalid path");
        
        address fromToken = _path[0];
       
        
        uint256 initialBalance = ITRC20(fromToken).balanceOf(address(this));
        // Transfer tokens from sender to this contract
        ITRC20(fromToken).transferFrom(msg.sender, address(this), _amountInMax);
        
        // Get the initial balance of fromToken in the contract
       
        
        // Approve the Sunswap Router to spend the tokens
        ITRC20(fromToken).approve(address(sunSwapRouter), _amountInMax);
        
        // Perform the token swap
        uint256[] memory amounts = sunSwapRouter.swapTokensForExactTokens(
            _tokenAmount,
            _amountInMax,
            _path,
            address(this),
            block.timestamp
        );
        
       
        uint256 finalBalance = ITRC20(fromToken).balanceOf(address(this));
        uint256 remainingBalance =  finalBalance -initialBalance  ;
        
     
        if (remainingBalance > 0) {
            ITRC20(fromToken).transfer(msg.sender, remainingBalance);
        }
        
        uint256 receivedTokens = ITRC20(_path[_path.length - 1]).balanceOf(address(this));
        require(receivedTokens >= _tokenAmount, "Swap did not result in enough tokens");
        
        return amounts;
}


   function swapAndDisperseTokenToToken(uint256 _tokenAmount, address[] memory _path,uint256 _amountInMax, address[] memory _recipients, uint256[] memory _values) external {
    swapTokensForTokens(_tokenAmount, _path,_amountInMax);
    disperseTokenAfterSwap(ITRC20(_path[_path.length - 1]), _recipients, _values);
    }
}