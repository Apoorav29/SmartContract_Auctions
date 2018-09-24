# Auction Smart Contract
A smart contract for conducting an auction for a set of bidders and a set of items.

### Dependencies
* `ganache`  or  `ganache-cli`, `truffle`, `solc`

### Instructions
```
ganache
truffle migrate --reset
```
* To compile [Auction.sol](./contracts/Auction.sol) - `truffle compile`
* To run tests in [auction.js](./test/auction.js) - `truffle test`

## Working and Structure
* The auctioneer initialises the contract with the values Q and M, where Q is a prime number used for random representation of values, and M is the number of items in the item set.
* Once the contract is created, Notaries and bidders can register(`registerNotary()` and `registerBidder()`) for the auction. No bidder can place a bid more than once and no notary can register more than once.
* The auctioneer assigns distinct notaries to each bidder(`assignNotary()`). The bid values for the assigned bidder are accessible by this notary.
* Now, the notaries are required to perform work i.e. they exchange values among each other(`performWork()`), which is later used for sorting the bidder list.
* Once the notaries have exchanged values, the auctioneer calls the `sortBidders()` function, which sorts the bidder in a descending order, according to a specific procedure involving random representations.
* To calculate the winners, Notaries are now required to exchange values, to calcuate whether the items bidded are intersecting with other bidders or not(`priorWinners()`).
* Once the winners are calculated, the auctioneer calls the  `findWinners()` function which determines the final winners.
* The `makePayments()` function determines how much the winners owe.
* The notaries are paid in proportion to the amount of work done by them.