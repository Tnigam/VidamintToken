
const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");
const MintableToken = artifacts.require("zeppelin-solidity/contracts/token/MintableToken.sol");
const VidamintTokenMigration = artifacts.require('vidamintTokenMigration');

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
  vidamintSale.at('0x028acf20d0c0975e50c6d1875004e4b139fed19c').then(function(instance) {
    console.log('vidamintSale:' + instance.address);
    //instance.preSaleToggle();
    //instance.changeRate(2500);
    //return instance.weiRaised.call();
    
    //return instance.token.totalSupply();
    //instance.send(1000000000);
    //instance.changeStartTime(1509519600); 
    //return instance.distributePreBuyersRewards(preBuyers,preBuyersTokens,{gas: 4700000});
   // return instance.changeTokenUpgradeMaster(owner,{gas: 4700000});
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    console.log('result: '+ result)
  }).catch(function(e) {
    console.log(e)
    // There was an error! Handle it.
  })
  vidamintToken.at('0xbb5410e767aad35a91049f1ddebaad12e5b316f6').then(function(instance) {
    //console.log('Token: '+instance.address);
    
    //this.vidamintTokenMigration = await VidamintTokenMigration.new(cToken);
    //return instance.setUpgradeAgent('0x9371ce5b62a47f0c25e315ab2473b6ac371425d9');
    
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    console.log('result: '+ result)
  }).catch(function(e) {
    console.log(e)
    // There was an error! Handle it.
  })
  

};
//0x9371ce5b62a47f0c25e315ab2473b6ac371425d9 new tonen 	200000 VIDA
//0x910907eb8946f328fade71012a67f19701bf6eed iold token