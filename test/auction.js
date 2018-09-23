const Auction = artifacts.require('./Auction.sol')
const assert = require('assert')

let contractInstance


contract('Auction', (accounts) =>{
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const notary1 = accounts[3];
    const notary2 = accounts[4];
    beforeEach(async() =>{  
        contractInstance = await Auction.deployed({from: auctioneer});
    })
    
    it('Multiple Bidder Registration', async() =>{
        await contractInstance.registerBidder([[18, 2],[5, 16]], [3,3],{from: bidder1}); // 3,4 -- 6 
        await contractInstance.registerBidder([[18, 3], [5, 15]], [1,2], {from: bidder2}); // 4,3 --3
        const expected1 = await contractInstance.bidders(0);
        const expected2 = await contractInstance.bidders(1);        
        // console.log(bidder1);
        // console.log(bidder2);
        assert.equal(expected1, bidder1,"The address of the bidder doesn't match");
        assert.equal(expected2, bidder2, "The address of the bidder doesn't match");
    })
    it('Multiple Notary Registration', async() =>{
        await contractInstance.registerNotary({from: notary1});
        await contractInstance.registerNotary({from: notary2});
        const expected1 = await contractInstance.notaries(0);
        const expected2 = await contractInstance.notaries(1);

        assert.equal(expected1, notary1, "The address of the notary doesn't match");
        assert.equal(expected2, notary2, "The address of the notary doesn't match");
    })
    it('Assign notaries to bidders', async () => {
        // await contractInstance.registerBidder([[18, 2], [5, 16]], [8, 9], { from: bidder1 });
        // await contractInstance.registerBidder([[18, 3], [5, 15]], [7, 9], { from: bidder2 });
        // await contractInstance.registerNotary({from: notary1 });
        // const expected3 = await contractInstance.notaries(1);
        // await contractInstance.registerNotary({from: notary2 });
        await contractInstance.assignNotary({ from: auctioneer });
        await contractInstance.performWork({from: notary1});
        await contractInstance.performWork({from: notary2});
        await contractInstance.sortBidders({from: auctioneer});
        await contractInstance.prior_Winner({from: notary1});
        await contractInstance.prior_Winner({from: notary2});
        await contractInstance.findWinners({from: auctioneer});
        const winner = await contractInstance.winners(0);
        console.log(winner);
        assert.equal(winner, bidder1);
        // assert.equal(winner, bidder2);
        // const winner = await contractInstance.bidders(0)
        // assert.equal(winner,bidder1,'The bidders have not been properly sorted');
    })
})