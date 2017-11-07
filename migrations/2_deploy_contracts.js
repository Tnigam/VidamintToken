const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");

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
function getTokenBalanceOf(actor) {
  return vidamintSale
    .deployed()
    .then((sale) => sale.token.call())
    .then((tokenAddr) => vidamintToken.at(tokenAddr))
    .then((token) => token.balanceOf.call(actor))
    .then((balance) => new BN(balance.valueOf(), 10))
    .catch((err) => {
      throw new Error(err);
    });
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
  let tokenConf;
  let preBuyersConf;
  let foundersConf;
  //let owner;
  const [edward,
    james,
    miguel,
    edwhale] = accounts;
  if (network === 'development') {
    saleConf = JSON.parse(fs.readFileSync('./conf/testSale.json'));
    tokenConf = JSON.parse(fs.readFileSync('./conf/testToken.json'));
    preBuyersConf = JSON.parse(fs.readFileSync('./conf/testPreBuyers.json'));
    foundersConf = JSON.parse(fs.readFileSync('./conf/testFounders.json'));
    //saleConf.owner = owner;
    fs.writeFileSync('./conf/testSale.json', JSON.stringify(saleConf, null, '  '));

    let i = 10; // We use addresses from 0-3 for actors in the tests.
    for (founder in foundersConf.founders) {
      foundersConf.founders[founder].address = accounts[i];
      i += 1;
    }
    //  fs.writeFileSync('./conf/testFounders.json', JSON.stringify(foundersConf,
    // null, '  '));
  } else {
    saleConf = JSON.parse(fs.readFileSync('./conf/sale.json'));
    tokenConf = JSON.parse(fs.readFileSync('./conf/token.json'));
    preBuyersConf = JSON.parse(fs.readFileSync('./conf/preBuyers.json'));
    foundersConf = JSON.parse(fs.readFileSync('./conf/founders.json'));
  }

  const preBuyers = [];
  const preBuyersTokens = [];
  for (recipient in preBuyersConf) {
    preBuyers.push(preBuyersConf[recipient].address);
    preBuyersTokens.push(new BN(preBuyersConf[recipient].amount, 10));
  }

  const founders = [];
  const foundersTokens = [];
  for (recipient in foundersConf.founders) {
    founders.push(foundersConf.founders[recipient].address);
    foundersTokens.push(new BN(foundersConf.founders[recipient].amount, 10));
  }

  const vestingDates = [];
  for (date in foundersConf.vestingDates) {
    vestingDates.push(foundersConf.vestingDates[date]);
  }

  const BigNumber = web3.BigNumber;
  const rate = saleConf.rate;
  // const startTime = 1510609894611;//latestTime() + duration.minutes(1); const
  // endTime =  1520609894611;//startTime + duration.weeks(1);

  const startTime = latestTime() + duration.minutes(1);
  const endTime = startTime + duration.weeks(1);
  const cap = saleConf.cap;
  const goal = saleConf.goal;
  const owner = saleConf.owner;
  const wallet = saleConf.wallet;
  console.log([
    owner,
    startTime,
    endTime,
    rate,
    goal,
    cap,
    wallet
  ]);
  // uint256 _startTime, uint256 _endTime, uint256 _rate, uint256, _cap, uint256
  // _goal, address _wallet)
  let token;
  let certOwner;
  return deployer.deploy(vidamintSale, owner, startTime, endTime, rate, goal, cap, wallet, {gas: 4700000})
  /* .then(() => vidamintSale.deployed())
    .then((vidamintSale) => vidamintSale.distributePreBuyersRewards(
      preBuyers,
      preBuyersTokens,{gas: 4700000}
    )) */
    .then(() => vidamintSale.deployed()).then(async() => {
    const vidaInsta = await vidamintSale.deployed();
    token = await vidaInsta
      .token
      .call();
    console.log('Token Address', token);

  });

}
