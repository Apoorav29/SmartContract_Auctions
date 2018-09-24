const Auction = artifacts.require('./Auction.sol')
const assert = require('assert')

let contractInstance
contract('Check Double Registration is not possible', (accounts) =>{
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const bidder3 = accounts[3];
    const notary1 = accounts[4];
    const notary2 = accounts[5];
    const notary3 = accounts[6];

    beforeEach(async () => {
        contractInstance = await Auction.deployed({ from: auctioneer });
    })
    it('Check same bidder cannot register more than once', async () => {
        //Test 1
        await contractInstance.registerBidder([[5, 13], [6, 13]], [1, 2], { from: bidder1 }); //{1,2} - 3
        const prevCount = await contractInstance.getBiddersLength();
        assert.equal(prevCount.c[0], 1,"The bidders array should have one element");
        try{
            await contractInstance.registerBidder([[1, 2], [9, 12]], [3, 3], { from: bidder1 });  //{3,4} - 6
        }
        catch(err){
        }
        const newCount = await contractInstance.getBiddersLength();
        assert.equal(newCount.c[0], 1, "Double registration should not have been possible");

    })
    it('Check same notary cannot register more than once', async () => {
        //Test 1
        await contractInstance.registerNotary({ from: notary1 });
        const prevCount = await contractInstance.getNotariesLength();
        assert.equal(prevCount.c[0], 1, "The notary array should have one element");
        try {
            await contractInstance.registerNotary({ from: notary1 });
        }
        catch (err) {
        }
        const newCount = await contractInstance.getNotariesLength();
        assert.equal(newCount.c[0], 1, "Double registration should not have been possible");
    })
})

contract('Full Test 1', (accounts) =>{
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const bidder3 = accounts[3];
    const notary1 = accounts[4];
    const notary2 = accounts[5];
    const notary3 = accounts[6];

    beforeEach(async() =>{  
        contractInstance = await Auction.deployed({from: auctioneer});
    })
    
    it('Multiple Bidder Registration', async() =>{
      
        //Test 1
        await contractInstance.registerBidder([[5, 13],[6, 13]], [1,2], {from: bidder1}); //{1,2} - 3
        await contractInstance.registerBidder([[1, 2],[9, 12]], [3,3], {from: bidder2});  //{3,4} - 6
        await contractInstance.registerBidder([[3,2]], [4, 4], { from: bidder3 }); //{5} - 8
       
        const expected1 = await contractInstance.bidders(0);
        const expected2 = await contractInstance.bidders(1);        
        const expected3 = await contractInstance.bidders(2);

        assert.equal(expected1, bidder1,"The address of the bidder doesn't match");
        assert.equal(expected2, bidder2, "The address of the bidder doesn't match");
        assert.equal(expected3, bidder3, "The address of the bidder doesn't match");

    })
    it('Multiple Notary Registration', async() =>{
        await contractInstance.registerNotary({from: notary1});
        await contractInstance.registerNotary({from: notary2});
        await contractInstance.registerNotary({from:notary3});
        const expected1 = await contractInstance.notaries(0);
        const expected2 = await contractInstance.notaries(1);
        const expected3 = await contractInstance.notaries(2);

        assert.equal(expected1, notary1, "The address of the notary doesn't match");
        assert.equal(expected2, notary2, "The address of the notary doesn't match");
        assert.equal(expected3, notary3, "The address of the notary doesn't match");

    })
    it('Assign notaries to bidders', async () => {
        await contractInstance.assignNotary({from: auctioneer});
    })
    it('Let Notaries exchange values', async() =>{
        await contractInstance.performWork({ from: notary1 });
        await contractInstance.performWork({ from: notary2 });
        await contractInstance.performWork({ from: notary3 });
    })
    it('Sort the bidders with procedure1', async() =>{
        await contractInstance.sortBidders({ from: auctioneer });
    })
    it('Calculate Item Intersection', async() =>{
        await contractInstance.prior_Winner({ from: notary1 });
        await contractInstance.prior_Winner({ from: notary2 });
        await contractInstance.prior_Winner({ from: notary3 });
    })
    it('Check Winners calculated are correct', async() =>{
        await contractInstance.findWinners({ from: auctioneer });
        //Test 1
        const winner1 = await contractInstance.winners(0);
        const winner2 = await contractInstance.winners(1);
        const winner3 = await contractInstance.winners(2);
        assert.equal(winner1, bidder3);
        assert.equal(winner2, bidder2);
        assert.equal(winner3, bidder1);
    }) 
    it('Check Payments', async() =>{
        await contractInstance.makePayments({from: auctioneer});
    })
})
contract('Full Test 2', (accounts) => {
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const bidder3 = accounts[3];
    const notary1 = accounts[4];
    const notary2 = accounts[5];
    const notary3 = accounts[6];

    beforeEach(async () => {
        contractInstance = await Auction.deployed({ from: auctioneer });
    })

    it('Multiple Bidder Registration', async () => {
        // Test 2 
        await contractInstance.registerBidder([[5, 13], [6, 13], [1, 2]], [1, 2], { from: bidder1 }); //{1,2,3} - 3
        await contractInstance.registerBidder([[1, 2], [9, 12]], [3, 3], { from: bidder2 });  //{3,4} - 6
        await contractInstance.registerBidder([[9, 12], [3, 2]], [4, 4], { from: bidder3 }); //{4,5} - 8 

        const expected1 = await contractInstance.bidders(0);
        const expected2 = await contractInstance.bidders(1);        
        const expected3 = await contractInstance.bidders(2);

        assert.equal(expected1, bidder1, "The address of the bidder doesn't match");
        assert.equal(expected2, bidder2, "The address of the bidder doesn't match");
        assert.equal(expected3, bidder3, "The address of the bidder doesn't match");

    })
    it('Multiple Notary Registration', async () => {
        await contractInstance.registerNotary({ from: notary1 });
        await contractInstance.registerNotary({ from: notary2 });
        await contractInstance.registerNotary({ from: notary3 });
        const expected1 = await contractInstance.notaries(0);
        const expected2 = await contractInstance.notaries(1);
        const expected3 = await contractInstance.notaries(2);

        assert.equal(expected1, notary1, "The address of the notary doesn't match");
        assert.equal(expected2, notary2, "The address of the notary doesn't match");
        assert.equal(expected3, notary3, "The address of the notary doesn't match");

    })
    it('Assign notaries to bidders', async () => {
        await contractInstance.assignNotary({ from: auctioneer });
    })
    it('Let Notaries exchange values', async () => {
        await contractInstance.performWork({ from: notary1 });
        await contractInstance.performWork({ from: notary2 });
        await contractInstance.performWork({ from: notary3 });
    })
    it('Sort the bidders with procedure1', async () => {
        await contractInstance.sortBidders({ from: auctioneer });
    })
    it('Calculate Item Intersection', async () => {
        await contractInstance.prior_Winner({ from: notary1 });
        await contractInstance.prior_Winner({ from: notary2 });
        await contractInstance.prior_Winner({ from: notary3 });
    })
    it('Check Winners calculated are correct', async () => {
        await contractInstance.findWinners({ from: auctioneer });
        //Test 2
        const winner1 = await contractInstance.winners(0);
        const winner2 = await contractInstance.winners(1);
        assert.equal(winner1, bidder3);
        assert.equal(winner2, bidder1);
    })
    it('Check Payments', async () => {
        await contractInstance.makePayments({ from: auctioneer });
    })
})
contract('Full Test 3', (accounts) => {
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const bidder2 = accounts[2];
    const bidder3 = accounts[3];
    const notary1 = accounts[4];
    const notary2 = accounts[5];
    const notary3 = accounts[6];

    beforeEach(async () => {
        contractInstance = await Auction.deployed({ from: auctioneer });
    })

    it('Multiple Bidder Registration', async () => {
        // Test 3
        await contractInstance.registerBidder([[5, 13], [6, 13], [1, 2]], [1, 2], { from: bidder1}); //{1,2,3} - 3
        await contractInstance.registerBidder([[1, 2], [9, 12]], [3, 3], { from: bidder2});  //{3,4} - 6
        await contractInstance.registerBidder([[3, 2]], [4, 4], { from: bidder3 }); //{5} - 8 

        const expected1 = await contractInstance.bidders(0);
        const expected2 = await contractInstance.bidders(1);
        const expected3 = await contractInstance.bidders(2);

        assert.equal(expected1, bidder1, "The address of the bidder doesn't match");
        assert.equal(expected2, bidder2, "The address of the bidder doesn't match");
        assert.equal(expected3, bidder3, "The address of the bidder doesn't match");

    })
    it('Multiple Notary Registration', async () => {
        await contractInstance.registerNotary({ from: notary1 });
        await contractInstance.registerNotary({ from: notary2 });
        await contractInstance.registerNotary({ from: notary3 });

        const expected1 = await contractInstance.notaries(0);
        const expected2 = await contractInstance.notaries(1);
        const expected3 = await contractInstance.notaries(2);

        assert.equal(expected1, notary1, "The address of the notary doesn't match");
        assert.equal(expected2, notary2, "The address of the notary doesn't match");
        assert.equal(expected3, notary3, "The address of the notary doesn't match");

    })
    it('Assign notaries to bidders', async () => {
        await contractInstance.assignNotary({ from: auctioneer });
    })
    it('Let Notaries exchange values', async () => {
        await contractInstance.performWork({ from: notary1 });
        await contractInstance.performWork({ from: notary2 });
        await contractInstance.performWork({ from: notary3 });
    })
    it('Sort the bidders with procedure1', async () => {
        await contractInstance.sortBidders({ from: auctioneer });
    })
    it('Calculate Item Intersection', async () => {
        await contractInstance.prior_Winner({ from: notary1 });
        await contractInstance.prior_Winner({ from: notary2 });
        await contractInstance.prior_Winner({ from: notary3 });
    })
    it('Check Winners calculated are correct', async () => {
        await contractInstance.findWinners({ from: auctioneer });
        //Test 3
        const winner1 = await contractInstance.winners(0);
        const winner2 = await contractInstance.winners(1);
        assert.equal(winner1, bidder3);
        assert.equal(winner2, bidder2);
    })
    it('Check Payments', async () => {
        await contractInstance.makePayments({ from: auctioneer });
    })
})
/* it('Check if two notaries with sample address can get registered', async () => {
        var prevcnt = await contractInstance.getNotarycnt();
        try {
            await contractInstance.registerNotary({ from: p[0] });
        }
        catch (err) {

        }
        var newcnt = await contractInstance.getNotarycnt();
        assert.equal(prevcnt.c[0], newcnt.c[0], 'Bidder is not registered');
    }) */