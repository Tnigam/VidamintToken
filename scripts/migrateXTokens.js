
const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");
const upgradeAgent = artifacts.require("./UpgradeAgent.sol");
const MintableToken = artifacts.require("zeppelin-solidity/contracts/token/MintableToken.sol");
//const VidamintTokenMigration = artifacts.require('vidamintTokenMigration');

const fs = require('fs');
const BN = require('bn.js');
const BigNumber = web3.BigNumber

 const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should()

module.exports = function(deployer) {
    return Migrate(deployer);

};
async function Migrate(deployer) {

    const tokenSaleAddr = '0xa11260b588429fcace882ffcda323531ad320271'
    const token1Addr = '0xcedfc848311231f2491a2c49e1ae1b520b4ffccc'
    const token2Addr = '0x6a787a47a02dd664e99f5b72257f88e0d2632ee6'
    const accountOwner = '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39' // this is who owns all the contracts
    const tokensToUpgrade = '202'
    const tokensAllocatedString = tokensToUpgrade + 'e+18'
    const Gas = new BigNumber(4700000);
    const weiToEth = 1000000000000000000

    this.vidamintSale = vidamintSale.at(tokenSaleAddr)
    this.vidamintToken = vidamintToken.at(token1Addr);
    this.newVidamintToken = vidamintToken.at(token2Addr);


    const owner = await this.vidamintToken.owner.call()
    console.log('vidamintToken: owner ' + owner);

    const tkBal = await this.vidamintToken.balanceOf.call(owner);
    console.log('vidamintToken: tkBal ' + tkBal);

    this.tkSupply = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: token Supply ' + this.tkSupply.dividedBy(weiToEth));

    this.upgradeMaster = await this.vidamintToken.upgradeMaster.call();
    console.log('vidamintToken: upgradeMaster ' + this.upgradeMaster);

    this.upgradeAgent = await this.vidamintToken.upgradeAgent.call();
    console.log('vidamintToken: upgradeAgent ' + this.upgradeAgent);

    const canUpgrade = await this.vidamintToken.canUpgrade.call();
    console.log('vidamintToken: canUpgrade ' + canUpgrade);

    const upgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: upgradeState ' + upgradeState);

    let tkSupply1 = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: token Supply ' + tkSupply1.dividedBy(weiToEth));

    this.totalUpgraded = await this.vidamintToken.totalUpgraded.call();
    console.log('vidamintToken: totalUpgraded ' + this.totalUpgraded.dividedBy(weiToEth));

    const remainingToBeUpgraded = tkSupply1.minus(this.totalUpgraded)
    console.log(`Reamining to be updated: ${remainingToBeUpgraded.dividedBy(weiToEth)}`)
    console.log(`Upgrading ${tokensToUpgrade}`)
    console.log(`upgrading in wie ${new BigNumber(tokensAllocatedString)}`)


    console.log('\n-------------- Upgrading Tokens --------------\n')
    await this.vidamintToken.upgrade(remainingToBeUpgraded ,{gas:Gas}); // TX

    const tkSupply2 = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: token Supply ' + tkSupply2.dividedBy(weiToEth));


    this.tkSupply2 = await this.newVidamintToken.totalSupply.call();
    console.log('newVidamintToken: token Supply ' + this.tkSupply2.dividedBy(weiToEth));

    console.log('Migration done: from ' + this.vidamintToken.address + ' to ' + this.newVidamintToken.address);
}
//0x9371ce5b62a47f0c25e315ab2473b6ac371425d9 new tonen 	200000 VIDA
//0x910907eb8946f328fade71012a67f19701bf6eed iold token