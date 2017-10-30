
const vidamintSale = artifacts.require("./vidamintSale.sol");
const vidamintToken = artifacts.require("./vidamintToken.sol");
const MintableToken = artifacts.require("zeppelin-solidity/contracts/token/MintableToken.sol");

const fs = require('fs');
const BN = require('bn.js');

 
module.exports = function(deployer, network, accounts) {
  return liveDeploy(deployer, network, accounts);
}; 

function latestTime() {
  return web3.eth.getBlock('latest').timestamp;
}
function getTokenBalanceOf(actor) {
  return vidamintSale.deployed()
  .then((sale) => sale.token.call())
  .then((tokenAddr) => vidamintToken.at(tokenAddr))
  .then((token) => token.balanceOf.call(actor))
  .then((balance) => new BN(balance.valueOf(), 10))
  .catch((err) => { throw new Error(err); });
}
const duration = {
  seconds: function(val) { return val},
  minutes: function(val) { return val * this.seconds(60) },
  hours:   function(val) { return val * this.minutes(60) },
  days:    function(val) { return val * this.hours(24) },
  weeks:   function(val) { return val * this.days(7) },
  years:   function(val) { return val * this.days(365)} 
};

async function liveDeploy(deployer, network,accounts) {
  let saleConf;
  let tokenConf;
  let preBuyersConf;
  let foundersConf;
  const [owner, james, miguel, edwhale] = accounts;
  if (network === 'development') {
    saleConf = JSON.parse(fs.readFileSync('./conf/testSale.json'));
    tokenConf = JSON.parse(fs.readFileSync('./conf/testToken.json'));
    preBuyersConf = JSON.parse(fs.readFileSync('./conf/testPreBuyers.json'));
    foundersConf = JSON.parse(fs.readFileSync('./conf/testFounders.json'));
    saleConf.owner = owner;
    fs.writeFileSync('./conf/testSale.json', JSON.stringify(saleConf, null, '  '));

    let i = 10; // We use addresses from 0-3 for actors in the tests.
    for (founder in foundersConf.founders) {
      foundersConf.founders[founder].address = accounts[i];
      i += 1;
    }
  //  fs.writeFileSync('./conf/testFounders.json', JSON.stringify(foundersConf, null, '  '));
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
  const startTime = latestTime() + duration.minutes(1);
  const endTime =  startTime + duration.weeks(1);
  const cap = saleConf.cap;
  const goal=  saleConf.goal; 
 // const owner =  saleConf.owner;
  const wallet = saleConf.wallet;
  console.log([startTime, endTime,rate,goal,cap,wallet]);
  // uint256 _startTime, uint256 _endTime, uint256 _rate, uint256, _cap, uint256 _goal, address _wallet) 
  let token;
  let certOwner;
  return deployer.deploy(vidamintSale
    , startTime
    , endTime 
    , rate
    , goal
    , cap
    ,wallet,{from: owner})
    .then( async () => {
      const vidaInsta = await vidamintSale.deployed();
      token = await vidaInsta.token.call();
      console.log('Token Address', token);

      
      return token;
     }).then((token) => {
        var cert;
        vidamintToken.at(token).then(function(instance) {
          cert=instance;
          //const ab= cert.owner.call();
          //const totalSupply = getTokenBalanceOf(ab);
          
          return cert.owner.call();
        }).then(function(value) {
          console.log('Token Owner: ', value);
          certOwner=value;
          var cert;
          vidamintToken.at(token).then(function(instance) {
            cert=instance;
            return cert.balanceOf(owner);
          }).then(function(value) {
            console.log('token bal', value);
          });

        })
        /* .then(() => vidamintSale.deployed())
        .then((vidamintSale) => vidamintSale.distributePreBuyersRewards(
          preBuyers,
          preBuyersTokens,{from:owner}
        ))
        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => vidamintSale.distributeFoundersRewards(
          founders,
          foundersTokens,
          {from:owner}
        ))
        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => {
          
          return vidamintSale.buyTokens('0xce42bdb34189a93c55de250e011c68faee374dd3', 
          {value:5000, from: '0xce42bdb34189a93c55de250e011c68faee374dd3',gas:17492186044415}
        );
        })
        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => {
          
          return vidamintSale.buyTokens('0xce42bdb34189a93c55de250e011c68faee374dd3', 
          {value:5000, from: '0xce42bdb34189a93c55de250e011c68faee374dd3',gas:17492186044415}
        );
        })
        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => {
          return vidamintSale.weiRaised.call();
          
        })
        .then(function(value) {
          console.log('wei bal: '+ value);
          vidamintToken.at(token).then(function(instance) {
            cert=instance;
            return cert.balanceOf('0xce42bdb34189a93c55de250e011c68faee374dd3');
          }).then(function(value) {
            console.log('prebuyer 1 bal', value);
          }); 

        }) */
      /* .then(() => vidamintSale.deployed())
      .then((vidamintSale) => vidamintSale.pause())  
      .then(() => vidamintSale.deployed())
      .then((vidamintSale) => vidamintSale.unpause()) 
      .then(() => vidamintSale.deployed())
      .then((vidamintSale) => vidamintSale.buyTokens('0xce42bdb34189a93c55de250e011c68faee374dd3', 
        {value:5000, from: '0xb9dcbf8a52edc0c8dd9983fcc1d97b1f5d975ed7',gas:17492186044415}
      ))*/
       

        /* 17592186044415


   const vidaInsta = await vidamintSale.deployed();
          weiRaised = await vidaInsta.weiRaised.call();
         console.log('weiRaised ', weiRaised);
        

        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => vidamintSale.timeLockTokens('0xce42bdb34189a93c55de250e011c68faee374dd3',
        1545742800,{from:'0xce42bdb34189a93c55de250e011c68faee374dd3', value: 2000000}
        ))
        .then(() => vidamintSale.deployed())
        .then((vidamintSale) => vidamintSale.timeLockTokens(edwhale,
        1545742800,{from:edwhale, value: 2000000}
        ))
        .then(function(value) {
          console.log('Time Lock: '+ value);
          vidamintToken.at(token).then(function(instance) {
            cert=instance;
            return cert.balanceOf('0xbe818b9952e33b97cd094ff5cd91ae3c428e42ea');
          }).then(function(value) {
            console.log('prebuyer 1 bal', value);
          }); 

        }); */
    });
/*      .then((vidamintSale) => {
      vidamintSale.distributePreBuyersRewards(
      preBuyers,
      preBuyersTokens
    )
    
  }); */
  
  }  
    /* .then(() => vidamintSale.deployed())
    .then((vidamintSale) => vidamintSale.distributePreBuyersRewards(
      preBuyers,
      preBuyersTokens
    )); 
    
     var cert;
      vidamintToken.at(token).then(function(instance) {
        cert=instance;
        return cert.balanceOf('0xf1b5f4822ee45fa8572b32da967d606bddc802aa');
      }).then(function(value) {
        console.log('bal', value);
      });*/
  
 

/*createTokenContract


  return deployer.deploy(Sale,
      ,
      saleConf.wallet,
      tokenConf.initialAmount,
      tokenConf.tokenName,
      tokenConf.decimalUnits,
      tokenConf.tokenSymbol,
      saleConf.price,
      saleConf.startBlock,
      saleConf.freezeBlock
    )
    .then(() => Sale.deployed())
    .then((sale) => sale.distributePreBuyersRewards(
      preBuyers,
      preBuyersTokens
    ))
    .then(() => Sale.deployed())
    .then((sale) => sale.distributeFoundersRewards(
      founders,
      foundersTokens,
      vestingDates
    ));
};
*/