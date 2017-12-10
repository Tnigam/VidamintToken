import ether from './helpers/ether'
import {advanceBlock} from './helpers/advanceToBlock'
import {increaseTimeTo, duration} from './helpers/increaseTime'
import latestTime from './helpers/latestTime'
import EVMThrow from './helpers/EVMThrow'

const BigNumber = web3.BigNumber

const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

const Crowdsale = artifacts.require('vidamintSale')
const vidamintToken = artifacts.require('vidamintToken')

contract('Crowdsale', function ([owner, investor, wallet, purchaser, randomUser, wallet2]) {

  const rate = new BigNumber(1)
  const value = ether(42)
  const goal = ether(100)
  const cap = ether(300)
  const expectedTokenAmount = rate.mul(value)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.seconds(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1)
    //this.owner ='0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39';

    this.crowdsale = await Crowdsale.new(owner,this.startTime, this.endTime, rate, cap, wallet)
    let tokenAddr = await this.crowdsale.token.call()
    this.token = vidamintToken.at(tokenAddr)
  })

  it('should be token owner', async function () {
    const tokenOwner = await this.token.owner()
    tokenOwner.should.equal(this.crowdsale.address)
  })

  it('should be ended only after end', async function () {
    let ended = await this.crowdsale.hasEnded()
    ended.should.equal(false)
    await increaseTimeTo(this.afterEndTime)
    ended = await this.crowdsale.hasEnded()
    ended.should.equal(true)
  })

  describe('CrowdSale Constructor:', () => {
    it('should successfully create crowdsale contract')
    it('should fail if owner = 0x0')
    it('should fail if startTime <= now')
    it('should fail if endTime < startTime')
    it('should fail if rate <=0')
    it('should fail if wallet == 0x0')
    it('should fail if cap <= 0')
  }) //end of name

  describe('changeTokenUpgradeMaster:', () => {
    it('should successfully allow owner to change of master of token contract', async function () {
      let originalMaster = await this.token.upgradeMaster.call()
      await this.crowdsale.changeTokenUpgradeMaster(purchaser, { from: owner }).should.not.be.rejected
      let newMaster = await this.token.upgradeMaster.call()
      newMaster.should.equal(purchaser)
      newMaster.should.not.equal(originalMaster)
    })
    it('should fail to allow randomUser to change master of token contract', async function () {
      let originalMaster = await this.token.upgradeMaster.call()
      await this.crowdsale.changeTokenUpgradeMaster(purchaser, { from: randomUser }).should.be.rejected
      let newMaster = await this.token.upgradeMaster.call()
      newMaster.should.not.equal(purchaser)
      newMaster.should.equal(originalMaster)
    })
    it('should fail to changeUpgradeMaster to 0x0')
  })

  describe('changeOwner:', () => {
    it('should successfully allow owner to change crowdsale owner', async function () {
      let originalOwner = await this.crowdsale.owner.call()
      await this.crowdsale.changeOwner(purchaser, { from: owner }).should.not.be.rejected
      let newOwner = await this.crowdsale.owner.call()
      newOwner.should.equal(purchaser)
      newOwner.should.not.equal(originalOwner)
    })
    it('should fail to allow randomUser to change crowdsale owner', async function () {
      let originalOwner = await this.crowdsale.owner.call()
      await this.crowdsale.changeOwner(purchaser, { from: randomUser }).should.be.rejected
      let newOwner = await this.crowdsale.owner.call()
      newOwner.should.not.equal(purchaser)
      newOwner.should.equal(originalOwner)
    })
    it('should fail to allow owner to be 0x0')
  })

  describe('changeRate:', () => {
    it('should successfully allow owner to change rate', async function () {
      let localRate = new BigNumber(3000)
      let originalRate = await this.crowdsale.rate.call()
      await this.crowdsale.changeRate(localRate, { from: owner }).should.not.be.rejected
      let newRate = await this.crowdsale.rate.call()
      newRate.should.be.bignumber.equal(localRate)
      newRate.should.be.bignumber.not.equal(originalRate)
    })
    it('should fail to allow randomUser to change rate', async function () {
      let localRate = new BigNumber(3000)
      let originalRate = await this.crowdsale.rate.call()
      await this.crowdsale.changeRate(rate, { from: randomUser }).should.be.rejected
      let newRate = await this.crowdsale.rate.call()
      newRate.should.be.bignumber.not.equal(localRate)
      newRate.should.bignumber.equal(originalRate)
    })
    it('should fail to change rate to 0')
  }) //end of changeRate

  describe('changeCap:', () => {
    it('should successfully allow owner to change the cap', async function () {
      let localCap = new BigNumber(40000000)
      let originalCap = await this.crowdsale.cap.call()
      await this.crowdsale.changeCap(localCap, { from: owner }).should.not.be.rejected
      let newCap = await this.crowdsale.cap.call()
      newCap.should.be.bignumber.equal(localCap)
      newCap.should.bignumber.not.equal(originalCap)
    })
    it('should fail to allow randomUser to change the cap', async function () {
      let localCap = new BigNumber(40000000)
      let originalCap = await this.crowdsale.cap.call()
      await this.crowdsale.changeCap(localCap, { from: randomUser }).should.be.rejected
      let newCap = await this.crowdsale.cap.call()
      newCap.should.be.bignumber.not.equal(localCap)
      newCap.should.bignumber.equal(originalCap)
    })
    it('should fail to set new cap to 0')
  }) //end of changeCap

  describe('changeWallet:', () => {
    it('should successfully allow owner to change wallet', async function () {
      let originalWallet = await this.crowdsale.wallet.call()
      await this.crowdsale.changeWallet(wallet2, { from: owner }).should.not.be.rejected
      let newWallet = await this.crowdsale.wallet.call()
      newWallet.should.be.bignumber.equal(wallet2)
      newWallet.should.be.bignumber.not.equal(originalWallet)
    })
    it('should fail to allow randomuser to change wallet', async function () {
      let originalWallet = await this.crowdsale.wallet.call()
      await this.crowdsale.changeWallet(wallet2, { from: randomUser }).should.be.rejected
      let newWallet = await this.crowdsale.wallet.call()
      newWallet.should.be.bignumber.not.equal(wallet2)
      newWallet.should.be.bignumber.equal(originalWallet)
    })
    it('should fail to set wallet to 0x0')
  }) //end of changeWallet

  describe('changeStartTime:', () => {
    it('should successfully allow owner to change startTime', async function () {
      let time = new Date().getTime()
      let originalStartTime = await this.crowdsale.startTime.call()
      await this.crowdsale.changeStartTime(time, { from: owner }).should.not.be.rejected
      let newStartTime = await this.crowdsale.startTime.call()
      newStartTime.should.be.bignumber.equal(time)
      newStartTime.should.be.bignumber.not.equal(originalStartTime)
    })
    it('should fail to allow randomUser to change startTime', async function () {
      let time = new Date().getTime()
      let originalStartTime = await this.crowdsale.startTime.call()
      await this.crowdsale.changeStartTime(time, { from: randomUser }).should.be.rejected
      let newStartTime = await this.crowdsale.startTime.call()
      newStartTime.should.be.bignumber.not.equal(time)
      newStartTime.should.be.bignumber.equal(originalStartTime)
    })
    it('should fail to set startTime to 0')
  }) //end of name

  describe('changeEndTime:', () => {
    it('should successfully allow owner to change endTime', async function () {
      let time = new Date().getTime()
      let originalEndTime = await this.crowdsale.endTime.call()
      await this.crowdsale.changeEndTime(time, { from: owner }).should.not.be.rejected
      let newEndTime = await this.crowdsale.endTime.call()
      newEndTime.should.be.bignumber.equal(time)
      newEndTime.should.be.bignumber.not.equal(originalEndTime)
    })
    it('should fail to allow randomUser to change endTime', async function () {
      let time = new Date().getTime()
      let originalEndTime = await this.crowdsale.endTime.call()
      await this.crowdsale.changeEndTime(time, { from: randomUser }).should.be.rejected
      let newEndTime = await this.crowdsale.endTime.call()
      newEndTime.should.be.bignumber.not.equal(time)
      newEndTime.should.be.bignumber.equal(originalEndTime)
    })
    it('should fail to set endTime to 0')
  }) //end of changeEndTime

  describe('preSaleToggle:', () => {
    it('should successfully allow owner to toggle presale', async function () {
      let originalPreSaleStatus = await this.crowdsale.preSaleIsStopped.call()
      await this.crowdsale.preSaleToggle({ from: owner }).should.not.be.rejected
      let newPreSaleStatus = await this.crowdsale.preSaleIsStopped.call()
      newPreSaleStatus.should.equal(true)
      originalPreSaleStatus.should.equal(false)
    })
    it('should fail to allow randomUser to toggle presale', async function () {
      let originalPreSaleStatus = await this.crowdsale.preSaleIsStopped.call()
      await this.crowdsale.preSaleToggle({ from: randomUser }).should.be.rejected
      let newPreSaleStatus = await this.crowdsale.preSaleIsStopped.call()
      newPreSaleStatus.should.equal(false)
      originalPreSaleStatus.should.equal(false)
    })
  }) //end of preSaleToggle

  describe('refundToggle:', () => {
    it('should successfully allow owner to toggle refunds', async function () {
      let originalRefundStatus = await this.crowdsale.refundIsStopped.call()
      await this.crowdsale.refundToggle({ from: owner }).should.not.be.rejected
      let newRefundStatus = await this.crowdsale.refundIsStopped.call()
      newRefundStatus.should.equal(false)
      originalRefundStatus.should.equal(true)
    })
    it('should fail to allow randomUser to toggle refunds', async function () {
      let originalRefundStatus = await this.crowdsale.refundIsStopped.call()
      await this.crowdsale.refundToggle({ from: randomUser }).should.be.rejected
      let newRefundStatus = await this.crowdsale.refundIsStopped.call()
      newRefundStatus.should.equal(true)
      originalRefundStatus.should.equal(true)
    })
  }) //end of refundToggle

  describe('createTokenContract:', () => {
    it.skip('should only be callable within crowdSale Contract')
  }) //end of createTokenContract

  describe('distributePreBuyersRewards:', () => {
    it('should successfully distribute to preBuyers')
    it('should fail to distribute to preBuyers because presale is no loner running')
  }) //end of distributePreBuyersRewards

  describe('addToTokenVault:', () => { // this is tested in VidaTokenTimeVault
    it('should successfully add to token vault')
    it('should fail to add to token vault becuase presale is no longer running')
  }) //end of addToTokenVault

  describe('refund:', () => {
    it('should successfully refund user')
    it('should fail to refund because refunding is disabled')
  }) //end of refund

  describe('high-level purchase:', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
      await this.crowdsale.unpause()
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.sendTransaction({value: value, from: investor})

      const event = logs.find(e => e.event === 'TokenPurchase')

      should.exist(event)
      event.args.purchaser.should.equal(investor)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should increase totalSupply', async function () {
      await this.crowdsale.send(value)
      const totalSupply = await this.token.totalSupply()
      totalSupply.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should assign tokens to sender', async function () {
      await this.crowdsale.sendTransaction({value: value, from: investor})
      let balance = await this.token.balanceOf(investor);
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.sendTransaction({value, from: investor})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

  describe('low-level purchase:', function () {

    beforeEach(async function() {
      await increaseTimeTo(this.startTime)
      await this.crowdsale.unpause()
    })

    it('should log purchase', async function () {
      const {logs} = await this.crowdsale.buyTokens(investor, {value: value, from: purchaser})

      const event = logs.find(e => e.event === 'TokenPurchase')

      should.exist(event)
      event.args.purchaser.should.equal(purchaser)
      event.args.beneficiary.should.equal(investor)
      event.args.value.should.be.bignumber.equal(value)
      event.args.amount.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should increase totalSupply', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const totalSupply = await this.token.totalSupply()
      totalSupply.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should assign tokens to beneficiary', async function () {
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const balance = await this.token.balanceOf(investor)
      balance.should.be.bignumber.equal(expectedTokenAmount)
    })

    it('should forward funds to wallet', async function () {
      const pre = web3.eth.getBalance(wallet)
      await this.crowdsale.buyTokens(investor, {value, from: purchaser})
      const post = web3.eth.getBalance(wallet)
      post.minus(pre).should.be.bignumber.equal(value)
    })

  })

  describe('accepting payments:', function () {

        it('should fail if beneficiary is 0x0')
        it('should fail if not a validPurchase')

        it('should reject payments before start', async function () {
         // await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow)
          await this.crowdsale.buyTokens(investor, {from: purchaser, value: value}).should.be.rejectedWith(EVMThrow)
        })

        it('should accept payments after start', async function () {
          await increaseTimeTo(this.startTime)
          await this.crowdsale.unpause()
          await this.crowdsale.send(value).should.be.fulfilled
          await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.fulfilled
        })

        it('should reject payments after end', async function () {
          await increaseTimeTo(this.afterEndTime)
          await this.crowdsale.send(value).should.be.rejectedWith(EVMThrow)
          await this.crowdsale.buyTokens(investor, {value: value, from: purchaser}).should.be.rejectedWith(EVMThrow)
        })

      })
})
