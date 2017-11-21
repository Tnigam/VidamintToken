const tokenVault = artifacts.require("./TokenVault.sol");

const fs = require('fs');
const BN = require('bn.js');
const BigNumber = web3.BigNumber

 const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should() 

module.exports = function(deployer) {

    return Migrate(deployer);

};
async function Migrate(deployer) {
       
    this.vidamintTokenVault = await tokenVault.at('0x464c5812cae912cd517f83cc05900ea85534f5cf');
    
    const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    console.log('tokensAllocatedTotal ' + tokensAllocatedTotal);

    const tokensToBeAllocated = await this.vidamintTokenVault.tokensToBeAllocated.call();
    console.log('tokensToBeAllocated ' + tokensToBeAllocated);
   
    const lockedAt = await this.vidamintTokenVault.lockedAt.call();
    console.log('lockedAt ' + lockedAt);
    
    const getState = await this.vidamintTokenVault.getState.call();
    console.log('Initial State ' + getState);

    await this.vidamintTokenVault.lock();

    const getState2 = await this.vidamintTokenVault.getState.call();
    console.log('Final State ' + getState2);

    
  }
