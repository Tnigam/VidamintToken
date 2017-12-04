const vidamintToken = artifacts.require("./vidamintToken.sol");
const tokenVault = artifacts.require("./TokenVault.sol");
const vidamintSale = artifacts.require("./vidamintSale.sol");
const determinTokensToMint = require('./helpers/determinTokensToMint')
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

    const tokenSaleAddr = '0xa11260b588429fcace882ffcda323531ad320271'
    const rewardeesConf = JSON.parse(fs.readFileSync('./conf/timelockTokens.19.json'));

    const weiToEth = 1000000000000000000
    this.tokenToBeMinted =  determinTokensToMint(rewardeesConf);
    this.tokensToBeAllocated = new BigNumber(this.tokenToBeMinted + 'e+18')
    this.freezeEndsAt = 1564556400;
    this.vidamintSale = await vidamintSale.at(tokenSaleAddr);

    console.log(`tokensToBeMinted (Eth): ${this.tokenToBeMinted}`)
    console.log(`tokensToBeAllocated (Wei): ${this.tokensToBeAllocated}`)

    const token = await this.vidamintSale.token.call()
    console.log('vidamintToken: ' + token);
    const owner = await this.vidamintSale.owner.call()
    console.log('vidamintSale: owner ' + owner);

    this.vidamintToken = vidamintToken.at(token);

    this.vidamintTokenVault = await tokenVault.new(owner,this.freezeEndsAt, token, this.tokensToBeAllocated, {gas:4700000});
    console.log('vidamintTokenVault: ' + this.vidamintTokenVault.address);

    console.log(`\n------------ List of rewardees ------------`)
    for (recipient in rewardeesConf.rewardees) {
      let address = rewardeesConf.rewardees[recipient].address
      let amount = new BigNumber(rewardeesConf.rewardees[recipient].amount + 'e+18') // converting to wei
      console.log(`${recipient} (${address}) gets ${amount.dividedBy(weiToEth)} tokens`);
      await this.vidamintTokenVault.setInvestor(address, amount, {gas:4700000});
    }
    console.log(`------------ List of rewardees ------------\n`)

    await this.vidamintSale.addToTokenVault(this.vidamintTokenVault.address,this.tokenToBeMinted,{gas:4700000});

    const totalSupply = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: Total Supply ' + totalSupply.dividedBy(weiToEth));

    const tkBal = await this.vidamintToken.balanceOf.call(this.vidamintTokenVault.address);
    console.log('vidamintTokenVault: tokenBalance ' + tkBal.dividedBy(weiToEth));

    const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    console.log('TokenVault: tokensAllocatedTotal ' + tokensAllocatedTotal.dividedBy(weiToEth));

    const tokensToBeAllocated = await this.vidamintTokenVault.tokensToBeAllocated.call();
    console.log('TokenVault: tokensToBeAllocated ' + tokensToBeAllocated.dividedBy(weiToEth));

    let lockedAt = await this.vidamintTokenVault.lockedAt.call();
    console.log('TokenVault: lockedAt ' + lockedAt);

    const getState = await this.vidamintTokenVault.getState.call();
    console.log('TokenVault: Initial State ' + getState);

    await this.vidamintTokenVault.lock();

    const getState2 = await this.vidamintTokenVault.getState.call();
    console.log('TokenVault: Final State ' + getState2);

    lockedAt = await this.vidamintTokenVault.lockedAt.call();
    console.log('TokenVault: lockedAt ' + lockedAt);
 
    const freezeEndsAt = await this.vidamintTokenVault.freezeEndsAt.call();
    console.log('TokenVault: freezeEndsAt ' + freezeEndsAt);

    const getTokenVaultsCount = await this.vidamintSale.getTokenVaultsCount.call()
    console.log('vidamintSale: getTokenVaultsCount ' + getTokenVaultsCount);

    console.log(`\n------------ List of rewardees RESULT ------------`)
    for (recipient in rewardeesConf.rewardees) {
      let address = rewardeesConf.rewardees[recipient].address
      let balance = await this.vidamintTokenVault.balances.call(address);
      console.log(`${recipient} (${address}) gets ${balance.dividedBy(weiToEth)} tokens`);
    }
    console.log(`------------ List of rewardees RESULT ------------\n`)

    const totalSupply2 = await this.vidamintToken.totalSupply.call();
    console.log('Token Total Supply (2) ' + totalSupply2.dividedBy(weiToEth));

    const tokenVaults = await this.vidamintSale.tokenVaults.call(getTokenVaultsCount-1);
    console.log('\nvidamintSale: tokenVaults ' + tokenVaults);
  }
