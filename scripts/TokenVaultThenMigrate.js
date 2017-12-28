const vidamintToken = artifacts.require("./vidamintToken.sol");
const tokenVault = artifacts.require("./TokenVault.sol");
const vidamintSale = artifacts.require("./vidamintSale.sol");
const upgradeAgent = artifacts.require("./UpgradeAgent.sol");
const determinTokensToMint = require('./helpers/determinTokensToMint')
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

    const tokenSaleAddr = '0xb8656a05a72586f0550f8e0ad88f6b41bdcc0594'
    const token1Addr = '0x3c036bb9e416367409d5d0e9c05b37220a3acf2f'
    const token2Addr = '0xfea7dcc6af33b29d62c4bed31c42522f59dde7c9'
    const accountOwner = '0xdf08f82de32b8d460adbe8d72043e3a7e25a3b39' //

    this.vidamintSale = await vidamintSale.at(tokenSaleAddr);
    this.vidamintToken = vidamintToken.at(token1Addr);
    this.newVidamintToken = vidamintToken.at(token2Addr);

    const gas = new BigNumber(4700000);
    const weiToEth = 1000000000000000000

    const rewardeesConf = JSON.parse(fs.readFileSync('./conf/timelockTokens.19.json'));

    this.tokenToBeMinted =  determinTokensToMint(rewardeesConf);
    this.tokensToBeAllocated = new BigNumber(this.tokenToBeMinted + 'e+18')
    this.freezeEndsAt = 1564556400;

    console.log(`tokensToBeMinted (Eth): ${this.tokenToBeMinted}`)
    console.log(`tokensToBeAllocated (Wei): ${this.tokensToBeAllocated}`)

    console.log('\n-------------- Creating Token Vault --------------')
    console.log(`tokensToBeMinted (Eth): ${this.tokenToBeMinted}`)
    this.vidamintTokenVault = await tokenVault.new(accountOwner, this.freezeEndsAt, token1Addr, this.tokensToBeAllocated, {gas:4700000});
    console.log('vidamintTokenVault: ' + this.vidamintTokenVault.address);



    console.log(`\n------------ List of rewardees ------------`)
    for (const recipient in rewardeesConf.rewardees) {
      let address = rewardeesConf.rewardees[recipient].address
      let amount = new BigNumber(rewardeesConf.rewardees[recipient].amount + 'e+18') // converting to wei
      console.log(`${recipient} (${address}) gets ${amount.dividedBy(weiToEth)} tokens`);
      await this.vidamintTokenVault.setInvestor(address, amount, {gas:4700000});  // TX
    }
    console.log(`------------ List of rewardees ------------`)



    console.log(`\n-------------- Adding ${this.tokenToBeMinted} tokens to Vault --------------`)
    await this.vidamintSale.addToTokenVault(this.vidamintTokenVault.address, this.tokenToBeMinted, {gas:4700000}); // TX

    const totalSupply = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: Total Supply ' + totalSupply.dividedBy(weiToEth));

    const getTokenVaultsCount = await this.vidamintSale.getTokenVaultsCount.call()
    const tokenVaults = await this.vidamintSale.tokenVaults.call(getTokenVaultsCount-1);
    console.log('vidamintSale: tokenVault: ' + tokenVaults);

    const tkBal = await this.vidamintToken.balanceOf.call(this.vidamintTokenVault.address);
    console.log('TokenVault: tokenBalance ' + tkBal.dividedBy(weiToEth));

    const tokensAllocatedTotal = await this.vidamintTokenVault.tokensAllocatedTotal.call();
    console.log('TokenVault: tokensAllocatedTotal ' + tokensAllocatedTotal.dividedBy(weiToEth));



    console.log('\n-------------- Setting up upgradeAgent(newVidamintToken) --------------')
    const newUpgradeAgent = upgradeAgent.at(this.newVidamintToken.address)

    const isUpgradeAgent = await newUpgradeAgent.isUpgradeAgent.call()
    console.log(`upgradeAgent(newVidamintToken): Can this token be an upgradeAgent = ${isUpgradeAgent}`)

    const vidaMintTokenTotalSupply = await this.vidamintToken.totalSupply.call()
    console.log(`vidamintToken: totalSupply = ${vidaMintTokenTotalSupply.dividedBy(weiToEth)}`)

    const vidaMintTokenOriginalSupply = await this.vidamintToken.originalSupply.call()
    console.log(`vidamintToken: OriginalSupply = ${vidaMintTokenOriginalSupply.dividedBy(weiToEth)}`)



    console.log('\n-------------- Migrating Tokens Because of Reasons --------------')
    this.newVidamintTokenMigration = await this.newVidamintToken.vidamintTokenMigration(this.vidamintToken.address, { gas });  // TX

    const newtkSupply = await this.newVidamintToken.originalSupply.call();
    console.log('newVidamintToken: newtkSupply ' + newtkSupply.dividedBy(weiToEth));

    this.agentOriginalSupply = await newUpgradeAgent.originalSupply.call()
    console.log(`upgradeAgent(newVidamintToken): original suppply = ${this.agentOriginalSupply.dividedBy(weiToEth)}`)

    this.totalUpgraded = await this.vidamintToken.totalUpgraded.call();
    console.log('vidamintToken: totalUpgraded(1) ' + this.totalUpgraded.dividedBy(weiToEth));

    this.getUpgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: getUpgradeState(1) ' + this.getUpgradeState);



    console.log('\n-------------- Changing Upgrade Master of token1 via Crowdsale Smart Contract --------------')
    await this.vidamintSale.changeTokenUpgradeMaster(accountOwner, { gas, from: accountOwner })  // TX 

    this.upgradeMaster = await this.vidamintToken.upgradeMaster.call();
    console.log('vidamintToken: upgradeMaster ' + this.upgradeMaster);

    await this.vidamintToken.setUpgradeAgent(this.newVidamintToken.address, { gas });
    this.upgradeAgent = await this.vidamintToken.upgradeAgent.call();
    console.log('vidamintToken: upgradeAgent ' + this.upgradeAgent);

    this.getUpgradeState = await this.vidamintToken.getUpgradeState.call();
    console.log('vidamintToken: getUpgradeState(2) ' + this.getUpgradeState);



    const TokensToBeUpgraded = new BigNumber(vidaMintTokenTotalSupply)
    console.log(`\n-------------- About To upgrade ${TokensToBeUpgraded.dividedBy(weiToEth)} tokens --------------`)
    await this.vidamintToken.upgrade(TokensToBeUpgraded, { gas });  // TX

    this.totalUpgraded = await this.vidamintToken.totalUpgraded.call();
    console.log('vidamintToken: totalUpgraded(2) ' + this.totalUpgraded.dividedBy(weiToEth));

    const tkBal1 = await this.vidamintToken.balanceOf.call(accountOwner);
    console.log('vidamintToken: tkBal1 ' + tkBal1.dividedBy(weiToEth));

    const tkSupply1 = await this.vidamintToken.totalSupply.call();
    console.log('vidamintToken: tkSupply1 ' + tkSupply1.dividedBy(weiToEth));

    const tkBal2 = await this.newVidamintToken.balanceOf.call(accountOwner);
    console.log('newVidamintToken: tkBal2 ' + tkBal2.dividedBy(weiToEth));

    this.tkSupply2 = await this.newVidamintToken.totalSupply.call();
    console.log('newVidamintToken: tkSupply2 ' + this.tkSupply2.dividedBy(weiToEth));

    console.log('Migration done: from ' + this.vidamintToken.address + ' to ' + this.newVidamintToken.address);
  }
