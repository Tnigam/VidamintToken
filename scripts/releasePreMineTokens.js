
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
  vidamintSale.at('0xa7df1d30f6456dc72ce18fe011896105651a1f86').then(function(instance) {
    console.log('vidamintSale:' + instance.address);
    return instance.distributePreBuyersRewards(preBuyers,preBuyersTokens,{gas: 4700000});
  }).then(function(result) {
    // If this callback is called, the transaction was successfully processed.
    console.log('result: '+ JSON.stringify(result,null,2))
  }).catch(function(e) {
    console.log(e)
    // There was an error! Handle it.
  })
};
