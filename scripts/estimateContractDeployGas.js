const Web3 = require('web3')

const provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(provider)


const artifact = require('../build/contracts/VidamintSale.json')

const abi = artifact.abi
// console.log(web3.eth)
var MyContract = web3.eth.contract(abi);


const fs = require('fs');
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

const saleConf = JSON.parse(fs.readFileSync('./conf/testSale.json'));
const BigNumber = web3.BigNumber;
// const BN = require('bn.js');
const rate = saleConf.rate;
//  const startTime = 1517418000;//latestTime() + duration.minutes(1); const
//  const endTime =  1520010000;//startTime + duration.weeks(1);

const startTime = latestTime() + duration.minutes(1);
const endTime = startTime + duration.weeks(1);
const cap = new BigNumber(saleConf.cap);
const owner = saleConf.owner;
const wallet = saleConf.wallet;

console.log([
  owner,
  startTime,
  endTime,
  rate,
  cap.toFixed(0),
  wallet
]);




var contractData = MyContract.new.getData(owner, startTime, endTime, rate, cap, wallet, {data: artifact.bytecode});
var estimate = web3.eth.estimateGas({data: contractData})
console.log(`Estimate = ${estimate}`)
