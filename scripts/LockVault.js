const tokenVault = artifacts.require("./TokenVault.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");

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
       
    this.vidamintTokenVault = await tokenVault.at('0x8d4e678ce575969e6c88dd451ce0c2b264c8926a');
    
    const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    console.log('tokensAllocatedTotal ' + tokensAllocatedTotal);

    const tokensToBeAllocated = await this.vidamintTokenVault.tokensToBeAllocated.call();
    console.log('tokensToBeAllocated ' + tokensToBeAllocated);

    const tokenVaultTokenBalance = await this.vidamintTokenVault.getBalance.call()
    console.log(`tokenVaultTokenBalance = ${tokenVaultTokenBalance}`)

    const lockedAt = await this.vidamintTokenVault.lockedAt.call();
    console.log('lockedAt ' + lockedAt);

    // const tokenaddr = await this.vidamintTokenVault.token.call()
    // console.log(`Token address ${tokenaddr}`)

    // const vidaToken = await tokenVault.at(tokenaddr)
    // const tokenBalance = await vidaToken.balances()
    // console.log(`vida token balance = ${tokenBalance}`)
    
    const getState = await this.vidamintTokenVault.getState.call();
    console.log('Initial State ' + getState);

    await this.vidamintTokenVault.lock();

    const getState2 = await this.vidamintTokenVault.getState.call();
    console.log('Final State ' + getState2);

    
  }
