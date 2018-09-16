pragma solidity  ^0.4.24;

contract Auction 
{
    address public auctioneer;  // Auctioneer conducts the auction, maybe beneficiary also as of now?
    uint public q;  // Q decided by auctioneer
    uint[] public items;    // Items array
    uint public ended;  // Whether auction  ended or not

    struct Bidder // Bidder struct -- 2D arrays for random representation of values
    {
        address account;
        uint[2][] uv;
        uint[2] w;
    }
    
    Bidder[] public bidders;

    constructor(uint _q, uint _m) public
    {
        auctioneer = msg.sender;
        q = _q;
        for (uint i = 0; i < _m; i++) 
        {
            items.push(i+1);
        }
    }

     // Modifiers
    modifier onlyBefore(uint _time) { require(now < _time, "Too Late"); _; }
    modifier onlyAfter(uint _time) { require(now > _time, "Too Early"); _; }
    modifier onlyAuctioneer() {require(msg.sender == auctioneer, "Only Auctioneer is allowed to call this method"); _; }
    
    // Events
    event bidGiven (address _bidder, uint[2][] _uv, uint[2] _w); // just for checking

    function bid(uint[2][] _uv, uint[2] _w)
    public
    {
        // TODO:  add check so that same bidder can't bid more  than once
        bidders.push(Bidder({
            account: msg.sender,
            uv: _uv,
            w: _w
        }));
        emit bidGiven(msg.sender, _uv, _w);
    }

    // temporary function for testing with truffle
    function getQ()
    public
    returns (uint)
    {
        return q;
    }
    //
}