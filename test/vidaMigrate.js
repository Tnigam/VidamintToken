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
contract('Crowdsale', function ([deployOwner, investor, wallet, purchaser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()

  })

  beforeEach(async function () {

    const rate = new BigNumber(1)
    const value = ether(42)
    const cap = ether(300)
    const expectedTokenAmount = rate.mul(value)
    this.tokensToBeAllocated = new BigNumber('9006e+18')
    this.tokenToBeMinted =  9006;
    this.freezeEndsAt = 1564556400;
    const userTokens = new BigNumber('1e+18')

    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1)
    this.deployOwner = deployOwner;

    console.log(`deployOwner --> ${deployOwner}`)
    console.log(`wallet --> ${wallet}`)

    this.crowdsale = await Crowdsale.new(deployOwner, this.startTime, this.endTime, rate, cap, wallet)
    const crowdSaleOwner = await this.crowdsale.owner()
    console.log(`crowdsale address --> ${this.crowdsale.address}`)

    const token1 = await this.crowdsale.token();
    this.token1 = vidamintToken.at(token1);
    console.log('token1 address --> ' + token1);
    const token1_owner = await this.token1.owner()
    console.log(`(token Owner, crowdsale Contract) = (${token1_owner}, ${this.crowdsale.address})`)

    this.token2 = await vidamintToken.new();
    const token2_oldToken = await this.token2.oldToken();
    console.log('token2_oldToken --> ' + token2_oldToken);


    //debugger variables
    // const tkBal = await this.token1.balanceOf(owner);
    // console.log('tkBal ' + tkBal);

    //allocate some tokens so there is something to upgrade
    this.tokenVault = await tokenVault.new(deployOwner, this.freezeEndsAt, token1, this.tokensToBeAllocated ,{gas:4700000});
    console.log('this.tokenVault ' + this.tokenVault.address);

    await this.tokenVault.setInvestor('0x2c85845F8deF610c29756C041dEF4C5F27db38a0', new BigNumber('9006e+18'), {gas:4700000});
    await this.crowdsale.addToTokenVault(this.tokenVault.address, this.tokenToBeMinted, {gas:4700000});
    await this.tokenVault.lock(); // not neccessary

    this.tkSupply = await this.token1.totalSupply();
    console.log('tkSupply ' + this.tkSupply);

    // const canUpgrade = await this.token1.canUpgrade();
    // console.log('canUpgrade ' + canUpgrade);
    //
    //
    // const getUpgradeState = await this.token1.getUpgradeState();
    // console.log('getUpgradeState ' + getUpgradeState);

    console.log('NOTE: About to do set migration from token 1 to token 2')
    await this.token2.vidamintTokenMigration(this.token1.address,{gas: 4700000});
    const newtkSupply = await this.token2.originalSupply();
    console.log('token2: newtkSupply ' + newtkSupply.toFixed(0));

    const upgrade_master_tmp = await this.token1.upgradeMaster.call()
    console.log(`token upgrade_master_tmp = ${upgrade_master_tmp}`)

    this.getUpgradeState = await this.token1.getUpgradeState.call();
    console.log('token1: getUpgradeState ' + this.getUpgradeState);

    // set upgrade master to owner
    await this.crowdsale.changeTokenUpgradeMaster(deployOwner, {gas: 4700000}) // works
    this.upgradeMaster = await this.token1.upgradeMaster.call();
    console.log('token1: upgradeMaster ' + this.upgradeMaster);

    //enable the line below and it breaks
    await this.token1.setUpgradeAgent(this.token2.address, {from: deployOwner}); //from should be deployOwner not owner
    console.log('i upgraded agent')
    //enable the line above and it breaks.

    await this.token1.upgrade(this.tkSupply, { from: deployOwner });
    const tkBal1 = await this.token1.balanceOf(deployOwner);
    console.log('tkBal1 ' + tkBal1);
    const tkSupply1 = await this.token1.totalSupply();
    console.log('tkSupply1 ' + tkSupply1);
    const tkBal2 = await this.token2.balanceOf(deployOwner);
    console.log('tkBal2 ' + tkBal2);
    this.tkSupply2 = await this.token2.totalSupply();
    console.log('tkSupply2 ' + this.tkSupply2);
    console.log('done')
  })

    it('Token2 supply should be Token1 original supply', async function () {
       const tkSupply2 = await this.token2.totalSupply();
       tkSupply2.should.be.bignumber.equal(this.tkSupply)
    })

    it('Token1 balance should be zero', async function() {
      const tkBal1 = await this.token1.balanceOf(deployOwner);
      tkBal1.should.be.bignumber.equal(0)
    })

    it('deployOwner Token1 balance should be zero ', async function() {
      const balance = await this.token1.balanceOf(deployOwner);
      balance.should.be.bignumber.equal(0)
    })

    it('deployOwner Token2 balance should be 9.006e+21', async function() {
      const balance = await this.token2.balanceOf(deployOwner);
      balance.should.be.bignumber.equal('9.006e+21')
    })
})
