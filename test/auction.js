const Auction = artifacts.require('./Auction.sol')
const assert = require('assert')

let contractInstance
contract('Unit Tests', (accounts) =>{
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
    it('Check Auctioneer cannot register as a bidder', async() => {
        try{
            await contractInstance.registerBidder([[5, 13], [6, 13]], [1, 2], { from: auctioneer }); //{1,2} - 3
            assert.fail();
        }
        catch(e){
            assert.ok(true);
        }
    })
    it('Check Auctioneer cannot register as a Notary', async () => {
        try {
            await contractInstance.registerNotary({ from: auctioneer });
            assert.fail();
        }
        catch (e) {
            assert.ok(true);
        }
    })
    it('Check same bidder cannot register more than once', async () => {
        //Test 1
        await contractInstance.registerBidder([[5, 13], [6, 13]], [1, 2], { from: bidder1 }); //{1,2} - 3
        const prevCount = await contractInstance.getBiddersLength();
        assert.equal(prevCount.c[0], 1,"The bidders array should have one element");
        try{
            await contractInstance.registerBidder([[1, 2], [9, 12]], [3, 3], { from: bidder1 });  //{3,4} - 6
            assert.fail("Bidder was able to double register");
        }
        catch(err){
            assert.ok(true);
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
            assert.fail("Notary was able to double register");
        }
        catch (err) {
            assert.ok(true);
        }
        const newCount = await contractInstance.getNotariesLength();
        assert.equal(newCount.c[0], 1, "Double registration should not have been possible");
    })
    it('Check sorting is not possible before the notaries have compared values', async() =>{
        try{
            await contractInstance.sortBidders({ from: auctioneer });
            assert.fail("sortBidders was called successfully");
        }
        catch(err)
        {
            assert.ok(true,"sortBidders should not have been called");
        }
    })
    it('Check Notaries exchange values', async() =>{
        try{
            await contractInstance.performWork({ from: notary1 });
            assert.ok(true);
        }
        catch(e){
            assert.fail("Notaries were unable to perform work")
        }
    })
    it('Check sorting is possible after notaries exchange', async() =>{
        try {
            await contractInstance.sortBidders({ from: auctioneer });
            assert.ok(true, "sortBidders should have been called");
        }
        catch (err) {
            assert.fail("sortBidders was not called successfully");
        }
    })
    it('Check auctioneer cannot findWinners until notaries find winners', async() =>{
        try {
            await contractInstance.findWinners({ from: auctioneer });
            assert.fail("findWinners was called successfully");
        }
        catch (err) {
            assert.ok(true, "findWinners should not have been called");
        }
    })
    it('Check Notaries exchange item values', async () => {
        try {
            await contractInstance.prior_Winner({ from: notary1 });
            assert.ok(true);
        }
        catch (e) {
            assert.fail("Notaries were unable to find Winner")
        }
    })
    it('Check makePayment is not possible before finding winner', async () => {
        try {
            await contractInstance.makePayments({ from: auctioneer });
            assert.fail("makePayments was called successfully");
        }
        catch (err) {
            assert.ok(true, "makePayments should not have been called");
        }
    })
    it('Check payNotaries is not possible before finding winner', async () => {
        try {
            await contractInstance.payNotaries({ from: auctioneer });
            assert.fail("payNotaries was called successfully");
        }
        catch (err) {
            assert.ok(true, "payNotaries should not have been called");
        }
    })
    it('Check withdrawNotaries is not possible before finding winner', async () => {
        try {
            await contractInstance.withdrawNotaries({ from: notary1 });
            assert.fail("withdrawNotaries was called successfully");
        }
        catch (err) {
            assert.ok(true, "withdrawNotaries should not have been called");
        }
    })
    it('Check findWinners is possible after notaries exchange', async () => {
        try {
            await contractInstance.findWinners({ from: auctioneer });
            assert.ok(true, "findWinners should have been called");
        }
        catch (err) {
            assert.fail("findWinners was not called successfully");
        }
    })
    it('Check makePayment is possible after finding winners', async () => {
        try {
            await contractInstance.findWinners({ from: auctioneer });
            assert.ok(true, "makePayments should have been called");
        }
        catch (err) {
            assert.fail("makePayments was not called successfully");
        }
    })
    it('Check payNotaries is possible after finding winners', async () => {
        try {
            await contractInstance.payNotaries({ from: auctioneer });
            assert.ok(true, "payNotaries should have been called");
        }
        catch (err) {
            assert.fail("payNotaries was not called successfully");
        }
    })
    it('Check withdrawNotaries is possible after finding winners', async () => {
        try {
            await contractInstance.withdrawNotaries({ from: notary1 });
            assert.ok(true, "withdrawNotaries should have been called");
        }
        catch (err) {
            assert.fail("withdrawNotaries was not called successfully");
        }
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
        try{
            await contractInstance.sortBidders({ from: auctioneer });
            assert.ok(true);
        }
        catch(e)
        {
            assert.fail();
        }
    })
    it('Calculate Item Intersection', async() =>{
        try{
            await contractInstance.prior_Winner({ from: notary1 });
            await contractInstance.prior_Winner({ from: notary2 });
            await contractInstance.prior_Winner({ from: notary3 });
            assert.ok(true);
        }
        catch(e){
            assert.fail();
        }
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
        const payment1 = await contractInstance.payments(bidder3);
        const payment2 = await contractInstance.payments(bidder2);
        const payment3 = await contractInstance.payments(bidder1);
        assert.equal(payment1.c[0], 0);
        assert.equal(payment2.c[0], 0);
        assert.equal(payment3.c[0], 0);

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
        const payment1 = await contractInstance.payments.call(bidder3);
        const payment2 = await contractInstance.payments.call(bidder1);
        assert.equal(payment1.c[0],6);
        assert.equal(payment2.c[0],6);
        // console.log(payment1.c[0]);
        // console.log(payment2.c[0]);

        // console.log(pay.c[0]);
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
        const payment1 = await contractInstance.payments(bidder3);
        const payment2 = await contractInstance.payments(bidder2);
        assert.equal(payment1.c[0],0);
        assert.equal(payment2.c[0],3);
        // console.log(payment1.c[0]);
        // console.log(payment2.c[0]);

    })
})
contract('Full Test 4 - Only one bidder and more than one notaries.', (accounts) => {
    const auctioneer = accounts[0];
    const bidder1 = accounts[1];
    const notary1 = accounts[2];
    const notary2 = accounts[3];
    
    beforeEach(async () => {
        contractInstance = await Auction.deployed({ from: auctioneer });
    })

    it('One Bidder Registration', async () => {
        await contractInstance.registerBidder([[5, 13], [6, 13], [1, 2]], [1, 2], { from: bidder1}); //{1,2,3} - 3
        
        const expected1 = await contractInstance.bidders(0);
        assert.equal(expected1, bidder1, "The address of the bidder doesn't match");
        
    })
    it('Multiple Notary Registration', async () => {
        await contractInstance.registerNotary({ from: notary1 });
        await contractInstance.registerNotary({ from: notary2 });
        const expected1 = await contractInstance.notaries(0);
        const expected2 = await contractInstance.notaries(1);
        assert.equal(expected1, notary1, "The address of the notary doesn't match");
        assert.equal(expected2, notary2, "The address of the notary doesn't match");
        
    })
    it('Assign notaries to bidders', async () => {
        await contractInstance.assignNotary({ from: auctioneer });
    })
    it('Let Notaries exchange values', async () => {
        await contractInstance.performWork({ from: notary1 });
        await contractInstance.performWork({ from: notary2 });
    })
    it('Sort the bidders with procedure1', async () => {
        await contractInstance.sortBidders({ from: auctioneer });
    })
    it('Calculate Item Intersection', async () => {
        await contractInstance.prior_Winner({ from: notary1 });
        await contractInstance.prior_Winner({ from: notary2 });
        //await contractInstance.prior_Winner({ from: notary3 });
    })
    it('Check Winners calculated are correct', async () => {
        await contractInstance.findWinners({ from: auctioneer });
        const winner1 = await contractInstance.winners(0);
        assert.equal(winner1, bidder1);
    })
    it('Check Payments', async () => {
        await contractInstance.makePayments({ from: auctioneer });
    })
})
