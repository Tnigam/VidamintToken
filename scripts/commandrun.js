const vidamintToken = artifacts.require("./vidamintToken.sol");
const tokenVault = artifacts.require("./TokenVault.sol");
const vidamintSale = artifacts.require("./vidamintSale.sol");
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
       
    this.vidamintSale = await vidamintSale.at('0xa7df1d30f6456dc72ce18fe011896105651a1f86');
    
    
    
    const cap = await this.vidamintSale.cap.call();
		console.log('Initial cap ' + cap);

		await this.vidamintSale.changeCap(new BigNumber(195000000000000000000000));

		const newCap = await this.vidamintSale.cap.call();
		console.log('New cap ' + newCap);

  }
