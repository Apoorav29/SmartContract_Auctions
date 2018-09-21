pragma solidity  ^0.4.24;

contract Auction 
{
    struct Notary   // Notary struct -- may add more attributes to notary if necessary
    {
        address addr;
    }
    
    struct Bidder // Bidder struct -- 2D arrays for random representation of values
    {
        address addr;   // The unique address
        uint[2][] uv;   // The random representations of the items 
        uint[2] w;  // The random representation of w
    }

    address public auctioneer;  // Auctioneer conducts the auction, maybe beneficiary also as of now?
    uint public q;  // Q decided by auctioneer
    uint[] items;    // Items array
    uint auctionEnded;  // Whether auction  ended or not

    Notary[] public notaries;
    Bidder[] public bidders;    

    mapping(address => Notary) public bToN;
    mapping(address => uint[2]) public bidValues;
    
    constructor (uint _q, uint _m) 
    public
    {
        auctioneer = msg.sender;
        q = _q;
        // The items array is created. May remove if not needed
        for (uint i = 0; i < _m; i++) 
        {
            items.push(i+1);
        }
        emit auctionCreated(q, _m);
        // Auctioneer broadcasts the value Q and the no. of items m. 
    }

     // Modifiers
    modifier onlyBefore(uint _time) { require(now < _time, "Too Late"); _; }
    modifier onlyAfter(uint _time) { require(now > _time, "Too Early"); _; }
    modifier onlyAuctioneer() {require(msg.sender == auctioneer, "Only Auctioneer is allowed to call this method"); _; }
    modifier isNotBidder()
    {
        bool flag = false;
        for(uint i=0; i< bidders.length; i++)
        {
            if(msg.sender == bidders[i].addr)
            {
                flag = true;
            }
        }
        require(flag == false);
        _;
    }
    modifier isNotNotary()
    {
        bool flag = false;
        for(uint i=0;i<notaries.length; i++)
        {
            if(msg.sender == notaries[i].addr)
            {
                flag = true;
            }
        }
        require(flag == false);
        _;
    } 
    
    // Events
    event bidGiven (address _bidder, uint[2][] _uv, uint[2] _w); // just for checking
    event auctionCreated(uint q, uint m);

    // Bidder will bid using this function
    function bid(uint[2][] _uv, uint[2] _w)
    isNotBidder()   // Same bidder can't bid more than once
    public
    {
        bidders.push(Bidder({
            addr: msg.sender,
            uv: _uv,
            w: _w
        }));
        emit bidGiven(msg.sender, _uv, _w);

        // Assign a notary to this bidder
        // Throught mapping(notary ->  bidder) maybe?
    }

    // Notary will register using this function
    function register()
    isNotNotary()   // Same notary can't register more than once
    public
    {
        notaries.push(Notary({
            addr: msg.sender
        }));
    }

    /* 
    The auctioneer calls this to assign each bidder a notary
    The assigned notary must have access to the bid of each bidder.
    TODO: Only assigned notary should be able to see the bids
     */
    function assignNotary()
    onlyAuctioneer()    // Only auctioneer should be able to call this method
    {
        /* 
        mapping(struct -> struct) is not possible in solidity 
            using a mapping(address => struct) instead
        */
        // TODO:Randomize this assigning somehow
        for(uint i=0;i<bidders.length;i++)
        {
            bToN[bidders[i].addr] = notaries[i];
            bidValues[notaries[i].addr]=bidders[i].w;        
        }   
    }
    function Procedure1(address a1,address a2) returns(uint){
        
        if(a1==msg.sender){
            uint u1 = bidValues[a1][0];
            uint u2 = bidValues[a2][0];
            uint val1;
            val1= u1-u2;
            return val1;
        }
        else
        {
            if(a2==msg.sender){
                uint v1 = bidValues[a1][1];
                uint v2 = bidValues[a2][1];
                uint val2;            
                val2 = v1-v2;
                return val2;
            }
        }
    }
    // Auctioneer starts the process to find the winner.
    
    function findWinner()
    onlyAuctioneer()
    {
        // Sort the bidders array according to Procedure 1.

        //
        for (uint i = 0; i <bidders.length; i++)      
        {
            // Last i elements are already in place   
            for (uint j = 0; j < bidders.length-i-1; j++){ 
               if (Procedure1(notaries[j].addr,notaries[j+1].addr) + Procedure1(notaries[j].addr,notaries[j+1].addr)<q/2)
              {
                  Bidder v=bidders[j];
                  bidders[j]=bidders[j+1];
                  bidders[j]=v;
              }
            }
        }
    }

    // function 
    /* 
    temporary function for testing with truffle
    function getQ()
    public
    returns (uint)
    {
        return q;
    }
*/
}
