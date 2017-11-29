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
const VidamintTokenMigration = artifacts.require('vidamintToken');
contract('Crowdsale', function ([_, investor, wallet, purchaser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()

  })

  beforeEach(async function () {

    const rate = new BigNumber(1)
    const value = ether(42)
    const goal = ether(100)
    const cap = ether(300)
    const expectedTokenAmount = rate.mul(value)

    this.startTime = latestTime() + duration.weeks(1);
    this.endTime =   this.startTime + duration.weeks(1);
    this.afterEndTime = this.endTime + duration.seconds(1)
    // this.owner ='0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39';
    this.owner = _;
    console.log(`wallet --> ${wallet}`)
    console.log(`default --> ${_}`)
    console.log(`this.owner --> ${this.owner}`)

    this.crowdsale = await Crowdsale.new(this.owner,this.startTime, this.endTime, rate, goal,cap,wallet)
    const crowdSaleOwner = await this.crowdsale.owner()
    console.log(`crowdSaleOwner = ${crowdSaleOwner}`)
    console.log(`crowdsale address = ${this.crowdsale.address}`)

    const cToken = await this.crowdsale.token();
    this.token = vidamintToken.at(cToken);
    console.log('cToken --> ' + cToken);
    const owner = await this.token.owner()
    console.log(`token Owner = ${owner}`)

    // this is debugger info
    console.log(`token address = ${this.token.address}`)
    // console.log(Crowdsale)

    //end of debugger info

    this.vidamintTokenMigration = await VidamintTokenMigration.new(cToken);
    const vidamintTokenMigrationOldToken = await this.vidamintTokenMigration.oldToken();
    console.log('vidamintTokenMigrationOldToken --> ' + vidamintTokenMigrationOldToken);


    //debugger variables
    // const tkBal = await this.token.balanceOf(owner);
    // console.log('tkBal ' + tkBal);
    // this.tkSupply = await this.token.totalSupply();
    // console.log('tkSupply ' + this.tkSupply);
    //
    // const canUpgrade = await this.token.canUpgrade();
    // console.log('canUpgrade ' + canUpgrade);
    //
    //
    // const getUpgradeState = await this.token.getUpgradeState();
    // console.log('getUpgradeState ' + getUpgradeState);

    const upgrade_master_tmp = await this.token.upgradeMaster.call()
    console.log(`token upgrade_master_tmp = ${upgrade_master_tmp}`)

    //enable the line below and it breaks
    await this.token.setUpgradeAgent(this.vidamintTokenMigration.address, {from: this.owner}); //from should be this.owner not owner
    //enable the line above and it breaks.

    // const upgradeAgent_tmp = await this.token.upgradeAgent.call()
    // console.log(`upgradeAgent_tmp = ${upgradeAgent_tmp}`)
    // console.log(`new vidamint migration address  = ${this.vidamintTokenMigration.address}`)

    //enable once the above works.
    // this.token.setUpgradeMaster(wallet, {from:owner});
    // await this.token.setUpgradeAgent(this.vidamintTokenMigration.address, {from:wallet});
    // const upgradeAgent_tmp2 = await this.token.upgradeAgent.call()
    // console.log(`upgradeAgent_tmp2 = ${upgradeAgent_tmp2}`)

    // this.token.upgrade(this.tkSupply,{from:owner});

    // const tkBal1 = await this.token.balanceOf(owner);
    // console.log('tkBal1 ' + tkBal1);
    // const tkSupply1 = await this.token.totalSupply();
    // console.log('tkSupply1 ' + tkSupply1);
    //
    // const tkBal2 = await this.vidamintTokenMigration.balanceOf(owner);
    // console.log('tkBal2 ' + tkBal2);
    // this.tkSupply2 = await this.vidamintTokenMigration.totalSupply();
    // console.log('tkSupply2 ' + this.tkSupply2);

  })

    it('supply should be transferred', async function () {
      // const master_tmp = await this.token.upgradeMaster.call()
      // await this.token.setUpgradeAgent(this.vidamintTokenMigration.address, {from: master_tmp});
      // const upgradeAgent_tmp = await this.token.upgradeAgent.call()
      // console.log(`upgradeAgent_tmp = ${upgradeAgent_tmp}`)

      // throw new Error('myerror')
       // this.tkSupply2.should.be.bignumber.equal(this.tkSupply)
    })

})
