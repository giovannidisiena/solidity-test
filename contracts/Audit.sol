//SPDX-License-Identifier: Unlicense
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract ERC721BidSale {
    address public _seller;
    ERC721 public _tokenContract;
    uint256 public _tokenId;
    uint256 public _delay;
    uint256 public _timeLimit;
    uint256 public _lastBid;
    address public _lastBidder;

    constructor() {
        _seller = msg.sender;
    }
    function setup(ERC721 tokenContract, uint256 tokenId, uint256 delay) external {
        require(msg.sender == _seller, "NOT_AUTHROIZED");
        _delay = delay;
        _tokenContract = tokenContract;
        _tokenId = tokenId;
        _tokenContract.transferFrom(msg.sender, address(this), tokenId);
        _timeLimit = block.timestamp + delay;
    }
    function bid() external payable {
        require(msg.value > _lastBid, "BID_TOO_LOW");
        require(block.timestamp < _timeLimit, "BID_OVER");
        _timeLimit = block.timestamp + _delay;
        _lastBid = msg.value;
        _lastBidder = msg.sender;
        payable(_lastBidder).transfer(_lastBid);
    }
    function widthrawPrice() external {
        require(block.timestamp >= _timeLimit, "BID_NOT_OVER");
        if (_lastBidder != address(0)) {
            require(_lastBidder == msg.sender, "NOT_LAST_BIDDER");
        } else {
            require(_seller == msg.sender, "NOT_SELLER");
        }
        _tokenContract.safeTransferFrom(address(this), msg.sender, _tokenId);
    }
    function withdrawSale() external {
        _lastBid = 0;
        payable(_seller).transfer(_lastBid);
    }
}