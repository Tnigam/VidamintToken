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


const gas = 4700000

contract('Migration V2:', function ([deployOwner, investor, wallet, purchaser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
  })

  describe('No Tokens Allocated: ', () => {
    beforeEach(async function () {

      // this.options = {
      //   rate: new BigNumber(1),
      //   value: ether(42),
      //   cap: ether(300),
      //   gas: 4700000,
      //   tokenToBeMinted: 9006,
      //   get tokensTobeAllocated () {
      //     return new BigNumber(`${this.tokenToBeMinted}e+18`)
      //   },
      //   freezeEndsAt: 1564556400,
      //   startTime: latestTime() + duration.weeks(1),
      //   endTime: this.startTime + duration.weeks(1),
      //   afterEndTime: this.endTime + duration.seconds(1),
      //   deployOwner
      // }

      const rate = new BigNumber(1)
      const value = ether(42)
      const cap = ether(300)
      const expectedTokenAmount = rate.mul(value)
      this.tokensToBeAllocated = new BigNumber('9006e+18')
      this.tokenToBeMinted =  9006;
      this.freezeEndsAt = 1564556400;

      this.startTime = latestTime() + duration.weeks(1)
      this.endTime = this.startTime + duration.weeks(1)
      this.afterEndTime = this.endTime + duration.seconds(1)
      this.deployOwner = deployOwner

      this.crowdsale = await Crowdsale.new(deployOwner, this.startTime, this.endTime, rate, cap, wallet)
      const token1Addr = await this.crowdsale.token.call()
      this.token1 = vidamintToken.at(token1Addr)
      this.token2 = await vidamintToken.new() // TX

      // //allocate some tokens so there is something to upgrade
      // this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated ,{ gas }); // TX
      // await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas }) //TX
      // await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas }) // TX
      // await this.tokenVault.lock(); // TX not neccessary

      // this.tkSupply = await this.token1.totalSupply.call(); //keep for tests below
      // await this.token2.vidamintTokenMigration(this.token1.address, { gas }) // TX
      // await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas }) // TX
      // await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner}) // TX from should be deployOwner not owner
      // await this.token1.upgrade(this.tkSupply, { from: deployOwner }) // TX
    })

    it('Should fail to set TokenMigration because total supply is zero', async function () {
      this.tkSupply = await this.token1.totalSupply.call()
      this.tkSupply.should.be.bignumber.equal(0)
      await this.token2.vidamintTokenMigration(this.token1.address, { gas }).should.be.rejected
    })

    it('Should fail to set TokenMigration if address if bad input', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected

      this.tkSupply = await this.token1.totalSupply.call()
      this.tkSupply.should.be.bignumber.above(0)

      await this.token2.vidamintTokenMigration('thisisnotanaddress', { gas, from: deployOwner }).should.be.rejected
    })

    it('Should fail to set TokenMigration if address is zero', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration('0x0', { gas, from: deployOwner }).should.be.rejected
    })

    it('Should sucesfully set TokenMigration after tokens have been minted', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected

      this.tkSupply = await this.token1.totalSupply.call()
      this.tkSupply.should.be.bignumber.above(0)

      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
    })

    it('Should successfully change token1 upgrade master', async function () {
      const newMasterOwner = '0x0000000000000000000000000000000000000001'
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(newMasterOwner, { gas, from: deployOwner }).should.not.be.rejected
      const tokenMaster = await this.token1.upgradeMaster.call()
      tokenMaster.should.equal(newMasterOwner)
    })

    it('Should fail to change token1 upgrade master', async function () {
      const newMasterOwner = '0x0000000000000000000000000000000000000001'
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(newMasterOwner, { gas, from: newMasterOwner }).should.be.rejected
      const tokenMaster = await this.token1.upgradeMaster.call()
      tokenMaster.should.equal(this.crowdsale.address)
    })

    it('Should successfully set upgrade agent', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.not.be.rejected
      this.upgradeAgent = await this.token1.upgradeAgent.call();
      this.upgradeAgent.should.equal(this.token2.address)
    })

    it('Should fail to set upgrade agent a second time', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.not.be.rejected

      this.tkSupply = await this.token1.totalSupply.call()
      await this.token1.upgrade(this.tkSupply, { from: deployOwner }).should.not.be.rejected

      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.be.rejected
    })

    it('Should fail to set upgrade agent of agent Original Supply does not equal totalSupply', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected

      this.token3 = await vidamintToken.new() // This has a good interface but has incorrect originalSupply
      await this.token1.setUpgradeAgent(this.token3.address, { from: deployOwner }).should.be.rejected
    })

    it('Should fail to set upgrade agent because bad interface', async function () {
      const badInterfaceAddress = '0x0000000000000000000000000000000000000001'
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(badInterfaceAddress, { from: deployOwner }).should.be.rejected
      this.upgradeAgent = await this.token1.upgradeAgent.call();
      this.upgradeAgent.should.equal('0x0000000000000000000000000000000000000000')
    })

    it('Should fail to set upgrade agent because from is not contract owner', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: '0x01' }).should.be.rejected
      this.upgradeAgent = await this.token1.upgradeAgent.call();
      this.upgradeAgent.should.equal('0x0000000000000000000000000000000000000000')
    })

    it('Should fail to set upgrade agent because input address is 0x0', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent('0x0000000000000000000000000000000000000000', { from: deployOwner }).should.be.rejected
      this.upgradeAgent = await this.token1.upgradeAgent.call();
      this.upgradeAgent.should.equal('0x0000000000000000000000000000000000000000')
    })

    it('Should successfully upgrade to token2', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.not.be.rejected

      let upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(3)

      this.tkSupply = await this.token1.totalSupply.call()
      await this.token1.upgrade(this.tkSupply, { from: deployOwner }).should.not.be.rejected

      upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(4)
    })

    it('Should Fail to upgrade to token2 because of bad UpgradeState (upgrade agent not set)', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected

      let upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(2)

      this.tkSupply = await this.token1.totalSupply.call()
      await this.token1.upgrade(this.tkSupply, { from: deployOwner }).should.be.rejected
    })

    it('Should fail to upgrade to token2 because value = 0', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.not.be.rejected

      let upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(3)

      this.tkSupply = await this.token1.totalSupply.call()
      await this.token1.upgrade(0, { from: deployOwner }).should.be.rejected

      upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(3)
    })

    it('[Possible Bug] Should fail if input value is greater than balance[msg.sender]', async function () {
      this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, this.token1.address, this.tokensToBeAllocated, { gas, from: deployOwner }); // TX
      await this.tokenVault.setInvestor(investor, this.tokensToBeAllocated, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, { gas, from: deployOwner }).should.not.be.rejected
      await this.token2.vidamintTokenMigration(this.token1.address, { gas, from: deployOwner }).should.not.be.rejected
      await this.crowdsale.changeTokenUpgradeMaster(deployOwner, { gas, from: deployOwner }).should.not.be.rejected
      await this.token1.setUpgradeAgent(this.token2.address, { from: deployOwner }).should.not.be.rejected

      let upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(3)

      let balance = await this.token1.balanceOf.call(purchaser)
      console.log('purchaser Token1 Balance: before: ' + balance);

      balance = await this.token2.balanceOf.call(purchaser)
      console.log('purchaser Token2 Balance: before: ' + balance);

      this.tkSupply = await this.token1.totalSupply.call()
      console.log('this.tksupply ' + this.tkSupply)
      await this.token1.upgrade(this.tkSupply, { from: purchaser }).should.not.be.rejected

      balance = await this.token1.balanceOf.call(purchaser)
      console.log('purchaser Token1 Balance: after: ' + balance);

      balance = await this.token2.balanceOf.call(purchaser)
      console.log('purchaser Token2 Balance: after: ' + balance);

      upgradeState = await this.token1.getUpgradeState.call()
      upgradeState.should.be.bignumber.equal(4)
    })

  })
})
