
const vidamintSale = artifacts.require("./vidamintSale.sol");

const fs = require('fs');
const BN = require('bn.js');
module.exports = function(deployer) {
 
  let preBuyersConf;
 
    preBuyersConf = JSON.parse(fs.readFileSync('./conf/PreBuyers.json'));
 
  const preBuyers = [];
  const preBuyersTokens = [];
  for (recipient in preBuyersConf) {
    preBuyers.push(preBuyersConf[recipient].address);
    preBuyersTokens.push(new BN(preBuyersConf[recipient].amount, 10));
  }
 
  const BigNumber = web3.BigNumber;
  vidamintSale.at('0xfe01c6e21bb64b51ce9e888be7915dde0a5badf6').then(function(instance) {
    console.log('vidamintSale:' + instance.address);
    return instance.distributePreBuyersRewards(preBuyers,preBuyersTokens,{gas: 4700000});
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    console.log('result: '+ result)
  }).catch(function(e) {
    console.log(e)
    // There was an error! Handle it.
  })
};
