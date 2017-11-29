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

contract('Crowdsale', function ([owner, investor, wallet, purchaser]) {

  const numTokens = 1
  const amount = web3.toWei(numTokens)
  const rate = web3.toBigNumber(1)
  const value = ether(42)
  const cap = ether(300)

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.seconds(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1)

    this.crowdsale = await Crowdsale.new(owner,this.startTime, this.endTime, rate, cap, wallet)
    await this.crowdsale.unpause()
    this.token = MintableToken.at(await this.crowdsale.token())

    this.releaseTime = latestTime() + duration.years(1)
    this.vidamintTokenVault = await TokenVault.new(owner,this.releaseTime,this.token.address, amount, {from: owner})

    await this.vidamintTokenVault.setInvestor(investor, amount, {from: owner});
    await this.crowdsale.addToTokenVault(this.vidamintTokenVault.address, 1, {from:owner});
    await this.vidamintTokenVault.lock({from: owner});

    //debugger info
    // const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    // console.log('tokensAllocatedTotal ' + tokensAllocatedTotal);

    // const lockedAt = await this.vidamintTokenVault.lockedAt.call();
    // console.log('lockedAt ' + lockedAt);
    //
    // const freezeEndsAt = await this.vidamintTokenVault.freezeEndsAt.call();
    // console.log('freezeEndsAt ' + lockedAt);
    //
    // const tkBal = await this.token.balanceOf(this.vidamintTokenVault.address);
    // console.log('tkBal ' + tkBal);
    //
    // const getState = await this.vidamintTokenVault.getState.call();
    // console.log('getState ' + getState);
    // await this.vidamintTokenVault.lock({from:owner});
    //
    // const getState2 = await this.vidamintTokenVault.getState.call();
    // console.log('getState2 ' + getState2);
  })

  it('cannot be released before time limit', async function () {
    await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
  })

  it('cannot be released just before time limit', async function () {
    await increaseTimeTo(this.releaseTime - duration.seconds(3))
    await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
  })

  it('can be released just after limit', async function () {
    await increaseTimeTo(this.releaseTime + duration.seconds(19))
    await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled
    const balance = await this.vidamintTokenVault.balances(investor)
    balance.should.be.bignumber.equal(amount)
  })

  it('can be released after time limit', async function () {
    await increaseTimeTo(this.releaseTime + duration.years(1))
    await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled
    const balance = await this.vidamintTokenVault.balances(investor)
    balance.should.be.bignumber.equal(amount)
  })

  it('cannot be released twice', async function () {
    await increaseTimeTo(this.releaseTime + duration.years(1))
    await this.vidamintTokenVault.claim({from: investor}).should.be.fulfilled
    await this.vidamintTokenVault.claim({from: investor}).should.be.rejected
    const balance = await this.vidamintTokenVault.balances(investor)
    balance.should.be.bignumber.equal(amount)
  })

})
