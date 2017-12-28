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

    this.vidamintSale = await vidamintSale.at('0xa11260b588429fcace882ffcda323531ad320271');

    const weiToEth = 1000000000000000000

    const startTime = await this.vidamintSale.startTime.call();
    console.log('Sale Start Time ' + startTime);

    const endTime = await this.vidamintSale.endTime.call();
    console.log('Sale End Time ' + endTime);

    const rate = await this.vidamintSale.rate.call();
    console.log('Sale Initial rate ' + rate);

    const cap = await this.vidamintSale.cap.call();
    console.log('Sale cap ' + cap.toFixed(0));

    const wallet = await this.vidamintSale.wallet.call();
    console.log('Sale wallet ' + wallet);

    const owner = await this.vidamintSale.owner.call();
    console.log('Sale owner ' + owner);

    const preSaleIsStopped = await this.vidamintSale.preSaleIsStopped.call();
    console.log('Pre-Sale is stopped ' + preSaleIsStopped);

    const paused = await this.vidamintSale.paused.call();
    console.log('Sale is paused ' + paused);

    const refundIsStopped = await this.vidamintSale.refundIsStopped.call();
    console.log('Sale Refund is stopped ' + refundIsStopped);

    this.token =await this.vidamintSale.token();
    console.log('Sale token address ' + this.token );
    this.vidamintToken = vidamintToken.at(this.token);

    const totalSupply = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: Token Supply ' + totalSupply.dividedBy(weiToEth));

    this.totalUpgraded = await this.vidamintToken.totalUpgraded.call();
    console.log('vidamintToken: totalUpgraded ' + this.totalUpgraded.dividedBy(weiToEth));

    const remainingToBeUpgraded = totalSupply.minus(this.totalUpgraded)
    console.log(`Reamining to be updated: ${remainingToBeUpgraded.dividedBy(weiToEth)}`)

    const weiRaised = await this.vidamintSale.weiRaised.call();
    console.log('Total Wei Raised ' + weiRaised);

    const upgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: upgradeState ' + upgradeState);
  }
