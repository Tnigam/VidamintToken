const vidamintToken = artifacts.require("./vidamintToken.sol");
const tokenVault = artifacts.require("./TokenVault.sol");
const vidamintSale = artifacts.require("./vidamintSale.sol");
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
    
    let rewardeesConf;
    rewardeesConf = JSON.parse(fs.readFileSync('./conf/timelockTokens.json'));
  
    const rewardees = [];
    const rewardeesTokens = [];
    for (recipient in rewardeesConf.rewardees) {
      rewardees.push(rewardeesConf.rewardees[recipient].address);
      rewardeesTokens.push(new BN(rewardeesConf.rewardees[recipient].amount, 10));
      console.log(rewardeesConf.rewardees[recipient].address + ' : ' + rewardeesConf.rewardees[recipient].amount);
    }

    
    this.vidamintSale = await vidamintSale.at('0xac7c5931d84c2bd826152dc18042a4e3b433ef31');
    
    const token = await this.vidamintSale.token()
    console.log('token ' + token);

    const owner = await this.vidamintSale.owner()
    console.log('owner ' + owner);

    this.vidamintToken = await vidamintToken.at(token);
    this.tokensToBeAllocated = new BigNumber('5e+18') 

    this.vidamintTokenVault = await tokenVault.new(owner,1530018000,token, this.tokensToBeAllocated ,{gas:4700000});
    console.log('vidamintTokenVault ' + this.vidamintTokenVault.address);


    this.vidamintTokenVault.setInvestor('0xafadbd44b6e32F7C3c645e528cD57062c48220d0',this.tokensToBeAllocated/2,{gas:4700000});
    this.vidamintTokenVault.setInvestor('0x4EC53EE19a11f887BFF0148DE83b6a746a6cF0C9',this.tokensToBeAllocated/2,{gas:4700000} );
    
    this.vidamintSale.addToTokenVault(this.vidamintTokenVault.address,5,{gas:4700000});
    
    const tkBal = await this.vidamintToken.balanceOf(this.vidamintTokenVault.address);
    console.log('tkBal ' + tkBal);

    const tkBal2 = await this.vidamintTokenVault.balances('0x4EC53EE19a11f887BFF0148DE83b6a746a6cF0C9');
    console.log('tkBal2 ' + tkBal2);

    const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    console.log('tokensAllocatedTotal ' + tokensAllocatedTotal);

    const tokensToBeAllocated = await this.vidamintTokenVault.tokensToBeAllocated.call();
    console.log('tokensToBeAllocated ' + tokensToBeAllocated);
    const lockedAt = await this.vidamintTokenVault.lockedAt.call();
    console.log('lockedAt ' + lockedAt);
    
    const getState = await this.vidamintTokenVault.getState.call();
    console.log('getState ' + getState);

    this.vidamintTokenVault.lock();
    const getState2 = await this.vidamintTokenVault.getState.call();
    console.log('getState2 ' + getState2);

    const getTokenVaultsCount = await this.vidamintSale.getTokenVaultsCount()
    console.log('getTokenVaultsCount ' + getTokenVaultsCount);
    
    const tokenVaults = await this.vidamintSale.tokenVaults.call(getTokenVaultsCount-1);
    console.log('tokenVaults ' + tokenVaults);
  }
