
const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");
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
    
    this.vidamintToken = await vidamintToken.at('0x06c59864bc788a94b11e6d1590b8b34037fc5318');
    this.newVidamintToken = await vidamintToken.at('0x261b6fac6d3a03c93a86cb04047766daa5103ada');

    const owner = await this.vidamintToken.owner()
    console.log('owner ' + owner);

    const tkBal = await this.vidamintToken.balanceOf(owner);
    console.log('tkBal ' + tkBal);
    this.tkSupply = await this.vidamintToken.totalSupply();
    console.log('tkSupply ' + this.tkSupply.toFixed(0));

    this.upgradeMaster = await this.vidamintToken.upgradeMaster();
    console.log('upgradeMaster ' + this.upgradeMaster);

    this.upgradeAgent = await this.vidamintToken.upgradeAgent();
    console.log('upgradeAgent ' + this.upgradeAgent);

    this.totalUpgraded = await this.vidamintToken.totalUpgraded();
    console.log('totalUpgraded ' + this.totalUpgraded.toFixed(0));

    


    const Gas = new BigNumber(4700000);
      
    this.newVidamintTokenMigration = await this.newVidamintToken.vidamintTokenMigration(this.vidamintToken.address,{gas: Gas});
    const newtkSupply = await this.newVidamintToken.originalSupply();
    console.log('newtkSupply ' + newtkSupply.toFixed(0));

  
    //this.getUpgradeState = await this.newVidamintToken.getUpgradeState();
    //console.log('getUpgradeState ' + this.getUpgradeState);
  
    

    //this.vidamintToken.setUpgradeMaster('0x37D93cc2A7629866cAd88a5BbCf939767f9B9B94',{gas: Gas});
    
   // console.log('this.newVidamintToken.address ' + this.newVidamintToken.address);
    
    this.vidamintToken.setUpgradeAgent(this.newVidamintToken.address,{gas: Gas});
    
    //this.getUpgradeState = await this.vidamintToken.getUpgradeState();
    //console.log('vidamintToken getUpgradeState ' + this.getUpgradeState);
    
    this.vidamintToken.upgrade(200000000000000000000000,{gas:Gas}); 
  
     const tkBal1 = await this.vidamintToken.balanceOf('0x37d93cc2a7629866cad88a5bbcf939767f9b9b94');
    console.log('tkBal1 ' + tkBal1);
    const tkSupply1 = await this.vidamintToken.totalSupply();
    console.log('tkSupply1 ' + tkSupply1.toFixed(0));
   
    const tkBal2 = await this.newVidamintToken.balanceOf('0x37d93cc2a7629866cad88a5bbcf939767f9b9b94');
    console.log('tkBal2 ' + tkBal2);
    this.tkSupply2 = await this.newVidamintToken.totalSupply();
    console.log('tkSupply2 ' + this.tkSupply2.toFixed(0)); 

  //  console.log('Migration done: from ' + this.VidamintToken.address + ' to ' + this.newVidamintToken.address);
}
//0x9371ce5b62a47f0c25e315ab2473b6ac371425d9 new tonen 	200000 VIDA
//0x910907eb8946f328fade71012a67f19701bf6eed iold token