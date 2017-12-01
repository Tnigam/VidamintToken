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

    const weiToEth = 1000000000000000000
    const saleContratAddr = '0x162a36c9821eadecff9669a3940b7f72d055cd1c'
    const purchaser = '0xe2b3204f29ab45d5fd074ff02ade098fbc381d42'

    this.vidamintSale = await vidamintSale.at(saleContratAddr);



    const startTime = await this.vidamintSale.startTime.call();
    console.log('Sale Start Time ' + startTime);

    const endTime = await this.vidamintSale.endTime.call();
    console.log('Sale End Time ' + endTime);

    const rate = await this.vidamintSale.rate.call();
    console.log('Sale Initial rate ' + rate);

    const cap = await this.vidamintSale.cap.call();
    console.log('Sale cap ' + cap.dividedBy(weiToEth));

    const wallet = await this.vidamintSale.wallet.call();
    console.log('Sale wallet ' + wallet);

    const owner = await this.vidamintSale.owner.call();
    console.log('Sale owner ' + owner);

    const paused = await this.vidamintSale.paused.call();
    console.log('Sale is paused ' + paused);

    if(paused === true) {
        console.log('unpausing to simulate crowdsale')
        await this.vidamintSale.unpause()
    }

    this.token = await this.vidamintSale.token();
    console.log('Sale token address ' + this.token );
    this.vidamintToken = vidamintToken.at(this.token);

    const purchaserTokenBalanceInit = await this.vidamintToken.balanceOf.call(purchaser)
    console.log(`Purchaser initial token balance = ${purchaserTokenBalanceInit.dividedBy(weiToEth)}`)

    await this.vidamintSale.buyTokens(purchaser, {from: purchaser, value: new BigNumber(1 * weiToEth) })

    const purchaserTokenBalanceAfter = await this.vidamintToken.balanceOf.call(purchaser)
    console.log(`Purchaser after token balance = ${purchaserTokenBalanceAfter.dividedBy(weiToEth)}`)

    const totalSupply = await this.vidamintToken.totalSupply.call();
    console.log('Token Total Supply ' + totalSupply.dividedBy(weiToEth));

    const purchaserBlance = await this.vidamintToken.balanceOf.call(purchaser)
    console.log(`Purchaser balance = ${purchaserBlance.dividedBy(weiToEth)}`)

    const weiRaised = await this.vidamintSale.weiRaised.call();
    console.log('Total Wei Raised ' + weiRaised);
    console.log('Total Ether Raised ' + weiRaised.dividedBy(weiToEth));


    // const preSaleIsStopped = await this.vidamintSale.preSaleIsStopped.call();
    // console.log('Pre-Sale is stopped ' + preSaleIsStopped);

    // const paused = await this.vidamintSale.paused.call();
    // console.log('Sale is paused ' + paused);

    // const refundIsStopped = await this.vidamintSale.refundIsStopped.call();
    // console.log('Sale Refund is stopped ' + refundIsStopped);

    // this.token = await this.vidamintSale.token();
    // console.log('Sale token address ' + this.token );
    // this.vidamintToken = vidamintToken.at(this.token);

    // const totalSupply = await this.vidamintToken.totalSupply.call();
    // console.log('Token Total Supply ' + totalSupply.toFixed(0));

    // const purchaserBlance = await this.vidamintToken.balanceOf(purchaser)
    // console.log(`Purchaser balance = ${purchaserBlance}`)

    // const weiRaised = await this.vidamintSale.weiRaised.call();
    // console.log('Total Wei Raised ' + weiRaised);
  }
