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
const tokenVault = artifacts.require('TokenVault.sol')
const token = artifacts.require('vidamintToken.sol')
const UpgradeableToken = artifacts.require('UpgradeableToken')


const gas = 4700000
const zeroAddr = '0x0000000000000000000000000000000000000000'

contract('UpgradeableToken:', function ([deployOwner, investor, wallet, purchaser, randomUser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  describe('StandardToken: ', () => {
    before(async function () {
      this.UpgradeableToken = await UpgradeableToken.new(deployOwner)
    })

    it('should have transferFrom function', async function () {
      this.UpgradeableToken.transferFrom.should.exist
      let type = typeof this.UpgradeableToken.transferFrom
      type.should.equal('function')
    })
    it('should have approve function', async function () {
      this.UpgradeableToken.approve.should.exist
      let type = typeof this.UpgradeableToken.approve
      type.should.equal('function')
    })
    it('should have allowance function', async function () {
      this.UpgradeableToken.allowance.should.exist
      let type = typeof this.UpgradeableToken.allowance
      type.should.equal('function')
    })
    it('should have increaseApproval function', async function () {
      this.UpgradeableToken.increaseApproval.should.exist
      let type = typeof this.UpgradeableToken.increaseApproval
      type.should.equal('function')
    })
    it('should have decreaseApproval function', async function () {
      this.UpgradeableToken.decreaseApproval.should.exist
      let type = typeof this.UpgradeableToken.decreaseApproval
      type.should.equal('function')
    })
  })

  describe('UpgradeableToken constructor:', () => {
    it('should successfully create UpgradeableToken contract', async function () {
      await UpgradeableToken.new(deployOwner).should.not.be.rejected
    })
    it('should fail to create UpgradeableToken because no master was set (master = 0x0)', async function() {
      await UpgradeableToken.new().should.be.rejected
    })
  }) //end of UpgradeableToken constructor tests

  describe('upgrade:', () => {
    it('should successfully upgrade a token')
    it('should fail to upgrade token because state == WaitingForAgent') //  handles !(state == UpgradeState.ReadyToUpgrade || state == UpgradeState.Upgrading)
    it('should fail if input value is equal to 0')
    it('should fail if balance of msg.sender is 0')
    // it('should fail call upgradeFrom ')
  }) //end of UpgradeAgent tests

  describe('setUpgradeAgent:', () => {
    beforeEach(async function () {
      this.UpgradeableToken = await UpgradeableToken.new(deployOwner)
    })
    it('should successfully set the upgradeAgent', async function () {
      let newToken = await token.new()
      await this.UpgradeableToken.setUpgradeAgent(newToken.address, { from: deployOwner }).should.not.be.rejected
      let newUpgradeAgent = await this.UpgradeableToken.upgradeAgent.call()
      newUpgradeAgent.should.equal(newToken.address)
    })
    it('should fail to allow randomuser to call setUpgradeAgent', async function () {
      let newToken = await token.new()
      await this.UpgradeableToken.setUpgradeAgent(newToken.address, { from: randomUser }).should.be.rejected
      let newUpgradeAgent = await this.UpgradeableToken.upgradeAgent.call()
      newUpgradeAgent.should.equal(zeroAddr)
    })
    it('[impossible] should fail if canUpgrade returns false')
    it('should fail if input agent address == 0x0', async function () {
      let newToken = await token.new()
      await this.UpgradeableToken.setUpgradeAgent(zeroAddr, { from: deployOwner }).should.be.rejected
      let newUpgradeAgent = await this.UpgradeableToken.upgradeAgent.call()
      newUpgradeAgent.should.equal(zeroAddr)
    })
    it('should fail if UpgradeState = UpgradeState.Upgrading (4)')
    it('should fail if upgradeAgent address is not an UpgradeAgent', async function () {
      let newToken = 0x1000000000000000000000000000000000000001
      await this.UpgradeableToken.setUpgradeAgent(newToken, { from: deployOwner }).should.be.rejected
      let newUpgradeAgent = await this.UpgradeableToken.upgradeAgent.call()
      newUpgradeAgent.should.equal(zeroAddr)
    })
    it('should fail if upgradeAgent.originalSupply does not equal totalSupply')
  }) //end of setUpgradeAgent tests

  describe('getUpgradeState:', () => {
    beforeEach(async function () {
      this.UpgradeableToken = await UpgradeableToken.new(deployOwner)
    })

    it('[impossible] should successfully return 1')
    it('should successfully return 2', async function () {
      let state = await this.UpgradeableToken.getUpgradeState.call()
      state.should.be.bignumber.equal(2)
    })
    it('should successfully return 3', async function () {
      let newToken = await token.new()
      await this.UpgradeableToken.setUpgradeAgent(newToken.address, { from: deployOwner })
      let state = await this.UpgradeableToken.getUpgradeState.call()
      state.should.be.bignumber.equal(3)
    })
    it.skip('should successfully return 4', async function () {
      const value = ether(1);
      let newToken = await token.new()
      await this.UpgradeableToken.setUpgradeAgent(newToken.address, { from: deployOwner })
      // await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      // await this.UpgradeableToken.transfer(purchaser, 1)
      // await newToken.upgrade(0, { from: deployOwner }).should.not.be.rejected
      // let state = await this.UpgradeableToken.getUpgradeState.call()
      // state.should.be.bignumber.equal(4)
    })
  }) //end of getUpgradeState tests

  describe('setUpgradeMaster:', () => {
    beforeEach(async function () {
      this.UpgradeableToken = await UpgradeableToken.new(deployOwner, { from: deployOwner })
    })
    it('should successfully set upgrade master', async function () {
      await this.UpgradeableToken.setUpgradeMaster(randomUser, { from: deployOwner } ).should.not.be.rejected
      let newMaster = await this.UpgradeableToken.upgradeMaster.call()
      newMaster.should.equal(randomUser)
    })
    it('should fail to allow randomUser to set upgrade master', async function () {
      await this.UpgradeableToken.setUpgradeMaster(randomUser, { from: randomUser } ).should.be.rejected
      let newMaster = await this.UpgradeableToken.upgradeMaster.call()
      newMaster.should.equal(deployOwner)
    })
    it('should fail to set upgrade master because input is 0x0', async function() {
      await this.UpgradeableToken.setUpgradeMaster('0x0', { from: deployOwner } ).should.be.rejected
      let newMaster = await this.UpgradeableToken.upgradeMaster.call()
      newMaster.should.equal(deployOwner)
    })
  }) //end of setUpgradeMaster

  describe('canUpgrade:', () => {
    beforeEach(async function () {
      this.UpgradeableToken = await UpgradeableToken.new(deployOwner, { from: deployOwner })
    })
    it('should successfully return true', async function () {
      let state = await this.UpgradeableToken.canUpgrade.call()
      state.should.equal(true)
    })
  }) //end of canUpgrade

})
