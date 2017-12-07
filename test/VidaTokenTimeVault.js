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
const MintableToken = artifacts.require('MintableToken')
const TokenVault = artifacts.require('TokenVault')

contract('TokenVault:', function ([owner, investor, wallet, purchaser, randomUser]) {

  const numTokens = 1
  const amount = new BigNumber(web3.toWei(numTokens))
  const rate = web3.toBigNumber(1)
  const value = ether(42)
  const cap = ether(300)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  describe('Claiming tokens:', () => {
    beforeEach(async function () {
      this.startTime = latestTime() + duration.seconds(1)
      this.endTime =   this.startTime + duration.weeks(1)
      this.afterEndTime = this.endTime + duration.seconds(1)

      this.crowdsale = await Crowdsale.new(owner,this.startTime, this.endTime, rate, cap, wallet)
      await this.crowdsale.unpause()
      this.token = MintableToken.at(await this.crowdsale.token())

      this.releaseTime = latestTime() + duration.years(1)
      this.vidamintTokenVault = await TokenVault.new(owner,this.releaseTime,this.token.address, amount, {from: owner})

      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner})
      await this.crowdsale.addToTokenVault(this.vidamintTokenVault.address, numTokens, {from:owner})
      await this.vidamintTokenVault.lock({from: owner})

      // debugger info
      // const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call()
      // console.log('tokensAllocatedTotal ' + tokensAllocatedTotal)

      // const lockedAt = await this.vidamintTokenVault.lockedAt.call()
      // console.log('lockedAt ' + lockedAt)
      //
      // const freezeEndsAt = await this.vidamintTokenVault.freezeEndsAt.call()
      // console.log('freezeEndsAt ' + lockedAt)
      //
      // const tkBal = await this.token.balanceOf(this.vidamintTokenVault.address)
      // console.log('tkBal ' + tkBal)
      //
      // const getState = await this.vidamintTokenVault.getState.call()
      // console.log('getState ' + getState)
      // await this.vidamintTokenVault.lock({from:owner})
      //
      // const getState2 = await this.vidamintTokenVault.getState.call()
      // console.log('getState2 ' + getState2)
    })

    it('cannot be released before time limit', async function () {
      await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
    })

    it('cannot be released just before time limit', async function () {
      await increaseTimeTo(this.releaseTime - duration.seconds(3))
      await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
    })

    it('cannot be claimed by randomUser', async function () {
      await increaseTimeTo(this.releaseTime + duration.seconds(19))

      let randomUserBalanceBefore = await this.token.balanceOf.call(randomUser)
      randomUserBalanceBefore.should.be.bignumber.equal(0)

      await this.vidamintTokenVault.claim({from: randomUser}).should.be.rejected

      let randomUserBalanceAfter = await this.token.balanceOf.call(randomUser)
      randomUserBalanceAfter.should.be.bignumber.equal(0)
    })

    it('can be released just after limit', async function () {
      await increaseTimeTo(this.releaseTime + duration.seconds(19))

      const balanceBefore = await this.vidamintTokenVault.balances.call(investor)
      balanceBefore.should.be.bignumber.equal('1000000000000000000')

      const claimedBefore = await this.vidamintTokenVault.claimed.call(investor)
      claimedBefore.should.be.bignumber.equal(0)

      let investorBalanceBefore = await this.token.balanceOf.call(investor)
      investorBalanceBefore.should.be.bignumber.equal(0)

      await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled

      const balanceAfter = await this.vidamintTokenVault.balances.call(investor)
      balanceAfter.should.be.bignumber.equal('1000000000000000000') // NOTE: TODO: reduce this to zero

      const claimedAfter = await this.vidamintTokenVault.claimed.call(investor)
      claimedAfter.should.be.bignumber.equal('1000000000000000000')

      let investorBalanceAfter = await this.token.balanceOf.call(investor)
      investorBalanceAfter.should.be.bignumber.equal('1000000000000000000')
    })

    it('can be released after time limit', async function () {
      await increaseTimeTo(this.releaseTime + duration.years(1))
      await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled
    })

    it('cannot be released twice', async function () {
      await increaseTimeTo(this.releaseTime + duration.years(1))
      await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled
      await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
    })
  }) // end of testing claming functionality

  describe('setInvestor:', () => {
    beforeEach(async function () {
      this.startTime = latestTime() + duration.seconds(1);
      this.endTime =   this.startTime + duration.weeks(1);
      this.afterEndTime = this.endTime + duration.seconds(1)

      this.crowdsale = await Crowdsale.new(owner, this.startTime, this.endTime, rate, cap, wallet)
      await this.crowdsale.unpause()
      this.token = MintableToken.at(await this.crowdsale.token())

      this.releaseTime = latestTime() + duration.years(1)
      this.vidamintTokenVault = await TokenVault.new(owner,this.releaseTime,this.token.address, amount, {from: owner})
    })

    it('Should succesfully set investor', async function () {
      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
    })

    it('Should fail to setInvestor if lockedAt > 0', async function () {
      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.vidamintTokenVault.address, numTokens, {from:owner}).should.not.be.rejected
      await this.vidamintTokenVault.lock({from: owner}).should.not.be.rejected

      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.be.rejected
    })

    it('should fail to setInvestor if amount = 0', async function () {
      await this.vidamintTokenVault.setInvestor(investor, 0, {from: owner}).should.be.rejected
    })

    it('should fail if setInvestor a second time regardless of value', async function () {
      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.vidamintTokenVault.setInvestor(investor, amount * 2, {from: owner}).should.be.rejected
    })

    it('should increase investorCount on each success add', async function() {
      let count = await this.vidamintTokenVault.investorCount.call()
      count.should.be.bignumber.equal(0)
      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      count = await this.vidamintTokenVault.investorCount.call()
      count.should.be.bignumber.equal(1)
      await this.vidamintTokenVault.setInvestor(purchaser, amount, {from: owner}).should.not.be.rejected
      count = await this.vidamintTokenVault.investorCount.call()
      count.should.be.bignumber.equal(2)
    })

    it('should not increase investorCount on failed setInvestor call', async function() {
      let count = await this.vidamintTokenVault.investorCount.call()
      count.should.be.bignumber.equal(0)

      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.vidamintTokenVault.setInvestor(purchaser, 0, {from: owner}).should.be.rejected

      count = await this.vidamintTokenVault.investorCount.call()
      count.should.be.bignumber.equal(1)
    })

    it('should have correct balance for given investor after setInvestor', async function() {
      let investorBefore = await this.vidamintTokenVault.balances.call(investor)
      investorBefore.should.be.bignumber.equal(0)

      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected

      let investorAfter = await this.vidamintTokenVault.balances.call(investor)
      investorAfter.should.be.bignumber.equal('1000000000000000000')
    })

    it('should have tokensAllocatedTotal for a given investor after setInvestor', async function() {
      let before = await this.vidamintTokenVault.tokensAllocatedTotal.call()
      before.should.be.bignumber.equal(0)

      await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected

      let after = await this.vidamintTokenVault.tokensAllocatedTotal.call()
      after.should.be.bignumber.equal('1000000000000000000')
    })

  }) // end of testing setInvestor functionality


  describe('Locking Vault:', () => {
    beforeEach(async function () {
      this.startTime = latestTime() + duration.seconds(1);
      this.endTime =   this.startTime + duration.weeks(1);
      this.afterEndTime = this.endTime + duration.seconds(1)

      this.crowdsale = await Crowdsale.new(owner,this.startTime, this.endTime, rate, cap, wallet)
      await this.crowdsale.unpause()
      this.token = MintableToken.at(await this.crowdsale.token())

      this.releaseTime = latestTime() + duration.years(1)
      this.tokenVault = await TokenVault.new(owner,this.releaseTime,this.token.address, amount, {from: owner})
    })

    it('should succesfully lock vault', async function() {
      await this.tokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, numTokens, {from:owner}).should.not.be.rejected
      await this.tokenVault.lock({from: owner}).should.not.be.rejected
      let state = await this.tokenVault.getState.call()
      state.should.be.bignumber.equal(2)
    })

    it('should fail to lock vault a second time', async function() {
      await this.tokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, numTokens, {from:owner}).should.not.be.rejected
      await this.tokenVault.lock({from: owner}).should.not.be.rejected

      let state = await this.tokenVault.getState.call()
      state.should.be.bignumber.equal(2)

      await this.tokenVault.lock({from: owner}).should.be.rejected

      state = await this.tokenVault.getState.call()
      state.should.be.bignumber.equal(2)
    })

    it('Should fail to lock vault because tokensAllocatedTotal and tokensToBeAllocated do not match', async function() {
      await this.tokenVault.setInvestor(investor, amount.plus(1), {from: owner}).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, numTokens, {from:owner}).should.not.be.rejected

      const tokensAllocatedTotal = await this.tokenVault.tokensAllocatedTotal.call()
      tokensAllocatedTotal.should.be.bignumber.equal('1000000000000000001')

      const tokensToBeAllocated = await this.tokenVault.tokensToBeAllocated.call()
      tokensToBeAllocated.should.be.bignumber.equal('1000000000000000000')

      const tokenVaultBalance = await this.token.balanceOf.call(this.tokenVault.address)
      tokenVaultBalance.should.be.bignumber.equal('1000000000000000000')

      await this.tokenVault.lock({from: owner}).should.be.rejected

      let state = await this.tokenVault.getState.call()
      state.should.be.bignumber.equal(1)
    })

    it('Should fail to lock vault because its balance is greater than allocations', async function() {
      await this.tokenVault.setInvestor(investor, amount, {from: owner}).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, numTokens + 3, {from:owner}).should.not.be.rejected

      const tokensAllocatedTotal = await this.tokenVault.tokensAllocatedTotal.call()
      tokensAllocatedTotal.should.be.bignumber.equal('1000000000000000000')

      const tokensToBeAllocated = await this.tokenVault.tokensToBeAllocated.call()
      tokensToBeAllocated.should.be.bignumber.equal('1000000000000000000')

      const tokenVaultBalance = await this.token.balanceOf.call(this.tokenVault.address)
      tokenVaultBalance.should.be.bignumber.equal('4000000000000000000')

      await this.tokenVault.lock({from: owner}).should.be.rejected

      let state = await this.tokenVault.getState.call()
      state.should.be.bignumber.equal(1)
    })
  }) // end of testing locking functionality

})
