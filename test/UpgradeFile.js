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


const MintableToken = artifacts.require('MintableToken');
const UpgradeAgent = artifacts.require('UpgradeAgent');
const UpgradeableToken = artifacts.require('UpgradeableToken');


contract('Crowdsale', function ([_, investor, wallet, purchaser]) {

  const rate = new BigNumber(1000)
  const value = ether(42)
  const goal = ether(100)
  const cap = ether(300)
  const expectedTokenAmount = rate.mul(value)
const Crowdsale = artifacts.require('vidamintSale')
  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  beforeEach(async function () {
    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1)


    this.crowdsale = await Crowdsale.new(this.startTime, this.endTime, rate, goal,cap,wallet)

    this.token = UpgradeableToken.at(await this.crowdsale.token())
  })

  
  it('should be upgradadble', async function () {
    //const pre = web3.eth.getBalance(wallet)
    //await this.crowdsale.buyTokens(investor, {value, from: purchaser})
   
    const isUpgradable =  this.token.canUpgrade()
    
    isUpgradable.should.be.equal(true)
  })

})
