
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
    const tokensAllocatedString = '9006e+18'
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
    console.log('vidamintToken: tkSupply(1) ' + this.tkSupply.dividedBy(weiToEth));

    this.upgradeMaster = await this.vidamintToken.upgradeMaster.call();
    console.log('vidamintToken: upgradeMaster ' + this.upgradeMaster);

    this.upgradeAgent = await this.vidamintToken.upgradeAgent.call();
    console.log('vidamintToken: upgradeAgent ' + this.upgradeAgent);

    const canUpgrade = await this.vidamintToken.canUpgrade.call();
    console.log('vidamintToken: canUpgrade ' + canUpgrade);

    const upgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: upgradeState ' + upgradeState);

    const newUpgradeAgent = upgradeAgent.at(this.vidamintToken.address)
    const isUpgradeAgent = await newUpgradeAgent.isUpgradeAgent.call()
    console.log(`vidamintToken: Can this token be an upgradeAgent = ${isUpgradeAgent}`)

    const agentOriginalSupply = await newUpgradeAgent.originalSupply.call()
    console.log(`vidamintToken: agent original suppply = ${agentOriginalSupply.dividedBy(weiToEth)}`)

    const newTokenTotalSupply = await this.newVidamintToken.totalSupply.call()
    console.log(`newVidamintToken: newToken totalSupply = ${newTokenTotalSupply.dividedBy(weiToEth)}`)

    this.totalUpgraded = await this.vidamintToken.totalUpgraded.call();
    console.log('vidamintToken: totalUpgraded ' + this.totalUpgraded.dividedBy(weiToEth));



    console.log('NOTE: About to do set migration from token 1 to token 2')
    this.newVidamintTokenMigration = await this.newVidamintToken.vidamintTokenMigration(this.vidamintToken.address,{gas: Gas});

    const originalSupply = await this.newVidamintToken.originalSupply();
    console.log('newVidamintToken: originalSupply ' + originalSupply.dividedBy(weiToEth));


    this.getUpgradeState = await this.newVidamintToken.getUpgradeState.call();
    console.log('newVidamintToken: getUpgradeState ' + this.getUpgradeState);


    console.log(`NOTE: About to change Master on the vidamintSale contract to address owner: ${accountOwner}`)
  //   // // // await this.vidamintToken.setUpgradeMaster('0x37D93cc2A7629866cAd88a5BbCf939767f9B9B94',{gas: Gas}); // fails
    await this.vidamintSale.changeTokenUpgradeMaster(accountOwner, {gas: Gas}) // works
    this.upgradeMaster = await this.vidamintToken.upgradeMaster.call();
    console.log('vidamintToken: upgradeMaster ' + this.upgradeMaster);


    console.log('newVidamintToken: address ' + this.newVidamintToken.address);

    console.log(`NOTE: About to set the upgrade agent in token 1`)
    await this.vidamintToken.setUpgradeAgent(this.newVidamintToken.address, {gas: Gas});
    this.upgradeAgent = await this.vidamintToken.upgradeAgent.call();
    console.log('vidamintToken: upgradeAgent ' + this.upgradeAgent);


    this.getUpgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: getUpgradeState ' + this.getUpgradeState);

    console.log(`NOTE: About to upgrade X tokens 1 tokens`)
    await this.vidamintToken.upgrade(new BigNumber(tokensAllocatedString) ,{gas:Gas});


    const tkBal1 = await this.vidamintToken.balanceOf.call(accountOwner);
    console.log('vidamintToken: tkBal1 ' + tkBal1);

    const tkSupply1 = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: tkSupply(1) ' + tkSupply1.dividedBy(weiToEth));

    const tkBal2 = await this.newVidamintToken.balanceOf.call(accountOwner);
    console.log('newVidamintToken: tkBal2 ' + tkBal2);

    this.tkSupply2 = await this.newVidamintToken.totalSupply.call();
    console.log('newVidamintToken: tkSupply(3) ' + this.tkSupply2.dividedBy(weiToEth));

    console.log('Migration done: from ' + this.vidamintToken.address + ' to ' + this.newVidamintToken.address);
}
//0x9371ce5b62a47f0c25e315ab2473b6ac371425d9 new tonen 	200000 VIDA
//0x910907eb8946f328fade71012a67f19701bf6eed iold token