/*global web3 describe before artifacts assert it contract:true after*/
const Sale = artifacts.require("./vidamintSale.sol");
const HumanStandardToken = artifacts.require(`./MintableToken.sol`);
const fs = require(`fs`);
const BN = require(`bn.js`);
const HttpProvider = require(`ethjs-provider-http`);
const EthRPC = require(`ethjs-rpc`);
const EthQuery = require(`ethjs-query`);
const ethRPC = new EthRPC(new HttpProvider(`http://localhost:8545`));
const ethQuery = new EthQuery(new HttpProvider(`http://localhost:8545`));



contract(`Sale`, (accounts) => {
  const preBuyersConf = JSON.parse(fs.readFileSync(`./conf/testPreBuyers.json`));
  const foundersConf = JSON.parse(fs.readFileSync(`./conf/testFounders.json`));
  const saleConf = JSON.parse(fs.readFileSync(`./conf/testSale.json`));
  const tokenConf = JSON.parse(fs.readFileSync(`./conf/testToken.json`));
  const [owner, james, miguel, edwhale] = accounts;

  let tokensForSale;

 
  web3.eth.getAccounts(function(err, accs) {
    if (err != null) {
      alert("There was an error fetching your accounts.");
      return;
    }

    if (accs.length == 0) {
      alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
      return;
    }

    accounts = accs;
    var account = accounts[0];
    checkAllBalances();
    
  });



  /*
   * Utility Functions
   */
  function checkAllBalances() { var i =0; web3.eth.accounts.forEach( function(e){ console.log("  eth.accounts["+i+"]: " +  e + " \tbalance: " + web3.fromWei(web3.eth.getBalance(e), "ether") + " ether"); i++; })};
  
  function purchaseToken(actor, amount) {
    if (!BN.isBN(amount)) { throw new Error(`Supplied amount is not a BN.`); }
    return Sale.deployed()
    .then((sale) => sale.purchaseTokens(
      {from: actor, value: amount.mul(saleConf.price)}));
  }

  function getTokenBalanceOf(actor) {
    return Sale.deployed()
    .then((sale) => sale.token.call())
    .then((tokenAddr) => HumanStandardToken.at(tokenAddr))
    .then((token) => token.balanceOf.call(actor))
    .then((balance) => new BN(balance.valueOf(), 10))
    .catch((err) => { throw new Error(err); });
  }

  function totalPreSoldTokens() {
    let tokensPreSold = new BN(`0`, 10);
    Object.keys(preBuyersConf).map((curr, i, arr) => {
      preBuyersConf[curr].amount = new BN(preBuyersConf[curr].amount, 10);
      tokensPreSold = tokensPreSold.add(preBuyersConf[curr].amount);
      return null;
    });
    return tokensPreSold;
  }

  function totalFoundersTokens() {
    let foundersTokens = new BN(`0`, 10);
    getFounders().map((curr, i, arr) => {
      foundersConf.founders[curr].amount = new BN(foundersConf.founders[curr].amount, 10);
      foundersTokens = foundersTokens.add(foundersConf.founders[curr].amount);
      return null;
    });
    return foundersTokens;
  }

  function getFilter(index) {
    return Sale.deployed()
    .then((sale) => sale.filters.call(index))
    .then((filterAddr) => Filter.at(filterAddr));
  }

  function getFoundersAddresses() {
    return getFounders().map((curr, i, arr) =>
      foundersConf.founders[curr].address
    );
  }

  function getFounders() {
    return Object.keys(foundersConf.founders);
  }

  function forceMine(blockToMine) {
    return new Promise((resolve, reject) => {
      if (!BN.isBN(blockToMine)) {
        reject(`Supplied block number must be a BN.`);
      }
      return ethQuery.blockNumber()
      .then((blockNumber) => {
        if (new BN(blockNumber, 10).lt(blockToMine)) {
          ethRPC.sendAsync({method: `evm_mine`}, (err) => {
            if (err !== undefined && err !== null) { reject(err); }
            resolve(forceMine(blockToMine));
          });
        } else {
          resolve();
        }
      });
    });
  }

  before(() => {
    const tokensPreAllocated = totalPreSoldTokens().add(totalFoundersTokens());
    saleConf.price = new BN(saleConf.price, 10);
    saleConf.startBlock = new BN(saleConf.startBlock, 10);
    tokenConf.initialAmount = new BN(tokenConf.initialAmount, 10);
    tokensForSale = tokenConf.initialAmount.sub(tokensPreAllocated);
    
  });

  describe(`Initial token issuance`, () => {
    it(`should instantiate preBuyers with the proper number of tokens.`, () =>
      Promise.all(
        Object.keys(preBuyersConf).map((curr, i, arr) =>
          new Promise((resolve, reject) =>
            getTokenBalanceOf(preBuyersConf[curr].address)
            .then((balance) =>
              resolve(
                assert.equal(balance.toString(10),
                preBuyersConf[curr].amount.toString(10),
                `A preBuyer ${preBuyersConf[curr].address} was instantiated with ` +
                `an incorrect balance.`)
              )
            )
            .catch((err) => reject(err))
          )
        )
      )
    );
    it(`should instantiate the public sale with the total supply of tokens ` +
       `minus the sum of tokens pre-sold.`, () =>
      new Promise((resolve, reject) =>
        getTokenBalanceOf(Sale.address)
        .then((balance) =>
          resolve(
            assert.equal(balance.toString(10),
            tokensForSale.toString(10),
            `The sale contract was not given the correct number of tokens to sell`)
          )
        )
        .catch((err) => reject(err))
      )
    );
  });
  describe(`Instantiation`, () => {
    it(`should instantiate with the price set to ${saleConf.price} Wei.`, () =>
      new Promise((resolve, reject) =>
        Sale.deployed()
        .then((instance) => instance.price.call())
        .then((price) =>
          resolve(
            assert.equal(price.toString(10), saleConf.price.toString(10),
            `The price was not instantiated properly.`)
          )
        )
        .catch((err) => reject(err))
      )
    );
    it(`should instantiate with the owner set to ${saleConf.owner}.`, () =>
      new Promise((resolve, reject) =>
        Sale.deployed()
        .then((sale) => sale.owner.call())
        .then((owner) =>
          resolve(
            assert.equal(owner.valueOf(), saleConf.owner,
            `The owner was not instantiated properly.`)
          )
        )
        .catch((err) => reject(err))
      )
    );
    it(`should instantiate with the wallet set to ${saleConf.wallet}.`, () =>
      new Promise((resolve, reject) =>
        Sale.deployed()
        .then((sale) => sale.wallet.call())
        .then((wallet) =>
          resolve(
            assert.equal(wallet.valueOf(), saleConf.wallet.toLowerCase(),
            `The wallet was not instantiated properly.`)
          )
        )
        .catch((err) => reject(err))
      )
    );
    it(`should instantiate with the startBlock set to ${saleConf.startBlock}.`, () =>
      new Promise((resolve, reject) =>
        Sale.deployed()
        .then((sale) => sale.startBlock.call())
        .then((startBlock) =>
          resolve(
            assert.equal(startBlock.toString(10),
            saleConf.startBlock.toString(10),
            `The startBlock was not instantiated properly.`)
          )
        )
        .catch((err) => reject(err))
      )
    );
  });
 
});
