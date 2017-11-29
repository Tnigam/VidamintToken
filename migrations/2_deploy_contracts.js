const vidamintSale = artifacts.require("./vidamintSale.sol");

const fs = require('fs');
const BN = require('bn.js');

module.exports = function (deployer, network, accounts) {
  return liveDeploy(deployer, network, accounts);
};

function latestTime() {
  return web3
    .eth
    .getBlock('latest')
    .timestamp;
}
const duration = {
  seconds: function (val) {
    return val
  },
  minutes: function (val) {
    return val * this.seconds(60)
  },
  hours: function (val) {
    return val * this.minutes(60)
  },
  days: function (val) {
    return val * this.hours(24)
  },
  weeks: function (val) {
    return val * this.days(7)
  },
  years: function (val) {
    return val * this.days(365)
  }
};

async function liveDeploy(deployer, network, accounts) {
  let saleConf;
  const [edward,
    james,
    miguel,
    edwhale] = accounts;

    saleConf = JSON.parse(fs.readFileSync('./conf/testSale.json'));


  const BigNumber = web3.BigNumber;
  const rate = saleConf.rate;
  // REAL TIMES
  //  const startTime = 1517418000;//latestTime() + duration.minutes(1); const
  //  const endTime =  1520010000;//startTime + duration.weeks(1);

  //LOCAL DEV TIMES
  const startTime = latestTime() + duration.minutes(1);
  const endTime = startTime + duration.weeks(1);


  const cap = new BigNumber(saleConf.cap);
  const owner = saleConf.owner;
  const wallet = saleConf.wallet;
  console.log(network)
  console.log(accounts)
  console.log([
    owner,
    startTime,
    endTime,
    rate,
    cap.toFixed(0),
    wallet
  ]);

  deployer.deploy(vidamintSale, owner, startTime, endTime, rate, cap, wallet, {gas:7829561})
    // .then(() => vidamintSale.deployed())
    .then( async function() {
      const vidaInsta = await vidamintSale.deployed();
      const token = await vidaInsta.token.call();
      console.log('Token Address 1', token);
    });

  //here for testing purposes only
  // deployer.deploy(vidamintSale, owner, startTime, endTime, rate, cap.times(2), wallet, {gas:7829561})
  //   // .then(() => vidamintSale.deployed())
  //   .then( async function() {
  //     const vidaInsta = await vidamintSale.deployed();
  //     const token = await vidaInsta.token.call();
  //     console.log('Token Address 2', token);
  //   });

  }

