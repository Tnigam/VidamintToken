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

    const saleContractAddr = '0x85a84691547b7ccf19d7c31977a7f8c0af1fb25a'
    const capVal = new BigNumber(199000000000000000000000)

    this.vidamintSale = await vidamintSale.at(saleContractAddr);

    const cap1 = await this.vidamintSale.cap.call();
    console.log('Initial cap ' + cap1);

    await this.vidamintSale.changeCap(capVal);

    const cap2 = await this.vidamintSale.cap.call();
    console.log('New cap ' + cap2);

  }
