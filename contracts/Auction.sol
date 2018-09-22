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
    struct Result // for storing result of comparision by notaries
    {
        address addr;
        uint u;  // u1-u2
        uint v;  // v2-v1
    }
    struct setIntersection // for storing result of intersections of item lists
    {
        address addr;
        bool intersect;
    }
    address public auctioneer;  // Auctioneer conducts the auction, maybe beneficiary also as of now?
    uint public q;  // Q decided by auctioneer
    uint[] items;    // Items array
    uint auctionEnded;  // Whether auction  ended or not
    
    Bidder[] public winners;  // containg list of winners
    Notary[] public notaries; // containg list of notaries
    Bidder[] public bidders; // containg list of bidders
    
    uint public count;  // maintains count of notaries who have done comparision work
    uint public countIntersection; // maintains count of notaries who have done determination of set intersections
    
    mapping(address => Notary) public bToN; // mapping between bidders and notaries
    mapping(address => uint[2]) public bidValues; // mapping between notaries and bid values of bidders assigned to them
    mapping(address => uint[]) public item_map; // mapping between notaries and set of items of bidders assigned to them
    mapping(address => setIntersection[]) public set_values; // mapping containing notaries address and set intersection results
    mapping(address => uint) public workDone; // mapping containg notaries address and amount to be paid to notaries
    mapping(address => Result[]) public results; // mapping between notaries and results of comparision used for sorting
    
    
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
    modifier workCompleted() { require(count == notaries.length,"All notaries have not finished work.."); _; }
    modifier workCompleted1() { require(countIntersection == notaries.length,"All notaries have not finished work.."); _; }
    
    
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
                break;
            }
        }
        require(flag == false);
        _;
    } 
     modifier sufficientNotaries()
    {
        require(notaries.length>=bidders.length,"Insufficient notaries registered");
        _;
    }

    modifier isNotary()
    {
        bool flag = false;
        for(uint i=0;i<notaries.length; i++)
        {
            if(msg.sender == notaries[i].addr)
            {
                flag = true;
                break;
            }
        }
        require(flag == true);
        _;
    } 
    
    // Events
    event bidGiven (address _bidder, uint[2][] _uv, uint[2] _w); // just for checking
    event auctionCreated(uint q, uint m);

    // Bidder will bid using this function
    function registerBidder(uint[2][] _uv, uint[2] _w)
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
    function registerNotary()
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
    public
    {
        /* 
        mapping(struct -> struct) is not possible in solidity 
            using a mapping(address => struct) instead
        */
        // TODO:Randomize this assigning somehow
        for(uint i=0;i<bidders.length;i++)
        {
            bToN[bidders[i].addr] = notaries[i];
            bidValues[notaries[i].addr]=bidders[i].w;  // assigning bidding values of bidders to their notaries
            
            for(uint j=0;j<bidders[i].uv.length;j++)
            {
                item_map[notaries[i].addr].push((bidders[i].uv[j][0]+bidders[i].uv[j][1])%q); // assigning bidding items of bidders to notaries
            }
        }   
    }
    // uint count public =0;
    function performWork()
    isNotary()
    {
        count++; // to maintain number of notaries who have done comparision work.
        address myadd = msg.sender;
        uint[2] w2;
        w2=bidValues[myadd];  // u,v of bidder value of bidder assigned to notary
        for(uint i=0;i<notaries.length;i++){
            if(notaries[i].addr!=myadd){
                uint[2] w1;
                w1=bidValues[notaries[i].addr];
                Result r;
                r.addr = notaries[i].addr;
                r.u=w2[0]-w1[0];
                r.v=w1[1]-w2[1];
                results[myadd].push(r);  // add the val1 and val2 into the mapping
            }
        }
    }
    
    // Auctioneer starts the process to find the winner.
    
    function prior_Winner()
    isNotary()
    {
        
        countIntersection++; // to maintain number of notaries who have done determination of intersection between sets.
        address myadd = msg.sender;
        uint[] w2;
        w2=item_map[myadd];  // array of items for which bidding is to be done by that bidder
        for(uint i=0;i<notaries.length;i++){
            if(notaries[i].addr!=myadd)
            {
                uint[] w1;
                w1=item_map[notaries[i].addr];
                setIntersection si;
                si.addr=notaries[i].addr;
                
                for(uint j=0;j<w2.length;j++){
                    for(uint k=0;k<w1.length;k++){
                        if(w2[j]==w1[k])
                        {
                            si.intersect = true;
                            break;
                        }
                    }
                    if(w2[j]==w1[k])
                        break;
                    
                }
                set_values[myadd].push(si);  // pushing true or false according to intersection found between array of items of different bidders
            }
        }
    }
    
    function findWinners()
    onlyAuctioneer()
    workCompleted1()
    {
        winners.push(bidders[0]);  // first bidder in the list is always a winner so add directly
        uint flag;
        for(uint i=1;i<bidders.length;i++){
            flag=0;
            for(uint j=0;j<winners.length;j++){
                
                workDone[bidders[i].addr]++;
                workDone[winners[j].addr]++;
                
                for(uint k=0;k<set_values[notaries[i].addr].length;k++){
                    if(((set_values[notaries[i].addr][k]).addr)==(bToN[winners[j].addr]).addr)
                    {
                        if((set_values[notaries[i].addr][k]).intersect==true){
                            flag=1;  // if any intersection found break from loop
                            break;
                        }
                    }
                }
                if(flag==1)
                    break;
            }
            if(flag==0) //  if no intersection found between previous winner and current bidder make the bidder as a winner
                winners.push(bidders[i]);
        }
    }
    
    function sortBidders()
    onlyAuctioneer()
    workCompleted()
    {
        // Sort the bidders array according to Procedure 1.
        for (uint i = 0; i <bidders.length; i++)      
        {
            // Last i elements are already in place   
            for (uint j = 0; j < bidders.length-i-1; j++){
                uint val1;
                uint val2;
                workDone[bidders[j].addr]++;
                workDone[bidders[j+1].addr]++;
                
                // for u1-u2
                for(uint k=0;k<results[notaries[j].addr].length;k++)
                {
                    if((results[notaries[j].addr][k]).addr==notaries[j+1].addr)
                    {    
                        val1=(results[notaries[j].addr][k]).u;
                        break;
                    }
                }
                
                // for v1-v2
                for(k=0;k<results[notaries[j+1].addr].length;k++)
                {
                    if((results[notaries[j+1].addr][k]).addr==notaries[j].addr)
                    {    
                        val2=(results[notaries[j+1].addr][k]).v;
                        break;
                    }
                }
               if((val1+val2)<q/2) // if the condition is true swap the bidders and assigned notaries.
              {
                  uint[2] w1 = bidValues[notaries[j].addr];
                  bidValues[notaries[j].addr] = bidValues[notaries[j+1].addr];
                  bidValues[notaries[j+1].addr] = w1;
                  Bidder v=bidders[j];
                  bidders[j]=bidders[j+1];
                  bidders[j+1]=v;
                  
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
