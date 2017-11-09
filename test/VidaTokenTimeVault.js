const BigNumber = web3.BigNumber

require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()


  import ether from './helpers/ether'
  import {advanceBlock} from './helpers/advanceToBlock'
  import {increaseTimeTo, duration} from './helpers/increaseTime'
  import latestTime from './helpers/latestTime'
  import EVMThrow from './helpers/EVMThrow'

const MintableToken = artifacts.require('MintableToken')
const TokenVault = artifacts.require('TokenVault')
const vidamintSale = artifacts.require("./vidamintSale.sol");

contract('TokenVault', function ([_, owner, beneficiary,wallet]) {

  const amount = new BigNumber(1e+18)
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

    this.vidamintSale = await vidamintSale.new(owner,this.startTime, this.endTime, rate, goal,cap,wallet)
    
    this.token = MintableToken.at(await this.vidamintSale.token())
    
    this.releaseTime = latestTime() + duration.years(1)
    this.vidamintTokenVault = await TokenVault.new(owner,this.releaseTime,this.token.address,amount)

    await this.vidamintTokenVault.setInvestor(beneficiary,amount,{from:owner});
    await this.vidamintSale.addToTokenVault(this.vidamintTokenVault.address,1,{from:owner});
    
    
    //const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    //console.log('tokensAllocatedTotal ' + tokensAllocatedTotal);

    //const tokensToBeAllocated = await this.vidamintTokenVault.tokensToBeAllocated.call();
    //console.log('tokensToBeAllocated ' + tokensToBeAllocated);
    //const lockedAt = await this.vidamintTokenVault.lockedAt.call();
   // console.log('lockedAt ' + lockedAt);
    
    
    //const tkBal = await this.token.balanceOf(this.vidamintTokenVault.address);
    //console.log('tkBal ' + tkBal);
    
    //const getState = await this.vidamintTokenVault.getState.call();
    //console.log('getState ' + getState);
    await this.vidamintTokenVault.lock({from:owner});
 
    //const getState2 = await this.vidamintTokenVault.getState.call();
    //console.log('getState2 ' + getState2);

  })

  it('cannot be released before time limit', async function () {
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.rejected
  })

  it('cannot be released just before time limit', async function () {
    await increaseTimeTo(this.releaseTime - duration.seconds(3))
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.rejected
  })

  it('can be released just after limit', async function () {
    await increaseTimeTo(this.releaseTime + duration.seconds(1))
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.fulfilled
    const balance = await this.vidamintTokenVault.balances(beneficiary)
    balance.should.be.bignumber.equal(amount)
  })

  it('can be released after time limit', async function () {
    await increaseTimeTo(this.releaseTime + duration.years(1))
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.fulfilled
    const balance = await this.vidamintTokenVault.balances(beneficiary)
    balance.should.be.bignumber.equal(amount)
  })

  it('cannot be released twice', async function () {
    await increaseTimeTo(this.releaseTime + duration.years(1))
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.fulfilled
    await this.vidamintTokenVault.claim({from: beneficiary}).should.be.rejected
    const balance = await this.vidamintTokenVault.balances(beneficiary)
    balance.should.be.bignumber.equal(amount)
  })

})
