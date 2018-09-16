pragma solidity ^0.4.24;

contract Auction 
{
    address public auctioneer;  // Auctioneer conducts the auction, maybe beneficiary also as of now?
    uint public q;  // Q decided by auctioneer
    uint[] public items;    // Items array
    uint public ended;  // Whether auction  ended or not

    // constructor(uint _q, uint _m) public
    // {
    //     auctioneer = msg.sender;
    //     q = _q;
    //     for (uint i = 0; i < _m; i++) 
    //     {
    //         items.push(i+1);
    //     }
    // }

    struct Bidder // Bidder struct -- 2D arrays for random representation of values
    {
        address account;
        uint[2][] uv;
        uint[2] w;
    }
    
    Bidder[] public bidders;

    // Modifiers
    modifier onlyBefore(uint _time) { require(now < _time, "Too Late"); _; }
    modifier onlyAfter(uint _time) { require(now > _time, "Too Early"); _; }
    modifier onlyAuctioneer() {require(msg.sender == auctioneer, "Only Auctioneer is allowed to call this method"); _; }

}