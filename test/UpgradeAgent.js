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
const upgradeAgent = artifacts.require('UpgradeAgent.sol')


const gas = 4700000

contract('UpgradeAgent:', function ([deployOwner, investor, wallet, purchaser]) {

  before(async function() {
    //Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
     await advanceBlock()
    //  this.upgradeAgent = await upgradeAgent.new()
  })

  it('should have uint originalSupply')
  it('should have isUpgradeAgent function')
  it('should have upgradeFrom function')

})
