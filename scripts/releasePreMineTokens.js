
const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");
const MintableToken = artifacts.require("zeppelin-solidity/contracts/token/MintableToken.sol");

const fs = require('fs');
const BN = require('bn.js');
module.exports = function(deployer) {
  function latestTime() {
    return web3.eth.getBlock('latest').timestamp;
  }
  function getTokenBalanceOf(actor) {
    return vidamintSale.deployed()
    .then((sale) => sale.token.call())
    .then((tokenAddr) => vidamintToken.at(tokenAddr))
    .then((token) => token.balanceOf.call(actor))
    .then((balance) => new BN(balance.valueOf(), 10))
    .catch((err) => { throw new Error(err); });
  }
  const duration = {
    seconds: function(val) { return val},
    minutes: function(val) { return val * this.seconds(60) },
    hours:   function(val) { return val * this.minutes(60) },
    days:    function(val) { return val * this.hours(24) },
    weeks:   function(val) { return val * this.days(7) },
    years:   function(val) { return val * this.days(365)} 
  };
  let saleConf;
  let tokenConf;
  let preBuyersConf;
  let foundersConf;

    saleConf = JSON.parse(fs.readFileSync('./conf/sale.json'));
    tokenConf = JSON.parse(fs.readFileSync('./conf/token.json'));
    preBuyersConf = JSON.parse(fs.readFileSync('./conf/preBuyers.json'));
    foundersConf = JSON.parse(fs.readFileSync('./conf/founders.json'));

  const preBuyers = [];
  const preBuyersTokens = [];
  for (recipient in preBuyersConf) {
    preBuyers.push(preBuyersConf[recipient].address);
    preBuyersTokens.push(new BN(preBuyersConf[recipient].amount, 10));
  }

  const founders = [];
  const foundersTokens = [];
  for (recipient in foundersConf.founders) {
    founders.push(foundersConf.founders[recipient].address);
    foundersTokens.push(new BN(foundersConf.founders[recipient].amount, 10));
  }

  const vestingDates = [];
  for (date in foundersConf.vestingDates) {
    vestingDates.push(foundersConf.vestingDates[date]);
  }

  const BigNumber = web3.BigNumber;
  const rate = saleConf.rate;
  const startTime = 1510609894611;//latestTime() + duration.minutes(1);
  const endTime =  1520609894611;//startTime + duration.weeks(1);
  
  //const startTime =latestTime() + duration.minutes(1);
  //const endTime =  startTime + duration.weeks(1);
  const cap = saleConf.cap;
  const goal=  saleConf.goal; 
  const owner =  saleConf.owner;
  const wallet = saleConf.wallet;
  console.log([owner, startTime, endTime,rate,goal,cap,wallet]);
  vidamintSale.at('0x32E13a59Aa6BB1704CD26aF375E85e75FBE4ED77').then(function(instance) {
    console.log(instance.address);
    //instance.preSaleToggle();
    //instance.changePrice(2500);
    instance.changeStartdate(1509519600); 
    //instance.distributePreBuyersRewards(preBuyers,preBuyersTokens,{gas: 4700000});
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    console.log('result: '+ result)
  }).catch(function(e) {
    console.log(e)
    // There was an error! Handle it.
  })

};