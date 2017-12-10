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
const token = artifacts.require('vidamintToken')


const gas = 4700000

contract('vidamintToken:', function ([deployOwner, investor, wallet, purchaser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  describe('MintableToken: ', () => {
    before(async function () {
      this.token = await token.new()
    })

    it('should have mint function', async function() {
      this.token.mint.should.exist
      let type = typeof this.token.mint
      type.should.equal('function')
    })
    it('should have finishMinting function', async function() {
      this.token.finishMinting.should.exist
      let type = typeof this.token.finishMinting
      type.should.equal('function')
    })
    it('should have mintingFinished variable', async function() {
      this.token.mintingFinished.should.exist
      let type = typeof this.token.mintingFinished
      type.should.equal('function') // A function does get returned for variables
    })
  })

  describe('UpgradeableToken:', () => {
    before(async function () {
      this.token = await token.new()
    })

    it('should have upgrade function', async function() {
      this.token.upgrade.should.exist
      let type = typeof this.token.upgrade
      type.should.equal('function')
    })
    it('should have setUpgradeAgent function', async function() {
      this.token.setUpgradeAgent.should.exist
      let type = typeof this.token.setUpgradeAgent
      type.should.equal('function')
    })
    it('should have getUpgradeState function', async function() {
      this.token.getUpgradeState.should.exist
      let type = typeof this.token.getUpgradeState
      type.should.equal('function')
    })
    it('should have setUpgradeMaster function', async function() {
      this.token.setUpgradeMaster.should.exist
      let type = typeof this.token.setUpgradeMaster
      type.should.equal('function')
    })
    it('should have a canUpgrade function', async function() {
      this.token.canUpgrade.should.exist
      let type = typeof this.token.canUpgrade
      type.should.equal('function')
    })
  }) //end of name

  describe('UpgradeAgent:', () => {
    before(async function () {
      this.token = await token.new()
    })

    it('should have a isUpgradeAgent function', async function() {
      this.token.isUpgradeAgent.should.exist
      let type = typeof this.token.isUpgradeAgent
      type.should.equal('function')
    })
    it('should have a upgradeFrom function', async function() {
      this.token.upgradeFrom.should.exist
      let type = typeof this.token.upgradeFrom
      type.should.equal('function')
    })
    it('should have a originalSupply uint variable', async function() {
      this.token.originalSupply.should.exist
      let type = typeof this.token.originalSupply
      type.should.equal('function') // A function does get returned for variables
    })
  }) //end of name

})
