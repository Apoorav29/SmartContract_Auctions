pragma solidity  ^0.4.24;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/Auction.sol";

contract TestAuction
{
    function testNumberOfItems()
    {
        Auction auc = Auction(DeployedAddresses.Auction());
        // Auction auc = new Auction(5,5);
        uint expected = 5;
        Assert.equal(auc.getQ(), expected, "The number of items should be m");
    }
}