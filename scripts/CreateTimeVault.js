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
    rewardeesConf = JSON.parse(fs.readFileSync('./conf/timelockTokens.18.json'));
  
    const rewardees = [];
    const rewardeesTokens = [];
    

    this.tokensToBeAllocated = new BigNumber('9006e+18') 
    this.freezeEndsAt = 1564556400;
    this.tokenToBeMinted =  9006;
    this.vidamintSale = await vidamintSale.at('0xfe01c6e21bb64b51ce9e888be7915dde0a5badf6');
    

    const token = await this.vidamintSale.token()
    console.log('token ' + token);
    const owner = await this.vidamintSale.owner()
    console.log('owner ' + owner);

    this.vidamintToken = await vidamintToken.at(token);
    
    this.vidamintTokenVault = await tokenVault.new(owner,this.freezeEndsAt,token, this.tokensToBeAllocated ,{gas:4700000});
    console.log('vidamintTokenVault ' + this.vidamintTokenVault.address);


    for (recipient in rewardeesConf.rewardees) {
      rewardees.push(rewardeesConf.rewardees[recipient].address);
      rewardeesTokens.push(new BN(rewardeesConf.rewardees[recipient].amount, 10));
      console.log(rewardeesConf.rewardees[recipient].address + ' : ' + new BigNumber(rewardeesConf.rewardees[recipient].amount + 'e+18'));
      await this.vidamintTokenVault.setInvestor(rewardeesConf.rewardees[recipient].address ,new BigNumber(rewardeesConf.rewardees[recipient].amount + 'e+18'),{gas:4700000});

    }

    
    await this.vidamintSale.addToTokenVault(this.vidamintTokenVault.address,this.tokenToBeMinted,{gas:4700000});
    
    const tkBal = await this.vidamintToken.balanceOf(this.vidamintTokenVault.address);
    console.log('tkBal ' + tkBal);

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

    const getTokenVaultsCount = await this.vidamintSale.getTokenVaultsCount()
    console.log('getTokenVaultsCount ' + getTokenVaultsCount);
    
    const tokenVaults = await this.vidamintSale.tokenVaults.call(getTokenVaultsCount-1);
    console.log('tokenVaults ' + tokenVaults);
  }
